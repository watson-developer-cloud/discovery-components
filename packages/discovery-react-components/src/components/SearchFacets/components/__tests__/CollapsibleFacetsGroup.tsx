import * as React from 'react';
import { render, RenderResult, fireEvent, within } from '@testing-library/react';
import { wrapWithContext } from 'utils/testingUtils';
import SearchFacets from 'components/SearchFacets/SearchFacets';
import {
  SearchContextIFC,
  SearchApiIFC,
  searchResponseStoreDefaults
} from 'components/DiscoverySearch/DiscoverySearch';
import { facetsQueryResponse } from 'components/SearchFacets/__fixtures__/facetsQueryResponse';
import '@testing-library/jest-dom/extend-expect';

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
}

const defaultSetupConfig: SetupConfig = {
  filter: '',
  collapsedFacetsCount: 5
};

const setup = (setupConfig: Partial<SetupConfig> = {}): Setup => {
  const mergedSetupConfig = { ...defaultSetupConfig, ...setupConfig };
  const fetchAggregationsMock = jest.fn();
  const performSearchMock = jest.fn();
  const context: Partial<SearchContextIFC> = {
    aggregationResults: facetsQueryResponse.result.aggregations,
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
      <SearchFacets collapsedFacetsCount={mergedSetupConfig.collapsedFacetsCount} />,
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
    test('show more link is not shown', () => {
      const { searchFacetsComponent } = setup({ collapsedFacetsCount: 20 });
      const showMoreButtons = searchFacetsComponent.queryAllByText('Show more');
      expect(showMoreButtons).toHaveLength(0);
    });
  });

  describe('when aggregations should be collapsed for some fields', () => {
    test('show more link is only shown for facet group with too many results', () => {
      const { searchFacetsComponent } = setup({ collapsedFacetsCount: 5 });
      const showMoreButtons = searchFacetsComponent.queryAllByText('Show more');
      expect(showMoreButtons).toHaveLength(2);
    });
  });

  describe('when aggregations are collapsed for multiple facets', () => {
    test('show more link is only shown for multiple facet groups', () => {
      const { searchFacetsComponent } = setup({ collapsedFacetsCount: 2 });
      const showMoreButtons = searchFacetsComponent.queryAllByText('Show more');
      expect(showMoreButtons).toHaveLength(3);
    });

    test('facets are initially shown collapsed', () => {
      const { searchFacetsComponent } = setup({ collapsedFacetsCount: 2 });
      const authorFacets = searchFacetsComponent.queryAllByText((content, element) => {
        return (
          element.tagName.toLowerCase() === 'span' &&
          ['Research (138993)', 'Analytics (57158)', 'Documentation (32444)'].includes(content)
        );
      });
      expect(authorFacets).toHaveLength(2);

      const subjectFacets = searchFacetsComponent.queryAllByText((content, element) => {
        return (
          element.tagName.toLowerCase() === 'span' &&
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
    });

    describe('clicking show more button', () => {
      describe('when there are less than 10 facet values', () => {
        test('expands list of facet terms for appropriate field', () => {
          const { searchFacetsComponent } = setup({ collapsedFacetsCount: 2 });
          const authorFacets = searchFacetsComponent.queryAllByText((content, element) => {
            return (
              element.tagName.toLowerCase() === 'span' &&
              ['Research (138993)', 'Analytics (57158)', 'Documentation (32444)'].includes(content)
            );
          });
          expect(authorFacets).toHaveLength(2);

          const showMoreButtons = searchFacetsComponent.queryAllByText('Show more');
          fireEvent.click(showMoreButtons[1]);
          const subjectFacets = searchFacetsComponent.queryAllByText((content, element) => {
            return (
              element.tagName.toLowerCase() === 'span' &&
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

        test('does not expand other fields', () => {
          const { searchFacetsComponent } = setup({ collapsedFacetsCount: 2 });
          const authorFacets = searchFacetsComponent.queryAllByText((content, element) => {
            return (
              element.tagName.toLowerCase() === 'span' &&
              ['Research (138993)', 'Analytics (57158)', 'Documentation (32444)'].includes(content)
            );
          });
          expect(authorFacets).toHaveLength(2);
        });

        test('changes button text to show less', () => {
          const { searchFacetsComponent } = setup({ collapsedFacetsCount: 2 });
          let showMoreButtons = searchFacetsComponent.queryAllByText('Show more');
          fireEvent.click(showMoreButtons[0]);

          showMoreButtons = searchFacetsComponent.queryAllByText('Show more');
          expect(showMoreButtons).toHaveLength(2);

          const showLessButtons = searchFacetsComponent.queryAllByText('Show less');
          expect(showLessButtons).toHaveLength(1);
        });
      });

      describe('when there are 10 or greater facet values', () => {
        test('opens modal with correct header and full list of facet terms for appropriate field', () => {
          const { searchFacetsComponent } = setup();
          const topEntitiesShowMoreButton = searchFacetsComponent.getByTestId(
            'show-more-less-enriched_text.entities.text'
          );
          fireEvent.click(topEntitiesShowMoreButton);
          const topEntitiesModal = searchFacetsComponent.getByTestId(
            'search-facet-show-more-modal-enriched_text.entities.text'
          );
          expect(topEntitiesModal).toBeDefined();
          const topEntitiesHeader = within(topEntitiesModal).getByText(
            'enriched_text.entities.text'
          );
          expect(topEntitiesHeader).toBeDefined();
          const topEntitiesFacets = within(topEntitiesModal).queryAllByText((content, element) => {
            return (
              element.tagName.toLowerCase() === 'span' &&
              [
                'ibm (138993)',
                'us (57158)',
                '$299 (32444)',
                'watson (32444)',
                'eu (57158)',
                'new york (57158)',
                'pittsburgh (57158)',
                'austin (57158)',
                'boston (57158)',
                'pennsylvania (57158)'
              ].includes(content)
            );
          });
          expect(topEntitiesFacets).toHaveLength(10);
        });

        // test('allows for selection and deselection of these facet terms', () => {

        // });
        // test('on submit of the modal, updates search with new facet selections and preserves selections', () => {

        // });
        // test('on cancel of modal, does not update search or preserve selections', () => {

        // });
      });
    });
  });

  describe('clicking show less button', () => {
    test('collapses list of facet terms for appropriate field', () => {
      const { searchFacetsComponent } = setup({ collapsedFacetsCount: 2 });
      const showMoreButtons = searchFacetsComponent.queryAllByText('Show more');
      showMoreButtons.forEach(button => fireEvent.click(button));

      const showLessButtons = searchFacetsComponent.queryAllByText('Show less');
      fireEvent.click(showLessButtons[0]);
      const authorFacets = searchFacetsComponent.queryAllByText((content, element) => {
        return (
          element.tagName.toLowerCase() === 'span' &&
          ['Research (138993)', 'Analytics (57158)', 'Documentation (32444)'].includes(content)
        );
      });
      expect(authorFacets).toHaveLength(3);
    });

    test('does not expand other fields', () => {
      const { searchFacetsComponent } = setup({ collapsedFacetsCount: 2 });
      const showMoreButtons = searchFacetsComponent.queryAllByText('Show more');
      showMoreButtons.forEach(button => fireEvent.click(button));

      const showLessButtons = searchFacetsComponent.queryAllByText('Show less');
      fireEvent.click(showLessButtons[0]);
      const subjectFacets = searchFacetsComponent.queryAllByText((content, element) => {
        return (
          element.tagName.toLowerCase() === 'span' &&
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

    test('change text of collapse button', () => {
      const { searchFacetsComponent } = setup({ collapsedFacetsCount: 2 });
      let showMoreButtons = searchFacetsComponent.queryAllByText('Show more');
      showMoreButtons.forEach(button => fireEvent.click(button));

      let showLessButtons = searchFacetsComponent.queryAllByText('Show less');
      fireEvent.click(showLessButtons[0]);

      showMoreButtons = searchFacetsComponent.queryAllByText('Show more');
      expect(showMoreButtons).toHaveLength(1);
      showLessButtons = searchFacetsComponent.queryAllByText('Show less');
      expect(showLessButtons).toHaveLength(2);
    });
  });
});
