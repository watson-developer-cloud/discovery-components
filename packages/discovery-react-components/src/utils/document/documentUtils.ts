import uniqWith from 'lodash/uniqWith';
import { decodeHTML } from 'entities';

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
export function findOffsetInDOM(
  parentNode: HTMLElement,
  begin: number,
  end: number
): FindOffsetResults {
  // Find the lowest nodes within the DOM tree that contain begin and end offsets
  let beginNode = findContainingNodeWithin(parentNode, begin);
  let endNode = findContainingNodeWithin(parentNode, end);

  if (beginNode === null) {
    beginNode = parentNode;
    console.warn(
      `Unable to find a node containing the start of the highlight: ${begin}. Using root node instead.`
    );
  }
  if (endNode === null) {
    endNode = parentNode;
    console.warn(
      `Unable to find a node containing the end of the highlight: ${end}. Using root node instead.`
    );
  }

  const { textNode: beginTextNode, textOffset: beginOffset } = getTextNodeAndOffset(
    beginNode,
    begin
  );
  const { textNode: endTextNode, textOffset: endOffset } = getTextNodeAndOffset(endNode, end);

  return {
    beginTextNode: beginTextNode as Text,
    beginOffset,
    endTextNode: endTextNode as Text,
    endOffset
  };
}

/**
 * Find the appropriate DOM TextNode and offset within to match the given
 * string offset
 * @param {HTMLElement} node
 * @param {number} strOffset - offset into HTML string
 * @return TextNode and DOM offset matching the given string offset
 */
export function getTextNodeAndOffset(node: Node, strOffset: number): NodeOffset {
  const nodeElement = node as HTMLElement;
  // beginOffset - offset into HTML string for beginning of this node's content
  const beginStrOffset = getChildBegin(nodeElement);
  // domOffset - offset within DOM node
  let domOffset = Math.max(0, strOffset - beginStrOffset);

  // If attribute 'data-orig-text' is present then the string contains some
  // encoded entities so, we need adjust the `domOffset`
  const originalText = nodeElement.dataset.origText;
  if (originalText) {
    // To properly calculate the offset of the string we want to highlight
    // we need to get the offset from the decoded html text and subtract
    // it from the original encoded html offset. we doing this because the
    // offsets are based on the original html string which may contain
    // html entities (eg. `&quot;`), however those entities get rendered in
    // the dom which throws off the offsets values, for example `&quot;`
    // becomes `"`, going from 6 characters to 1.
    const encodedTextSubstring = originalText.substring(0, domOffset);
    const decodedText = decodeHTML(encodedTextSubstring);
    const adjustment = domOffset - decodedText.length;
    domOffset = Math.max(0, domOffset - adjustment);
  }

  // In certain cases (i.e. text length > 65536 chars), the DOM will break
  // up text into multiple TextNodes. Loop through TextNodes, finding which
  // contains the `domOffset`
  const iterator = document.createNodeIterator(node, NodeFilter.SHOW_TEXT);
  let textNode: Text | null = null,
    len: number,
    prevNode: Text | null;
  do {
    prevNode = textNode;
    textNode = iterator.nextNode() as Text;
  } while (textNode && (len = textNode.data.length) && domOffset > len && (domOffset -= len));

  if (textNode === null && prevNode === null) {
    // If no text nodes were found, throw an error.
    throw new Error(`Unable to find text node. Node: ${node.textContent}, offset: ${strOffset}`);
  } else if (textNode === null && prevNode !== null) {
    // If the offset was not found in the last text node,
    // return the last node with an offset pointing to the end of that node.
    return { textNode: prevNode, textOffset: prevNode.data.length };
  } else {
    // If the offset was within a node, return that node.
    return { textNode, textOffset: domOffset };
  }
}

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
export function createFieldRects({
  fragment,
  parentRect,
  fieldType,
  fieldValue,
  fieldId,
  beginTextNode,
  beginOffset,
  endTextNode,
  endOffset
}: CreateFieldRectsProps): void {
  // create a field container
  const fieldNode = document.createElement('div');
  fieldNode.className = 'field';
  fieldNode.dataset.fieldType = fieldType;
  fieldNode.dataset.fieldValue = fieldValue;
  fieldNode.dataset.fieldId = fieldId;
  fieldNode.setAttribute('data-testid', `field-${fieldId}`);
  fragment.appendChild(fieldNode);

  // create highlight rect(s) inside of a field
  forEachRectInRange(beginTextNode, beginOffset, endTextNode, endOffset, rect => {
    const div = document.createElement('div');
    div.className = 'field--rect';
    div.setAttribute('data-testid', 'field-rect');
    div.setAttribute(
      'style',
      `top: ${rect.top - parentRect.top}px;
            left: ${rect.left - parentRect.left}px;
            width: ${rect.width}px;
            height: ${rect.height}px;`
    );
    fieldNode.appendChild(div);
  });
}

