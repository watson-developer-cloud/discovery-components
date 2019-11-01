import React, { useContext } from 'react';
import { settings } from 'carbon-components';
import { ToggleSmall } from 'carbon-components-react';
import { SearchApi } from '../../../DiscoverySearch/DiscoverySearch';

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
   * override the default label text for the show tables only toggle
   */
  tablesOnlyToggleLabelText: string;
}

export const TablesOnlyToggle: React.FunctionComponent<TablesOnlyToggleProps> = ({
  setShowTablesOnlyResults,
  showTablesOnlyResults,
  showTablesOnlyToggle,
  tablesOnlyToggleLabelText
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
        <ToggleSmall
          aria-label={tablesOnlyToggleLabelText}
          className={toggleClassName}
          id={`${settings.prefix}--tables-only-toggle`}
          labelText={tablesOnlyToggleLabelText}
          onToggle={handleToggle}
        />
      )}
    </>
  );
};
