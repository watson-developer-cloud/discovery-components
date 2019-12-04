import deburr from 'lodash/deburr';
// import memoize from 'lodash/memoize';
import {
  serif,
  sansSerif,
  semiSerif,
  monoSpace,
  cursive,
  dingbat,
  weightsMap
} from '@DocumentPreview/components/PdfFallback/utils/fontsList';
import leven from 'leven';

/**
 * Fallback font-family stack for a given generic type
 * @see https://github.com/IBM/plex/tree/v3.0.0
 */
const fontFamilyStack = {
  serif: `'IBM Plex Serif', 'Georgia', Times, serif`,
  'sans-serif': `'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif`,
  monospace: `'IBM Plex Mono', 'Menlo', 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', Courier, monospace`,
  cursive: `cursive`
};

/**
 * Normalized string
 * deburr - convert accented chars to basic ASCII chars
 * replace - removes any non-word character from string, including whitespace
 * @param {string} name string to normalize
 * @return {string} normalized value
 */
export const normalizeFontName = (name: string): string =>
  deburr(name)
    .toLowerCase()
    .replace(/\W/g, '');

const fonts = {};

/**
 * Map font families into global `fonts` array
 */
function mapFonts(typename: string, fontArray: Array<string>): void {
  fontArray.forEach((item: string) => {
    const type = typename === 'dingbat' ? 'sans-serif' : typename;
    fonts[normalizeFontName(item)] = { name: item, type };
  });
}

mapFonts('serif', serif);
mapFonts('sans-serif', sansSerif);
mapFonts('sans-serif', semiSerif);
mapFonts('monospace', monoSpace);
mapFonts('cursive', cursive);
mapFonts('dingbat', dingbat);

/**
 * Find font name which is "closest" to given name
 */
function findFont(fontName: string): { name: string; type: string; distance: number } {
  const normalized = normalizeFontName(fontName);
  const initValue = { ...fonts[0], distance: Number.MAX_SAFE_INTEGER };
  return Object.keys(fonts).reduce((current, fontString) => {
    const newDistance = leven(fontString, normalized);
    if (newDistance < current.distance) {
      return {
        ...fonts[fontString],
        distance: newDistance
      };
    }
    return current;
  }, initValue);
}

interface ComputeShape {
  fontFamily: string;
  fontWeight: number;
}

/**
 * Compute font family and font weight from provided font string
 *
 * @param {string} fontString string representing font
 * @return {Object} containing font value and font weight
 */
export const computeFontFamilyAndWeight = (fontString: string): ComputeShape => {
  let closestFont;
  let fontWeight = weightsMap.Normal;

  // find closest font
  closestFont = findFont(fontString);

  // distance is a bit high; perhaps font name includes weight info?
  if (closestFont.distance > 2) {
    // search for weight string at the end of font string
    let fontWeightIndex;
    for (const key in weightsMap) {
      const index = fontString.search(new RegExp(key + '$', 'i'));
      if (index >= 0) {
        fontWeightIndex = index;
        break;
      }
    }

    // if weight string is found separate weight string from weight name
    if (fontWeightIndex) {
      // get weight value from weight string
      fontWeight = weightsMap[fontString.substr(fontWeightIndex)];
      const fontWithoutWeight = fontString.substr(0, fontWeightIndex);

      // search for closest font
      const closestFontWithoutWeight = findFont(fontWithoutWeight);

      // compare latest font to earlier one, using distance
      closestFont =
        closestFontWithoutWeight.distance < closestFont.distance
          ? closestFontWithoutWeight
          : closestFont;
    }
  }

  const fontFamily = fontFamilyStack[closestFont.type] || fontFamilyStack['sans-serif'];

  return { fontFamily: `'${fontString}', '${closestFont.name}', ${fontFamily}`, fontWeight };
};
