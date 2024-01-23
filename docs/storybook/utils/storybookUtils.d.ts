import DiscoveryV2 from 'ibm-watson/discovery/v2';
export declare const StoryWrapper: (props: any) => any;
export declare const DocumentStoryWrapper: (props: any) => any;
export declare class DummySearchClient {
    query(queryParams: DiscoveryV2.QueryParams): Promise<any>;
    getAutocompletion(autocompletionParams: DiscoveryV2.GetAutocompletionParams): Promise<any>;
    listCollections(listCollectionParams: DiscoveryV2.ListCollectionsParams): Promise<any>;
    getComponentSettings(getComponentSettingsParams: DiscoveryV2.GetComponentSettingsParams): Promise<any>;
    listFields(listFieldsParams: DiscoveryV2.ListFieldsParams): Promise<any>;
}
