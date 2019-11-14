import { configure, addParameters } from '@storybook/react';
import { DocsPage, DocsContainer } from '@storybook/addon-docs/blocks';
import '@disco-widgets/styles';

addParameters({
  docs: {
    container: DocsContainer,
    page: DocsPage
  }
});

const req = require.context('../src', true, /\.stories.(tsx|mdx)$/);

function loadStories() {
  req.keys().forEach(req);
}

configure(loadStories, module);
