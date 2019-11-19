/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
dotenv.config({ path: './.server-env' });
const path = require('path');
const express = require('express');
const proxy = require('http-proxy-middleware');
const app = express();
const { CloudPakForDataAuthenticator } = require('ibm-watson/auth');
const cors = require('cors');
const bodyParser = require('body-parser');
/* eslint-enable @typescript-eslint/no-var-requires */

const BASE_URL = process.env.BASE_URL;
const RELEASE_PATH = process.env.RELEASE_PATH;
const authenticator = new CloudPakForDataAuthenticator({
  url: BASE_URL || 'http://example.com',
  username: process.env.CLUSTER_USERNAME || 'username',
  password: process.env.CLUSTER_PASSWORD || 'password',
  disableSslVerification: true
});

const addAuthorization = async (req, _res, next) => {
  const accessToken = await authenticator.tokenManager.getToken();
  req.headers.authorization = `Bearer ${accessToken}`;
  next();
};

app.use(express.static(path.join(__dirname, 'build')));
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
    }
  })
);
app.use(bodyParser.json());
app.options('*', cors());
app.get('/', async (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = 4000;
app.listen(port, () => {
  console.log('Discovery components example application running at http://localhost:%s/', port);
});
