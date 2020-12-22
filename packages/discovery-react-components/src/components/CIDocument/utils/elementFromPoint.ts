export interface MsDocument extends Document {
  msElementsFromPoint(x: number, y: number): HTMLElement[];
}

export function elementFromPoint(x: number, y: number, className: string): Element | undefined {
  return document.elementsFromPoint(x, y).find(elem => elem.classList.contains(className));
}

// Edge uses a non-standard name; also returns NodeList instead of array
export function elementFromPointMs(x: number, y: number, className: string): Element | undefined {
  return Array.from((document as MsDocument).msElementsFromPoint(x, y)).find(elem =>
    elem.classList.contains(className)
  );
}

// fallback for older browsers which don't support `document.elementsFromPoint` (note the plural)
export function elementFromPointFallback(
  x: number,
  y: number,
  className: string,
  stopElem: EventTarget | null
): HTMLElement | null {
  const els = [];
  let elem;
  // eslint-disable-next-line no-cond-assign
  while ((elem = document.elementFromPoint(x, y) as HTMLElement | null) && elem !== null) {
    // if we found a field rect or if we've made it back to our container node, stop looping
    if (elem.classList.contains(className)) {
      break;
    }
    if (elem === stopElem) {
      elem = null;
      break;
    }

    // else, set current elem to ignore pointer events and check next layer
    els.push(elem);
    elem.style.pointerEvents = 'none';
  }

  // reset pointer events
  els.forEach(el => (el.style.pointerEvents = 'none'));

  return elem;
}

// @ts-expect-error function is not always defined
const exportFn = document.elementsFromPoint
  ? elementFromPoint
  : // @ts-expect-error function is not always defined
  (document as MsDocument).msElementsFromPoint
  ? elementFromPointMs
  : elementFromPointFallback;
export default exportFn;
