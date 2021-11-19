import React, { MutableRefObject, ReactElement, useRef } from 'react';

import { LoremIpsum } from 'lorem-ipsum';
import seedrandom from 'seedrandom';
import { storiesOf } from '@storybook/react';

import VirtualScroll from './VirtualScroll';

const pseudoRandom = seedrandom('same-every-time');
const lorem = new LoremIpsum({ random: pseudoRandom });
const loremCache: string[] = [];

const getLorem = (i: number): string => {
  if (loremCache.length <= i) {
    let numWords;
    for (let j = loremCache.length; j <= i; j++) {
      numWords = Math.pow(Math.floor(pseudoRandom() * 5), 4);
      loremCache.push(lorem.generateWords(numWords));
    }
  }
  return loremCache[i];
};

interface Index {
  index: number;
}

const PseudoRandomRow = ({ index }: Index): ReactElement => (
  <>
    <h1 style={{ fontSize: '40px' }}>Row {index}</h1>
    {Array(6)
      .fill(0)
      .map((_, i, arr) => {
        const id = index * 5 + i;
        const style = { backgroundColor: '#1FEFEF', margin: '0 10px' };
        return (
          <React.Fragment key={id}>
            {getLorem(id)}
            {i !== arr.length - 1 && (
              <span id={`elem-${id}`} style={style}>
                This is element {id}.
              </span>
            )}
          </React.Fragment>
        );
      })}
  </>
);

const VirtualScrollTester = (): ReactElement => {
  const virtualScrollRef: MutableRefObject<any> = useRef();

  const scrollToRow = async (): Promise<void> => {
    try {
      await virtualScrollRef.current.scrollToRow(70);
      const elem = virtualScrollRef.current.getElementById('elem-352');
      elem.scrollIntoView({ block: 'center' });
      elem.style.backgroundColor = 'yellow';
    } catch (err) {}
  };

  return (
    <div style={{ height: '90vh', margin: '20px 100px' }}>
      <button onClick={scrollToRow}>Scroll to row 70 and elem 352</button>
      <VirtualScroll ref={virtualScrollRef} rowCount={100}>
        {({ index }): ReactElement => <PseudoRandomRow index={index} />}
      </VirtualScroll>
    </div>
  );
};

storiesOf('CIDocument/components/VirtualScroll', module).add('default', () => (
  <VirtualScrollTester />
));
