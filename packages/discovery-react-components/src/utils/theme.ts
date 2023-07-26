// @see https://www.carbondesignsystem.com/guidelines/color/usage/
// @see https://www.ibm.com/design/language/elements/color

const colors = {
  blue20: '#c9deff',
  blue30: '#97c1ff',
  gray20: '#dcdcdc',
  purple30: '#d0b0ff'
};

const whiteTheme = {
  highlight: colors.blue20,
  hover_selected_ui: colors.gray20
};

export interface Theme {
  /**
   * Text highlight color
   */
  highlightBackground: string;
  /**
   * Active element, darker than text highlight
   */
  activeHighlightBackground: string;
  /**
   * Highlight color within active element
   */
  highlightWithinActiveHighlightBackground: string;
  /**
   * Background color when hovering over text
   */
  textHoverBackground: string;
}

export const defaultTheme: Theme = {
  highlightBackground: whiteTheme.highlight,
  activeHighlightBackground: 'unset',
  highlightWithinActiveHighlightBackground: colors.purple30,
  textHoverBackground: whiteTheme.hover_selected_ui
};
