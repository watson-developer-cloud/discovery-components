const path = require('path');
const SRC_PATH = path.join(__dirname, '../src');

const styles = require.resolve('@disco-widgets/styles');
module.exports = ({ config }) => {
  config.node = {
    fs: 'empty'
  };
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    include: [SRC_PATH],
    use: [
      {
        loader: require.resolve('awesome-typescript-loader'),
        options: {
          configFileName: './.storybook/tsconfig.json'
        }
      },
      // Optional
      {
        loader: require.resolve('react-docgen-typescript-loader')
      },
      {
        loader: require.resolve('@storybook/addon-storysource/loader'),
        options: { parser: 'typescript' }
      }
    ]
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
  config.resolve.extensions.push('.ts', '.tsx');
  return config;
};
