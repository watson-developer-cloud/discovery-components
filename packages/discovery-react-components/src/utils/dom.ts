import { encodeHTML } from 'entities';

export function clearNodeChildren(node: Node): void {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

/**
 * Return HTML encoded text node. Need to encode the string before measuring
 * the length, because the offsets are calculated from the HTML string,
 * which has encoded entities.
 *
 * @param textNode DOM Text node
 */
export function getEncodedTextNode(textNode: Text): string {
  return encodeHTML(textNode.data);
}
