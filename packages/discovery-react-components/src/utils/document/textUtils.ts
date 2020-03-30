import { encodeHTML } from 'entities';
import tokenizer from 'sbd';

const MAX_CHARS_UNSTYLED_TEXT_STRING = 1024;
const TOKENIZER_OPTIONS = {
  preserve_whitespace: true
};

export interface LocationData {
  mentions: [
    {
      location: {
        begin: number;
        end: number;
      };
      text: string;
    }
  ];
}

// Split text strings in order to make them more readable
function splitTextIntoSections(textArray: string[], locationData?: LocationData[]) {
  // A "compliant" text array is one that contains new lines (for proper
  // formatting).
  // However, there is also the case that the text array
  // may short strings that do not contain new lines, even if the overall
  // document text _did_ contain newlines (e.g. user has labeled some
  // text as "question" or "title"). For this scenario, we look for a
  // MAX character count -- anything more than that will result in the
  // fallback, not-as-great sentence splitting.
  const isCompliantText = textArray.some(
    text => text.includes('\n') || text.length < MAX_CHARS_UNSTYLED_TEXT_STRING
  );
  if (isCompliantText) {
    return textArray.flatMap(text => text.split('\n').map(str => str + '\n'));
  }
  // non-"compliant" text
  return sentencify(textArray, locationData);
}

// For "non-compliant" text, we first split on sentences. However, since
// that is not 100% accurate, we then iterate on the new array, matching
// to the given location data. If an item spans multiple
// "sentences", we merge those two together so that the span is
// fully contained within a "section".
function sentencify(textArray: string[], locationData?: LocationData[]) {
  const sections = textArray.flatMap(text => tokenizer.sentences(text, TOKENIZER_OPTIONS));

  if (locationData) {
    const spans = locationData
      .flatMap(item => item.mentions)
      .map(mention => mention.location)
      .sort((a, b) => {
        if (a.begin === b.begin) {
          return a.end - b.end;
        }
        return a.begin - b.begin;
      });

    let currIndex = 0;
    let charCount = 0;
    spans.forEach(({ begin, end }) => {
      // find section (item in `textArray`) which contains the `begin` offset
      while (begin >= charCount + sections[currIndex].length) {
        charCount += sections[currIndex].length;
        currIndex++;
      }
      // if span isn't fully contained within current section,
      // then join with following section
      while (end > charCount + sections[currIndex].length) {
        const nextSection = sections.splice(currIndex + 1, 1);
        sections[currIndex] += nextSection[0];
      }
    });
  }

  return sections;
}

// Wrap array of strings into html sections
function generateSections(textArray: string[]) {
  let rollingStart = 0;
  return textArray.map(text => {
    const end = rollingStart + text.length - 1;

    const res = {
      html: `<p data-child-begin="${rollingStart}" data-child-end="${end}">${encodeHTML(text)}</p>`,
      location: {
        begin: rollingStart,
        end
      }
    };

    rollingStart = end + 1;
    return res;
  });
}

/**
 * Transform document text into HTML "sections".
 *
 * @param {string[] | string} text document text
 * @param {object[]} [locationData] (optional) data (such as enrichments array) containing `mentions` property
 */
export function getSectionsFromText(text: string | string[], locationData?: LocationData[]) {
  if (!text) {
    throw new Error('No text to process');
  }

  if (!Array.isArray(text)) {
    text = [text];
  }

  return generateSections(splitTextIntoSections(text, locationData));
}
