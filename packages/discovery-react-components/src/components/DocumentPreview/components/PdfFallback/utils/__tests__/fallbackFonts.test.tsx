import {
  computeFontFamilyAndWeight,
  normalizeFontName
} from '@DocumentPreview/components/PdfFallback/utils/fallbackFonts';

describe('Fallback Font', () => {
  it('Verify that text is being normalized correctly', () => {
    expect(normalizeFontName('LiberationSerif-Bold')).toEqual('liberationserifbold');
    expect(normalizeFontName('Andalé Mono')).toEqual('andalemono');
    expect(normalizeFontName('Arial Unicode MS')).toEqual('arialunicodems');
    expect(normalizeFontName('Ionic No. 5')).toEqual('ionicno5');
  });

  it('Verify that correct font family is returned', () => {
    expect(computeFontFamilyAndWeight('LiberationSerif-Bold').fontFamily).toEqual(
      expect.stringContaining('serif')
    );
    expect(computeFontFamilyAndWeight('LiberationSerif').fontFamily).toEqual(
      expect.stringContaining('serif')
    );
    expect(computeFontFamilyAndWeight('RotisSemiSerif').fontFamily).toEqual(
      expect.stringContaining('sans-serif')
    );
    expect(computeFontFamilyAndWeight('ArialSansSerif').fontFamily).toEqual(
      expect.stringContaining('sans-serif')
    );
    expect(computeFontFamilyAndWeight('Consolas').fontFamily).toEqual(
      expect.stringContaining('mono')
    );
    expect(computeFontFamilyAndWeight('Andalé Sans').fontFamily).toEqual(
      expect.stringContaining('sans-serif')
    );
    expect(computeFontFamilyAndWeight('Andale Sans').fontFamily).toEqual(
      expect.stringContaining('sans-serif')
    );
  });

  it('Verify that correct font weight is returned', () => {
    expect(computeFontFamilyAndWeight('LiberationSerif-Bold').fontWeight).toEqual(700);
    expect(computeFontFamilyAndWeight('LiberationSerif').fontWeight).toEqual(400);
    //Footlight is name of a font so this test has no weight specified and shoud default to 400
    expect(computeFontFamilyAndWeight('Footlight').fontWeight).toEqual(400);
    expect(computeFontFamilyAndWeight('FootlightLight').fontWeight).toEqual(300);
    expect(computeFontFamilyAndWeight('FootlightUltraLight').fontWeight).toEqual(200);
    expect(computeFontFamilyAndWeight('LightFoot').fontWeight).toEqual(400);
  });
});
