import { addParameters } from '@storybook/react';
import { DocsPage, DocsContainer } from '@storybook/addon-docs/blocks';
import './styles.scss';

addParameters({
  docs: {
    container: DocsContainer,
    page: DocsPage
  }
});
