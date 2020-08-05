import { configure, addParameters } from '@storybook/react';
import { DocsPage, DocsContainer } from '@storybook/addon-docs/blocks';
import './styles.scss';
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
    ? require.context('../src', true, /.*\/__stories__\/.*\.stories.tsx$/)
    : require.context('../src', true, /\.stories.tsx$/);

function loadStories() {
  req.keys().forEach(req);
}

configure(loadStories, module);
