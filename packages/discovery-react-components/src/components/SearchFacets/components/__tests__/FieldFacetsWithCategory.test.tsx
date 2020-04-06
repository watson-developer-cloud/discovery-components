import * as React from 'react';
import { render, fireEvent, RenderResult } from '@testing-library/react';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { wrapWithContext } from 'utils/testingUtils';
import {
  SearchContextIFC,
  SearchApiIFC,
  searchResponseStoreDefaults
} from 'components/DiscoverySearch/DiscoverySearch';
import SearchFacets from 'components/SearchFacets/SearchFacets';
import { facetsQueryResponse } from 'components/SearchFacets/__fixtures__/facetsQueryResponse';

interface Setup {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  performSearchMock: jest.Mock<any, any>;
  fieldFacetsWithCategoryComponent: RenderResult;
}

interface SetupConfig {
  filter: string;
  componentSettingsAggregations: DiscoveryV2.ComponentSettingsAggregation[];
  collapsedFacetsCount: number;
  aggregationResults: DiscoveryV2.QueryAggregation[] | undefined;
}

const aggregationComponentSettings: DiscoveryV2.ComponentSettingsAggregation[] = [
  {
    name: 'entities',
    label: 'Top Entities',
    multiple_selections_allowed: true
  },
  {
    name: 'category_id',
    label: 'Category',
    multiple_selections_allowed: true
  },
  {
    name: 'machine_learning_id',
    label: 'Machine Learning Terms',
    multiple_selections_allowed: true
  }
];

const defaultSetupConfig: SetupConfig = {
  filter: '',
  componentSettingsAggregations: aggregationComponentSettings,
  collapsedFacetsCount: 5,
  aggregationResults: facetsQueryResponse.result.aggregations
};

const setup = (setupConfig: Partial<SetupConfig> = {}): Setup => {
  const mergedSetupConfig = { ...defaultSetupConfig, ...setupConfig };
  const performSearchMock = jest.fn();
  const context: Partial<SearchContextIFC> = {
    aggregationResults: mergedSetupConfig.aggregationResults,
    searchResponseStore: {
      ...searchResponseStoreDefaults,
      parameters: {
        projectId: '',
        filter: mergedSetupConfig.filter
      }
    },
    componentSettings: {
      aggregations: mergedSetupConfig.componentSettingsAggregations
    }
  };
  const api: Partial<SearchApiIFC> = {
    performSearch: performSearchMock
  };
  const fieldFacetsWithCategoryComponent = render(
    wrapWithContext(
      <SearchFacets
        collapsedFacetsCount={mergedSetupConfig.collapsedFacetsCount}
        overrideComponentSettingsAggregations={mergedSetupConfig.componentSettingsAggregations}
      />,
      api,
      context
    )
  );
  return {
    performSearchMock,
    fieldFacetsWithCategoryComponent
  };
};

describe('FieldFacetsWithCategoryComponent', () => {
  describe('legend header elements', () => {
    test('contains all facet headers with correct text', () => {
      const { fieldFacetsWithCategoryComponent } = setup();
      const headerTopEntities = fieldFacetsWithCategoryComponent.getByText('Top Entities');
      expect(headerTopEntities).toBeDefined();
      const headerCategory = fieldFacetsWithCategoryComponent.getByText('Category');
      expect(headerCategory).toBeDefined();
      const headerMachineLearningTerms = fieldFacetsWithCategoryComponent.getByText(
        'Machine Learning Terms'
      );
      expect(headerMachineLearningTerms).toBeDefined();
    });
  });

  describe('entities facet category header elements', () => {
    test('contains all expected category headers', () => {
      const { fieldFacetsWithCategoryComponent } = setup();
      const locationCategoryHeader = fieldFacetsWithCategoryComponent.getByText('Location');
      const organizationCategoryHeader = fieldFacetsWithCategoryComponent.getByText('Organization');
      const quantityCategoryHeader = fieldFacetsWithCategoryComponent.getByText('Quantity');
      expect(locationCategoryHeader).toBeDefined();
      expect(organizationCategoryHeader).toBeDefined();
      expect(quantityCategoryHeader).toBeDefined();
    });

    test('category elements are collapsed on initial load and facet values are not shown', () => {
      const { fieldFacetsWithCategoryComponent } = setup();
      const ibmFacetValue = fieldFacetsWithCategoryComponent.queryByText('ibm');
      const pittsburghFacetValue = fieldFacetsWithCategoryComponent.queryByText('pittsburgh');
      const usFacetValue = fieldFacetsWithCategoryComponent.queryByText('us (57158)');
      const euFacetValue = fieldFacetsWithCategoryComponent.queryByText('eu (57158)');
      const quantityFacetValue = fieldFacetsWithCategoryComponent.queryByText('$299 (57158)');
      expect(ibmFacetValue).toBe(null);
      expect(pittsburghFacetValue).toBe(null);
      expect(quantityFacetValue).toBe(null);
      expect(usFacetValue).toBe(null);
      expect(euFacetValue).toBe(null);
    });

    test('category headers expand to show facet values on click (and not facet values of other categories)', () => {
      const { fieldFacetsWithCategoryComponent } = setup();
      const locationCategoryHeader = fieldFacetsWithCategoryComponent.getByText('Location');
      fireEvent.click(locationCategoryHeader);
      const pittsburghFacetValue = fieldFacetsWithCategoryComponent.getByText('pittsburgh (57158)');
      const usFacetValue = fieldFacetsWithCategoryComponent.getByText('us (57158)');
      const euFacetValue = fieldFacetsWithCategoryComponent.getByText('eu (57158)');
      const quantityFacetValue = fieldFacetsWithCategoryComponent.queryByText('$299 (57158)');
      const ibmFacetValue = fieldFacetsWithCategoryComponent.queryByText('ibm (57158)');
      expect(pittsburghFacetValue).toBeDefined();
      expect(usFacetValue).toBeDefined();
      expect(euFacetValue).toBeDefined();
      expect(quantityFacetValue).toBe(null);
      expect(ibmFacetValue).toBe(null);
    });
  });
});
