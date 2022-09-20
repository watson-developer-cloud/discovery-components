import findIndex from 'lodash/findIndex';
import { SaxParser, Parser, ParsingError, Attributes } from './saxParser';
import cloneDeep from 'lodash/cloneDeep';
import { isRelationObject } from './nonContractUtils';
import { getId } from './idUtils';
import transformEnrichment from './transformEnrichment';
import { getEnrichmentName } from 'components/CIDocument/utils/enrichmentUtils';
import { spansIntersect } from './documentUtils';
import { decodeHTML, encodeHTML } from 'entities';
import { getDocumentTitle } from 'utils/getDocumentTitle';
import { QueryResultWithOptionalMetadata } from 'components/DocumentPreview/types';

// split HTML into "sections" based on these top level tag(s)
const SECTION_NAMES = ['p', 'ul', 'table'];

// enrichments with location data
const DOC_ENRICHMENTS = ['elements', 'attributes', 'relations'];

const TABLE_TAG = 'table';
const BBOX_TAG = 'bbox';

// skip rendering `<bbox>` nodes?
// TODO When removing, we need to readjust the offsets for parent nodes;
//      otherwise, parsing docs fails
const SKIP_BBOX = false;

interface Options {
  sections?: boolean;
  tables?: boolean;
  bbox?: boolean;
  bboxInnerText?: boolean;
  itemMap?: boolean;
}

const DEFAULT_OPTIONS: Options = {
  sections: false,
  tables: false,
  bbox: false,
  itemMap: false
};

export interface Location {
  begin: number;
  end: number;
}

export interface ProcessedDoc {
  title: string;
  styles: string;
  sections?: any[];
  tables?: Table[];
  bboxes?: ProcessedBbox[];
  itemMap?: {
    byItem: any;
    bySection: any;
  };
  metadata?: any[];
  attributes?: any[];
  relations?: any[];
}

export interface ProcessedBbox {
  left: number;
  right: number;
  top: number;
  bottom: number;
  page: number;
  className: string;
  location: Location;
  innerTextSource?: string;
  innerTextLocation?: Location;
}

export interface Table {
  location: Location;
  bboxes: ProcessedBbox[];
}

/**
 * Convert document data into structure that is more palatable for use by
 * CIDocument
 *
 * @param {Object} queryData Discovery document data
 * @param {Object} options
 * @param {Boolean} options.sections return array of HTML sections
 * @param {Boolean} options.tables return array of tables' bboxes
 * @param {Boolean} options.bbox return array of bboxes, with classname
 * @param {Boolean} options.itemMap return item mapping into 'sections'
 * @throws {ParsingError}
 */
export async function processDoc(
  queryData: QueryResultWithOptionalMetadata,
  options?: Options
): Promise<ProcessedDoc> {
  const { html, enriched_html: enrichedHtml } = cloneDeep(queryData);
  const documentTitle = getDocumentTitle(queryData, 'title');
  options = {
    ...DEFAULT_OPTIONS,
    ...(options || {})
  };
  const transformedEnrichmentArray = transformEnrichment(enrichedHtml);

  //enriched_html is a singlton array.
  const transformedEnrichment = transformedEnrichmentArray && transformedEnrichmentArray[0];
  const enrichment = transformedEnrichment
    ? transformedEnrichment[getEnrichmentName(transformedEnrichment)]
    : [];

  const doc: ProcessedDoc = {
    title: documentTitle,
    styles: ''
  };
  if (enrichment && enrichment.metadata) {
    doc.metadata = enrichment.metadata;
  }
  if (enrichment && enrichment.attributes) {
    doc.attributes = enrichment.attributes;
  }
  if (enrichment && enrichment.relations) {
    doc.relations = enrichment.relations;
  }
  if (options.sections) {
    doc.sections = [];
  }
  if (options.tables) {
    doc.tables = [];
  }
  if (options.bbox) {
    doc.bboxes = [];
  }

  const parser = new SaxParser();

  // setup initial parsing handling
  setupDocParser(parser, doc, options);

  const htmlContent = Array.isArray(html) ? html[0] : html;

  // kick off parsing
  await parser.parse(htmlContent);

  sortFields(enrichment, doc);
  if (options.sections && options.itemMap) {
    addItemMap(doc);
  }

  return doc;
}

function setupDocParser(parser: SaxParser, doc: ProcessedDoc, options: Options): void {
  parser.pushState({
    onopentag: (_: Parser, tagName: string): void => {
      /* eslint-disable-next-line default-case */
      switch (tagName) {
        case 'style': {
          setupStyleParser(parser, doc);
          break;
        }
        case 'body': {
          setupBodyParser(parser, doc, options);
          break;
        }
      }
    }
  });
}

