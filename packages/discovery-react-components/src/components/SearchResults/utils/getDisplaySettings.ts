import DiscoveryV2 from 'ibm-watson/discovery/v2';
import get from 'lodash/get';

export interface DisplaySettingsParams {
  resultTitleField?: string;
  bodyField?: string;
  usePassages?: boolean;
}

export const getDisplaySettings = (
  params: DisplaySettingsParams,
  componentSettings: DiscoveryV2.ComponentSettingsResponse | null = null
): Required<DisplaySettingsParams> => {
  return {
    resultTitleField: params.resultTitleField || get(componentSettings, 'fields_shown.title.field'),
    bodyField: params.bodyField || get(componentSettings, 'fields_shown.body.field', 'text'),
    usePassages:
      params.usePassages === undefined
        ? get(componentSettings, 'fields_shown.body.use_passage', true)
        : params.usePassages
  };
};
