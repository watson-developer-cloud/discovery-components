document.createRange = jest.fn().mockImplementation(
  (): Range =>
    (({
      setStart: () => {},
      setEnd: () => {},
      getClientRects: () =>
        ([
          ({
            top: 1,
            bottom: 2,
            left: 3,
            right: 4
          } as unknown) as ClientRect
        ] as unknown) as ClientRectList,
      commonAncestorContainer: {
        nodeName: 'BODY',
        ownerDocument: document
      } as Node
    } as unknown) as Range)
);

export default document;
