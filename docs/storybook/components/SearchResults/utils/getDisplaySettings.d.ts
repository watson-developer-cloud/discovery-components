import DiscoveryV2 from 'ibm-watson/discovery/v2';
export interface DisplaySettingsParams {
    resultTitleField?: string;
    bodyField?: string;
    usePassages?: boolean;
}
export declare const getDisplaySettings: (params: DisplaySettingsParams, componentSettings?: DiscoveryV2.ComponentSettingsResponse | null) => Required<DisplaySettingsParams>;
