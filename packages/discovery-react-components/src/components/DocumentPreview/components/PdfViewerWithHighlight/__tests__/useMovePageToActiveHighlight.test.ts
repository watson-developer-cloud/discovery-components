import { renderHook } from '@testing-library/react-hooks';
import { useMovePageToActiveHighlight } from '../PdfViewerWithHighlight';

type HookProps = {
  page?: number;
  highlightPages?: number[];
  activeIds?: string[] | undefined;
  setPage?: ((page: number) => any) | undefined;
};

const EMPTY_ARRAY: never[] = [];

describe('useMovePageToActiveHighlight', () => {
  let setPage: any;

  beforeEach(() => {
    setPage = jest.fn();
  });

  function render(initialProps: HookProps = {}) {
    return renderHook(
      (props: HookProps) =>
        useMovePageToActiveHighlight(
          props.page ?? 1,
          props.highlightPages ?? EMPTY_ARRAY,
          props.activeIds ?? EMPTY_ARRAY,
          props.setPage ?? setPage
        ),
      { initialProps }
    );
  }

  describe('without having active highlight initially', () => {
    it('returns the initial page', () => {
      const rendered = render({ page: 3 });
      expect(rendered.result.current).toBe(3); // page to render
      expect(setPage).toBeCalledTimes(0); // set page shouldn't be called
    });

    it('returns the updated page after page is changed', () => {
      const rendered = render({ page: 3 });

      // update page (i.e. user changes the current page)
      rendered.rerender({ page: 5 });
      expect(rendered.result.current).toBe(5);
      expect(setPage).toBeCalledTimes(0); // set page shouldn't be called
    });

    it('returns the active highlight page after active highlight is set', () => {
      const rendered = render({ page: 3 });

      // active highlight is set
      rendered.rerender({ page: 3, highlightPages: [8] });
      expect(rendered.result.current).toBe(8);
      expect(setPage).toBeCalledTimes(1); // setPage should is called to to notify page change
      expect(setPage).toBeCalledWith(8);

      setPage.mockReset();
      rendered.rerender({ page: 8, highlightPages: [8] }); // page updated by the setPage
      expect(rendered.result.current).toBe(8);
      expect(setPage).toBeCalledTimes(0);
    });
  });

  describe('with having active highlight', () => {
    it('returns the page having the active highlight', () => {
      const rendered = render({ page: 3, highlightPages: [5] });
      expect(rendered.result.current).toBe(5); // page to render
      expect(setPage).toBeCalledTimes(1); // setPage should is called to to notify page change
      expect(setPage).toBeCalledWith(5);

      setPage.mockReset();
      rendered.rerender({ page: 5, highlightPages: [5] }); // page updated by the setPage
      expect(rendered.result.current).toBe(5);
      expect(setPage).toBeCalledTimes(0);
    });

    it('returns the page after page is changed', () => {
      const highlightPages = [5];
      const rendered = render({ page: 5, highlightPages });

      // update page (i.e. user changes the current page)
      rendered.rerender({ page: 8, highlightPages });
      expect(rendered.result.current).toBe(8);
      expect(setPage).toBeCalledTimes(0);
    });

    it('returns the active highlight page after active highlight page is updated', () => {
      const rendered = render({ page: 5, highlightPages: [5] });

      // update active highlight's page
      rendered.rerender({ page: 5, highlightPages: [8] });
      expect(rendered.result.current).toBe(8);
      expect(setPage).toBeCalledTimes(1);
      expect(setPage).toBeCalledWith(8);

      setPage.mockReset();
      rendered.rerender({ page: 8, highlightPages: [8] }); // page updated by the setPage
      expect(rendered.result.current).toBe(8);
      expect(setPage).toBeCalledTimes(0);
    });

    it('invokes setPage when active highlight id is updated and page change is necessary', () => {
      const highlightPages = [5];
      const activeIds1 = ['1'];
      const activeIds2 = ['2'];
      const activeIds3 = ['3'];
      const rendered = render({ page: 5, highlightPages, activeIds: activeIds1 });

      // change active highlight
      rendered.rerender({ page: 5, highlightPages, activeIds: activeIds2 });
      expect(rendered.result.current).toBe(5);
      expect(setPage).toBeCalledTimes(0);

      // move page
      rendered.rerender({ page: 6, highlightPages, activeIds: activeIds2 });
      expect(rendered.result.current).toBe(6);

      // change active highlight
      rendered.rerender({ page: 6, highlightPages, activeIds: activeIds3 });
      expect(rendered.result.current).toBe(5);
      expect(setPage).toBeCalledTimes(1);
      expect(setPage).toBeCalledWith(5); // the page should get back to page 5
    });
  });
});
