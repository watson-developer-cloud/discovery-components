export function clearNodeChildren(node: Node): void {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}
