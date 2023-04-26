import * as React from 'react';
import { render, RenderResult, fireEvent, waitFor, within } from '@testing-library/react';
import { wrapWithContext } from 'utils/testingUtils';
import SearchFacets from 'components/SearchFacets/SearchFacets';
import {
  SearchContextIFC,
  SearchApiIFC,
  searchResponseStoreDefaults,
  globalAggregationsResponseStoreDefaults
} from 'components/DiscoverySearch/DiscoverySearch';
import { facetsQueryResponse } from 'components/SearchFacets/__fixtures__/facetsQueryResponse';

interface Setup {
  context: Partial<SearchContextIFC>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetchAggregationsMock: jest.Mock<any, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  performSearchMock: jest.Mock<any, any>;
  searchFacetsComponent: RenderResult;
}

interface SetupConfig {
  filter: string;
  collapsedFacetsCount: number;
  showMatchingResults: boolean;
}

const defaultSetupConfig: SetupConfig = {
  filter: '',
  collapsedFacetsCount: 5,
  showMatchingResults: true
};

const setup = (setupConfig: Partial<SetupConfig> = {}): Setup => {
  const mergedSetupConfig = { ...defaultSetupConfig, ...setupConfig };
  const fetchAggregationsMock = jest.fn();
  const performSearchMock = jest.fn();
  const context: Partial<SearchContextIFC> = {
    globalAggregationsResponseStore: {
      ...globalAggregationsResponseStoreDefaults,
      data: facetsQueryResponse.result.aggregations || []
    },
    searchResponseStore: {
      ...searchResponseStoreDefaults,
      parameters: {
        projectId: '',
        filter: mergedSetupConfig.filter,
        aggregation: '[term(author,count:3),term(subject,count:4)]'
      }
    }
  };
  const api: Partial<SearchApiIFC> = {
    performSearch: performSearchMock,
    fetchAggregations: fetchAggregationsMock
  };
  const searchFacetsComponent = render(
    wrapWithContext(
      <SearchFacets
        collapsedFacetsCount={mergedSetupConfig.collapsedFacetsCount}
        showMatchingResults={mergedSetupConfig.showMatchingResults}
      />,
      api,
      context
    )
  );
  return {
    context,
    performSearchMock,
    fetchAggregationsMock,
    searchFacetsComponent
  };
};

