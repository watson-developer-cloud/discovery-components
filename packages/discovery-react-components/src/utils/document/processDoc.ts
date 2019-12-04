import findIndex from 'lodash/findIndex';
import { SaxParser, Parser, ParsingError, Attributes } from '@rootUtils/document/saxParser';
import { QueryResult } from 'ibm-watson/discovery/v2';
import { isRelationObject } from '@rootUtils/document/nonContractUtils';
import { getId } from '@rootUtils/document/idUtils';
import transformEnrichment from '@rootUtils/document/transformEnrichment';
import { getEnrichmentName } from '@CIDocument/utils/enrichmentUtils';
import { spansIntersect } from '@rootUtils/document/documentUtils';

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
  itemMap?: boolean;
}

const DEFAULT_OPTIONS: Options = {
  sections: false,
  tables: false,
  bbox: false,
  itemMap: false
};

export interface ProcessedDoc {
  styles: string;
  sections?: any[];
  tables?: Table[];
  bboxes?: ProcessedBbox[];
  itemMap?: {
    byItem: any;
    bySection: any;
  };
}

export interface ProcessedBbox {
  left: number;
  right: number;
  top: number;
  bottom: number;
  page: number;
  className: string;
}

export interface Table {
  location: {
    begin: number;
    end: number;
  };
  bboxes: ProcessedBbox[];
}

/**
 * Convert document data into structure that is more palatable for use by
 * CIDocument
 *
 * @param {Object} data Discovery document data
 * @param {Object} options
 * @param {Boolean} options.sections return array of HTML sections
 * @param {Boolean} options.tables return array of tables' bboxes
 * @param {Boolean} options.bbox return array of bboxes, with classname
 * @param {Boolean} options.itemMap return item mapping into 'sections'
 * @throws {ParsingError}
 */
export default async function processDoc(
  // eslint-disable-next-line @typescript-eslint/camelcase
  { html, enriched_html }: QueryResult,
  options?: Options
): Promise<ProcessedDoc> {
  options = {
    ...DEFAULT_OPTIONS,
    ...(options || {})
  };
  const enrichedHtmlArray = transformEnrichment(enriched_html);

  //enriched_html is a singlton array.
  const enrichedHtml = enrichedHtmlArray && enrichedHtmlArray[0];
  const enrichment = enrichedHtml ? enrichedHtml[getEnrichmentName(enrichedHtml)] : [];

  const doc: ProcessedDoc = {
    styles: ''
  };
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
  setupDocParser(parser, doc);

  const htmlContent = Array.isArray(html) ? html[0] : html;

  // kick off parsing
  await parser.parse(htmlContent);

  sortFields(enrichment, doc);
  if (options && options.sections && options.itemMap) {
    addItemMap(doc);
  }

  return doc;
}

function setupDocParser(parser: SaxParser, doc: ProcessedDoc): void {
  parser.pushState({
    onopentag: (_: Parser, tagName: string): void => {
      /* eslint-disable-next-line default-case */
      switch (tagName) {
        case 'style': {
          setupStyleParser(parser, doc);
          break;
        }
        case 'body': {
          setupBodyParser(parser, doc);
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

function setupBodyParser(parser: SaxParser, doc: ProcessedDoc): void {
  parser.pushState({
    onopentag: (p: Parser, tagName: string, attributes: Attributes): void => {
      if (SECTION_NAMES.includes(tagName)) {
        setupSectionParser(
          parser,
          doc,
          tagName,
          attributes,
          p.startIndex,
          getChildBeginFromOpenTag(p)
        );
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
  sectionChildBegin: number
): void {
  let lastClassName = '';
  let currentTable: Table | null = null;

  // track nested nodes of same tag name
  let stackCount = 1;
  const openTagIndices = [0];
  const sectionHtml = [openTagToString(sectionTagName, sectionTagAttrs, sectionChildBegin)];

  parser.pushState({
    onopentag: (p: Parser, tagName: string, attributes: Attributes): void => {
      if (attributes.class) {
        lastClassName = attributes.class as string;
      }

      if (tagName !== BBOX_TAG || !SKIP_BBOX) {
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
        const bbox = {
          left: left,
          right: left + Number(attributes.width),
          top: top,
          bottom: top + Number(attributes.height),
          page: Number(attributes.page),
          className: lastClassName
        };
        if (doc.bboxes) {
          doc.bboxes.push(bbox);
        }
        if (currentTable && doc.tables) {
          currentTable.bboxes.push(bbox);
        }
      }

      if (tagName === sectionTagName) {
        stackCount++;
      }
    },

    ontext: (_: Parser, text: string): void => {
      sectionHtml.push(text);
    },

    onclosetag: (p: Parser, tagName: string): void => {
      if (tagName !== BBOX_TAG || !SKIP_BBOX) {
        sectionHtml.push(closeTagToString(tagName));

        // update opening tag with location of closing tag
        const openTagIdx = openTagIndices.pop() as number;
        sectionHtml[openTagIdx] = sectionHtml[openTagIdx].replace(
          />$/,
          ` data-child-end="${getChildEndFromCloseTag(p)}">`
        );
      }

      if (doc.tables && tagName === TABLE_TAG && currentTable) {
        currentTable.location.end = p.endIndex || p.startIndex;
        currentTable = null;
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
    }
  });
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
    console.error('Failed to find doc section which contains given field');
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