function setupStyleParser(parser: SaxParser, doc: ProcessedDoc): void {
  let styleText = '';

  parser.pushState({
    onopentag: (_: Parser, tagName: string): void => {
      throw new ParsingError(`Unexpected open tag (${tagName}) in <style>`);
    },

    ontext: (_: Parser, text: string): void => {
      styleText += text;
    },

    onclosetag: (_: Parser, tagName: string): void => {
      if (tagName !== 'style') {
        throw new ParsingError(`Unexpected close tag (${tagName}); expected </style>`);
      }

      // finish
      doc.styles += styleText;

      // cleanup
      parser.popState();
    }
  });
}

function setupBodyParser(parser: SaxParser, doc: ProcessedDoc, options: Options): void {
  parser.pushState({
    onopentag: (p: Parser, tagName: string, attributes: Attributes): void => {
      if (SECTION_NAMES.includes(tagName)) {
        setupSectionParser(parser, doc, tagName, attributes, p.startIndex, p, options);
      }
    }
  });
}

function setupSectionParser(
  parser: SaxParser,
  doc: ProcessedDoc,
  sectionTagName: string,
  sectionTagAttrs: Attributes,
  sectionStartIndex: number,
  sectionParser: Parser,
  options: Options
): void {
  let lastClassName = '';
  let currentTable: Table | null = null;
  let currentBbox: ProcessedBbox | null = null;

  // track nested nodes of same tag name
  let stackCount = 0;
  const openTagIndices = [0];
  const sectionHtml: string[] = [];

  const actionState = getActionState();
  parser.pushState(actionState);

  // Ensures the current section open tag is called first and then
  // continues through tags inside of that section.
  actionState.onopentag(sectionParser, sectionTagName, sectionTagAttrs);

  function getActionState() {
    return {
      onopentag: (p: Parser, tagName: string, attributes: Attributes): void => {
        if (attributes.class) {
          lastClassName = attributes.class as string;
        }

        if (tagName !== BBOX_TAG || !SKIP_BBOX) {
          if (tagName === TABLE_TAG) {
            const descriptionId = `table-description-${p.startIndex}`;
            const tableDescription =
              'This table was generated using AI. It may be missing semantic table markup for accessibility.';
            const ariaLabel = `Table generated from ${doc.title} (id: ${p.startIndex})`;

            sectionHtml.push(
              `<article aria-label="${ariaLabel}" aria-describedby="${descriptionId}" data-child-begin="${p.startIndex}">`
            );
            openTagIndices.push(sectionHtml.length - 1);
            sectionHtml.push(
              `<p id="${descriptionId}" style="display: none;">${tableDescription}</p>`
            );
          }

          sectionHtml.push(openTagToString(tagName, attributes, getChildBeginFromOpenTag(p)));
          openTagIndices.push(sectionHtml.length - 1);
        }

        // <table border="1" data-max-height="78.36000061035156" data-max-width="514.1761474609375"
        //    data-max-x="48.999847412109375" data-max-y="72.62348937988281"
        //    data-min-height="78.36000061035156" data-min-width="514.1761474609375"
        //    data-min-x="48.999847412109375" data-min-y="72.62348937988281" data-page="39">
        if (tagName === TABLE_TAG && doc.tables) {
          currentTable = {
            location: {
              begin: p.startIndex,
              end: 0
            },
            bboxes: []
          };
          doc.tables.push(currentTable);
        }

        // <bbox height="6.056159973144531" page="1" width="150.52044677734375" x="72.0" y="116.10381317138672">
        if (tagName === BBOX_TAG && (doc.bboxes || currentTable)) {
          const left = Number(attributes.x);
          const top = Number(attributes.y);
          currentBbox = {
            left: left,
            right: left + Number(attributes.width),
            top: top,
            bottom: top + Number(attributes.height),
            page: Number(attributes.page),
            className: lastClassName,
            location: {
              begin: p.startIndex,
              end: 0
            }
          };
          if (doc.bboxes) {
            doc.bboxes.push(currentBbox);
          }
          if (options.bboxInnerText) {
            currentBbox.innerTextSource = '';
            currentBbox.innerTextLocation = {
              begin: p.endIndex != null ? p.endIndex + 1 : -1,
              end: -1
            };
          }
          if (currentTable && doc.tables) {
            currentTable.bboxes.push(currentBbox);
          }
        }

        if (tagName === sectionTagName) {
          stackCount++;
        }
      },

      ontext: (_: Parser, text: string): void => {
        // In order to properly highlight texts in the DOM we need
        // to know if the original text contains some encoded
        // html entities, and if so, we pass that value down to
        // be used later.
        if (decodeHTML(text).length !== text.length) {
          const lastElemIndex = openTagIndices[openTagIndices.length - 1];
          // For us to be able to access the original text, we need to
          // encode it again because otherwise the dom will decode it
          // when we try to access it later
          sectionHtml[lastElemIndex] = sectionHtml[lastElemIndex].replace(
            />$/,
            ` data-orig-text="${encodeHTML(text)}">`
          );
        }

        if (currentBbox && options.bboxInnerText) {
          currentBbox.innerTextSource += text;
        }

        sectionHtml.push(text);
      },

      onclosetag: (p: Parser, tagName: string): void => {
        if (tagName !== BBOX_TAG || !SKIP_BBOX) {
          sectionHtml.push(closeTagToString(tagName));

          if (tagName === TABLE_TAG) {
            sectionHtml.push('</article>');
          }

          // update opening tag with location of closing tag
          const openTagIdx = openTagIndices.pop() as number;
          sectionHtml[openTagIdx] = sectionHtml[openTagIdx].replace(
            />$/,
            ` data-child-end="${getChildEndFromCloseTag(p)}">`
          );

          if (tagName === TABLE_TAG) {
            // update opening article tag with location of closing tag
            // (needs to be done after content due to first-in, last-out data structure)
            const openTagIdx = openTagIndices.pop() as number;
            sectionHtml[openTagIdx] = sectionHtml[openTagIdx].replace(
              />$/,
              ` data-child-end="${p.endIndex || p.startIndex}">`
            );
          }
        }

        if (doc.tables && tagName === TABLE_TAG && currentTable) {
          currentTable.location.end = p.endIndex || p.startIndex;
          currentTable = null;
        }

        if (doc.bboxes && tagName === BBOX_TAG && currentBbox) {
          currentBbox.location.end = getChildEndFromCloseTag(p);

          if (options.bboxInnerText && currentBbox.innerTextLocation) {
            currentBbox.innerTextLocation.end = getChildEndFromCloseTag(p);
            if (currentBbox.innerTextLocation.end < 0 && currentBbox.innerTextSource != null) {
              currentBbox.innerTextLocation.begin =
                currentBbox.innerTextLocation.end - currentBbox.innerTextSource.length;
            }
          }

          currentBbox = null;
        }

        if (tagName === sectionTagName) {
          stackCount--;

          if (stackCount === 0) {
            // finish
            if (doc.sections) {
              doc.sections.push({
                html: sectionHtml.join(''),
                location: {
                  begin: sectionStartIndex,
                  end: p.endIndex || p.startIndex
                },
                enrichments: []
              });
            }

            // cleanup
            parser.popState();
          }
        }

        if (tagName === 'body') {
          parser.popState();
        }
      }
    };
  }
}

