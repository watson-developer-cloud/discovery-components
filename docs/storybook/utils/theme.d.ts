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
export declare const defaultTheme: Theme;
