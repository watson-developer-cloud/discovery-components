import { Preview } from '@storybook/react';
import { DocsPage, DocsContainer } from '@storybook/addon-docs/blocks';
import './styles.scss';

const preview: Preview = {
  parameters: {
    docs: {
      container: DocsContainer,
      page: DocsPage
    }
  }
};

export default preview;
