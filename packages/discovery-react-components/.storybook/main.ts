module.exports = {
  stories: process.env.STORYBOOK_BUILD_MODE == 'production' ? ['../src/**/__stories__/*.stories.tsx'] : ['../src/**/*.stories.tsx'],
  addons: [
    '@storybook/preset-create-react-app',
    '@storybook/addon-actions',
    {
      name: '@storybook/addon-docs',
      options: {
        configureJSX: true,
      },
    },
    '@storybook/addon-knobs'
  ],
  core: {
    builder: 'webpack5',
  },
  staticDirs: ['../../../node_modules/pdfjs-dist/build/'],
  webpackFinal: (config) => {
    // ignore some Node.js packages
    config.resolve.fallback.crypto = false;
    config.resolve.fallback.fs = false;
    config.resolve.fallback.https = false;
    config.resolve.fallback.os = false;
    config.resolve.fallback.stream = false;
    config.resolve.fallback.zlib = false;

    config.module.rules.push({
      test: /\.worker\.min\.js$/,
      use: 'raw-loader'
    });

    return config;
  }
};
