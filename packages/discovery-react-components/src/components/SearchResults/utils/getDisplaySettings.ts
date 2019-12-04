import DiscoveryV2 from 'ibm-watson/discovery/v2';
import get from 'lodash/get';

interface displaySettingsParams {
  resultTitleField?: string;
  bodyField?: string;
  usePassages?: boolean;
}

export const getDisplaySettings = (
  params: displaySettingsParams,
  componentSettings: DiscoveryV2.ComponentSettingsResponse | null = null
): Required<displaySettingsParams> => {
  return {
    resultTitleField:
      params.resultTitleField ||
      get(componentSettings, 'fields_shown.title.field', 'extracted_metadata.title'),
    bodyField: params.bodyField || get(componentSettings, 'fields_shown.body.field', 'text'),
    usePassages:
      params.usePassages === undefined
        ? get(componentSettings, 'fields_shown.body.use_passage', true)
        : params.usePassages
  };
};
