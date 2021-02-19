const DiscoveryV2 = require('ibm-watson/discovery/v2');
const setSdkUrl = require('./setSdkUrl');

async function listProjects() {
  await setSdkUrl();
  const client = new DiscoveryV2({ version: '2021-02-01' });
  try {
    const { result } = await client.listProjects();
    return result.projects
      .map(({ project_id, name }) => {
        return `${project_id} (${name})`;
      })
      .join('\n');
  } catch (e) {
    console.error(
      'Error listing projects.\nYou may still enter a project id manually, but you might want to verify that your credentials are correct.\nIf your credentials are invalid, you may experience errors when running the example app.\nTo update your credentials, quit and then restart this script.'
    );
    throw e;
  }
}

if (require.main === module) {
  listProjects().then(result => console.log(result));
}

module.exports = { listProjects };
