const fs = require('fs');
const path = require('path');
const axios = require('axios').default;
const https = require('https');
const urlJoin = require('proper-url-join');
const { validateSdkEnvVars } = require('./validateSdkEnvVars.js');
const ibmCredentialsFilePath = path.join(__dirname, '../', 'ibm-credentials.env');

function writeReleasePathToFileAndReturn(authUrl, deployment, resource) {
  const releasePath = `/discovery/${deployment.id}/instances/${resource.zen_id}/api`;
  const fullDiscoveryUrl = urlJoin(authUrl, releasePath);
  try {
    if (process.env.IBM_CREDENTIALS_FILE || fs.existsSync(ibmCredentialsFilePath)) {
      const filePath = process.env.IBM_CREDENTIALS_FILE || ibmCredentialsFilePath;
      const ibmCredentialsFileContent =
        fs.readFileSync(filePath, {
          encoding: 'utf-8'
        }) || '';
      const fileContentWithDiscoveryUrl = ibmCredentialsFileContent.concat(
        `\nDISCOVERY_URL=${fullDiscoveryUrl}`
      );
      fs.writeFileSync(filePath, fileContentWithDiscoveryUrl);
    }
  } catch (e) {
    console.error('Error appending DISCOVERY_URL to file');
    throw e;
  }
  return fullDiscoveryUrl;
}

module.exports = async function() {
  validateSdkEnvVars();

  if (process.env.DISCOVERY_AUTH_TYPE === 'cp4d' && !process.env.DISCOVERY_URL) {
    const authUrl = process.env.DISCOVERY_AUTH_URL;
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });
    try {
      const {
        data: { accessToken }
      } = await axios.get(urlJoin(authUrl, '/v1/preauth/validateAuth'), {
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
      } = await axios.get(urlJoin(authUrl, '/zen-data/v3/deployments/discovery'), {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        httpsAgent
      });

      if (deployments && deployments.length > 0) {
        const {
          data: { resources }
        } = await axios.get(
          urlJoin(
            authUrl,
            '/watson/common/discovery/api/ibmcloud/resource-controller/resource_instances?resource_id=discovery'
          ),
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            },
            httpsAgent
          }
        );
        if (resources && resources.length > 0) {
          process.env.DISCOVERY_URL = writeReleasePathToFileAndReturn(
            authUrl,
            deployments[0],
            resources[0]
          );
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
  return process.env.DISCOVERY_URL;
};
