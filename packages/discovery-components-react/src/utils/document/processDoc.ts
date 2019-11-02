import findIndex from 'lodash/findIndex';
import SaxesParser, { ParsingError } from './saxesParser';
import { QueryResult } from '@disco-widgets/ibm-watson/discovery/v2';
import { SaxesTag } from 'saxes';
import { isRelationObject } from './nonContractUtils';
import { getId } from './idUtils';

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
 * SemanticDocument.
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
  { html, enriched_html_elements }: QueryResult,
  options?: Options
): Promise<ProcessedDoc> {
  options = {
    ...DEFAULT_OPTIONS,
    ...(options || {})
  };

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

  const parser = new SaxesParser();

  // setup initial parsing handling
  setupDocParser(parser, doc);

  // kick off parsing
  await parser.parse(html);

  sortFields(enriched_html_elements, doc);
  if (options && options.sections && options.itemMap) {
    addItemMap(doc);
  }

  return doc;
}

function setupDocParser(parser: SaxesParser, doc: ProcessedDoc): void {
  parser.pushState({
    onopentag: function(tag: SaxesTag) {
      /* eslint-disable-next-line default-case */
      switch (tag.name) {
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

function setupStyleParser(parser: SaxesParser, doc: ProcessedDoc): void {
  let styleText = '';

  parser.pushState({
    onopentag: function(tag: SaxesTag) {
      throw new ParsingError(`Unexpected open tag (${tag.name}) in <style>`);
    },

    ontext: function(text: string) {
      styleText += text;
    },

    onclosetag: function(tag: SaxesTag) {
      if (tag.name !== 'style') {
        throw new ParsingError(`Unexpected close tag (${tag.name}); expected </style>`);
      }

      // finish
      doc.styles += styleText;

      // cleanup
      parser.popState();
    }
  });
}

function setupBodyParser(parser: SaxesParser, doc: ProcessedDoc): void {
  parser.pushState({
    onopentag: function(tag: SaxesTag) {
      if (SECTION_NAMES.includes(tag.name)) {
        setupSectionParser(parser, doc, tag, this.position);
      }
    },

    ontext: function() {
      // Don't throw error; just keep parsing
      // eslint-disable-next-line no-console
      console.error('Unexpected text while parsing body');
    }
  });
}

function setupSectionParser(
  parser: SaxesParser,
  doc: ProcessedDoc,
  sectionTag: SaxesTag,
  sectionPosition: number
): void {
  const { name: sectionTagName } = sectionTag;
  let lastClassName = '';
  let currentTable: Table | null = null;

  // track nested nodes of same tag name
  let stackCount = 1;
  const openTagIndices = [0];
  const sectionHtml = [openTagToString(sectionTag, sectionPosition)];

  parser.pushState({
    onopentag: function(tag: SaxesTag) {
      const { attributes } = tag;
      if (attributes.class) {
        lastClassName = attributes.class as string;
      }

      if (tag.name !== BBOX_TAG || !SKIP_BBOX) {
        sectionHtml.push(openTagToString(tag, this.position));
        openTagIndices.push(sectionHtml.length - 1);
      }

      // <table border="1" data-max-height="78.36000061035156" data-max-width="514.1761474609375"
      //    data-max-x="48.999847412109375" data-max-y="72.62348937988281"
      //    data-min-height="78.36000061035156" data-min-width="514.1761474609375"
      //    data-min-x="48.999847412109375" data-min-y="72.62348937988281" data-page="39">
      if (tag.name === TABLE_TAG && doc.tables) {
        currentTable = {
          location: {
            begin: this.position,
            end: 0
          },
          bboxes: []
        };
        doc.tables.push(currentTable);
      }

      // <bbox height="6.056159973144531" page="1" width="150.52044677734375" x="72.0" y="116.10381317138672">
      if (tag.name === BBOX_TAG && (doc.bboxes || currentTable)) {
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

      if (tag.name === sectionTagName) {
        stackCount++;
      }
    },

    ontext: function(text: string) {
      sectionHtml.push(text);
    },

    onclosetag: function(tag: SaxesTag) {
      if (tag.name !== BBOX_TAG || !SKIP_BBOX) {
        sectionHtml.push(closeTagToString(tag));

        // update opening tag with location of closing tag
        const openTagIdx = openTagIndices.pop() as number;
        sectionHtml[openTagIdx] = sectionHtml[openTagIdx].replace(
          '>',
          ` data-child-end="${this.position}">`
        );
      }

      if (doc.tables && tag.name === TABLE_TAG && currentTable) {
        currentTable.location.end = this.position;
        currentTable = null;
      }

      if (tag.name === sectionTagName) {
        stackCount--;

        if (stackCount === 0) {
          // finish
          if (doc.sections) {
            doc.sections.push({
              html: sectionHtml.join(''),
              location: {
                begin: sectionPosition,
                end: this.position
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

function openTagToString(tag: SaxesTag, position: number): string {
  const { name, attributes, isSelfClosing } = tag;
  const text = [`<${name}`];

  if (attributes) {
    for (const [attr, val] of Object.entries(attributes)) {
      text.push(` ${attr}="${val}"`);
    }
  }

  text.push(` data-child-begin="${position}"`);
  text.push(isSelfClosing ? '/>' : '>');
  return text.join('');
}

function closeTagToString(tag: SaxesTag): string {
  return `</${tag.name}>`;
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
      const sectionIdx = 0;
      for (const field of fields) {
        if (isRelationObject(field)) {
          for (const attribute of field.attributes) {
            sortFieldsBySection(attribute, doc.sections, sectionIdx, fieldType);
          }
        } else {
          sortFieldsBySection(field, doc.sections, sectionIdx, fieldType);
        }
      }
    }
  }
}

function sortFieldsBySection(
  field: any,
  sections: any[],
  sectionIdx: number,
  fieldType: string
): void {
  const { begin, end } = field.location;

  const newSectionIdx = findIndex(
    sections,
    item => begin >= item.location.begin && end <= item.location.end,
    sectionIdx
  );
  if (newSectionIdx === -1) {
    // notify of error, but keep going
    // eslint-disable-next-line no-console
    console.error('Failed to find doc section which contains given field');
  }

  sections[newSectionIdx].enrichments.push({
    ...field,
    __type: fieldType
  });

  // 'elements' contain 'attributes', which also contain location data
  if (fieldType === 'elements' && field.attributes && field.attributes.length) {
    sections[newSectionIdx].enrichments.push(
      ...field.attributes.map((attr: any) => ({
        ...attr,
        __type: 'attributes'
      }))
    );
  }

  sectionIdx = newSectionIdx;
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
