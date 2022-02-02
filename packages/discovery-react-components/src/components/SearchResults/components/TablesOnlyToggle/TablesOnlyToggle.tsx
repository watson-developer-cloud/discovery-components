import React, { useContext } from 'react';
import { settings } from 'carbon-components';
import { Toggle } from 'carbon-components-react';
import { SearchApi } from 'components/DiscoverySearch/DiscoverySearch';
import { Messages } from 'components/SearchResults/messages';

export interface TablesOnlyToggleProps {
  /**
   * used to set the showTablesOnlyResults state when toggled
   */
  setShowTablesOnlyResults: (value: boolean) => void;
  /**
   * specifies whether tables only results or regular search results should be shown
   */
  showTablesOnlyResults: boolean;
  /**
   * specify whether to display a toggle option for showing table search results only
   */
  showTablesOnlyToggle: boolean;
  /**
   * override default messages for the component by specifying custom and/or internationalized text strings
   */
  messages: Messages;
}

export const TablesOnlyToggle: React.FunctionComponent<TablesOnlyToggleProps> = ({
  setShowTablesOnlyResults,
  showTablesOnlyResults,
  showTablesOnlyToggle,
  messages
}) => {
  const { setIsResultsPaginationComponentHidden } = useContext(SearchApi);

  const handleToggle = () => {
    setShowTablesOnlyResults(!showTablesOnlyResults);
    showTablesOnlyResults
      ? setIsResultsPaginationComponentHidden(false)
      : setIsResultsPaginationComponentHidden(true);
  };

  const toggleClassName = `${settings.prefix}--search-result--toggle`;
  return (
    <>
      {showTablesOnlyToggle && (
        <Toggle
          size="sm"
          aria-label={messages.tablesOnlyToggleLabelText}
          className={toggleClassName}
          id={`${settings.prefix}--tables-only-toggle`}
          labelText={messages.tablesOnlyToggleLabelText}
          onToggle={handleToggle}
          toggled={showTablesOnlyResults}
        />
      )}
    </>
  );
};
