import { configure, addParameters } from '@storybook/react';
import { DocsPage, DocsContainer } from '@storybook/addon-docs/blocks';
import '@disco-widgets/styles';

const req =
  process.env.STORYBOOK_BUILD_MODE == 'production'
    ? require.context('../src', true, /.*\/__stories__\/.*\.stories.(tsx|mdx)$/)
    : require.context('../src', true, /\.stories.(tsx|mdx)$/);

addParameters({
  docs: {
    container: DocsContainer,
    page: DocsPage
  }
});

function loadStories() {
  req.keys().forEach(req);
}

configure(loadStories, module);
