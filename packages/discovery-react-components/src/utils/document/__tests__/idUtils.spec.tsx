import { getId, findElement, findElementIndex } from '../idUtils';

const elements = [
  { text: 'Koya Creative LLC', location: { begin: 469800, end: 469817 } },
  { location: { begin: 282689, end: 282844 }, text: 'This Agreement may only be amended' }
];

const relation: any = [
  {
    type: 'invoice_parts',
    allAttributeIds: ['1618_1621', '1876_1879', '2126_2195', '2435_2440']
  },
  {
    type: 'invoice_parts',
    allAttributeIds: ['1618_1621', '2949_2951', '3197_3268', '3508_3513']
  }
];

describe('idUtils - function getId', () => {
  it('gives back id from a valid item', () => {
    expect(getId(elements[0])).toBe('469800_469817');
  });

  it('gives back undefined from an invalid item', () => {
    const item: any = { text: 'Foo bar' };
    expect(getId(item)).toBeUndefined();
  });
});

describe('idUtils - function findElement', () => {
  it('finds an element in the given list that matches the given ids', () => {
    expect(findElement(elements, ['469800_469817'])).toBe(elements[0]);
  });

  it('gives back undefined if it could not match the given ids', () => {
    expect(findElement(elements, ['random_id'])).toBeUndefined();
    expect(findElement([], ['random_id'])).toBeUndefined();
  });
});

describe('idUtils - function findElementIndex', () => {
  it('Finds the index of an item in the given list that matches the given id', () => {
    expect(findElementIndex(relation, ['1618_1621', '2949_2951', '3197_3268', '3508_3513'])).toBe(
      1
    );
    expect(findElementIndex(relation, [])).toBe(-1);
    expect(findElementIndex([], ['random_id'])).toBe(-1);
  });
});
