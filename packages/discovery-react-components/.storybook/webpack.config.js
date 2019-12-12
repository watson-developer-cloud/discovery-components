module.exports = ({ config }) => {
  config.module.rules.push({
    test: /\.worker\.min\.js$/,
    use: 'raw-loader'
  });
  return config;
};
