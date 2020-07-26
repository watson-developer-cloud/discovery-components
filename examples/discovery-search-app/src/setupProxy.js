const path = require('path');
const dotenv = require('dotenv');
const serverEnv = dotenv.config({ path: path.join(__dirname, '../', '.server-env') });
const clusterEnv = dotenv.config({ path: path.join(__dirname, '../', '.env.local') });
const proxy = require('http-proxy-middleware');
const { CloudPakForDataAuthenticator } = require('ibm-watson/auth');
const cors = require('cors');
const bodyParser = require('body-parser');

// if we are just running cypress tests, we don't need to setup a proxy
if (process.env.CYPRESS_MODE) {
  console.log('CYPRESS_MODE=true   --->   Skipping proxy setup');
  module.exports = function(app) {};
  return;
}

if (serverEnv.error) {
  console.warn(
    'Error retrieving server environment variables. Please make sure you have set .server-env'
  );
  throw new Error(serverEnv.error);
}

if (clusterEnv.error) {
  console.warn(
    'Error retrieving cluster environment variables. Please make sure you have set .env.local'
  );
  throw new Error(clusterEnv.error);
}

const RELEASE_PATH = process.env.RELEASE_PATH || '/example/release/path';
const BASE_URL = process.env.BASE_URL || 'http://example.com';
const addAuthorization = async (req, _res, next) => {
  const authenticator = new CloudPakForDataAuthenticator({
    url: BASE_URL,
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
