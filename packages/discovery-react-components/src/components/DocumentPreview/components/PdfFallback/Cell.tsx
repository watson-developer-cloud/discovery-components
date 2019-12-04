import React, { FC, createRef, useState, useEffect } from 'react';
import {
  PageWithCells,
  StyledCell as StyledCellType
} from '@DocumentPreview/components/PdfFallback/PdfFallback';

interface Props {
  page: PageWithCells;
  cell: StyledCellType;
}

const Cell: FC<Props> = props => {
  const { page, cell } = props;
  const { bbox, className, content } = cell;
  const [left, top, right, bottom] = bbox;
  const x = left;
  const y = page.origin === 'TopLeft' ? top : page.height - top;
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

      // only shrink-to-fit, don't grow
      setScale(Math.min(widthScale, 1));
      setDidUpdate(true);
    }

    return (): void => {
      didCancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, className]);

  return (
    <text
      className={className}
      x={x / scale}
      y={y / scale}
      width={width}
      height={height}
      ref={textNode}
      visibility={didUpdate ? undefined : 'hidden'}
      style={{
        transform: `scale(${scale})`
      }}
    >
      {content}
    </text>
  );
};

export default Cell;
