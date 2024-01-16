import { dirname, join } from 'path';
import { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories:
    process.env.STORYBOOK_BUILD_MODE == 'production'
      ? ['../src/**/__stories__/*.stories.tsx']
      : ['../src/**/*.stories.tsx'],

  addons: [
    getAbsolutePath('@storybook/addon-actions'),
    {
      name: '@storybook/addon-docs',
      options: {
        configureJSX: true
      }
    },
    getAbsolutePath('@storybook/addon-knobs')
  ],

  core: {
    disableTelemetry: true
  },

  staticDirs: ['../../../node_modules/pdfjs-dist/build/'],

  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {}
  },

  docs: {
    autodocs: true
  }
};

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')));
}

export default config;
