const fs = require('fs');
const path = require('path');
const axios = require('axios').default;
const https = require('https');
const { validateSdkEnvVars } = require('./validateSdkEnvVars.js');
const ibmCredentialsFilePath = path.join(__dirname, '../', 'ibm-credentials.env');

function writeReleasePathToFileAndReturn(url, deployment, resource) {
  const releasePath = `/discovery/${deployment.id}/instances/${resource.zen_id}/api`;
  const fullDiscoveryUrl = `${url}${releasePath}`;
  try {
    if (process.env.IBM_CREDENTIALS_FILE || fs.existsSync(ibmCredentialsFilePath)) {
      const ibmCredentialsFileContent =
        fs.readFileSync(process.env.IBM_CREDENTIALS_FILE || ibmCredentialsFilePath, {
          encoding: 'utf-8'
        }) || '';
      const replacement = ibmCredentialsFileContent.replace(
        /DISCOVERY_URL=[^\n]+/,
        `DISCOVERY_URL=${fullDiscoveryUrl}`
      );
      fs.writeFileSync(process.env.IBM_CREDENTIALS_FILE || ibmCredentialsFilePath, replacement);
    }
  } catch (e) {
    console.error('Error appending release path to file');
    throw e;
  }
  return fullDiscoveryUrl;
}

module.exports = async function() {
  validateSdkEnvVars();
  let sdkUrl = process.env.DISCOVERY_URL.replace(/\/$/, '');

  if (process.env.DISCOVERY_AUTH_TYPE === 'cp4d' && !sdkUrl.endsWith('/api')) {
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });
    try {
      const {
        data: { accessToken }
      } = await axios.get(`${sdkUrl}/v1/preauth/validateAuth`, {
        headers: {
          'Content-Type': 'application/json'
        },
        auth: {
          username: process.env.DISCOVERY_USERNAME,
          password: process.env.DISCOVERY_PASSWORD
        },
        httpsAgent
      });
      const {
        data: { deployments }
      } = await axios.get(`${sdkUrl}/zen-data/v3/deployments/discovery`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        httpsAgent
      });

      if (deployments && deployments.length > 0) {
        const {
          data: { resources }
        } = await axios.get(
          `${sdkUrl}/watson/common/discovery/api/ibmcloud/resource-controller/resource_instances?resource_id=discovery`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            },
            httpsAgent
          }
        );
        if (resources && resources.length > 0) {
          sdkUrl = writeReleasePathToFileAndReturn(sdkUrl, deployments[0], resources[0]);
          process.env.DISCOVERY_URL = sdkUrl;
        } else {
          throw new Error('No discovery instances found');
        }
      } else {
        throw new Error('No discovery deployments found');
      }
    } catch (e) {
      console.error('Error setting up release path');
      throw e;
    }
  }
  return sdkUrl;
};