/**
 * Iterate over all the DOMRects for a range
 * @param beginTextNode
 * @param beginOffset
 * @param endTextNode
 * @param endOffset
 * @param callback a callback invoked with each DOMRect in a range
 */
export function forEachRectInRange(
  beginTextNode: Text,
  beginOffset: number,
  endTextNode: Text,
  endOffset: number,
  callback: (rect: DOMRect) => any
) {
  // create a Range
  const range = document.createRange();
  range.setStart(beginTextNode, Math.min(beginOffset, beginTextNode.length));
  range.setEnd(endTextNode, Math.min(endOffset, endTextNode.length));

  // visit rects in the range
  Array.prototype.forEach.call(uniqRects(range.getClientRects() as DOMRectList), callback);
}

// Some browsers (Chrome, Safari) return duplicate rects
export function uniqRects(rects: DOMRectList): Partial<DOMRectList> {
  return uniqWith(
    rects,
    (rectA, rectB) =>
      rectA.bottom === rectB.bottom &&
      rectA.height === rectB.height &&
      rectA.left === rectB.left &&
      rectA.right === rectB.right &&
      rectA.top === rectB.top &&
      rectA.width === rectB.width &&
      rectA.x === rectB.x &&
      rectA.y === rectB.y
  );
}

/**
 * Finds the descendant node that contains the given offset.
 * This is done efficiently via a binary search.
 * @param parentNode node to search the descendants of
 * @param offset value to find within the nodes
 * @return the descendant node, or null if none is found
 */
export function findContainingNodeWithin(parentNode: HTMLElement, offset: number) {
  let foundNode = null,
    nodeToSearch: HTMLElement | null = parentNode;

  while (!!nodeToSearch) {
    // Get all children of the current node to search
    let nodes = Array.from(nodeToSearch.children) as HTMLElement[];

    // Perform binary search for the offset value on the array of nodes
    // (This array of nodes will always be sorted by both
    //  begin AND end, since sibling nodes are disjoint.)
    const currentFoundNode = getContainingNode(nodes, offset);

    if (!!currentFoundNode) {
      // If we found a node, set it to the found node and then search its children
      // (in case there's a node lower in the DOM tree that contains the offset as well)
      foundNode = currentFoundNode;
      nodeToSearch = foundNode;
    } else {
      // If we didn't find a containing node at this level, stop looping
      nodeToSearch = null;
    }
  }

  // return the lowest DOM element that contains the offset value
  return foundNode;
}

/**
 * Finds the index within an array of the node that contains the given offset.
 * This is done efficiently via a binary search.
 * @param sortedArray array of disjoint node sorted by both data-child-begin and data-child-end
 * @param offset value to find within the nodes
 * @return index of the containing node, or -1 if none is found
 */
export function getContainingNode(sortedArray: HTMLElement[], offset: number) {
  // Set the low and high markers to the outer edges of the array
  let lowIdx = 0,
    highIdx = sortedArray.length - 1,
    midIdx;

  // Keep looping until the low marker passes the high marker
  while (lowIdx <= highIdx) {
    // Set the pivot to the halfway point of the outer markers
    midIdx = Math.floor((highIdx + lowIdx) / 2);
    const currentNode = sortedArray[midIdx];
    if (getChildEnd(currentNode) < offset) {
      // If the end of the current pivot node is below the offset we're looking for,
      // we should look above the pivot (i.e. move the low marker up).
      lowIdx = midIdx + 1;
    } else if (getChildBegin(currentNode) > offset) {
      // If the begin of the current pivot node is above the offset we're looking for,
      // we should look below the pivot (i.e. move the high marker down).
      highIdx = midIdx - 1;
    } else {
      // If neither of the above conditions above are true (i.e. begin <= offset <= end),
      // the offset is within the current pivot node, so return its index
      return currentNode;
    }
  }

  // If the low marker passes the high marker without finding a match, there is no match.
  return null;
}

function getChildBegin(node: HTMLElement) {
  return parseInt(node.dataset.childBegin || '0', 10);
}

function getChildEnd(node: HTMLElement) {
  return parseInt(node.dataset.childEnd || '0', 10);
}

type Span = {
  begin: number;
  end: number;
};

export function spansIntersect(
  { begin: beginA, end: endA }: Span,
  { begin: beginB, end: endB }: Span
): boolean {
  return beginA <= endB && endA > beginB;
}
