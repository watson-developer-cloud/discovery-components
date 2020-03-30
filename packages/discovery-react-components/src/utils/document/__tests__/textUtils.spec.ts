import { processText } from '../textUtils';

describe('processText', () => {
  it('splits on new lines', () => {
    const text = 'one\ntwo\nthree four five\nsix seven';
    const sections = processText(text);

    expect(sections.length).toEqual(4);
    expect(sections[1].html).toEqual(expect.stringContaining('two'));
    expect(sections[2].html).toEqual(expect.stringContaining('three four five'));
    expect(sections[2].location).toEqual({ begin: 8, end: 23 });
  });

  const fallbackMockText =
    "This is a sentence. I am friends with Wile E. Coyote, Dr. Acula and Frank N. Furter. Now here's some lorem ipsum to get us over 1024 characters: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam elementum arcu ac magna iaculis posuere. Phasellus consequat auctor nisi id pharetra. In pulvinar molestie diam a iaculis. Vivamus in diam at lorem imperdiet egestas non in nisl. Vivamus eget fermentum lacus, et sodales sapien. Suspendisse potenti. Nullam posuere efficitur ligula sed convallis. Praesent malesuada sem posuere justo tincidunt, ac bibendum elit ullamcorper. Aliquam ut orci quis lorem suscipit pretium nec vitae lacus. Praesent tempor faucibus iaculis. Fusce vel sollicitudin nisl. Vivamus dignissim at elit in commodo. Integer accumsan blandit magna nec iaculis. Curabitur quis orci justo. Duis iaculis purus nec orci euismod, vel congue ante luctus. Nullam vitae nisl eu massa tincidunt pellentesque et vitae mi. Suspendisse potenti. Pellentesque fringilla accumsan pharetra. Nullam diam metus, elementum sit amet congue ac, fringilla eget metus. Morbi lobortis erat ut odio malesuada, lacinia finibus mi volutpat. Sed fermentum libero nec sed.";
  it('splits into sentences (fallback)', () => {
    const sections = processText(fallbackMockText);

    expect(sections.length).toEqual(23);
    expect(sections[0].html).toEqual(expect.stringContaining('This is a sentence&period;'));
    expect(sections[1].html).toEqual(
      expect.stringContaining(
        'I am friends with Wile E&period; Coyote&comma; Dr&period; Acula and Frank N&period; Furter&period;'
      )
    );
  });

  it('merges sentences when enrichments span "sentences"', () => {
    const sections = processText(fallbackMockText, [
      {
        mentions: [
          {
            location: {
              begin: 196,
              end: 207
            },
            text: 'elit. Etiam'
          }
        ]
      }
    ]);

    expect(sections.length).toEqual(22);
    expect(sections[2].html).toEqual(
      expect.stringContaining(
        'Now here&apos;s some lorem ipsum to get us over 1024 characters&colon; Lorem ipsum dolor sit amet&comma; consectetur adipiscing elit&period; Etiam elementum arcu ac magna iaculis posuere&period;'
      )
    );
  });
});
