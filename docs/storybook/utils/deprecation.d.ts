import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { SearchParams } from '../components/DiscoverySearch/types';
export declare function deprecateReturnFields(queryParams: (DiscoveryV2.QueryParams & {
    returnFields?: string[];
}) | (SearchParams & {
    returnFields?: string[];
}) | undefined): DiscoveryV2.QueryParams | SearchParams | undefined;
