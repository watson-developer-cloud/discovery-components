import { Messages } from 'components/SearchFacets/messages';
import { formatMessage } from 'utils/formatMessage';

export const getFacetLabel = (facetText: string, count: number | undefined, messages: Messages) => {
  return count !== undefined
    ? formatMessage(messages.labelTextWithCount, { facetText: facetText, count: count }, false)
    : formatMessage(messages.labelText, { facetText: facetText }, false);
};
