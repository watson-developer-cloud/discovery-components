#!/bin/bash

SCRIPT_DIR=$(
    cd "$(dirname "$0")"
    pwd
)

set -a
source ${SCRIPT_DIR}/../.env.local
set +a

if [[ -z $CLUSTER_USERNAME || -z $CLUSTER_PASSWORD || -z $CLUSTER_HOST || -z $CLUSTER_PORT ]]; then
  echo "You must the following defined as environment variables: CLUSTER_HOST, CLUSTER_PORT, CLUSTER_USERNAME and CLUSTER_PASSWORD" >&2
  exit 1
fi

clusterHost=$(echo ${CLUSTER_HOST#*//} | tr -cd '[:print:]')
baseUrl="https://${clusterHost}:${CLUSTER_PORT}"
accessToken=$(curl -s -k -u ${CLUSTER_USERNAME}:${CLUSTER_PASSWORD} ${baseUrl}/v1/preauth/validateAuth -H 'Content-Type: application/json' | jq --raw-output '.accessToken')
if [ -z "$accessToken" ]; then
  echo "Unable to retrieve access token with provided cluster information"
  exit 1
fi

deploymentId=$(curl -s -k ${baseUrl}/zen-data/v3/deployments/discovery -H "Authorization: Bearer ${accessToken}" -d "{}" -H "Content-Type: application/json" | jq --raw-output '.deployments[0].id')
instanceId=$(curl -s -k -H "Authorization: Bearer ${accessToken}" -X GET "${baseUrl}/watson/common/discovery/api/ibmcloud/resource-controller/resource_instances?resource_id=discovery" -H "Content-Type: application/json" | jq --raw-output '.resources[].id')

cat >.server-env <<EOL
RELEASE_PATH=/discovery/${deploymentId}/instances/${instanceId}/api
BASE_URL=${baseUrl}
EOL