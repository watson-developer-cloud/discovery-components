const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const ibmCredentialsFilePath = path.join(__dirname, '../', 'ibm-credentials.env');
const ibmCredentialsEnv = dotenv.config({
  path: ibmCredentialsFilePath
});
const axios = require('axios').default;
const envLocalFilePath = path.join(__dirname, '../', '.env.local');

function validateRequiredEnvVar(envVar) {
  if (!process.env[envVar]) {
    throw new Error(`Please set ${envVar} in your environment or in the ibm-credentials.env file`);
  }
}

function writeReleasePathToFileAndReturn(deployment, resource) {
  const releasePath = `/discovery/${deployment.id}/instances/${resource.zen_id}/api`;
  try {
    const envLocal =
      fs.readFileSync(envLocalFilePath, {
        encoding: 'utf-8'
      }) || '';
    fs.writeFileSync(envLocalFilePath, `${envLocal}\nRELEASE_PATH=${releasePath}`);
  } catch (e) {
    console.error('Error writing release path to file');
    throw new Error(e);
  }
  return releasePath;
}

module.exports = async function() {
  dotenv.config({ path: envLocalFilePath });
  let releasePath = process.env.RELEASE_PATH;
  if (ibmCredentialsEnv.error) {
    console.warn(
      `Error retrieving server environment variables. Please make sure you have created ${ibmCredentialsFilePath}. Read more at https://github.com/watson-developer-cloud/node-sdk`
    );
    throw new Error(ibmCredentialsEnv.error);
  }
  validateRequiredEnvVar('DISCOVERY_AUTH_TYPE');
  validateRequiredEnvVar('DISCOVERY_URL');
  validateRequiredEnvVar('DISCOVERY_USERNAME');
  validateRequiredEnvVar('DISCOVERY_PASSWORD');

  if (process.env.DISCOVERY_AUTH_TYPE === 'cp4d') {
    const baseUrl = process.env.DISCOVERY_URL;
    try {
      const {
        data: { accessToken }
      } = await axios.get(`${baseUrl}/v1/preauth/validateAuth`, {
        headers: {
          'Content-Type': 'application/json'
        },
        auth: {
          username: process.env.DISCOVERY_USERNAME,
          password: process.env.DISCOVERY_PASSWORD
        }
      });
      const {
        data: { deployments }
      } = await axios.get(`${baseUrl}/zen-data/v3/deployments/discovery`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (deployments && deployments.length > 0) {
        const {
          data: { resources }
        } = await axios.get(
          `${baseUrl}/watson/common/discovery/api/ibmcloud/resource-controller/resource_instances?resource_id=discovery`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
        if (resources && resources.length > 0) {
          releasePath = writeReleasePathToFileAndReturn(deployments[0], resources[0]);
        } else {
          throw new Error('No discovery instances found');
        }
      } else {
        throw new Error('No discovery deployments found');
      }
    } catch (e) {
      console.error('Error setting up release path');
      throw new Error(e);
    }
  }
  return releasePath;
};
