const fs = require('fs');
const path = require('path');
const axios = require('axios').default;
const urlJoin = require('proper-url-join');
const { validateSdkEnvVars } = require('./validateSdkEnvVars.js');
const ibmCredentialsFilePath = path.join(__dirname, '../', 'ibm-credentials.env');

function generateDiscoveryUrlForCp4d(authUrl, deployment, resource) {
  const releasePath = `/discovery/${deployment.id}/instances/${resource.zen_id}/api`;
  return urlJoin(authUrl, releasePath);
}

function writeEnvVarToFileAndReturn(key, value) {
  try {
    if (process.env.IBM_CREDENTIALS_FILE || fs.existsSync(ibmCredentialsFilePath)) {
      const filePath = process.env.IBM_CREDENTIALS_FILE || ibmCredentialsFilePath;
      const ibmCredentialsFileContent =
        fs.readFileSync(filePath, {
          encoding: 'utf-8'
        }) || '';
      const fileContentWithDiscoveryUrl = ibmCredentialsFileContent.concat(`\n${key}=${value}`);
      fs.writeFileSync(filePath, fileContentWithDiscoveryUrl);
    }
  } catch (e) {
    console.error(`Error appending ${key}=${value} to file`);
    throw e;
  }
  return value;
}

module.exports = async function () {
  validateSdkEnvVars();

  if (process.env.DISCOVERY_AUTH_TYPE === 'cp4d' && !process.env.DISCOVERY_URL) {
    const authUrl = process.env.DISCOVERY_AUTH_URL;
    const rejectUnauthorized = process.env.DISCOVERY_AUTH_DISABLE_SSL !== 'true';

    let baseUrl = authUrl;
    if (authUrl.endsWith('/icp4d-api')) {
      baseUrl = authUrl.substring(0, authUrl.length - '/icp4d-api'.length);
    }

    let globalRejectUnauthorized = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    if (!rejectUnauthorized) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }

    try {
      const {
        data: { token }
      } = await axios.post(
        urlJoin(authUrl, '/v1/authorize'),
        {
          username: process.env.DISCOVERY_USERNAME,
          password: process.env.DISCOVERY_PASSWORD
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const axiosOptions = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const {
        data: { deployments }
      } = await axios.get(urlJoin(baseUrl, '/zen-data/v3/deployments/discovery'), axiosOptions);

      if (deployments && deployments.length > 0) {
        const {
          data: { resources }
        } = await axios.get(
          urlJoin(
            baseUrl,
            '/watson/common/discovery/api/ibmcloud/resource-controller/resource_instances?resource_id=discovery'
          ),
          axiosOptions
        );
        if (resources && resources.length > 0) {
          const discoveryUrl = generateDiscoveryUrlForCp4d(baseUrl, deployments[0], resources[0]);
          process.env.DISCOVERY_URL = writeEnvVarToFileAndReturn('DISCOVERY_URL', discoveryUrl);
        } else {
          throw new Error('No discovery instances found');
        }
      } else {
        throw new Error('No discovery deployments found');
      }
    } catch (e) {
      console.error('Error setting up release path');
      throw e;
    } finally {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = globalRejectUnauthorized;
    }
  } else if (
    process.env.DISCOVERY_AUTH_TYPE === 'iam' &&
    /\.(test|dev)\./.test(process.env.DISCOVERY_URL) &&
    !process.env.DISCOVERY_AUTH_URL
  ) {
    // when using a dev/test instance, use the test IAM identity endpoint
    process.env.DISCOVERY_AUTH_URL = writeEnvVarToFileAndReturn(
      'DISCOVERY_AUTH_URL',
      'https://iam.test.cloud.ibm.com/identity/token'
    );
  }
  return process.env.DISCOVERY_URL;
};
