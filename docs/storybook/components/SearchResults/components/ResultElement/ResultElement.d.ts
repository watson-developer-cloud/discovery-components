import React from 'react';
import { SelectedResult } from 'components/DiscoverySearch/DiscoverySearch';
export interface ResultElementProps {
    /**
     * body of the result element. Table html if a table element. Otherwise, first passage text or bodyField.
     */
    body: string;
    /**
     * CTA text for viewing the result element in the document
     */
    buttonText?: string;
    /**
     * the result element object
     */
    element?: SelectedResult['element'];
    /**
     * type of result element
     */
    elementType?: SelectedResult['elementType'];
    /**
     * handler for selecting the result element to view in the document
     */
    handleSelectResult: (element: SelectedResult['element'], elementType: SelectedResult['elementType']) => (event: React.MouseEvent<HTMLButtonElement>) => void;
    /**
     * specify a className for styling passage text and highlights
     */
    passageTextClassName?: string;
    /**
     * specifies whether or not there is a Queryresult object corresponding with this ResultElement
     */
    hasResult: boolean;
    /**
     * specifies whether to use dangerouslySetInnerHtml when rendering this result element
     */
    dangerouslyRenderHtml?: boolean;
    /**
     * label used to describe the element
     */
    elementLabel?: string;
}
export declare const ResultElement: React.FunctionComponent<ResultElementProps>;
