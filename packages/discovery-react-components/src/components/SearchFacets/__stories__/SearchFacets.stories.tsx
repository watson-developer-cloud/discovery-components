import { text, object, boolean, number } from '@storybook/addon-knobs';
import SearchFacets from '../SearchFacets';
import { facetsQueryResponse } from '../__fixtures__/facetsQueryResponse';
import collectionsResponse from '../__fixtures__/collectionsResponse';
import aggregationComponentSettingsResponse from '../__fixtures__/componentSettingsResponse';
import { StoryWrapper, DummySearchClient } from 'utils/storybookUtils';
import { createDummyResponsePromise } from 'utils/testingUtils';
import DiscoverySearch, { DiscoverySearchProps } from 'components/DiscoverySearch/DiscoverySearch';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { action } from '@storybook/addon-actions';
import { defaultMessages } from '../messages';

export const props = () => ({
  showCollections: boolean('Show collection facets', true),
  showDynamicFacets: boolean('Show dynamic facets', true),
  showMatchingResults: boolean('Show matching results', true),
  collapsedFacetsCount: number('Number of facet terms to show when list is collapsed', 5),
  messages: object("Default messages for the component's text strings", defaultMessages),
  componentSettingsAggregations: object(
    'Aggregation component settings',
    aggregationComponentSettingsResponse.result
  )
});

class DummySearchClientWithQueryAndCollections extends DummySearchClient {
  exampleProps = props();
  query(params: DiscoveryV2.QueryParams): Promise<DiscoveryV2.Response<DiscoveryV2.QueryResponse>> {
    action('query')(params);
    return createDummyResponsePromise(facetsQueryResponse.result);
  }
  listCollections(
    params: DiscoveryV2.ListCollectionsParams
  ): Promise<DiscoveryV2.Response<DiscoveryV2.ListCollectionsResponse>> {
    action('listCollections')(params);
    return createDummyResponsePromise(collectionsResponse.result);
  }
  getComponentSettings(
    params: DiscoveryV2.GetComponentSettingsParams
  ): Promise<DiscoveryV2.Response<DiscoveryV2.ComponentSettingsResponse>> {
    action('getComponentSettings')(params);
    return createDummyResponsePromise(this.exampleProps.componentSettingsAggregations);
  }
}

const discoverySearchProps = (
  queryParams?: Partial<DiscoveryV2.QueryParams>
): DiscoverySearchProps => ({
  searchClient: new DummySearchClientWithQueryAndCollections(),
  projectId: text('Project ID', 'project-id'),
  overrideQueryParameters: queryParams,
  overrideSearchResults: {
    suggested_refinements: [
      {
        text: 'regression'
      },
      {
        text: 'classification'
      },
      {
        text: 'naive bayes'
      },
      {
        text: 'classifier'
      },
      {
        text: 'algorithm'
      },
      {
        text: 'decision tree'
      },
      {
        text: 'clustering'
      },
      {
        text: 'linear'
      },
      {
        text: 'logistic'
      },
      {
        text: 'theorem'
      },
      {
        text: 'training'
      },
      {
        text: 'data'
      },
      {
        text: 'informative'
      },
      {
        text: 'assumption'
      },
      {
        text: 'classify'
      },
      {
        text: 'trees'
      }
    ]
  }
});

export default {
  title: 'SearchFacets',

  parameters: {
    component: SearchFacets
  },

  excludeStories: ['props']
};

export const Default = {
  render: () => {
    const exampleProps = props();
    return (
      <StoryWrapper>
        <DiscoverySearch {...discoverySearchProps()}>
          <SearchFacets {...exampleProps} />
        </DiscoverySearch>
      </StoryWrapper>
    );
  },

  name: 'default'
};

export const WithInitialSelectedCollection = {
  render: () => {
    const exampleProps = props();
    return (
      <StoryWrapper>
        <DiscoverySearch {...discoverySearchProps({ collectionIds: ['machine-learning'] })}>
          <SearchFacets {...exampleProps} showCollections={true} />
        </DiscoverySearch>
      </StoryWrapper>
    );
  },

  name: 'with initial selected collection'
};

export const WithInitialSelectedFacets = {
  render: () => {
    const exampleProps = props();
    return (
      <StoryWrapper>
        <DiscoverySearch
          {...discoverySearchProps({
            filter: 'category:"Research","regression",machine_learning_terms:"Reinforced learning"'
          })}
        >
          <SearchFacets {...exampleProps} />
        </DiscoverySearch>
      </StoryWrapper>
    );
  },

  name: 'with initial selected facets'
};
