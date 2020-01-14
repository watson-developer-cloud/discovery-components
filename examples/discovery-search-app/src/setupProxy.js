const dotenv = require('dotenv');
const serverEnv = dotenv.config({ path: '.server-env' });
const clusterEnv = dotenv.config({ path: '.env.local' });
const proxy = require('http-proxy-middleware');
const { CloudPakForDataAuthenticator } = require('ibm-watson/auth');
const cors = require('cors');
const bodyParser = require('body-parser');

if (serverEnv.error) {
  throw serverEnv.error;
}

if (clusterEnv.error) {
  throw clusterEnv.error;
}

const RELEASE_PATH = process.env.RELEASE_PATH;
const BASE_URL = process.env.BASE_URL;
const addAuthorization = async (req, _res, next) => {
  const authenticator = new CloudPakForDataAuthenticator({
    url: BASE_URL || 'http://example.com',
    username: process.env.CLUSTER_USERNAME || 'username',
    password: process.env.CLUSTER_PASSWORD || 'password',
    disableSslVerification: true
  });
  try {
    const accessToken = await authenticator.tokenManager.getToken();
    req.headers.authorization = `Bearer ${accessToken}`;
  } catch (e) {
    console.error(e);
  }
  return next();
};

module.exports = function(app) {
  app.use(
    '/api',
    addAuthorization,
    proxy({
      target: `${BASE_URL}${RELEASE_PATH}`,
      secure: false,
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/'
      },
      onProxyRes: proxyRes => {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      },
      onError: error => {
        console.error(error);
      }
    })
  );
  app.use(bodyParser.json());
  app.options('*', cors());
};
