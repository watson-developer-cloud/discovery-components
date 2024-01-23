import React from 'react';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { Messages } from './messages';
import { DisplaySettingsParams } from './utils/getDisplaySettings';
export interface SearchResultsProps {
    /**
     * specify a field on the result object to pull the result title from
     * if this field does not contain a valid title, document_id will be used.
     */
    resultTitleField?: string;
    /**
     * specify a field on the result object to create the result link.
     * When clicking the "View passage in document" button, the user will be taken to the corresponding link rather than attempting to
     * preview the text using the CIDocument component.
     */
    resultLinkField?: string;
    /**
     * specify a string template using mustache templating syntax https://github.com/janl/mustache.js to create the result link.
     * When clicking the "View passage in document" button, the user will be taken to the corresponding link rather than attempting to
     * preview the text using the CIDocument component.
     */
    resultLinkTemplate?: string;
    /**
     * specify a field on the result object that will be displayed if there is no passage or usePassages is set to false
     */
    bodyField?: string;
    /**
     * specify whether or not any html in passages should be cleaned of html element tags
     */
    dangerouslyRenderHtml?: boolean;
    /**
     * specify whether or not passages should be displayed in the search results
     */
    usePassages?: boolean;
    /**
     * specify an approximate max length for passages returned to the Result component
     * default length is 400. Min length is 50 and max length is 2000.
     */
    passageLength?: number;
    /**
     * specify a className for styling passage text and highlights
     */
    passageTextClassName?: string;
    /**
     * specify whether only table results should be displayed by default
     */
    showTablesOnly?: boolean;
    /**
     * specify whether to display a toggle for showing table search results only
     */
    showTablesOnlyToggle?: boolean;
    /**
     * override default messages for the component by specifying custom and/or internationalized text strings
     */
    messages?: Partial<Messages>;
    /**
     * callback function from the component for sending document
     */
    onSelectResult?: (document: {
        document: DiscoveryV2.QueryResult;
    }) => void | undefined;
    /**
     * custom handler invoked when any input element changes in the SearchResults component
     */
    onChange?: (searchValue: string) => void;
    /**
     * custom handler invoked when the tablesonly toggle is changed
     */
    onTablesOnlyToggle?: (value: boolean) => void;
}
/**
 * Hook to update search parameters' `return` param with the fields
 * that are necessary to render this component.
 */
export declare function useUpdateQueryReturnParam({ displaySettings, resultLinkField }: {
    displaySettings: DisplaySettingsParams;
    resultLinkField?: string;
}): void;
declare const _default: React.ComponentType<SearchResultsProps>;
export default _default;
