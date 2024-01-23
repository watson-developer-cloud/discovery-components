import React from 'react';
import { QueryResult } from 'ibm-watson/discovery/v2';
import { WithErrorBoundaryProps } from 'utils/hoc/withErrorBoundary';
import { Theme } from 'utils/theme';
import { Messages as DetailsPaneMessages } from '../DetailsPane/messages';
import { Messages as FilterPanelMessages } from '../FilterPanel/messages';
import { Messages as MetadataPaneMessages } from '../MetadataPane/messages';
import { Messages as NavigationToolbarMessages } from '../NavigationToolbar/messages';
import { Messages as CIDocumentMessages } from './messages';
export type Messages = DetailsPaneMessages & FilterPanelMessages & MetadataPaneMessages & NavigationToolbarMessages & CIDocumentMessages;
export declare function canRenderCIDocument(document: QueryResult): boolean;
export interface CIDocumentProps extends WithErrorBoundaryProps {
    /**
     * Document data, as that returned by a query. Overrides result from SearchContext
     */
    document: QueryResult;
    /**
     * i18n messages for the component
     */
    messages?: Messages;
    /**
     * Color theme, for select areas which cannot be specified in CSS
     */
    theme?: Theme;
    /**
     * Override autosizing of document content with specified width. Useful for testing.
     */
    overrideDocWidth?: number;
    /**
     * Override autosizing of document content with specified height. Useful for testing.
     */
    overrideDocHeight?: number;
}
declare const _default: React.ComponentClass<Omit<CIDocumentProps, "didCatch">, import("utils/hoc/withErrorBoundary").WithErrorBoundaryState>;
export default _default;