describe('CollapsibleFacetsGroupComponent', () => {
  describe('when aggregations should not be collapsed for any fields', () => {
    test('show more link is not shown', async () => {
      const { searchFacetsComponent } = setup({ collapsedFacetsCount: 20 });
      // wait for component to finish rendering (prevent "act" warning)
      await waitFor(() => {
        searchFacetsComponent.findByText('category');
      });
      const showMoreButtons = searchFacetsComponent.queryAllByText('Show more');
      expect(showMoreButtons).toHaveLength(0);
    });
  });

  describe('when aggregations should be collapsed for some fields', () => {
    test('show more and show all links are only shown for facet group with too many results', async () => {
      const { searchFacetsComponent } = setup({ collapsedFacetsCount: 5 });
      const showMoreButtons = await searchFacetsComponent.findAllByText('Show more');
      expect(showMoreButtons).toHaveLength(1);
      const showAllButtons = searchFacetsComponent.queryAllByText('Show all');
      expect(showAllButtons).toHaveLength(1);
    });
  });

  describe('when aggregations are collapsed for multiple facets', () => {
    test('show more and show all links are only shown for multiple facet groups', async () => {
      const { searchFacetsComponent } = setup({ collapsedFacetsCount: 2 });
      const showMoreButtons = await searchFacetsComponent.findAllByText('Show more');
      expect(showMoreButtons).toHaveLength(2);
      const showAllButtons = searchFacetsComponent.queryAllByText('Show all');
      expect(showAllButtons).toHaveLength(1);
    });

    test('facets are initially shown collapsed', async () => {
      // Check SingleSelect facets
      const { searchFacetsComponent } = setup({ collapsedFacetsCount: 2 });
      const authorFacets = await searchFacetsComponent.findAllByText((content, element) => {
        return (
          element?.tagName.toLowerCase() === 'span' &&
          ['Research (138993)', 'Analytics (57158)', 'Documentation (32444)'].includes(content)
        );
      });
      expect(authorFacets).toHaveLength(2);

      // Check MultiSelect facets
      const subjectFacets = searchFacetsComponent.queryAllByText((content, element) => {
        return (
          element?.tagName.toLowerCase() === 'span' &&
          [
            'Neural network (138993)',
            'Reinforced learning (57158)',
            'CIFAR-10 (32444)',
            'MNIST (32444)',
            'Recommender systems (32444)',
            'Decision trees (32444)'
          ].includes(content)
        );
      });
      expect(subjectFacets).toHaveLength(2);

      // Check CatagoryFacets
      const locationCategoryHeader = searchFacetsComponent.getByText('Location');
      fireEvent.click(locationCategoryHeader);
      const locationFacets = searchFacetsComponent.queryAllByText((content, element) => {
        return (
          element?.tagName.toLowerCase() === 'span' &&
          [
            'us (57158)',
            'eu (57158)',
            'new york (57158)',
            'pittsberg (57158)',
            'austin (57158)'
          ].includes(content)
        );
      });
      expect(locationFacets).toHaveLength(2);
    });

    describe('clicking show more button', () => {
      describe('when there are 10 or fewer facet values', () => {
        test('expands list of facet terms for appropriate field', async () => {
          const { searchFacetsComponent } = setup({ collapsedFacetsCount: 2 });
          const authorFacets = await searchFacetsComponent.findAllByText((content, element) => {
            return (
              element?.tagName.toLowerCase() === 'span' &&
              ['Research (138993)', 'Analytics (57158)', 'Documentation (32444)'].includes(content)
            );
          });
          expect(authorFacets).toHaveLength(2);

          const showMoreButtons = searchFacetsComponent.queryAllByText('Show more');
          fireEvent.click(showMoreButtons[1]);
          const subjectFacets = searchFacetsComponent.queryAllByText((content, element) => {
            return (
              element?.tagName.toLowerCase() === 'span' &&
              [
                'Neural network (138993)',
                'Reinforced learning (57158)',
                'CIFAR-10 (32444)',
                'MNIST (32444)',
                'Recommender systems (32444)',
                'Decision trees (32444)'
              ].includes(content)
            );
          });
          expect(subjectFacets).toHaveLength(6);
        });

        test('does not expand other fields', async () => {
          const { searchFacetsComponent } = setup({ collapsedFacetsCount: 2 });
          const authorFacets = await searchFacetsComponent.findAllByText((content, element) => {
            return (
              element?.tagName.toLowerCase() === 'span' &&
              ['Research (138993)', 'Analytics (57158)', 'Documentation (32444)'].includes(content)
            );
          });
          expect(authorFacets).toHaveLength(2);
        });

        test('changes button text to show less', async () => {
          const { searchFacetsComponent } = setup({ collapsedFacetsCount: 2 });
          let showMoreButtons = await searchFacetsComponent.findAllByText('Show more');
          fireEvent.click(showMoreButtons[0]);

          showMoreButtons = searchFacetsComponent.queryAllByText('Show more');
          expect(showMoreButtons).toHaveLength(1);

          const showLessButtons = searchFacetsComponent.queryAllByText('Show less');
          expect(showLessButtons).toHaveLength(1);
        });
      });

      describe('when there are greater than 10 facet values', () => {
        test('opens modal with correct header and full list of facet terms for appropriate field', async () => {
          const { searchFacetsComponent } = setup();
          const productsShowMoreButton = await searchFacetsComponent.findByTestId(
            'show-more-less-products'
          );
          fireEvent.click(productsShowMoreButton);
          const productsModal = searchFacetsComponent.getByTestId(
            'search-facet-show-more-modal-products'
          );
          expect(productsModal).toBeDefined();
          const productsHeader = within(productsModal).getByText('products');
          expect(productsHeader).toBeDefined();
          const productsFacets = within(productsModal).queryAllByText((content, element) => {
            return (
              element?.tagName.toLowerCase() === 'span' &&
              [
                'discovery (138993)',
                'studio (57158)',
                'openscale (32444)',
                'assistant (32444)',
                'speech to text (57158)',
                'knowledge catalog (57158)',
                'nlu (57158)',
                'API kit (57158)',
                'openpages (57158)',
                'visual recognition (57158)',
                'language translator (57158)',
                'machine learning (57158)',
                'tone analyzer (57158)',
                'personality insights (57158)',
                'cybersecurity (57158)',
                'language classifier (57158)'
              ].includes(content)
            );
          });
          expect(productsFacets).toHaveLength(16);
        });

        test('allows for selection and deselection of these facet terms', async () => {
          const { searchFacetsComponent } = setup();
          const productsShowMoreButton = await searchFacetsComponent.findByTestId(
            'show-more-less-products'
          );
          fireEvent.click(productsShowMoreButton);
          const productsModal = searchFacetsComponent.getByTestId(
            'search-facet-show-more-modal-products'
          );
          let assistantFacetValue = within(productsModal).getByLabelText('assistant (32444)');
          expect(assistantFacetValue['checked']).toEqual(false);
          fireEvent.click(assistantFacetValue);
          assistantFacetValue = within(productsModal).getByLabelText('assistant (32444)');
          expect(assistantFacetValue['checked']).toEqual(true);
          fireEvent.click(assistantFacetValue);
          assistantFacetValue = within(productsModal).getByLabelText('assistant (32444)');
          expect(assistantFacetValue['checked']).toEqual(false);
        });

        test('on submit of the modal, updates search with new facet selections and preserves selections', async () => {
          const { searchFacetsComponent, performSearchMock } = setup();
          const productsShowMoreButton = await searchFacetsComponent.findByTestId(
            'show-more-less-products'
          );
          fireEvent.click(productsShowMoreButton);
          const productsModal = searchFacetsComponent.getByTestId(
            'search-facet-show-more-modal-products'
          );
          const assistantModalFacetValue =
            within(productsModal).getByLabelText('assistant (32444)');
          fireEvent.click(assistantModalFacetValue);
          const saveButton = within(productsModal).getByText('Apply');
          fireEvent.click(saveButton);
          expect(performSearchMock).toBeCalledTimes(1);
          expect(performSearchMock).toBeCalledWith(
            expect.objectContaining({
              filter: 'products::"assistant"'
            }),
            false
          );
          const assistantFacetValues =
            searchFacetsComponent.queryAllByLabelText('assistant (32444)');
          expect(assistantFacetValues[0]['checked']).toEqual(true);
          expect(assistantFacetValues[1]['checked']).toEqual(true);
        });

        test('on cancel of modal, does not update search or preserve selections', async () => {
          const { searchFacetsComponent, performSearchMock } = setup();
          const productsShowMoreButton = await searchFacetsComponent.findByTestId(
            'show-more-less-products'
          );
          fireEvent.click(productsShowMoreButton);
          const productsModal = searchFacetsComponent.getByTestId(
            'search-facet-show-more-modal-products'
          );
          const assistantModalFacetValue =
            within(productsModal).getByLabelText('assistant (32444)');
          fireEvent.click(assistantModalFacetValue);
          const cancelButton = within(productsModal).getByText('Cancel');
          fireEvent.click(cancelButton);
          expect(performSearchMock).toBeCalledTimes(0);
          const assistantFacetValues =
            searchFacetsComponent.queryAllByLabelText('assistant (32444)');
          expect(assistantFacetValues[0]['checked']).toEqual(false);
          expect(assistantFacetValues[1]['checked']).toEqual(false);
        });

        test('on close of modal, does not update search or preserve selections', async () => {
          const { searchFacetsComponent, performSearchMock } = setup();
          const productsShowMoreButton = await searchFacetsComponent.findByTestId(
            'show-more-less-products'
          );
          fireEvent.click(productsShowMoreButton);
          const productsModal = searchFacetsComponent.getByTestId(
            'search-facet-show-more-modal-products'
          );
          const assistantModalFacetValue =
            within(productsModal).getByLabelText('assistant (32444)');
          fireEvent.click(assistantModalFacetValue);
          const closeButton = within(productsModal).getByTitle('Close');
          fireEvent.click(closeButton);
          expect(performSearchMock).toBeCalledTimes(0);
          const assistantFacetValues =
            searchFacetsComponent.queryAllByLabelText('assistant (32444)');
          expect(assistantFacetValues[0]['checked']).toEqual(false);
          expect(assistantFacetValues[1]['checked']).toEqual(false);
        });
      });
    });
  });

  describe('when there are greater than 15 facet values', () => {
    const productsFacetArray = [
      'discovery (138993)',
      'studio (57158)',
      'openscale (32444)',
      'assistant (32444)',
      'speech to text (57158)',
      'knowledge catalog (57158)',
      'nlu (57158)',
      'API kit (57158)',
      'openpages (57158)',
      'visual recognition (57158)',
      'language translator (57158)',
      'machine learning (57158)',
      'tone analyzer (57158)',
      'personality insights (57158)',
      'cybersecurity (57158)',
      'language classifier (57158)'
    ];

    let productsShowMoreButton: HTMLElement;
    let productsModal: HTMLElement;
    let productsSearchBar: HTMLElement;

    beforeEach(async () => {
      const { searchFacetsComponent } = setup();
      productsShowMoreButton = await searchFacetsComponent.findByTestId('show-more-less-products');
      fireEvent.click(productsShowMoreButton);
      productsModal = searchFacetsComponent.getByTestId('search-facet-show-more-modal-products');
      expect(productsModal).toBeDefined();
      productsSearchBar = within(productsModal).getByTestId(
        'search-facet-modal-search-bar-products'
      );
    });

    test('opens modal with an empty search bar and all facets', () => {
      expect(productsSearchBar).toBeDefined();
      const placeHolderText = productsSearchBar.getAttribute('placeholder');
      expect(placeHolderText).toEqual('Find');
      const searchBarValue = productsSearchBar.getAttribute('value');
      expect(searchBarValue).toBe('');
      // all facets are initially shown
      const productsFacets = within(productsModal).queryAllByText((content, element) => {
        return element?.tagName.toLowerCase() === 'span' && productsFacetArray.includes(content);
      });
      expect(productsFacets).toHaveLength(16);
    });

    test('search bar starts with all facets and filters down based on user input', () => {
      // user filters by "st"
      fireEvent.focus(productsSearchBar);
      fireEvent.change(productsSearchBar, { target: { value: 'st' } });
      expect(productsSearchBar.getAttribute('value')).toBe('st');
      // only two facets are left showing
      const filteredProductsFacets = within(productsModal).queryAllByText((content, element) => {
        return element?.tagName.toLowerCase() === 'span' && productsFacetArray.includes(content);
      });
      expect(filteredProductsFacets).toHaveLength(2);
      const studioFacet = within(productsModal).getByLabelText('studio (57158)');
      const assistantFacet = within(productsModal).getByLabelText('assistant (32444)');
      expect(studioFacet).toBeDefined();
      expect(assistantFacet).toBeDefined();
    });

    test('search bar filter is case insensitive', () => {
      // user filters by "DiScOvErY"
      fireEvent.focus(productsSearchBar);
      fireEvent.change(productsSearchBar, { target: { value: 'DiScOvErY' } });
      // should return only the "discovery" facet
      const filteredFacets = within(productsModal).queryAllByText((content, element) => {
        return element?.tagName.toLowerCase() === 'span' && productsFacetArray.includes(content);
      });
      expect(filteredFacets).toHaveLength(1);
      const discoveryFacet = within(productsModal).getByLabelText('discovery (138993)');
      expect(discoveryFacet).toBeDefined();
      // user filters by "api KIT"
      fireEvent.focus(productsSearchBar);
      fireEvent.change(productsSearchBar, { target: { value: 'api KIT' } });
      // should return only the "API kit" facet
      const filteredProductsFacets = within(productsModal).queryAllByText((content, element) => {
        return element?.tagName.toLowerCase() === 'span' && productsFacetArray.includes(content);
      });
      expect(filteredProductsFacets).toHaveLength(1);
      const apiFacet = within(productsModal).getByLabelText('API kit (57158)');
      expect(apiFacet).toBeDefined();
    });

    test('empty state message is shown when facets do not contain the search value', () => {
      // user filters by "1"
      fireEvent.focus(productsSearchBar);
      fireEvent.change(productsSearchBar, { target: { value: '1' } });
      // should show no matching facets
      const filteredFacets = within(productsModal).queryAllByText((content, element) => {
        return element?.tagName.toLowerCase() === 'span' && productsFacetArray.includes(content);
      });
      expect(filteredFacets).toHaveLength(0);
      const emptyStateMessage = within(productsModal).getByText('There were no results found');
      expect(emptyStateMessage).toBeDefined();
    });

    test('search bar clears when user clicks the clear search button', () => {
      fireEvent.focus(productsSearchBar);
      fireEvent.change(productsSearchBar, { target: { value: 'studio' } });
      expect(productsSearchBar.getAttribute('value')).toBe('studio');
      const clearSearchBtn = within(productsModal).getByLabelText('Clear search input');
      fireEvent.click(clearSearchBtn);
      expect(productsSearchBar.getAttribute('value')).toBe('');
    });

    test('search bar clears on modal cancel', () => {
      // user filters
      fireEvent.focus(productsSearchBar);
      fireEvent.change(productsSearchBar, { target: { value: 'studio' } });
      // user exits modal
      const cancelButton = within(productsModal).getByText('Cancel');
      fireEvent.click(cancelButton);
      // user reopens modal and search bar is clear
      fireEvent.click(productsShowMoreButton);
      const searchBarValue = productsSearchBar.getAttribute('value');
      expect(searchBarValue).toBe('');
      const closeButton = within(productsModal).getByTitle('Close');
      fireEvent.click(closeButton);
    });
  });

  describe('clicking show less button', () => {
    test('collapses list of facet terms for appropriate field', async () => {
      const { searchFacetsComponent } = setup({ collapsedFacetsCount: 2 });
      const showMoreButtons = await searchFacetsComponent.findAllByText('Show more');
      fireEvent.click(showMoreButtons[0]);
      fireEvent.click(showMoreButtons[1]);

      const showLessButtons = searchFacetsComponent.queryAllByText('Show less');
      fireEvent.click(showLessButtons[0]);
      const authorFacets = searchFacetsComponent.queryAllByText((content, element) => {
        return (
          element?.tagName.toLowerCase() === 'span' &&
          ['Research (138993)', 'Analytics (57158)', 'Documentation (32444)'].includes(content)
        );
      });
      expect(authorFacets).toHaveLength(2);
    });

    test('does not expand other fields', async () => {
      const { searchFacetsComponent } = setup({ collapsedFacetsCount: 2 });
      const showMoreButtons = await searchFacetsComponent.findAllByText('Show more');
      showMoreButtons.forEach(button => fireEvent.click(button));

      const showLessButtons = searchFacetsComponent.queryAllByText('Show less');
      fireEvent.click(showLessButtons[0]);
      const subjectFacets = searchFacetsComponent.queryAllByText((content, element) => {
        return (
          element?.tagName.toLowerCase() === 'span' &&
          [
            'Neural network (138993)',
            'Reinforced learning (57158)',
            'CIFAR-10 (32444)',
            'MNIST (32444)',
            'Recommender systems (32444)',
            'Decision trees (32444)'
          ].includes(content)
        );
      });
      expect(subjectFacets).toHaveLength(6);
    });

    test('change text of collapse button', async () => {
      const { searchFacetsComponent } = setup({ collapsedFacetsCount: 2 });
      let showMoreButtons = await searchFacetsComponent.findAllByText('Show more');
      fireEvent.click(showMoreButtons[0]);
      fireEvent.click(showMoreButtons[1]);

      let showLessButtons = searchFacetsComponent.queryAllByText('Show less');
      fireEvent.click(showLessButtons[0]);

      showMoreButtons = searchFacetsComponent.queryAllByText('Show more');
      expect(showMoreButtons).toHaveLength(1);
      showLessButtons = searchFacetsComponent.queryAllByText('Show less');
      expect(showLessButtons).toHaveLength(1);
    });
  });
});
