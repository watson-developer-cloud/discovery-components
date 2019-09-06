/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const express = require('express');
const app = express();
const DiscoveryV1 = require('ibm-watson/discovery/v1');
const cors = require('cors');
const bodyParser = require('body-parser');
/* eslint-enable @typescript-eslint/no-var-requires */

app.use(express.static(path.join(__dirname, 'build')));
app.use(bodyParser.json());
app.options('*', cors());
app.get('/', async (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.post(
  '/discovery/:release_name/instances/:instance_id/api/v1/environments/:environment_id/collections/:collection_id/query',
  async (req, res) => {
    try {
      const searchClient = new DiscoveryV1({
        url:
          'https://blissful-tharp-balancer.fyre.ibm.com:31843/discovery/zen-apostle/instances/1566577081/api',
        icp4d_url: 'https://blissful-tharp-balancer.fyre.ibm.com:31843/',
        authentication_type: 'icp4d',
        username: 'admin',
        password: 'password',
        icp4d_access_token:
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwic3ViIjoiYWRtaW4iLCJpc3MiOiJLTk9YU1NPIiwiYXVkIjoiRFNYIiwicm9sZSI6IkFkbWluIiwicGVybWlzc2lvbnMiOltdLCJ1aWQiOiI5OTkiLCJpYXQiOjE1Njc3MTAwMTl9.IofsTGquXFGEBRyJHxCHdtpGGL9Yk720zEGA-20t3SlIYdhCbE2vJK1nw2QelXfojF1t5qaSaEm74JHc3prWR2xBEszMzHSc3sZ5luYpl9RK0QFZKIW07fw_l2PBw1a2uu2Wt-M2oGwdggAWDN7yVRlmadjsDsi-ukoVveq6NJ3aGRK5eTKTIH6TGZJ2dQ3FQul8-ocu5or0tTScrBaarGALypupwJf30jc2ij_i2Bwk0BqSyzyZYCI8GW-e0d2zP73vc33guoO9zw_ABivoQPTgRPTveYpdVkZf1i8uqMMGa8w2Mv4EPNwnMJZO7IddE7Weh8DFdTrIUeglHzBM_Q',
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
  }
);

const port = 4000;
app.listen(port, () => {
  console.log('Watson browserify example server running at http://localhost:%s/', port);
});
