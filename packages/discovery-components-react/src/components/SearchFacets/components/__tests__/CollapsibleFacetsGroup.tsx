import * as React from 'react';
import { render, RenderResult, fireEvent } from '@testing-library/react';
import { wrapWithContext } from '../../../../utils/testingUtils';
import { SearchFacets } from '../../SearchFacets';
import {
  SearchContextIFC,
  SearchApiIFC,
  searchResponseStoreDefaults
} from '../../../DiscoverySearch/DiscoverySearch';
import { facetsQueryResponse } from '../../__fixtures__/facetsQueryResponse';
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

describe('CollapsableFacetsGroupComponent', () => {
  describe('when aggregations should not be collapsed for any fields', () => {
    test('show more link is not shown', () => {
      const { searchFacetsComponent } = setup({ collapsedFacetsCount: 20 });
      const showMoreButtons = searchFacetsComponent.queryAllByText('Show More');
      expect(showMoreButtons).toHaveLength(0);
    });
  });

  describe('when aggregations should be collapsed for some fields', () => {
    test('show more link is only shown for facet group with too many results', () => {
      const { searchFacetsComponent } = setup({ collapsedFacetsCount: 5 });
      const showMoreButtons = searchFacetsComponent.queryAllByText('Show More');
      expect(showMoreButtons).toHaveLength(1);
    });
  });

  describe('when aggregations are collapsed for multiple facets', () => {
    test('show more link is only shown for multiple facet groups', () => {
      const { searchFacetsComponent } = setup({ collapsedFacetsCount: 2 });
      const showMoreButtons = searchFacetsComponent.queryAllByText('Show More');
      expect(showMoreButtons).toHaveLength(2);
    });

    test('facets are initially shown collapsed', () => {
      const { searchFacetsComponent } = setup({ collapsedFacetsCount: 2 });
      const authorFacets = searchFacetsComponent.queryAllByText((content, element) => {
        return (
          element.tagName.toLowerCase() === 'span' &&
          ['Research', 'Analytics', 'Documentation'].includes(content)
        );
      });
      expect(authorFacets).toHaveLength(2);

      const subjectFacets = searchFacetsComponent.queryAllByText((content, element) => {
        return (
          element.tagName.toLowerCase() === 'span' &&
          [
            'Neural network',
            'Reinforced learning',
            'CIFAR-10',
            'MNIST',
            'Recommender systems',
            'Decision trees'
          ].includes(content)
        );
      });
      expect(subjectFacets).toHaveLength(2);
    });

    describe('clicking show more button', () => {
      test('expands list of facet terms for appropriate field', () => {
        const { searchFacetsComponent } = setup({ collapsedFacetsCount: 2 });
        const authorFacets = searchFacetsComponent.queryAllByText((content, element) => {
          return (
            element.tagName.toLowerCase() === 'span' &&
            ['Research', 'Analytics', 'Documentation'].includes(content)
          );
        });
        expect(authorFacets).toHaveLength(2);

        const showMoreButtons = searchFacetsComponent.queryAllByText('Show More');
        fireEvent.click(showMoreButtons[1]);
        const subjectFacets = searchFacetsComponent.queryAllByText((content, element) => {
          return (
            element.tagName.toLowerCase() === 'span' &&
            [
              'Neural network',
              'Reinforced learning',
              'CIFAR-10',
              'MNIST',
              'Recommender systems',
              'Decision trees'
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
            ['Research', 'Analytics', 'Documentation'].includes(content)
          );
        });
        expect(authorFacets).toHaveLength(2);
      });

      test('changes button text to show less', () => {
        const { searchFacetsComponent } = setup({ collapsedFacetsCount: 2 });
        let showMoreButtons = searchFacetsComponent.queryAllByText('Show More');
        fireEvent.click(showMoreButtons[0]);

        showMoreButtons = searchFacetsComponent.queryAllByText('Show More');
        expect(showMoreButtons).toHaveLength(1);

        const showLessButtons = searchFacetsComponent.queryAllByText('Show More');
        expect(showLessButtons).toHaveLength(1);
      });
    });
  });

  describe('clicking show less button', () => {
    test('collapses list of facet terms for appropriate field', () => {
      const { searchFacetsComponent } = setup({ collapsedFacetsCount: 2 });
      const showMoreButtons = searchFacetsComponent.queryAllByText('Show More');
      showMoreButtons.forEach(button => fireEvent.click(button));

      const showLessButtons = searchFacetsComponent.queryAllByText('Show Less');
      fireEvent.click(showLessButtons[0]);
      const authorFacets = searchFacetsComponent.queryAllByText((content, element) => {
        return (
          element.tagName.toLowerCase() === 'span' &&
          ['Research', 'Analytics', 'Documentation'].includes(content)
        );
      });
      expect(authorFacets).toHaveLength(2);
    });

    test('does not expand other fields', () => {
      const { searchFacetsComponent } = setup({ collapsedFacetsCount: 2 });
      const showMoreButtons = searchFacetsComponent.queryAllByText('Show More');
      showMoreButtons.forEach(button => fireEvent.click(button));

      const showLessButtons = searchFacetsComponent.queryAllByText('Show Less');
      fireEvent.click(showLessButtons[0]);
      const subjectFacets = searchFacetsComponent.queryAllByText((content, element) => {
        return (
          element.tagName.toLowerCase() === 'span' &&
          [
            'Neural network',
            'Reinforced learning',
            'CIFAR-10',
            'MNIST',
            'Recommender systems',
            'Decision trees'
          ].includes(content)
        );
      });
      expect(subjectFacets).toHaveLength(6);
    });

    test('change text of collapse button', () => {
      const { searchFacetsComponent } = setup({ collapsedFacetsCount: 2 });
      let showMoreButtons = searchFacetsComponent.queryAllByText('Show More');
      showMoreButtons.forEach(button => fireEvent.click(button));

      let showLessButtons = searchFacetsComponent.queryAllByText('Show Less');
      fireEvent.click(showLessButtons[0]);

      showMoreButtons = searchFacetsComponent.queryAllByText('Show More');
      expect(showMoreButtons).toHaveLength(1);
      showLessButtons = searchFacetsComponent.queryAllByText('Show More');
      expect(showLessButtons).toHaveLength(1);
    });
  });
});
