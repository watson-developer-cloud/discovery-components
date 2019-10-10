import deburr from 'lodash/deburr';
import { serif, sansSerif, semiSerif, monoSpace, weightsMap } from './fontsList';

interface ComputeShape {
  fontFamily: string;
  fontWeight: number;
}

/**
 * Normalized string
 * deburr - convert accented chars to basic ASCII chars
 * replace - removes any non-word character from string, including whitespace
 * @param {string} name string to normalize
 * @return {string} normalized value
 */
const NormalizeFontName = (name: string): string =>
  deburr(name)
    .toLowerCase()
    .replace(/\W/g, '');

const fontsFamilyMap = new Map();

serif.forEach(font => fontsFamilyMap.set(NormalizeFontName(font), 'serif'));

semiSerif.forEach(font => fontsFamilyMap.set(NormalizeFontName(font), 'sans-serif'));

sansSerif.forEach(font => fontsFamilyMap.set(NormalizeFontName(font), 'sans-serif'));

monoSpace.forEach(font => fontsFamilyMap.set(NormalizeFontName(font), 'monospace'));

const getFontStack = (font: string): string => {
  const stack = {
    serif: 'IBM Plex Serif, Georgia, Times, serif',
    'sans-serif': 'IBM Plex Sans, Helvetica Neue, Arial, sans-serif',
    monospace:
      'IBM Plex Mono, Menlo, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier, monospace'
  };

  return stack[font];
};

/**
 * Compute font family and font weight from provided font string
 *
 * @param {string} fontString string representing font
 * @return {Object} containing font value and font weight
 */
const ComputeFontFamilyAndWeight = (fontString: string): ComputeShape => {
  //normalize incoming font string
  let fontFamilyName = NormalizeFontName(fontString);
  let fontWeight = weightsMap.Normal;
  let fontWeightIndex;
  //check if normalized font string is present in font map
  let fontFamilyString = fontsFamilyMap.get(fontFamilyName);

  if (!fontFamilyString) {
    //search for weight string at the end of font string
    for (const key in weightsMap) {
      const index = fontString.search(new RegExp(key + '$', 'i'));
      if (index >= 0) {
        fontWeightIndex = index;
        break;
      }
    }
    //if weight string is found separate weight string from weight name
    if (fontWeightIndex) {
      //get weight value from weight string
      fontWeight = weightsMap[fontString.substr(fontWeightIndex)];
      //get new normalized font name after removing weight string
      fontFamilyName = NormalizeFontName(fontString.substr(0, fontWeightIndex));
      //check if new normalized font name is present in the map
      fontFamilyString = fontsFamilyMap.get(fontFamilyName);
    }
  }

  //if font family is available get the corresponding stack else get the default stack sans-serif
  const fontFamily = getFontStack(fontFamilyString) || getFontStack('sans-serif');

  return { fontFamily, fontWeight };
};

export { ComputeFontFamilyAndWeight, NormalizeFontName };
