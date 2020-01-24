import { configure, addParameters } from '@storybook/react';
import { DocsPage, DocsContainer } from '@storybook/addon-docs/blocks';
import '@ibm-watson/discovery-styles';
import { addDecorator } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';

addDecorator(withKnobs);

addParameters({
  docs: {
    container: DocsContainer,
    page: DocsPage
  }
});

const req =
  process.env.STORYBOOK_BUILD_MODE == 'production'
    ? require.context('../src', true, /.*\/__stories__\/.*\.stories.(tsx|mdx)$/)
    : require.context('../src', true, /\.stories.(tsx|mdx)$/);

console.log('keys', req.keys())

function loadStories() {
  req.keys().forEach(req);
}

configure(loadStories, module);
