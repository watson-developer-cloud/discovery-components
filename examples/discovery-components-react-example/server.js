/* eslint-disable @typescript-eslint/no-var-requires */
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
dotenv.config({ path: './.server-env' });
const path = require('path');
const express = require('express');
const app = express();
const DiscoveryV2 = require('@disco-widgets/ibm-watson/discovery/v2');
const { CloudPakForDataAuthenticator } = require('@disco-widgets/ibm-watson/auth');
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
const searchClient = new DiscoveryV2({
  authenticator,
  url: `${BASE_URL}${RELEASE_PATH}`,
  disableSslVerification: true,
  version: '2019-01-01'
});

const toCamel = s => {
  return s.replace(/([-_][a-z])/gi, $1 => {
    return $1
      .toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });
};

app.use(express.static(path.join(__dirname, 'build')));
app.use(bodyParser.json());
app.options('*', cors());
app.get('/', async (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.post('/api/v2/projects/:projectId/query', cors(), async (req, res) => {
  try {
    const params = Object.assign({}, req.body, req.params);
    const camelCaseParams = {};
    Object.keys(params).forEach(key => {
      camelCaseParams[toCamel(key)] = params[key];
    });
    const { result } = await searchClient.query(camelCaseParams);
    res.json(result);
  } catch (e) {
    console.error(e);
    res.json({ error: 'something went wrong' });
  }
});
app.get('/api/v2/projects/:projectId/collections', cors(), async (req, res) => {
  try {
    const params = Object.assign({}, req.body, req.params);
    const camelCaseParams = {};
    Object.keys(params).forEach(key => {
      camelCaseParams[toCamel(key)] = params[key];
    });
    const { result } = await searchClient.listCollections(camelCaseParams);
    res.json(result);
  } catch (e) {
    console.error(e);
    res.json({ error: 'something went wrong' });
  }
});

app.get('/api/v2/projects/:projectId/autocompletion', cors(), async (req, res) => {
  try {
    const query = req.query;
    const params = req.params;
    const combinedParams = Object.assign({}, query, params);
    const camelCaseParams = {};
    Object.keys(combinedParams).forEach(key => {
      camelCaseParams[toCamel(key)] = params[key];
    });
    const { result } = await searchClient.getAutocompletion(camelCaseParams);
    res.json(result);
  } catch (e) {
    console.error(e);
    res.json({ error: 'something went wrong' });
  }
});

const port = 4000;
app.listen(port, () => {
  console.log('Kitchen sink app running at http://localhost:%s/', port);
});
