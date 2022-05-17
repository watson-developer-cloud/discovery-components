import * as React from 'react';
import { render } from '@testing-library/react';
import {
  uniqRects,
  findOffsetInDOM,
  getTextNodeAndOffset,
  spansIntersect,
  findContainingNodeWithin,
  getContainingNode
} from '../documentUtils';
import { data as textNodesData, watsonIndex } from '../__fixtures__/textNodeData';
import { nodes as fakeDOM } from '../__fixtures__/fakeDOM';

describe('uniqRects', () => {
  it('removes duplicate rects', () => {
    const rects = [
      {
        bottom: 1,
        height: 2,
        left: 3,
        right: 4,
        top: 5,
        width: 6,
        x: 7,
        y: 8
      },
      {
        bottom: 1,
        height: 2,
        left: 3,
        right: 4,
        top: 5,
        width: 6,
        x: 7,
        y: 8
      },
      {
        bottom: 9,
        height: 9,
        left: 3,
        right: 4,
        top: 5,
        width: 6,
        x: 7,
        y: 8
      }
    ];

    expect(uniqRects(rects as unknown as DOMRectList)).toHaveLength(2);
  });

  it('does not remove similar but not identical rects', () => {
    const rects = [
      {
        bottom: 1,
        height: 2,
        left: 3,
        right: 4,
        top: 5,
        width: 6,
        x: 7,
        y: 8
      },
      {
        bottom: 2,
        height: 2,
        left: 3,
        right: 4,
        top: 5,
        width: 6,
        x: 7,
        y: 8
      },
      {
        bottom: 9,
        height: 9,
        left: 3,
        right: 4,
        top: 5,
        width: 6,
        x: 7,
        y: 8
      }
    ];

    expect(uniqRects(rects as unknown as DOMRectList)).toHaveLength(3);
  });
});

describe('findOffsetInDOM', () => {
  it('finds offsets in a single node', () => {
    const childBegin = 54;
    const childEnd = 757;

    const { container } = render(
      <div className="parent">
        <div data-child-begin={childBegin} data-child-end={childEnd}>
          Nam lobortis enim et luctus auctor. Vestibulum dignissim luctus mollis. Donec porttitor
          pulvinar tellus et eleifend. Curabitur venenatis, elit eget consequat sollicitudin, odio
          mi pulvinar ante, a sagittis nulla sapien interdum quam. Nunc id tortor quis leo blandit
          sagittis nec quis enim. Curabitur finibus blandit lacinia. Fusce et odio eget nunc pretium
          hendrerit. Suspendisse potenti. Vestibulum sollicitudin tortor eu dolor mollis mattis.
          Praesent ut placerat enim, non suscipit enim. Nam auctor velit sit amet lorem viverra, sed
          aliquam quam feugiat. Suspendisse pellentesque tortor leo, sed molestie nibh feugiat
          aliquam. Proin laoreet fringilla tristique. Proin tempus metus quis posuere viverra.
        </div>
      </div>
    );
    const parentNode = container.querySelector('.parent');

    const { beginTextNode, beginOffset, endTextNode, endOffset } = findOffsetInDOM(
      parentNode as HTMLElement,
      422,
      442
    );

    expect(beginTextNode).toEqual(endTextNode);
    expect(beginOffset).toEqual(422 - childBegin);
    expect(endOffset).toEqual(442 - childBegin);
  });

  it('finds offsets across multiple nodes', () => {
    const { container } = render(
      <div className="parent">
        <div data-child-begin={0} data-child-end={780}>
          Maecenas convallis neque id elit laoreet, quis aliquam velit aliquam. Donec porttitor
          rutrum dui, a ultricies magna rutrum id. Praesent vel consectetur magna. Nunc feugiat eget
          felis nec ultrices. Phasellus leo sapien, porttitor sed viverra sit amet, efficitur
          placerat massa. Nam non est augue. Nulla congue massa sed eleifend auctor. Quisque
          vulputate neque nec arcu tempor viverra. Nulla sit amet ligula eget tortor malesuada
          dignissim. Maecenas interdum erat risus, eget bibendum dui rutrum non. Integer et
          imperdiet ligula. Mauris nisi libero, pharetra a placerat vel, sagittis id orci. Aenean
          porta risus vel lobortis pulvinar. Sed scelerisque purus ipsum. Fusce placerat sem
          vestibulum lorem hendrerit, a blandit ipsum cursus. Curabitur sodales enim sed convallis
          placerat.
        </div>
        <div data-child-begin={781} data-child-end={1661}>
          Morbi commodo, diam id bibendum efficitur, sapien ipsum dictum nulla, ut pharetra diam
          ante bibendum velit. Fusce nisl magna, mattis et nunc sed, ornare aliquet dui. Cras in
          urna malesuada, rhoncus erat sed, fringilla erat. Aenean pulvinar egestas eros, quis
          tristique eros maximus id. Praesent mi nulla, tempus ac facilisis a, finibus sed ante.
          Fusce quis accumsan ipsum. Proin fermentum ante eget finibus pharetra. Nulla sed risus a
          massa aliquet posuere. Praesent ut enim eu orci vestibulum pulvinar et id elit. Praesent
          in facilisis lorem. Duis odio turpis, euismod facilisis volutpat ut, porttitor sit amet
          tellus. Praesent nulla orci, consequat nec ante at, rhoncus interdum eros. Donec
          vestibulum, orci ac bibendum volutpat, massa dui interdum erat, quis gravida diam magna eu
          elit. Duis hendrerit ullamcorper orci, a vehicula purus convallis sed. Praesent eu turpis
          ligula.
        </div>
      </div>
    );
    const parentNode = container.querySelector('.parent');

    const { beginTextNode, beginOffset, endTextNode, endOffset } = findOffsetInDOM(
      parentNode as HTMLElement,
      734,
      888
    );

    expect(beginTextNode).not.toEqual(endTextNode);
    expect(beginOffset).toEqual(734);
    expect(endOffset).toEqual(107);
  });
});

