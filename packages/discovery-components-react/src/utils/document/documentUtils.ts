import uniqWith from 'lodash/uniqWith';
import { getEncodedTextNodeLength } from '../dom';

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

export function getTextNodeAndOffset(node: Node, offset: number): NodeOffset {
  const nodeOffset = parseInt((node as HTMLElement).dataset.childBegin || '0', 10);
  const iterator = document.createNodeIterator(node, NodeFilter.SHOW_TEXT);

  let textNode: Text,
    runningOffset = nodeOffset,
    len: number;
  do {
    textNode = iterator.nextNode() as Text;
  } while (
    textNode &&
    (len = getEncodedTextNodeLength(textNode)) &&
    offset > runningOffset + len &&
    (runningOffset += len)
  );

  if (textNode === null) {
    throw new Error(`Failed to find text node. Node: ${node.textContent}, offset: ${offset}`);
  }

  const textOffset = Math.max(0, offset - runningOffset);
  return { textNode, textOffset };
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
  range.setStart(beginTextNode, beginOffset);
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
