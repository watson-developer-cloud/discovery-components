require('dotenv').config({ path: './.server-env' });

/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const express = require('express');
const app = express();
const DiscoveryV1 = require('@disco-widgets/ibm-watson/discovery/v1');
const cors = require('cors');
const bodyParser = require('body-parser');
/* eslint-enable @typescript-eslint/no-var-requires */

const BASE_URL = process.env.BASE_URL;
const RELEASE_PATH = process.env.RELEASE_PATH;
app.use(express.static(path.join(__dirname, 'build')));
app.use(bodyParser.json());
app.options('*', cors());
app.get('/', async (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.post('/api/v2/projects/:project_id/query', cors(), async (req, res) => {
  try {
    const searchClient = new DiscoveryV1({
      url: `${BASE_URL}${RELEASE_PATH}`,
      icp4d_url: BASE_URL,
      authentication_type: 'icp4d',
      username: 'admin',
      password: 'password',
      disable_ssl_verification: true,
      version: '2019-01-01'
    });
    const params = Object.assign({}, req.body, req.params);
    const response = await searchClient.query(params);
    res.json(response);
  } catch (e) {
    console.error(e);
    res.json({ error: 'something went wrong' });
  }
});
app.get('/api/v2/projects/:project_id/collections', cors(), async (req, res) => {
  try {
    const searchClient = new DiscoveryV1({
      url: `${BASE_URL}${RELEASE_PATH}`,
      icp4d_url: BASE_URL,
      authentication_type: 'icp4d',
      username: 'admin',
      password: 'password',
      disable_ssl_verification: true,
      version: '2019-01-01'
    });
    const params = Object.assign({}, req.body, req.params);
    const response = await searchClient.listCollections(params);
    res.json(response);
  } catch (e) {
    console.error(e);
    res.json({ error: 'something went wrong' });
  }
});

app.get('/api/v2/projects/:project_id/autocompletion', cors(), async (req, res) => {
  try {
    const searchClient = new DiscoveryV1({
      url: `${BASE_URL}${RELEASE_PATH}`,
      icp4d_url: BASE_URL,
      authentication_type: 'icp4d',
      username: 'admin',
      password: 'password',
      disable_ssl_verification: true,
      version: '2019-01-01'
    });
    const query = req.query;
    const params = req.params;
    const combinedParams = Object.assign({}, query, params);
    const response = await searchClient.getAutocompletion(combinedParams);
    res.json(response);
  } catch (e) {
    console.error(e);
    res.json({ error: 'something went wrong' });
  }
});

const port = 4000;
app.listen(port, () => {
  console.log('Kitchen sink app running at http://localhost:%s/', port);
});