function getChildBeginFromOpenTag(p: Parser): number {
  // For an open tag, `p.endIndex` will be the ">". Add one to get
  // offset for child content.
  // (Default to `startIndex` since `endIndex` is marked as possibly null)
  return (p.endIndex || p.startIndex) + 1;
}

function getChildEndFromCloseTag(p: Parser): number {
  return p.startIndex;
}

function openTagToString(tagName: string, attributes: Attributes, position: number): string {
  const text = [`<${tagName}`];

  if (attributes) {
    for (const [attr, val] of Object.entries(attributes)) {
      text.push(` ${attr}="${val}"`);
    }
  }

  text.push(` data-child-begin="${position}"`);
  text.push('>');
  return text.join('');
}

function closeTagToString(tagName: string): string {
  return `</${tagName}>`;
}

function sortFields(_enrichments: any, doc: ProcessedDoc): void {
  // shallow copy of object
  const enrichments = Object.assign({}, _enrichments);

  for (const fieldType of DOC_ENRICHMENTS) {
    const fields = enrichments[fieldType];
    if (!fields) {
      continue;
    }

    // ASSUMPTIONS:
    // - location data in JSON is sorted

    if (doc.sections) {
      for (const field of fields) {
        if (isRelationObject(field)) {
          for (const attribute of field.attributes) {
            sortFieldsBySection(attribute, doc.sections, fieldType);
          }
        } else {
          sortFieldsBySection(field, doc.sections, fieldType);
        }
      }
    }
  }
}

function sortFieldsBySection(field: any, sections: any[], fieldType: string): void {
  const { begin, end } = field.location;

  const sectionIdx = findIndex(sections, item => spansIntersect({ begin, end }, item.location));
  if (sectionIdx === -1) {
    // notify of error, but keep going
    // eslint-disable-next-line no-console
    console.error('Unable to find doc section which contains given field');
    return;
  }

  sections[sectionIdx].enrichments.push({
    ...field,
    __type: fieldType
  });

  // 'elements' contain 'attributes', which also contain location data
  if (fieldType === 'elements' && field.attributes && field.attributes.length) {
    sections[sectionIdx].enrichments.push(
      ...field.attributes.map((attr: any) => ({
        ...attr,
        __type: 'attributes'
      }))
    );
  }
}

function addItemMap(doc: ProcessedDoc): void {
  const itemNames = ['elements', 'attributes', 'metadata'];
  const { sections } = doc;
  const byItem = {};
  const bySection = {};

  (sections as any[]).forEach((section, sectionNum) => {
    bySection[sectionNum] = [];
    const itemsInSection = section.enrichments.filter(({ __type }: any) =>
      itemNames.includes(__type)
    );

    for (const item of itemsInSection) {
      const itemId = getId(item);
      bySection[sectionNum].push(itemId);
      byItem[itemId] = sectionNum;
    }
  });

  doc.itemMap = {
    byItem,
    bySection
  };
}
