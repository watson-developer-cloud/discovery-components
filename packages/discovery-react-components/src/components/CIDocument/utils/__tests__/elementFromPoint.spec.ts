import {
  elementFromPoint,
  elementFromPointMs,
  elementFromPointFallback,
  MsDocument
} from '../elementFromPoint';

const clientX = 50;
const clientY = 50;
const className = 'field--rect';
const stopElem = null;

const classList = (list: string[]): any => {
  return {
    contains: (name: string): boolean => {
      return list.includes(name);
    }
  };
};

const mockElements = [
  { classList: classList(['mockName']), style: { pointerEvents: null } },
  { classList: classList(['mockClass']), style: { pointerEvents: null } },
  { classList: classList([className]), style: { pointerEvents: null } }
];

describe('elementFromPoint', () => {
  it('elementsFromPoint', () => {
    const originalElementsFromPoint = document.elementsFromPoint;
    document.elementsFromPoint = (x: number, y: number): Element[] => {
      return (mockElements as unknown) as Element[];
    };

    const elementResult = elementFromPoint(clientX, clientY, className);
    expect(elementResult).toEqual(mockElements[2]);

    document.elementsFromPoint = originalElementsFromPoint;
  });

  it('elementFromPointMs', () => {
    const originalElementsFromPoint = (document as MsDocument).msElementsFromPoint;
    (document as MsDocument).msElementsFromPoint = (x: number, y: number): HTMLElement[] => {
      return (mockElements as unknown) as HTMLElement[];
    };

    const elementResult = elementFromPointMs(clientX, clientY, className);
    expect(elementResult).toEqual(mockElements[2]);

    document.elementsFromPoint = originalElementsFromPoint;
  });

  it('elementFromPointFallback', () => {
    const originalElementFromPoint = document.elementFromPoint;
    let test = 0;
    document.elementFromPoint = (x: number, y: number): Element | null => {
      return (mockElements[test++] as unknown) as Element;
    };

    const elementResult = elementFromPointFallback(clientX, clientY, className, stopElem);
    expect(elementResult).toEqual(mockElements[2]);

    document.elementFromPoint = originalElementFromPoint;
  });
});
