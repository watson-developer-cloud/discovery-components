import * as React from 'react';
import { render } from '@testing-library/react';
import { uniqRects, findOffsetInDOM } from '../document/documentUtils';

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

    expect(uniqRects((rects as unknown) as DOMRectList)).toHaveLength(2);
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

    expect(uniqRects((rects as unknown) as DOMRectList)).toHaveLength(3);
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
