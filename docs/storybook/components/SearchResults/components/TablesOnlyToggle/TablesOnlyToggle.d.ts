import React from 'react';
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
export declare const TablesOnlyToggle: React.FunctionComponent<TablesOnlyToggleProps>;
