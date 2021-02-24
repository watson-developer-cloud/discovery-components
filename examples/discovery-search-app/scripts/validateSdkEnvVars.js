const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');
const ibmCredentialsFilePath = path.join(__dirname, '../', 'ibm-credentials.env');

function validateRequiredEnvVar(envVar) {
  if (!process.env[envVar]) {
    throw new Error(
      `Please set ${envVar} in your environment or in ${ibmCredentialsFilePath} file`
    );
  }
}

function loadCredentialsFile() {
  if (!process.env.IBM_CREDENTIALS_FILE && fs.existsSync(ibmCredentialsFilePath)) {
    process.env.IBM_CREDENTIALS_FILE = ibmCredentialsFilePath;
  }
  if (process.env.IBM_CREDENTIALS_FILE) {
    dotenv.config({
      path: process.env.IBM_CREDENTIALS_FILE
    });
  }
}

function validateSdkEnvVars() {
  try {
    validateRequiredEnvVar('DISCOVERY_AUTH_TYPE');
  } catch (e) {
    loadCredentialsFile();
    validateRequiredEnvVar('DISCOVERY_AUTH_TYPE');
  }

  if (process.env.DISCOVERY_AUTH_TYPE === 'cp4d') {
    ['DISCOVERY_AUTH_URL', 'DISCOVERY_USERNAME', 'DISCOVERY_PASSWORD'].forEach(envVar =>
      validateRequiredEnvVar(envVar)
    );
  } else if (process.env.DISCOVERY_AUTH_TYPE === 'iam') {
    ['DISCOVERY_URL', 'DISCOVERY_APIKEY'].forEach(envVar => validateRequiredEnvVar(envVar));
  }
}

module.exports = { validateSdkEnvVars };
