#!/bin/bash

if [[ -z $CLUSTER_USERNAME || -z $CLUSTER_PASSWORD || -z $CLUSTER_HOST || -z $CLUSTER_PORT ]]; then
  echo "You must the following defined as environment variables: CLUSTER_HOST, CLUSTER_PORT, CLUSTER_USERNAME and CLUSTER_PASSWORD" >&2
  exit 1
fi

baseUrl=https://${CLUSTER_HOST}:${CLUSTER_PORT}
accessToken=$(curl -s -k -u ${CLUSTER_USERNAME}:${CLUSTER_PASSWORD} ${baseUrl}/v1/preauth/validateAuth -H "Content-Type: application/json" | jq --raw-output '.accessToken')
releasePath=$(curl -s -k -X POST ${baseUrl}/zen-data/v1/addOn/query -H "Authorization: Bearer ${accessToken}" -d "{}" -H "Content-Type: application/json" | jq --raw-output '.requestObj[] | select(.Type=="discovery") | .Details.openURL')
resourceInstance=$(curl -s -k -H "Authorization: Bearer ${accessToken}" -X GET "${baseUrl}/${releasePath}/api/ibmcloud/resource-controller/resource_instances?resource_id=discovery" -H "Content-Type: application/json")
instanceId=$(echo ${resourceInstance} | jq --raw-output '.resources[].zen_id')
releasePath=$(echo ${releasePath} | sed 's/\/watson//')

cat >.server-env <<EOL
RELEASE_PATH=${releasePath}instances/${instanceId}/api
BASE_URL=${baseUrl}
EOL