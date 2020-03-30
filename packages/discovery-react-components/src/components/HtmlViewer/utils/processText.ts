import cloneDeep from 'lodash/cloneDeep';
import { getSectionsFromText } from 'utils/document/textUtils';
import { getId } from 'utils/document/idUtils';

/**
 * Convert document data into structure that is more palatable for use by
 * Enrichment Document.
 *
 * @param {Object} document Discovery document data
 * @param {Object} enrichment path to enrichment data within document
 * @throws {ParsingError}
 */
export async function processText(text: string, enrichments) {
  if (!text) {
    throw new Error('No data in document data path.');
  }

  const sections = getSectionsFromText(text, enrichments).map(section => ({
    enrichments: [],
    ...section
  }));

  return {
    styles: [],
    sections,
    enrichments: sortFields(enrichments, sections),
    itemMap: getItemMap(sections)
  };
}

function sortFields(enrichments, sections) {
  // ASSUMPTIONS:
  // - location data in JSON is sorted

  const restructuredFields = fieldsFromMentions(enrichments);
  for (let field of restructuredFields) {
    sortFieldsBySection(field, sections);
  }
  return restructuredFields;
}

function fieldsFromMentions(enrichments) {
  const newFields = [];

  for (let enrichment of enrichments) {
    if (enrichment.mentions) {
      newFields.push(...cloneDeep(enrichment.mentions));
    }
  }

  newFields.sort((a, b) => {
    // Sort based on begin, and then by end (if begins are equal)
    return a.location.begin !== b.location.begin
      ? a.location.begin - b.location.begin
      : a.location.end - b.location.end;
  });

  return newFields;
}

function spansIntersect(
  { begin: beginA, end: endA }: { begin: number; end: number },
  { begin: beginB, end: endB }: { begin: number; end: number }
) {
  return beginA <= endB && endA > beginB;
}

function sortFieldsBySection(field, sections) {
  const { begin, end } = field.location;

  const sectionIdx = sections.findIndex(item => spansIntersect({ begin, end }, item.location));
  if (sectionIdx === -1) {
    // notify of error, but keep going
    // eslint-disable-next-line no-console
    console.error('Failed to find doc section which contains given field');
    return;
  }

  sections[sectionIdx].enrichments.push({
    ...field
  });
}

function getItemMap(sections) {
  const byItem = {};
  const bySection = {};

  sections.forEach((section, sectionNum) => {
    bySection[sectionNum] = [];
    const itemsInSection = section.enrichments;

    for (const item of itemsInSection) {
      const itemId = getId(item);
      bySection[sectionNum].push(itemId);
      byItem[itemId] = sectionNum;
    }
  });

  return {
    byItem,
    bySection
  };
}
