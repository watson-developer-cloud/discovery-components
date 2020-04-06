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

  describe('entities facet category elements', () => {
    test('contain all expected category headers', () => {
      const { fieldFacetsWithCategoryComponent } = setup();
      const locationCategoryHeader = fieldFacetsWithCategoryComponent.getByText('Location');
      const organizationCategoryHeader = fieldFacetsWithCategoryComponent.getByText('Organization');
      const quantityCategoryHeader = fieldFacetsWithCategoryComponent.getByText('Quantity');
      expect(locationCategoryHeader).toBeDefined();
      expect(organizationCategoryHeader).toBeDefined();
      expect(quantityCategoryHeader).toBeDefined();
    });

    test('are collapsed on initial load and facet values are not shown', () => {
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

    // todo: break up into a describe block so can test for each of these pieces separately
    // instead of smushing into one test block
    test('expand to show first 5 facet values on click (and not more than 5 or facet values of other categories)', () => {
      const { fieldFacetsWithCategoryComponent } = setup();
      const locationCategoryHeader = fieldFacetsWithCategoryComponent.getByText('Location');
      fireEvent.click(locationCategoryHeader);
      const pittsburghFacetValue = fieldFacetsWithCategoryComponent.getByText('pittsburgh (57158)');
      const usFacetValue = fieldFacetsWithCategoryComponent.getByText('us (57158)');
      const euFacetValue = fieldFacetsWithCategoryComponent.getByText('eu (57158)');
      let bostonFacetValue = fieldFacetsWithCategoryComponent.queryByText('boston (57158)');
      let pennsylvaniaFacetValue = fieldFacetsWithCategoryComponent.queryByText(
        'pennsylvania (57158)'
      );
      const quantityFacetValue = fieldFacetsWithCategoryComponent.queryByText('$299 (57158)');
      const ibmFacetValue = fieldFacetsWithCategoryComponent.queryByText('ibm (138993)');
      expect(pittsburghFacetValue).toBeDefined();
      expect(usFacetValue).toBeDefined();
      expect(euFacetValue).toBeDefined();
      expect(bostonFacetValue).toBe(null);
      expect(pennsylvaniaFacetValue).toBe(null);
      expect(quantityFacetValue).toBe(null);
      expect(ibmFacetValue).toBe(null);
      const showMore = fieldFacetsWithCategoryComponent.getByTestId('show-more-less-Location');
      fireEvent.click(showMore);
      bostonFacetValue = fieldFacetsWithCategoryComponent.getByText('boston (57158)');
      pennsylvaniaFacetValue = fieldFacetsWithCategoryComponent.getByText('pennsylvania (57158)');
      expect(bostonFacetValue).toBeDefined();
      expect(pennsylvaniaFacetValue).toBeDefined();
    });

    test('can expand multiple categories and collapse them again', () => {
      const { fieldFacetsWithCategoryComponent } = setup();
      const locationCategoryHeader = fieldFacetsWithCategoryComponent.getByText('Location');
      const organizationCategoryHeader = fieldFacetsWithCategoryComponent.getByText('Organization');
      fireEvent.click(locationCategoryHeader);
      fireEvent.click(organizationCategoryHeader);
      let pittsburghFacetValue = fieldFacetsWithCategoryComponent.getByText('pittsburgh (57158)');
      let ibmFacetValue = fieldFacetsWithCategoryComponent.getByText('ibm (138993)');
      expect(pittsburghFacetValue).toBeDefined();
      expect(ibmFacetValue).toBeDefined();
      fireEvent.click(locationCategoryHeader);
      pittsburghFacetValue = fieldFacetsWithCategoryComponent.queryByText('pittsburgh (57158)');
      ibmFacetValue = fieldFacetsWithCategoryComponent.getByText('ibm (138993)');
      expect(pittsburghFacetValue).toBe(null);
      expect(ibmFacetValue).toBeDefined();
    });

    test('can select facet values across one category and clear them', () => {
      const { fieldFacetsWithCategoryComponent } = setup();
      const locationCategoryHeader = fieldFacetsWithCategoryComponent.getByText('Location');
      fireEvent.click(locationCategoryHeader);
      let pittsburghFacetValue = fieldFacetsWithCategoryComponent.getByLabelText(
        'pittsburgh (57158)'
      );
      let usFacetValue = fieldFacetsWithCategoryComponent.getByLabelText('us (57158)');
      fireEvent.click(pittsburghFacetValue);
      fireEvent.click(usFacetValue);
      expect(pittsburghFacetValue['checked']).toEqual(true);
      expect(usFacetValue['checked']).toEqual(true);
      const clearButton = fieldFacetsWithCategoryComponent.queryByTitle('Clear all selected items');
      fireEvent.click(clearButton);
      pittsburghFacetValue = fieldFacetsWithCategoryComponent.getByLabelText('pittsburgh (57158)');
      usFacetValue = fieldFacetsWithCategoryComponent.getByLabelText('us (57158)');
      expect(pittsburghFacetValue['checked']).toEqual(false);
      expect(usFacetValue['checked']).toEqual(false);
    });

    test('can select facet values across multiple categories and clear them', () => {
      const { fieldFacetsWithCategoryComponent } = setup();
      const locationCategoryHeader = fieldFacetsWithCategoryComponent.getByText('Location');
      const organizationCategoryHeader = fieldFacetsWithCategoryComponent.getByText('Organization');
      fireEvent.click(locationCategoryHeader);
      fireEvent.click(organizationCategoryHeader);
      let pittsburghFacetValue = fieldFacetsWithCategoryComponent.getByLabelText(
        'pittsburgh (57158)'
      );
      let ibmFacetValue = fieldFacetsWithCategoryComponent.getByLabelText('ibm (138993)');
      fireEvent.click(pittsburghFacetValue);
      fireEvent.click(ibmFacetValue);
      expect(pittsburghFacetValue['checked']).toEqual(true);
      expect(ibmFacetValue['checked']).toEqual(true);
      const clearButton = fieldFacetsWithCategoryComponent.queryByTitle('Clear all selected items');
      fireEvent.click(clearButton);
      pittsburghFacetValue = fieldFacetsWithCategoryComponent.getByLabelText('pittsburgh (57158)');
      ibmFacetValue = fieldFacetsWithCategoryComponent.getByLabelText('ibm (138993)');
      expect(pittsburghFacetValue['checked']).toEqual(false);
      expect(ibmFacetValue['checked']).toEqual(false);
    });
  });
});
