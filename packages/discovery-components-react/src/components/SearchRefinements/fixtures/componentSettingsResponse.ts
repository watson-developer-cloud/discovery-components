import { Response, ComponentSettingsResponse } from '@disco-widgets/ibm-watson/discovery/v2';
import { createDummyResponse } from '../../../utils/testingUtils';

const aggregationComponentSettingsResponse: Response<
  ComponentSettingsResponse
> = createDummyResponse({
  aggregations: [
    {
      label: 'Author (label created in component settings)',
      multiple_selections_allowed: false
    }
  ]
});

export default aggregationComponentSettingsResponse;
