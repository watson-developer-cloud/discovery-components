#!/bin/bash

set -e

PREREQUISITES=("yarn" "node")
SCRIPT_DIR=$(
    cd "$(dirname "$0")"
    pwd
)
USE_FORMAT=$(
  type tput >/dev/null 2>&1
  if [ $? -eq 0 ]; then echo "true"; else echo "false"; fi
)
CREDENTIALS_FILE="${SCRIPT_DIR}/examples/discovery-search-app/ibm-credentials.env"
ENV_LOCAL_FILE="${SCRIPT_DIR}/examples/discovery-search-app/.env.local"

function boldMessage() {
  if [ "$USE_FORMAT" == "true" ]; then
    echo "$(tput bold)$1$(tput sgr 0)"
  else
    echo "$1"
  fi
}

function colorMessage() {
  if [ "$USE_FORMAT" == "true" ]; then
    echo "$(tput setaf $2)$1$(tput sgr 0)"
  else
    echo "$1"
  fi
}

function paddedMessage() {
  echo
  echo
  boldMessage "$1"
}

function checkForDependencies() {
  boldMessage "Checking for prerequisites..."
  missing=0
  for i in "${PREREQUISITES[@]}"; do
    echo -n "  $i: "

    set +e
    type $i >/dev/null 2>&1
    exists=$?
    set -e

    if [ $exists -eq 0 ]; then
      colorMessage "Y" 2
    else
      colorMessage "N" 1
    fi

    if [ $exists -ne 0 ]; then
      (( missing+=1 ))
    fi
  done

  if [[ $missing > 0 ]]; then
    echo
    echo "Not all prerequistes are installed." >&2
    exit 1
  fi
}

function updateEnvFile() {
  local authType
  local url
  local projectId
  local username
  local password
  local apikey
  local authTypeValid=false

  paddedMessage "What kind of authorization type are you using?"
  echo "iam (Cloud)"
  echo "cp4d (CP4D)"
  echo

  while ! $authTypeValid; do
    read -p "  authType: " authType
    if [[ "$authType" == "iam" || "$authType" == "cp4d" ]]; then
      authTypeValid=true
    else
      paddedMessage "Please provide a valid value (iam/cp4d)"
    fi
  done

  if [[ "$authType" == "cp4d" ]]; then
    paddedMessage "Provide the following based on the Discovery workspace url template:"
    echo "CP4D"
    colorMessage "  {url}/discovery/{deployment_id}/projects/{project_id}/workspace" 3
    paddedMessage "CP4D credentials:"
    echo "  These are the credentials used to log into the CP4D dashboard"
    echo
    while [[ "$url" == "" ]]; do
        read -p "  url: " url
    done
    while [[ "$username" == "" ]]; do
        read -p "  username: " username
    done

    while [[ "$password" == "" ]]; do
        read -p "  password: " password
    done

    cat >$CREDENTIALS_FILE <<EOL
DISCOVERY_AUTH_TYPE=${authType}
DISCOVERY_URL=${url}
DISCOVERY_USERNAME=${username}
DISCOVERY_PASSWORD=${password}
EOL
  elif [[ "$authType" == "iam" ]]; then
    paddedMessage "Cloud credentials:"
    echo "Cloud URL example (project_id not available in URL):"
    colorMessage "  https://api.us-south.discovery.cloud.ibm.com/instances/1234" 3
    echo
    while [[ "$url" == "" ]]; do
        read -p "  url: " url
    done
    while [[ "$apikey" == "" ]]; do
        read -p "  apikey: " apikey
    done
      cat >$CREDENTIALS_FILE <<EOL
DISCOVERY_AUTH_TYPE=${authType}
DISCOVERY_URL=${url}
DISCOVERY_APIKEY=${apikey}
EOL
  else
    echo "Unsupported auth type: ${authType}"
    exit 1
  fi

  paddedMessage "Project ID:"
  echo "Copy from available project IDs"
  node "${SCRIPT_DIR}/examples/discovery-search-app/scripts/listProjects.js"
  while [[ "$projectId" == "" ]]; do
    read -p "  project_id: " projectId
  done

  # for CP4D setupProxy, we need to set the release path. this also creates the ENV_LOCAL_FILE
  node "${SCRIPT_DIR}/examples/discovery-search-app/scripts/setReleasePath.js"

  echo "REACT_APP_PROJECT_ID=${projectId}" >> $ENV_LOCAL_FILE

  if [ $OSTYPE == 'msys' ]; then
    echo "SASS_PATH=\"../../node_modules;src\"" >> $ENV_LOCAL_FILE
  fi
  echo
}

if [ "$USE_FORMAT" == "true" ]; then tput clear; fi

#
# check for missing prerequistes
#
checkForDependencies

#
# install dependencies
#
paddedMessage "Installing project dependencies..."
yarn --silent
colorMessage "done" 2

#
# collection discovery instance information
#
if [ -f $CREDENTIALS_FILE ]; then
  paddedMessage "File already exists:"
  colorMessage "  $CREDENTIALS_FILE" 3
  read -p "$(paddedMessage 'Update file before configuring server (y/n)? ')" updateEnvValues

  if [[ "${updateEnvValues}" =~ ^(Y|y)$ ]]; then
    updateEnvFile
  fi
else
  updateEnvFile
fi

#
# run server setup script
#
paddedMessage "Setting up server..."
yarn workspace discovery-search-app run --silent server:setup
colorMessage "done" 2

#
# build discovery-react-components
#
paddedMessage "Building components..."
yarn workspace @ibm-watson/discovery-react-components run --silent build 2>/tmp/component_build
if [ $? -ne 0 ]; then
  echo
  cat /tmp/component_build
  echo
  echo
  echo "Build failed with the above errors" >&2
  exit 1
fi
colorMessage "done" 2

read -p "$(paddedMessage 'Start the example app now (y/n)? ')" startServer
if [[ "${startServer}" =~ ^(Y|y)$ ]]; then
    yarn workspace discovery-search-app run start
fi