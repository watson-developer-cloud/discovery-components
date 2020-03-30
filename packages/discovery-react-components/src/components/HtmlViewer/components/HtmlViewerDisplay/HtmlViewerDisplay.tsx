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
import { SectionType, ItemMap } from 'components/HtmlViewerDisplay/types';

const baseClassName = `${settings.prefix}--html-viewer-display`;

export interface HtmlViewerDisplayProps {
  className?: string;
  styles?: string[];
  sections: SectionType[];
  itemMap: ItemMap;
  underlinedList?: string[];
  highlightedList?: string[];
  activeItem?: string[];
  subparts?: string[];
  activeSubpart?: string[];
  width?: number;
  height?: number;
  theme?: Theme;
  onItemClick?: OnFieldClickFn;
}

const HtmlViewerDisplay: FC<HtmlViewerDisplayProps> = ({
  className,
  sections = [],
  styles: docStyles = '',
  underlinedList = [],
  highlightedList = [],
  activeItem = [],
  subparts = [],
  activeSubpart = [],
  itemMap,
  width,
  height,
  theme = defaultTheme,
  onItemClick = (): void => {}
}) => {
  const virtualScrollRef = useRef<any>();

  useEffect(() => {
    const ids =
      (activeSubpart.length > 0 && activeSubpart) ||
      (activeItem.length > 0 && activeItem) ||
      (subparts.length > 0 && subparts);
    if (ids && ids.length > 0 && virtualScrollRef.current) {
      scrollToActiveItem(virtualScrollRef, itemMap, ids[0]);
    }
  }, [activeItem, subparts, activeSubpart, itemMap]);

  const loading = !sections || sections.length === 0;
  return (
    <div className={cx(baseClassName, className, { skeleton: loading })}>
      {loading ? (
        <SkeletonText paragraph={true} lineCount={80} />
      ) : (
        <>
          <style data-testid="style">{docStyles}</style>
          {highlightedList.length > 0 && (
            <style>
              {createStyleRules(highlightedList, [
                backgroundColorRule(theme.highlightBackground),
                // Set z-index to -1 in order to push non-active fields back
                zIndexRule(-1)
              ])}
            </style>
          )}
          {underlinedList && underlinedList.length > 0 && (
            <style>
              {createStyleRules(underlinedList, [underlineRule(theme.textHoverBackground)])}
            </style>
          )}
          {activeItem && activeItem.length > 0 && (
            <>
              <style>
                {/*Set z-index to 0 to pull active element in front of overlapping fields */}
                {createStyleRules(activeItem, [
                  backgroundColorRule(theme.activeHighlightBackground),
                  zIndexRule(0)
                ])}
              </style>
            </>
          )}
          {subparts.length > 0 && (
            <style>
              {createStyleRules(subparts, [
                backgroundColorRule(theme.highlightWithinActiveHighlightBackground)
              ])}
            </style>
          )}
          {activeSubpart.length > 0 && (
            <style>
              {createStyleRules(activeSubpart, [
                backgroundColorRule(theme.highlightWithinActiveHighlightBackground)
              ])}
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

export default HtmlViewerDisplay;
