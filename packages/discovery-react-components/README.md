# @ibm-watson/discovery-react-components

>

[![NPM](https://img.shields.io/npm/v/@ibm-watson/discovery-react-components)](https://www.npmjs.com/package/@ibm-watson/discovery-react-components) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save @ibm-watson/discovery-react-components
```

## Usage

```jsx
// src/App.js
import React from 'react';
import {
  DiscoverySearch,
  SearchInput,
  SearchResults,
  SearchFacets,
  ResultsPagination,
  DocumentPreview
} from '@ibm-watson/discovery-react-components';
import { CloudPackForDataAuthenticator, DiscoveryV2 } from 'ibm-watson';

// optionally import SASS styles
import '@ibm-watson/discovery-styles/scss/index.scss';
// or load vanilla CSS
// import '@ibm-watson/discovery-styles/css/index.css';

// Replace these values
const username = '<your cluster username>';
const password = '<your cluster password>';
const url = '<your cluster url>';
const serviceUrl = '<your discovery url>';
const version = '<YYYY-MM-DD discovery version>';
const projectId = '<your discovery project id>';

const App = () => {
  const authenticator = new CloudPakForDataAuthenticator({ username, password, url });
  const searchClient = new DiscoveryV2({ url: serviceUrl, version, authenticator });

  return (
    <DiscoverySearch searchClient={searchClient} projectId={'<your discovery project id>'}>
      <SearchInput />
      <SearchResults />
      <SearchFacets />
      <ResultsPagination />
      <DocumentPreview />
    </DiscoverySearch>
  );
};
```
