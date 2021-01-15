import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { SearchParams } from '../components/DiscoverySearch/types';

export function deprecateReturnFields(
  queryParams:
    | (DiscoveryV2.QueryParams & { returnFields?: string[] })
    | (SearchParams & { returnFields?: string[] })
    | undefined
): DiscoveryV2.QueryParams | SearchParams | undefined {
  if (queryParams && queryParams.returnFields) {
    console.warn(
      '"returnFields" has been renamed to "_return". Support for "returnFields" will be removed in the next major release'
    );
    return { ...queryParams, _return: queryParams.returnFields };
  }
  return queryParams;
}
