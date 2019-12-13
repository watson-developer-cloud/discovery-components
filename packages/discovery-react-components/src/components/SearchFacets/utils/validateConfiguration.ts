import DiscoveryV2 from 'ibm-watson/discovery/v2';

function isConfigurationTerm(
  configuration: any
): configuration is DiscoveryV2.QueryTermAggregation {
  return (
    (typeof configuration.field === 'string') === true &&
    configuration.count !== undefined &&
    (typeof configuration.count === 'number') === true
  );
}

export const validateConfiguration = (configuration: DiscoveryV2.QueryTermAggregation[]) => {
  if (!configuration) {
    return false;
  }
  if (!Array.isArray(configuration)) {
    return false;
  }
  if (!(configuration.length > 0)) {
    return false;
  }
  const termsAreNotValid = configuration.filter(config => {
    return !isConfigurationTerm(config);
  });
  if (termsAreNotValid.length > 0) {
    return false;
  }
  return true;
};
