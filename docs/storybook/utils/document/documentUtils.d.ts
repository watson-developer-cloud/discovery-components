interface FindOffsetResults {
    beginTextNode: Text;
    beginOffset: number;
    endTextNode: Text;
    endOffset: number;
}
export interface NodeOffset {
    textNode: Text;
    textOffset: number;
}
/**
 * Find the offsets within the children of the given node
 * @param parentNode DOM node containing children with attributes `data-child-begin` and `data-child-end`
 * @param begin the start offset to search for
 * @param end end offset
 * @param _getTextNodeAndOffset function for retrieving text node and offset
 * @return begin/end text nodes and offsets within those nodes; for use with DOM `Range`
 */
export declare function findOffsetInDOM(parentNode: HTMLElement, begin: number, end: number): FindOffsetResults;
/**
 * Find the appropriate DOM TextNode and offset within to match the given
 * string offset
 * @param {HTMLElement} node
 * @param {number} strOffset - offset into HTML string
 * @return TextNode and DOM offset matching the given string offset
 */
export declare function getTextNodeAndOffset(node: Node, strOffset: number): NodeOffset;
interface CreateFieldRectsProps {
    fragment: DocumentFragment;
    parentRect: DOMRect;
    fieldType: string;
    fieldValue: string;
    fieldId: string;
    beginTextNode: Text;
    beginOffset: number;
    endTextNode: Text;
    endOffset: number;
}
/**
 * Create "field" rects in the DOM, starting/ending with values of beginTextNode/beginOffset
 * & endTextNode/endOffset.
 * @param args.fragment DocumentFragment or Node in which to create field rects
 * @param args.parentRect dimensions of parent of field rects
 * @param args.fieldType type string for field rects
 * @param args.fieldValue displayed in tooltip
 * @param args.fieldId id string for field rects
 * @param args.beginTextNode
 * @param args.beginOffset
 * @param args.endTextNode
 * @param args.endOffset
 */
export declare function createFieldRects({ fragment, parentRect, fieldType, fieldValue, fieldId, beginTextNode, beginOffset, endTextNode, endOffset }: CreateFieldRectsProps): void;
/**
 * Iterate over all the DOMRects for a range
 * @param beginTextNode
 * @param beginOffset
 * @param endTextNode
 * @param endOffset
 * @param callback a callback invoked with each DOMRect in a range
 */
export declare function forEachRectInRange(beginTextNode: Text, beginOffset: number, endTextNode: Text, endOffset: number, callback: (rect: DOMRect) => any): void;
export declare function uniqRects(rects: DOMRectList): Partial<DOMRectList>;
/**
 * Finds the descendant node that contains the given offset.
 * This is done efficiently via a binary search.
 * @param parentNode node to search the descendants of
 * @param offset value to find within the nodes
 * @return the descendant node, or null if none is found
 */
export declare function findContainingNodeWithin(parentNode: HTMLElement, offset: number): HTMLElement | null;
/**
 * Finds the index within an array of the node that contains the given offset.
 * This is done efficiently via a binary search.
 * @param sortedArray array of disjoint node sorted by both data-child-begin and data-child-end
 * @param offset value to find within the nodes
 * @return index of the containing node, or -1 if none is found
 */
export declare function getContainingNode(sortedArray: HTMLElement[], offset: number): HTMLElement | null;
type Span = {
    begin: number;
    end: number;
};
export declare function spansIntersect({ begin: beginA, end: endA }: Span, { begin: beginB, end: endB }: Span): boolean;
export {};
