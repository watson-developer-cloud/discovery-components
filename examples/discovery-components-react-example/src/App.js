import React from 'react';
import DiscoveryV1 from 'ibm-watson/discovery/v1';

import { DiscoverySearch, SearchInput } from '@disco-widgets/react-components';

const App = () => {
  // eslint-disable @typescript-eslint/camelcase
  const searchClient = new DiscoveryV1({
    url: 'http://localhost:4000/discovery/zen-apostle/instances/1566577081/api',
    icp4d_url: 'https://blissful-tharp-balancer.fyre.ibm.com:31843/',
    authentication_type: 'icp4d',
    username: 'admin',
    password: 'password',
    icp4d_access_token:
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwic3ViIjoiYWRtaW4iLCJpc3MiOiJLTk9YU1NPIiwiYXVkIjoiRFNYIiwicm9sZSI6IkFkbWluIiwicGVybWlzc2lvbnMiOltdLCJ1aWQiOiI5OTkiLCJpYXQiOjE1Njc3MTAwMTl9.IofsTGquXFGEBRyJHxCHdtpGGL9Yk720zEGA-20t3SlIYdhCbE2vJK1nw2QelXfojF1t5qaSaEm74JHc3prWR2xBEszMzHSc3sZ5luYpl9RK0QFZKIW07fw_l2PBw1a2uu2Wt-M2oGwdggAWDN7yVRlmadjsDsi-ukoVveq6NJ3aGRK5eTKTIH6TGZJ2dQ3FQul8-ocu5or0tTScrBaarGALypupwJf30jc2ij_i2Bwk0BqSyzyZYCI8GW-e0d2zP73vc33guoO9zw_ABivoQPTgRPTveYpdVkZf1i8uqMMGa8w2Mv4EPNwnMJZO7IddE7Weh8DFdTrIUeglHzBM_Q',
    disable_ssl_verification: true,
    version: '2019-01-01'
  });
  // eslint-enable @typescript-eslint/camelcase
  return (
    <DiscoverySearch
      searchClient={searchClient}
      collectionId={'3bbf3413-e6ee-a939-0000-016cc02a54c5'}
    >
      <SearchInput />
    </DiscoverySearch>
  );
};
export default App;
