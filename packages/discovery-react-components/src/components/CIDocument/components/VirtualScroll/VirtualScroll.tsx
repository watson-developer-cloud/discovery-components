import React, {
  ForwardRefRenderFunction,
  forwardRef,
  MutableRefObject,
  useImperativeHandle,
  useRef,
  useState,
  ReactElement
} from 'react';
import { findDOMNode } from 'react-dom';
import { AutoSizer, AutoSizerProps } from 'react-virtualized/dist/es/AutoSizer';
import { CellMeasurer, CellMeasurerCache } from 'react-virtualized/dist/es/CellMeasurer';
import { List } from 'react-virtualized/dist/es/List';
import { settings } from 'carbon-components';
import uniqueId from 'lodash/uniqueId';

interface RowRenderArgs {
  index: number;
}

interface VirtualScrollProps {
  children: (args: RowRenderArgs) => ReactElement;
  rowCount: number;
  // dimensions for overriding auto-sizing; useful for testing
  width?: number;
  height?: number;
}

const baseClassName = `${settings.prefix}--ci-doc-virtual-scroll`;

const VirtualScroll: ForwardRefRenderFunction<any, VirtualScrollProps> = (
  { children: rowRenderer, rowCount, width, height },
  ref
) => {
  const listRef = useRef<any>();
  const instanceRef = useRef<any>();
  useState(initInstance.bind(null, listRef, instanceRef));

  const {
    cache,
    onResize,
    getElementById,
    getPrefixedId,
    scrollToRow,
    scrollIntoView,
    scrollToRowCallback
  } = instanceRef.current;
  useImperativeHandle(ref, () => ({ scrollIntoView, scrollToRow, getElementById, listRef }));

  let Sizer: any = AutoSizer;
  if (width && height) {
    Sizer = ({ children }: AutoSizerProps): ReactElement =>
      children({ width, height }) as ReactElement;
  }

  return (
    <Sizer className={baseClassName} onResize={onResize}>
      {({ width, height }: { width: number; height: number }): ReactElement => (
        <List
          ref={listRef}
          width={width}
          height={height}
          overscan={3}
          rowCount={rowCount}
          deferredMeasurementCache={cache}
          rowHeight={cache.rowHeight}
          onRowsRendered={scrollToRowCallback}
          rowRenderer={({ index, key, parent, style }): ReactElement => (
            <CellMeasurer cache={cache} columnIndex={0} key={key} parent={parent} rowIndex={index}>
              <div id={getPrefixedId(index)} style={style}>
                {rowRenderer({ index })}
              </div>
            </CellMeasurer>
          )}
        />
      )}
    </Sizer>
  );
};

function initInstance(listRef: MutableRefObject<any>, instanceRef: MutableRefObject<any>): void {
  instanceRef.current = {
    cache: new CellMeasurerCache({ defaultHeight: 10, fixedWidth: true }),

    onResize: (): void => {
      instanceRef.current.cache.clearAll();
      listRef.current && listRef.current.forceUpdateGrid();
    },

    getElementById: (id: string): Element | null => {
      // eslint-disable-next-line react/no-find-dom-node
      const listNode = findDOMNode(listRef.current);
      return listNode ? (listNode as HTMLElement).querySelector(`#${id}`) : null;
    },

    idPrefix: uniqueId('VirtualScroll-') + '-',

    getPrefixedId: (id: string): string => `${instanceRef.current.idPrefix}${id}`,

    scrollToRow: (index: number, ttl = 500): Promise<void> =>
      new Promise(async (resolve, reject): Promise<void> => {
        const { promisedRow, cache, getElementById, getPrefixedId } = instanceRef.current;

        if (getElementById(getPrefixedId(index))) resolve();

        // If we've seen the row before, scroll once. If we haven't, scroll twice. See this issue for
        // explanation: https://github.com/bvaughn/react-virtualized/issues/995
        instanceRef.current.promisedRow = {
          index,
          resolve,
          remainingTries: cache._rowHeightCache[`${index}-0`] ? 0 : 1
        };

        listRef.current.scrollToRow(index);

        setTimeout(() => promisedRow && promisedRow.index === index && reject(), ttl);
      }),

    // This function is called in onRowsRendered as (sort of) a callback after the scroll event occurs
    scrollToRowCallback: (): void => {
      const { promisedRow } = instanceRef.current;
      if (!promisedRow) return;

      const { index, resolve, remainingTries } = promisedRow;
      if (remainingTries) {
        promisedRow.remainingTries--;
        listRef.current.scrollToRow(index);
      } else {
        instanceRef.current.promisedRow = null;
        resolve();
      }
    },

    scrollIntoView: async (row: number, elemSelector: string): Promise<void> => {
      try {
        // eslint-disable-next-line react/no-find-dom-node
        const listDom = findDOMNode(listRef.current);
        let elem = (listDom as Element).querySelector(elemSelector);

        if (isVisible(elem as HTMLElement, listRef)) {
          // If element is already visible, don't scroll at all
          return;
        }
        if (!elem) {
          // If element is not in DOM, scroll to its row
          await instanceRef.current.scrollToRow(row);
        }

        // Check for the element until it exists using the given selector
        // (Max of 1 second before giving up)
        elem = await new Promise((resolve): void => {
          let count = 0;
          const retry = 50;
          const timeout = 1000;

          const checkForElement = (): void => {
            const item = (listDom as Element).querySelector(elemSelector);
            if (!item && count * retry < timeout) {
              count++;
              setTimeout(() => {
                checkForElement();
              }, retry);
            } else {
              resolve(item);
            }
          };

          checkForElement();
        });

        if (elem) {
          (elem.childNodes[0] as Element).scrollIntoView({ block: 'center' });
        }
      } catch (err) {}
    }
  };
}

function isVisible(item: HTMLElement, listRef: MutableRefObject<HTMLElement>): boolean {
  if (!item || !listRef) {
    return false;
  }

  // eslint-disable-next-line react/no-find-dom-node
  const listNode = findDOMNode(listRef.current);
  if (!listNode) {
    return false;
  }

  const { top: docTop, bottom: docBottom } = (listNode as HTMLElement).getBoundingClientRect();
  const { itemTop, itemBottom } = itemBounds(item);

  return itemTop >= docTop && itemBottom <= docBottom;
}

interface VerticalBounds {
  itemTop: number;
  itemBottom: number;
}

function itemBounds(item: HTMLElement): VerticalBounds {
  const { top: itemTop, bottom: itemBottom } = item.getBoundingClientRect();
  if (itemTop !== itemBottom) {
    return { itemTop, itemBottom };
  } else {
    const childrenBounds = Array.from(item.children).map(child => {
      // Is there a way to combine these two lines?
      // Returning { top, bottom } = child.getBoundingClientRect() doesn't seem to work...
      const { top, bottom } = child.getBoundingClientRect();
      return { top, bottom };
    });
    return {
      itemTop: Math.min(...childrenBounds.map(bound => bound.top)),
      itemBottom: Math.max(...childrenBounds.map(bound => bound.bottom))
    };
  }
}

export default forwardRef(VirtualScroll);
