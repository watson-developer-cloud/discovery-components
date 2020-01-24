const path = require('path');
const createCompiler = require('@storybook/addon-docs/mdx-compiler-plugin');
const SRC_PATH = path.join(__dirname, '../src');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const styles = require.resolve('@ibm-watson/discovery-styles');
module.exports = async ({ config }) => {
  config.node = {
    fs: 'empty'
  };
  config.module.rules.push({
    test: /\.mdx$/,
    use: [
      {
        loader: 'babel-loader',
        // may or may not need this line depending on your app's setup
        options: {
          plugins: ['@babel/plugin-transform-react-jsx']
        }
      },
      {
        loader: '@mdx-js/loader',
        options: {
          compilers: [createCompiler({})],
        },
      }
    ]
  });
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    include: [SRC_PATH],
    use: [
      {
        loader: require.resolve('awesome-typescript-loader'),
        options: {
          reportFiles: ['src/**/*.stories.{ts,tsx,mdx}'],
          configFileName: './.storybook/tsconfig.json'
        }
      },
      // Optional
      {
        loader: require.resolve('react-docgen-typescript-loader')
      }
    ],
    enforce: 'pre'
  });
  config.module.rules.push({
    test: /\.scss$/,
    use: ['style-loader', 'css-loader', 'sass-loader'],
    include: styles
  });
  config.module.rules.push({
    test: /\.worker\.min\.js$/,
    use: 'raw-loader'
  });
  config.resolve.extensions.push('.ts', '.tsx', '.mdx');
  config.resolve.plugins = config.resolve.plugins || [];
  config.resolve.plugins.push(
    new TsconfigPathsPlugin({
      configFile: path.resolve(__dirname, 'tsconfig.json')
    })
  );

  console.log('config', config)
  return config;
};
