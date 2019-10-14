import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';

function isConfigurationTerm(configuration: any): configuration is DiscoveryV1.Term {
  return (
    (typeof configuration.field === 'string') === true &&
    (configuration.count !== undefined && (typeof configuration.count === 'number') === true)
  );
}

export const validateConfiguration = (configuration: DiscoveryV1.Term[]) => {
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
