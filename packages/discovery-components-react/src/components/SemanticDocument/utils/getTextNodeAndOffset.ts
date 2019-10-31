import { NodeOffset } from '../../../utils/documentUtils';
import get from 'lodash/get';

export function getTextNodeAndOffset(node: Node, offset: number): NodeOffset {
  const textNode = document.createNodeIterator(node, NodeFilter.SHOW_TEXT).nextNode() as Text;
  if (textNode === null) {
    throw new Error(`Failed to find text node. Node: ${node.textContent}, offset: ${offset}`);
  }
  const childBegin = get(textNode, 'parentNode.dataset.childBegin') || 0;
  const textOffset = Math.max(0, offset - childBegin);
  return { textNode, textOffset };
}
