import {
  elementFromPoint,
  elementFromPointMs,
  elementFromPointFallback,
  MsDocument
} from '../elementFromPoint';

const clientX = 50;
const clientY = 50;

// classList mocks the find function that is within elementFromPoint
// it returns an element that has a classList that contains a specified className
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
  { classList: classList(['field--rect']), style: { pointerEvents: null } }
];

describe('elementFromPoint returns expected mock element', () => {
  let originalElementsFromPoint: any;
  let originalMsElementsFromPoint: any;
  let originalElementFromPoint: any;

  beforeAll(() => {
    originalElementsFromPoint = document.elementsFromPoint;
    originalMsElementsFromPoint = (document as MsDocument).msElementsFromPoint;
    originalElementFromPoint = document.elementFromPoint;
  });

  afterAll(() => {
    document.elementsFromPoint = originalElementsFromPoint;
    (document as MsDocument).msElementsFromPoint = originalMsElementsFromPoint;
    document.elementFromPoint = originalElementFromPoint;
  });

  it('runs elementsFromPoint function for standard web browsers', () => {
    document.elementsFromPoint = (_x: number, _y: number): Element[] => {
      return mockElements as unknown as Element[];
    };

    const elementResult = elementFromPoint(clientX, clientY, 'field--rect');
    expect(elementResult).toEqual(mockElements[2]);
  });

  it('runs elementFromPointMs function for MS Edge browser', () => {
    (document as MsDocument).msElementsFromPoint = (_x: number, _y: number): HTMLElement[] => {
      return mockElements as unknown as HTMLElement[];
    };

    const elementResult = elementFromPointMs(clientX, clientY, 'field--rect');
    expect(elementResult).toEqual(mockElements[2]);
  });

  it('runs elementFromPointFallback function for older browsers', () => {
    let nextElementIndex = 0;
    document.elementFromPoint = (_x: number, _y: number): Element | null => {
      return nextElementIndex < mockElements.length
        ? (mockElements[nextElementIndex++] as unknown as Element)
        : null;
    };

    const elementResult = elementFromPointFallback(clientX, clientY, 'field--rect', null);
    expect(elementResult).toEqual(mockElements[2]);
  });

  it('runs elementFromPointFallback and fails to find element', () => {
    let nextElementIndex = 0;
    document.elementFromPoint = (_x: number, _y: number): Element | null => {
      return nextElementIndex < mockElements.length
        ? (mockElements[nextElementIndex++] as unknown as Element)
        : null;
    };

    const elementResult = elementFromPointFallback(clientX, clientY, 'should-be-null', null);
    expect(elementResult).toEqual(null);
  });
});
