const path = require('path');
const dotenv = require('dotenv');
const proxy = require('http-proxy-middleware');
const { getAuthenticatorFromEnvironment } = require('ibm-watson/auth');
const cors = require('cors');
const bodyParser = require('body-parser');
const setSdkUrl = require('../scripts/setSdkUrl');
const envLocal = dotenv.config({ path: path.join(__dirname, '../', '.env.local') });

// if we are just running cypress tests, we don't need to setup a proxy
if (process.env.CYPRESS_MODE) {
  console.log('CYPRESS_MODE=true   --->   Skipping proxy setup');
  module.exports = function(app) {};
  return;
}

if (envLocal.error) {
  console.warn(
    'Error retrieving local environment variables. Please make sure you have set .env.local'
  );
  throw new Error(envLocal.error);
}

const addAuthorization = async (req, _res, next) => {
  const authenticator = getAuthenticatorFromEnvironment('discovery');
  try {
    const accessToken = await authenticator.tokenManager.getToken();
    req.headers.authorization = `Bearer ${accessToken}`;
  } catch (e) {
    console.error(e);
  }
  return next();
};

module.exports = async function(app) {
  const target = await setSdkUrl();
  app.use(
    '/api',
    addAuthorization,
    proxy({
      target,
      secure: false,
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/'
      },
      onProxyReq: proxyReq => {
        proxyReq.removeHeader('Cookie');
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
