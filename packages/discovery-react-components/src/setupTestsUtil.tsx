// Helper functions to acount for DOMRect
// guidance https://stackoverflow.com/questions/71521976/referenceerror-domrect-is-not-defined
// globalThis https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis
export function defineDOMRect() {
  globalThis.DOMRect = class DOMRect {
    x: number = 0;
    y: number = 0;
    bottom: number = 0;
    left: number = 0;
    right: number = 0;
    top: number = 0;
    width: number = 0;
    height: number = 0;
    constructor(
      x: number | undefined = 0,
      y: number | undefined = 0,
      width: number | undefined = 0,
      height: number | undefined = 0
    ) {
      this.top = x;
      this.bottom = y + height;
      this.right = x + width;
      this.left = x;
      this.width = width;
      this.height = height;
    }
    static fromRect(other: DOMRectInit): DOMRect {
      return new DOMRect(other.x, other.y, other.width, other.height);
    }
    toJSON() {
      return JSON.stringify(this);
    }
  };
}

export function removeDOMRect() {
  delete globalThis.DOMRect;
}
