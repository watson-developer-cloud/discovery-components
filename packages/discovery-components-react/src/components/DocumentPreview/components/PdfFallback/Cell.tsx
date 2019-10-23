import React, { FC, createRef, useState, useEffect } from 'react';
import { PageWithCells, StyledCell as StyledCellType } from './PdfFallback';

interface Props {
  page: PageWithCells;
  cell: StyledCellType;
}

interface CellProps extends Props {
  children(props: any): JSX.Element;
}

// Simple SVG text node to which we apply styling (through `className`)
const StyledCell: FC<CellProps> = ({ cell, children }) => {
  return children({ className: cell.className });
};

// If no styling information is available, then attempt to fit the text to
// the given box width
const AutosizeCell: FC<CellProps> = ({ cell, children }) => {
  const { bbox } = cell;
  const [left, top, right, bottom] = bbox;

  const width = right - left;
  const height = bottom - top;

  const textNode = createRef<SVGTextElement>();

  const [scale, setScale] = useState<number>(1);
  const [didUpdate, setDidUpdate] = useState<boolean>(false);
  useEffect(() => {
    let didCancel = false;
    if (!didCancel && textNode.current) {
      const box = textNode.current.getBBox();
      const widthScale = width / box.width;
      // const heightScale = height / box.height;
      // const scale = Math.min(widthScale, heightScale);

      // setScale(scale);
      setScale(widthScale);
      setDidUpdate(true);
    }

    return (): void => {
      didCancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  return children({
    ref: textNode,
    visibility: didUpdate ? null : 'hidden',
    style: {
      fontSize: `${scale}rem`
    }
  });
};

const Cell: FC<Props> = props => {
  const { page, cell } = props;
  const { bbox, className, content } = cell;
  const [left, top, right, bottom] = bbox;
  const width = right - left;
  const height = bottom - top;

  const Element = className ? StyledCell : AutosizeCell;
  return (
    <Element {...props}>
      {(moreProps: any) => (
        <text
          x={left}
          y={page.origin === 'TopLeft' ? top : page.height - top}
          width={width}
          height={height}
          {...moreProps}
        >
          {content}
        </text>
      )}
    </Element>
  );
};

export default Cell;
