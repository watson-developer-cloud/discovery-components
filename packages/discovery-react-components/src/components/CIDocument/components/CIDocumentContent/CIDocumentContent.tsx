/**
 * Renders a "CI" (HTML) document using a virtual "infinite" list, for
 * performance reasons.
 */

import React, { FC, ReactElement, MutableRefObject, useEffect, useRef } from 'react';
import cx from 'classnames';
import { settings } from 'carbon-components';
import { SkeletonText } from 'carbon-components-react';
import Section, { OnFieldClickFn } from '../Section/Section';
import VirtualScroll from '../VirtualScroll/VirtualScroll';
import { defaultTheme, Theme } from 'utils/theme';
import { SectionType, ItemMap, HighlightWithMeta } from 'components/CIDocument/types';
import { FacetInfoMap } from '../../../DocumentPreview/types';
import { getId as getLocationId } from 'utils/document/idUtils';

const baseClassName = `${settings.prefix}--ci-doc-content`;

export interface CIDocumentContentProps {
  className?: string;
  styles?: string[];
  sections: SectionType[];
  itemMap: ItemMap;
  highlightedIds?: string[];
  activeIds?: string[];
  activePartIds?: string[];
  selectableIds?: string[];
  activeMetadataIds?: string[];
  width?: number;
  height?: number;
  theme?: Theme;
  documentId?: string;
  onItemClick?: OnFieldClickFn;
  combinedHighlights?: HighlightWithMeta[];
  facetInfoMap?: FacetInfoMap;
  activeColor?: string | null;
}

const CIDocumentContent: FC<CIDocumentContentProps> = ({
  className,
  sections = [],
  styles: docStyles = '',
  highlightedIds = [],
  activeIds = [],
  activePartIds = [],
  selectableIds = [],
  activeMetadataIds = [],
  itemMap,
  width,
  height,
  theme = defaultTheme,
  documentId = '',
  onItemClick = (): void => {},
  combinedHighlights,
  facetInfoMap,
  activeColor
}) => {
  const virtualScrollRef = useRef<any>();

  useEffect(() => {
    const ids =
      (activePartIds.length > 0 && activePartIds) ||
      (activeIds.length > 0 && activeIds) ||
      (activeMetadataIds.length > 0 && activeMetadataIds);
    if (ids && ids.length > 0 && virtualScrollRef.current) {
      scrollToActiveItem(virtualScrollRef, itemMap, ids[0]);
    }
  }, [activeIds, activeMetadataIds, activePartIds, itemMap]);

  const loading = !sections || sections.length === 0;

  return (
    <div className={cx(baseClassName, className, { skeleton: loading })}>
      {loading ? (
        <SkeletonText paragraph={true} lineCount={80} />
      ) : (
        <>
          <style data-testid="style">{docStyles}</style>
          {!!combinedHighlights && combinedHighlights.length > 0 && (
            <style>{highlightColoringFullArray(combinedHighlights).join('\n')}</style>
          )}
          {(!combinedHighlights || combinedHighlights.length <= 0) && (
            <style>
              {createStyleRules(highlightedIds, [
                backgroundColorRule(theme.highlightBackground),
                // Set z-index to -1 in order to push non-active fields back
                zIndexRule(-1)
              ])}
            </style>
          )}
          {activeIds && activeIds.length > 0 && (
            <>
              <style>
                {/*Set z-index to 0 to pull active element in front of overlapping fields */}
                {createStyleRules(activeIds, [
                  backgroundColorRule(theme.activeHighlightBackground),
                  outlineRule(activeColor || theme.highlightBackground),
                  zIndexRule(0)
                ])}
              </style>
            </>
          )}
          {activePartIds.length > 0 && (
            <style>
              {createStyleRules(activePartIds, [
                backgroundColorRule(theme.highlightWithinActiveHighlightBackground)
              ])}
            </style>
          )}
          {selectableIds && selectableIds.length > 0 && (
            <style>
              {createStyleRules(selectableIds, [underlineRule(theme.textHoverBackground)])}
            </style>
          )}
          {activeMetadataIds.length > 0 && (
            <style>
              {createStyleRules(activeMetadataIds, [
                backgroundColorRule(theme.highlightWithinActiveHighlightBackground)
              ])}
            </style>
          )}
          {sections.length > 0 && (
            <VirtualScroll
              key={`${documentId}-${sections.length}-${sections[0].html.length}`}
              rowCount={sections.length}
              width={width}
              height={height}
              ref={virtualScrollRef}
            >
              {({ index }): ReactElement => (
                <Section
                  section={sections[index]}
                  onFieldClick={onItemClick}
                  facetInfoMap={facetInfoMap}
                />
              )}
            </VirtualScroll>
          )}
        </>
      )}
    </div>
  );
};

function createStyleRules(idList: string[], rules: string[]): string {
  return idList
    .map(id => `.${baseClassName} .field[data-field-id="${id}"] > *`)
    .join(',')
    .concat(`{${rules.join(';')}}`);
}

function highlightColoringFullArray(combinedHighlightsWithMeta: HighlightWithMeta[]) {
  return combinedHighlightsWithMeta.map(highlightWithMeta => {
    const locationId = getHighlightLocationId(highlightWithMeta);
    const rules = `.${baseClassName} .field[data-field-id="${locationId}"] > * {background-color: ${highlightWithMeta.color}; border: 2px solid ${highlightWithMeta.color};}`;
    return rules;
  });
}

function backgroundColorRule(color: string): string {
  return `background-color: ${color}`;
}

function zIndexRule(value: number): string {
  return `z-index: ${value}`;
}

function outlineRule(color: string): string {
  return `border: ${color} solid 2px`;
}

function underlineRule(color: string): string {
  return `border-bottom: ${color} dashed 1px`;
}

function scrollToActiveItem(
  virtualScrollRef: MutableRefObject<any>,
  itemMap: ItemMap,
  activeId: string
): void {
  virtualScrollRef.current.scrollIntoView(
    itemMap.byItem[activeId],
    `.field[data-field-id="${activeId}"]`
  );
}

function getHighlightLocationId(highlightWithMeta: HighlightWithMeta): string {
  return getLocationId({
    location: {
      begin: highlightWithMeta.begin,
      end: highlightWithMeta.end
    }
  });
}

export default CIDocumentContent;
