import { Response, ComponentSettingsResponse } from 'ibm-watson/discovery/v2';
import { createDummyResponse } from '../../../utils/testingUtils';

const aggregationComponentSettingsResponse: Response<
  ComponentSettingsResponse
> = createDummyResponse({
  aggregations: [
    {
      name: 'category_id',
      label: 'Category (label created in component settings)',
      multiple_selections_allowed: false
    }
  ]
});

export default aggregationComponentSettingsResponse;