describe('getTextNodeAndOffset', () => {
  it('finds offset when text spans multiple TextNodes', () => {
    const MAX_TEXT_NODE_LEN = 65536;

    const { container } = render(<div className="textNodesParent"></div>);
    const node = container.querySelector('.textNodesParent') as HTMLElement;

    // split text data into 2 text nodes
    const texts = [
      textNodesData.substring(0, MAX_TEXT_NODE_LEN),
      textNodesData.substring(MAX_TEXT_NODE_LEN)
    ];
    node.appendChild(document.createTextNode(texts[0]));
    node.appendChild(document.createTextNode(texts[1]));

    const { textNode, textOffset } = getTextNodeAndOffset(node, watsonIndex);

    // expect to get 2nd text node
    expect(textNode).toEqual(node.childNodes[1]);
    // expect that offset will be within 2nd text node, therefore subtract 1st text node length
    const firstNode = node.childNodes[0] as Node;
    expect(textOffset).toEqual(watsonIndex - firstNode.textContent!.length);
  });

  it('calculates proper offset with encoded text', () => {
    const { container } = render(
      <div
        data-child-begin={123}
        data-child-end={196}
        data-orig-text="Maecenas convallis neque id elit laoreet &amp;amp; quis aliquam velit aliquam."
      >
        Maecenas convallis neque id elit laoreet &amp; quis aliquam velit aliquam.
      </div>
    );

    const node = container.querySelector('[data-child-begin]');
    const { textNode, textOffset } = getTextNodeAndOffset(node as HTMLElement, 183);

    // text content in DOM should be the "decoded" text
    expect(textNode.textContent).toEqual(
      'Maecenas convallis neque id elit laoreet & quis aliquam velit aliquam.'
    );
    // while the offset passed in to func is +60, once we account for decoded text in DOM, the offset should be +56
    expect(textOffset).toEqual(56);
  });
});

describe('spansIntersect', () => {
  it('checks that two cells intersect', () => {
    const cell1 = {
      start_offset: 138812,
      end_offset: 139245,
      field: 'text'
    };

    const cell2 = {
      start_offset: 139244,
      end_offset: 139300,
      field: 'text'
    };

    const cell3 = {
      start_offset: 139248,
      end_offset: 139300,
      field: 'text'
    };

    let result = spansIntersect(
      { begin: cell1.start_offset, end: cell1.end_offset },
      { begin: cell2.start_offset, end: cell2.end_offset }
    );

    expect(result).toBeTruthy();

    result = spansIntersect(
      { begin: cell1.start_offset, end: cell1.end_offset },
      { begin: cell3.start_offset, end: cell3.end_offset }
    );

    expect(result).toBeFalsy();
  });

  it('checks that the end intersections are exclusive', () => {
    const cell1 = {
      start_offset: 138812,
      end_offset: 139245,
      field: 'text'
    };

    const cell2 = {
      start_offset: 139245,
      end_offset: 139300,
      field: 'text'
    };

    const cell3 = {
      start_offset: 139244,
      end_offset: 139300,
      field: 'text'
    };

    let result = spansIntersect(
      { begin: cell1.start_offset, end: cell1.end_offset },
      { begin: cell2.start_offset, end: cell2.end_offset }
    );

    expect(result).toBeFalsy();

    result = spansIntersect(
      { begin: cell1.start_offset, end: cell1.end_offset },
      { begin: cell3.start_offset, end: cell3.end_offset }
    );

    expect(result).toBeTruthy();
  });
});

describe('findContainingNodeWithin', () => {
  let parentNode: HTMLElement;

  beforeEach(() => {
    const { container } = render(fakeDOM);
    parentNode = container.querySelector('.parent') as HTMLElement;
  });

  it('returns a leaf node if it contains the offset', () => {
    expect(findContainingNodeWithin(parentNode, 204)?.classList.contains('leaf')).toBe(true);
  });

  it("returns a mid-level node if it's the lowest node that contains the offset", () => {
    expect(findContainingNodeWithin(parentNode, 335)?.classList.contains('intermediate')).toBe(
      true
    );
  });

  it("returns a root node if it's the lowest node that contains the offset", () => {
    expect(findContainingNodeWithin(parentNode, 384)?.classList.contains('root')).toBe(true);
  });

  it('returns null when no node contains the offset', () => {
    expect(findContainingNodeWithin(parentNode, 780)).toBeNull();
  });
});

describe('getContainingNode', () => {
  let nodeList: HTMLElement[];

  beforeEach(() => {
    const { container } = render(fakeDOM);
    nodeList = Array.from(container.querySelectorAll('.leaf')) as HTMLElement[];
  });

  it('returns the node that contains the offset', () => {
    // works when the first node contains the offset
    expect(getContainingNode(nodeList, 50)).toBe(nodeList[0]);

    // works when the last node contains the offset
    expect(getContainingNode(nodeList, 1650)).toBe(nodeList[nodeList.length - 1]);

    // works when an arbitrary node contains the offset
    expect(getContainingNode(nodeList, 1000)).toBe(nodeList[18]);
  });

  it('returns null when no node contains the offset', () => {
    // returns null when offset is less than begin of first node
    expect(getContainingNode(nodeList, -1)).toBeNull();

    // returns null when offset is greater than end of last node
    expect(getContainingNode(nodeList, 2000)).toBeNull();

    // returns null when offset is between two nodes (not contained in any node)
    expect(getContainingNode(nodeList, 499)).toBeNull();
  });
});
