import { encodeHTML } from 'entities';

export function clearNodeChildren(node: Node): void {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

/**
 * Return length of text node's HTML encoded length. Need to encode the string
 * before measuring, because the offsets are calculated from the HTML string,
 * which has encoded entities. However, `textNode.length` will return length
 * of decoded text (from DOM).
 *
 * @param textNode DOM Text node
 */
export function getEncodedTextNodeLength(textNode: Text): number {
  return encodeHTML(textNode.data).length;
}
