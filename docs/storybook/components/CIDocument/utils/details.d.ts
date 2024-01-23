import { Items, Item } from '../components/DetailsPane/types';
export declare const contractDetailsFromItem: (item: any) => Items[];
export declare const nonContractDetailsFromItem: (item: any) => Items[];
/**
 *
 * @param enrichmentName
 * @return
 */
declare function getDetailsFromItem(enrichmentName: string): (item: any) => Items[];
export declare function getAttributesWithinRelation(attributes: any): Item[];
declare function getDetailsFromMetadata(data: any): Items[];
export { getDetailsFromItem, getDetailsFromMetadata };
