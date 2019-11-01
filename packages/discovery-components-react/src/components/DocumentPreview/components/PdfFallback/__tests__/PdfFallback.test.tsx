import React from 'react';
import {
  act,
  cleanup,
  render,
  waitForElement,
  BoundFunction,
  GetByText
} from '@testing-library/react';
import PdfFallback from '../PdfFallback';
import docJson from '../../../__fixtures__/Art Effects Koya Creative Base TSA 2008.pdf.json';
import fieldNameTest from '../../../__fixtures__/FieldNameTest.json';

describe('PdfFallback', () => {
  const mockedBbox = {
    x: 0,
    y: 0,
    width: 10,
    height: 12
  };

  const originalGetBBox = (SVGElement.prototype as SVGTextElement).getBBox;
  beforeEach(
    () =>
      ((SVGElement.prototype as SVGTextElement).getBBox = (): any => {
        return mockedBbox;
      })
  );

  afterEach(cleanup);
  afterEach(() => ((SVGElement.prototype as SVGTextElement).getBBox = originalGetBBox));

  it('Verify number of line generated is accurate', async () => {
    let container: HTMLElement;
    act(() => {
      ({ container } = render(
        <PdfFallback document={docJson} currentPage={1} setLoading={(): void => {}} />
      ));
    });

    const svgTag = await waitForElement<SVGElement>(() => {
      const svgTag = container.querySelector('svg');
      if (!svgTag) {
        throw new Error();
      }
      return svgTag;
    });

    if (svgTag !== null) {
      expect(svgTag.children.length).toEqual(31);
    } else {
      throw new Error('expected to find SVG element');
    }
  });

  it('Verify the right values are being put on the page', async () => {
    let getByText: BoundFunction<GetByText> = () => {
      throw new Error();
    };

    act(() => {
      ({ getByText } = render(
        <PdfFallback document={docJson} currentPage={1} setLoading={(): void => {}} />
      ));
    });

    await waitForElement(() => getByText('1.0 Definitions'));

    getByText('1.0 Definitions');
    getByText(
      'materials basis as set out in the relevant SOW and charged in accordance with Clause 5 (Pricing) and additional terms within'
    );
  });

  it('loads text, title, and table field names', () => {
    const wrapper = render(
      <PdfFallback document={fieldNameTest} currentPage={1} setLoading={(): void => {}} />
    );

    wrapper.getByText('Technical');
    wrapper.getByText('Party');
    wrapper.getByText(
      'On 22 December 2008 ART EFFECTS LIMITED and Customer entered into an Framework Agreement'
    );
  });
});
