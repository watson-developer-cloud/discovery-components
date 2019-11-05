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
import { SectionType, ItemMap } from '../../types';

const baseClassName = `${settings.prefix}--ci-doc-content`;

const highlightedColor = '#deedf7'; //$cerulean_01;
const activeColor = '#afcdef';
const activePartColor = '#eb9500';
const clickableItemColor = '#bebebe'; //$gray_30;
const activeMetadataColor = '#eb9500';

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
  onItemClick?: OnFieldClickFn;
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
  onItemClick = (): void => {}
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
          {highlightedIds.length > 0 && (
            <style>
              {createStyleRules(highlightedIds, [
                backgroundColorRule(highlightedColor),
                // Set z-index to -1 in order to push non-active fields back
                zIndexRule(-1)
              ])}
            </style>
          )}
          {activeIds && activeIds.length > 0 && (
            <>
              <style>
                {/*Set z-index to 0 to pull active element in front of overlapping fields */}
                {createStyleRules(activeIds, [backgroundColorRule(activeColor), zIndexRule(0)])}
              </style>
            </>
          )}
          {activePartIds.length > 0 && (
            <style>{createStyleRules(activePartIds, [backgroundColorRule(activePartColor)])}</style>
          )}
          {selectableIds && selectableIds.length > 0 && (
            <style>{createStyleRules(selectableIds, [underlineRule(clickableItemColor)])}</style>
          )}
          {activeMetadataIds.length > 0 && (
            <style>
              {createStyleRules(activeMetadataIds, [backgroundColorRule(activeMetadataColor)])}
            </style>
          )}
          {sections.length > 0 && (
            <VirtualScroll
              key={`${sections.length}-${sections[0].html.length}`}
              rowCount={sections.length}
              width={width}
              height={height}
              ref={virtualScrollRef}
            >
              {({ index }): ReactElement => (
                <Section section={sections[index]} onFieldClick={onItemClick} />
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

function backgroundColorRule(color: string): string {
  return `background-color: ${color}`;
}

function zIndexRule(value: number): string {
  return `z-index: ${value}`;
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

export default CIDocumentContent;
