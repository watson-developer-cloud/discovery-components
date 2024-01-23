import { Preview } from '@storybook/react';
import { DocsPage, DocsContainer } from '@storybook/blocks';
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
