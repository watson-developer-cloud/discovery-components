import React from 'react';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { Messages } from 'components/SearchResults/messages';
export interface ResultProps {
    /**
     * specify a field on the result object that will be displayed if there is no passage or usePassages is set to false
     */
    bodyField: string;
    /**
     * collection name to render on each search result
     */
    collectionName?: string;
    /**
     * specify a className for styling passage text and highlights
     */
    passageTextClassName?: string;
    /**
     * the query result document associated with the search result
     */
    result?: DiscoveryV2.QueryResult;
    /**
     * specify a field on the result object to pull the result link from
     * This will disable the "View passage in document" button and instead take the user to the corresponding link when clicked.
     */
    resultLinkField?: string;
    /**
     * specify a string template using mustache templating syntax https://github.com/janl/mustache.js to create the result link from each result object
     * This will disable the "View passage in document" button and instead take the user to the corresponding link when clicked.
     */
    resultLinkTemplate?: string;
    /**
     * specify a field on the result object to pull the result title from
     * if this field does not contain a valid title, document_id will be used
     */
    resultTitleField: string;
    /**
     * specifies whether to show tables only results or regular search results
     */
    showTablesOnlyResults?: boolean;
    /**
     * the table result element for the search result
     */
    table?: DiscoveryV2.QueryTableResult;
    /**
     * specify whether or not any html in passages should be cleaned of html element tags
     */
    dangerouslyRenderHtml?: boolean;
    /**
     * specify whether or not passages should be displayed in the search results
     */
    usePassages?: boolean;
    /**
     * override default messages for the component by specifying custom and/or internationalized text strings
     */
    messages: Partial<Messages>;
    /**
     * callback function from the component for sending document
     */
    onSelectResult?: (document: {
        document: DiscoveryV2.QueryResult;
    }) => void;
}
export declare const Result: React.FunctionComponent<ResultProps>;
