#!/bin/bash

set -e

PREREQUISTES=("yarn" "jq")
SCRIPT_DIR=$(
    cd "$(dirname "$0")"
    pwd
)
USE_FORMAT=$(
  type tput >/dev/null 2>&1
  if [ $? -eq 0 ]; then echo "true"; else echo "false"; fi
)

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
  for i in "${PREREQUISTES[@]}"; do
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

    (( missing += exists ))
  done

  if [[ $missing > 0 ]]; then
    echo
    echo "Not all prerequistes are installed." >&2
    exit 1
  fi
}

function updateEnvFile() {
  paddedMessage "Provide the following based on the Discovery workspace url template:"
  colorMessage "  https://{cluster_host}:{cluster_port}/discovery/{release_name}/projects/{project_id}/workspace" 3
  echo

  read -p "  cluster_host: " host
  read -p "  cluster_port (e.g. 443): " port
  read -p "  project_id: " projectId

  paddedMessage "CP4D credentials:"
  echo "  These are the credentials used to log into the CP4D dashboard"
  echo
  read -p "  username: " username
  read -sp "  password: " password

  if [[ -z $host || -z $port || -z $username || -z $password ]]; then
    echo
    echo
    echo "You provide all of the following: host, port, username and password" >&2
    exit 1
  fi

  cat >"$SCRIPT_DIR/../.env.local" <<EOL
REACT_APP_PROJECT_ID=${projectId}
CLUSTER_USERNAME=${username}
CLUSTER_PASSWORD=${password}
CLUSTER_PORT=${port}
CLUSTER_HOST=${host}
EOL

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
if [ -f "$SCRIPT_DIR/../.env.local" ]; then
  paddedMessage "File already exists:"
  colorMessage "$SCRIPT_DIR/../.env.local" 3
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