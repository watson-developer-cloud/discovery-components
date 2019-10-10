import { ComputeFontFamilyAndWeight, NormalizeFontName } from '../utils/fallbackFonts';

describe('Fallback Font', () => {
  it('Verify that text is being normalized correctly', () => {
    expect(NormalizeFontName('LiberationSerif-Bold')).toEqual('liberationserifbold');
    expect(NormalizeFontName('Andalé Mono')).toEqual('andalemono');
    expect(NormalizeFontName('Arial Unicode MS')).toEqual('arialunicodems');
    expect(NormalizeFontName('Ionic No. 5')).toEqual('ionicno5');
  });

  it('Verify that correct font family is returned', () => {
    expect(ComputeFontFamilyAndWeight('LiberationSerif-Bold').fontFamily).toEqual(
      expect.stringContaining('serif')
    );
    expect(ComputeFontFamilyAndWeight('LiberationSerif').fontFamily).toEqual(
      expect.stringContaining('serif')
    );
    expect(ComputeFontFamilyAndWeight('RotisSemiSerif').fontFamily).toEqual(
      expect.stringContaining('sans-serif')
    );
    expect(ComputeFontFamilyAndWeight('ArialSansSerif').fontFamily).toEqual(
      expect.stringContaining('sans-serif')
    );
    expect(ComputeFontFamilyAndWeight('Consolas').fontFamily).toEqual(
      expect.stringContaining('mono')
    );
    expect(ComputeFontFamilyAndWeight('Andalé Sans').fontFamily).toEqual(
      expect.stringContaining('sans-serif')
    );
    expect(ComputeFontFamilyAndWeight('Andale Sans').fontFamily).toEqual(
      expect.stringContaining('sans-serif')
    );
  });

  it('Verify that correct font weight is returned', () => {
    expect(ComputeFontFamilyAndWeight('LiberationSerif-Bold').fontWeight).toEqual(700);
    expect(ComputeFontFamilyAndWeight('LiberationSerif').fontWeight).toEqual(400);
    //Footlight is name of a font so this test has no weight specified and shoud default to 400
    expect(ComputeFontFamilyAndWeight('Footlight').fontWeight).toEqual(400);
    expect(ComputeFontFamilyAndWeight('FootlightLight').fontWeight).toEqual(300);
    expect(ComputeFontFamilyAndWeight('FootlightUltraLight').fontWeight).toEqual(200);
    expect(ComputeFontFamilyAndWeight('LightFoot').fontWeight).toEqual(400);
  });
});
