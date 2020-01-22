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
  const allNodes = Array.from(parentNode.querySelectorAll('[data-child-begin]')) as HTMLElement[];

  let beginNode,
    endNode,
    idx = 0;

  do {
    beginNode = allNodes[idx];
  } while (
    ++idx &&
    idx < allNodes.length &&
    begin >= parseInt(allNodes[idx].dataset.childBegin || '0', 10)
  );

  idx--; // reset to index of `beginNode`

  do {
    endNode = allNodes[idx];
  } while (
    ++idx &&
    idx < allNodes.length &&
    end > parseInt(allNodes[idx].dataset.childBegin as string, 10)
  );

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
  const beginStrOffset = parseInt(nodeElement.dataset.childBegin || '0', 10);
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
  let textNode: Text, len: number;
  do {
    textNode = iterator.nextNode() as Text;
  } while (textNode && (len = textNode.data.length) && domOffset > len && (domOffset -= len));

  if (textNode === null) {
    throw new Error(`Failed to find text node. Node: ${node.textContent}, offset: ${strOffset}`);
  }

  return { textNode, textOffset: domOffset };
}

interface CreateFieldRectsProps {
  fragment: DocumentFragment;
  parentRect: DOMRect;
  fieldType: string;
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
  fieldId,
  beginTextNode,
  beginOffset,
  endTextNode,
  endOffset
}: CreateFieldRectsProps): void {
  // create a Range for each field
  const range = document.createRange();
  range.setStart(beginTextNode, Math.min(beginOffset, beginTextNode.length));
  range.setEnd(endTextNode, Math.min(endOffset, endTextNode.length));

  // create a field container
  const fieldNode = document.createElement('div');
  fieldNode.className = 'field';
  fieldNode.dataset.fieldType = fieldType;
  fieldNode.dataset.fieldId = fieldId;
  fragment.appendChild(fieldNode);

  // create highlight rect(s) inside of a field
  Array.prototype.forEach.call(uniqRects(range.getClientRects() as DOMRectList), rect => {
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

type Span = {
  begin: number;
  end: number;
};

export function spansIntersect(
  { begin: beginA, end: endA }: Span,
  { begin: beginB, end: endB }: Span
): boolean {
  return beginA <= endB && endA >= beginB;
}
