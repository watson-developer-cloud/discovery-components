import { intersects } from '@DocumentPreview/components/PdfFallback/utils/box';

describe('box', () => {
  it('returns that boxes intersect', () => {
    // [left, top, right, bottom]
    const boxA = [10, 10, 20, 20];
    const boxB = [15, 15, 25, 25];
    expect(intersects(boxA, boxB)).toEqual(true);
  });

  it('returns that boxes do not intersect', () => {
    const boxA = [10, 10, 20, 20];
    const boxB = [21, 10, 25, 20];
    expect(intersects(boxA, boxB)).toEqual(false);
  });
});
