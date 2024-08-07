import { StorybookConfig } from '@storybook/react-vite';
import path from 'node:path';
import { mergeConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

const config: StorybookConfig = {
  stories:
    process.env.STORYBOOK_BUILD_MODE == 'production'
      ? ['../src/**/__stories__/*.stories.tsx']
      : ['../src/**/*.stories.tsx'],

  addons: [
    '@storybook/addon-actions',
    {
      name: '@storybook/addon-docs',
      options: {
        configureJSX: true
      }
    },
    '@storybook/addon-knobs'
  ],

  core: {
    disableTelemetry: true
  },

  staticDirs: [
    // should resolve to '.../pdfjs-dist/build/'
    path.dirname(require.resolve('pdfjs-dist'))
  ],

  framework: '@storybook/react-vite',

  async viteFinal(config) {
    // Merge custom configuration into the default config
    return mergeConfig(config, {
      plugins: [
        nodePolyfills({
          exclude: ['buffer', 'crypto', 'fs', 'module', 'net', 'tls'],
          globals: {
            process: true
          },
          // Whether to polyfill `node:` protocol imports.
          protocolImports: true
        })
      ]
    });
  },

  docs: {
    autodocs: true
  }
};

export default config;
