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
    console.error('Error listing projects');
    throw e;
  }
}

if (require.main === module) {
  listProjects().then(result => console.log(result));
}

module.exports = { listProjects };
