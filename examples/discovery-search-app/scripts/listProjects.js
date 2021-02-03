const path = require('path');
const dotenv = require('dotenv');
const ibmCredentialsFilePath = path.join(__dirname, '../', 'ibm-credentials.env');
const ibmCredentialsEnv = dotenv.config({
  path: ibmCredentialsFilePath
});
const DiscoveryV2 = require('ibm-watson/discovery/v2');

if (ibmCredentialsEnv.error) {
  console.warn(
    `Error retrieving server environment variables. Please make sure you have created ${ibmCredentialsFilePath}. Read more at https://github.com/watson-developer-cloud/node-sdk`
  );
  throw new Error(ibmCredentialsEnv.error);
}

async function listProjects() {
  const client = new DiscoveryV2({ version: '2021-02-01' });
  const { result } = await client.listProjects();
  return result.projects.map(({ id, name }) => {
    return `${id} (${name})`;
  });
}

if (require.module === 'main') {
  console.log(listProjects());
}

module.exports = { listProjects, default: listProjects };
