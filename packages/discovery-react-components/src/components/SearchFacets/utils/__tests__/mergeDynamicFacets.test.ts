import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { mergeDynamicFacets } from '../mergeDynamicFacets';
import { SelectableDynamicFacets } from '../searchFacetInterfaces';

describe('mergeDynamicFacets', () => {
  test('only returns old facets that are selected at the top', () => {
    const dynamicFacets: DiscoveryV2.QuerySuggestedRefinement[] = [
      {
        text: 'one'
      },
      {
        text: 'two'
      },
      {
        text: 'three'
      }
    ];
    const selectedFacets: SelectableDynamicFacets[] = [
      {
        text: 'old'
      },
      {
        text: 'old selected',
        selected: true
      }
    ];
    const allDyanmicFacets: SelectableDynamicFacets[] = mergeDynamicFacets(
      dynamicFacets,
      selectedFacets
    );
    expect(allDyanmicFacets).toEqual([
      {
        text: 'old selected',
        selected: true
      },
      {
        text: 'one'
      },
      {
        text: 'two'
      },
      {
        text: 'three'
      }
    ]);
  });

  test('removes old unselected facets', () => {
    const dynamicFacets: DiscoveryV2.QuerySuggestedRefinement[] = [
      {
        text: 'one'
      },
      {
        text: 'two'
      },
      {
        text: 'three'
      }
    ];
    const selectedFacets: SelectableDynamicFacets[] = [
      {
        text: 'old'
      },
      {
        text: 'also old'
      }
    ];
    const allDyanmicFacets: SelectableDynamicFacets[] = mergeDynamicFacets(
      dynamicFacets,
      selectedFacets
    );
    expect(allDyanmicFacets).toEqual([
      {
        text: 'one'
      },
      {
        text: 'two'
      },
      {
        text: 'three'
      }
    ]);
  });

  test('returns each unique facet once with selected at the top', () => {
    const dynamicFacets: DiscoveryV2.QuerySuggestedRefinement[] = [
      {
        text: 'one'
      },
      {
        text: 'two'
      },
      {
        text: 'three'
      }
    ];
    const selectedFacets: SelectableDynamicFacets[] = [
      {
        text: 'two',
        selected: true
      }
    ];
    const allDyanmicFacets: SelectableDynamicFacets[] = mergeDynamicFacets(
      dynamicFacets,
      selectedFacets
    );
    expect(allDyanmicFacets).toEqual([
      {
        text: 'two',
        selected: true
      },
      {
        text: 'one'
      },
      {
        text: 'three'
      }
    ]);
  });
});
