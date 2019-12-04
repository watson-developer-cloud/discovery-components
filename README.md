# Discovery Components

[![Build Status](https://travis-ci.org/watson-developer-cloud/discovery-components.svg?branch=master)](https://travis-ci.org/watson-developer-cloud/discovery-components)
[![Apache-2.0 license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](https://github.com/watson-developer-cloud/discovery-components/blob/master/LICENSE)
[![Lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/watson-developer-cloud/discovery-components/blob/master/.github/CONTRIBUTING.md)
[![CLA assistant](https://cla-assistant.io/readme/badge/watson-developer-cloud/discovery-components)](https://cla-assistant.io/watson-developer-cloud/discovery-components)

## Table of contents

- [Discovery Components](#discovery-components)
  - [Table of contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Running the example app](#running-the-example-app)
  - [Using Discovery Components in a React application](#using-discovery-components-in-a-react-application)
    - [Interacting with Discovery data in custom components](#interacting-with-discovery-data-in-custom-components)
  - [Development](#development)
    - [Project structure](#project-structure)
    - [Install](#install)
    - [Available commands](#available-commands)
      - [Root directory](#root-directory)
      - [Example app (examples/discovery-search-app)](#example-app-examplesdiscovery-search-app)
      - [React components (packages/discovery-react-components)](#react-components-packagesdiscovery-react-components)
      - [Styles (packages/discovery-styles)](#styles-packagesdiscovery-styles)
    - [Running the project](#running-the-project)
    - [Running Storybook](#running-storybook)
    - [Testing](#testing)
      - [Unit/Integration testing](#unitintegration-testing)
      - [Feature tests](#feature-tests)
      - [Continuous integration](#continuous-integration)
    - [Releasing](#releasing)
      - [A note on versioning](#a-note-on-versioning)
  - [Helpful links](#helpful-links)
  - [Contributors](#contributors)

## Prerequisites

- [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [nvm](https://github.com/nvm-sh/nvm#installation-and-update)
- [yarn](https://yarnpkg.com/en/docs/install) or [npm](https://www.npmjs.com/get-npm)
- jq (When running the server in the Discovery components example application)
  - `brew install jq`

## Running the example app

The example app is a catalogue of the core components provided by this library. With little effort, you can see the functionality of each component using your real data. You can also modify the example code to see how you can customize Discovery Components to fit your needs.

1. Install [Yarn](https://yarnpkg.com/lang/en/docs/install), as it is required build the components locally.

2. Clone the repository

   ```
   git clone git@github.com:watson-developer-cloud/discovery-components.git
   ```

   or

   ```
   git clone https://github.com/watson-developer-cloud/discovery-components.git
   ```

3. Navigate into the project and install component dependencies

   ```
   cd discovery-components && yarn
   ```

4. Create an environment file

   Create a file at `examples/discovery-search-app/.env.local` file, and populate the following values from your Discovery project:

   ```
   REACT_APP_PROJECT_ID=<project_id to query>
   CLUSTER_USERNAME=<cluster username>
   CLUSTER_PASSWORD=<cluster password>
   CLUSTER_PORT=<cluster port>
   CLUSTER_HOST=<cluster hostname>
   ```

   1. `REACT_APP_PROJECT_ID` is contained in the URL when viewing your Discovery project on the CP4D cluster (ex. `https://{CLUSTER_HOST}:{CLUSTER_PORT}/discovery/{RELEASE_NAME}/projects/{REACT_APP_PROJECT_ID}/workspace`)
   2. `CLUSTER_USERNAME` the username used to log in to your CP4D dashboard and access your instance of Discovery
   3. `CLUSTER_PASSWORD` the password used to log in to your CP4D dashboard and access your instance of Discovery
   4. `CLUSTER_PORT` defaults to `443` unless configured otherwise
   5. `CLUSTER_HOST` the base URL of your CP4D cluster (ex. `{}.com`)

For more information about configuring your Cloud Pak for Data cluster, see https://www.ibm.com/support/producthub/icpdata/docs/content/SSQNUZ_current/cpd/overview/overview.html

5. Build the React components:

   ```
   yarn workspace @ibm-watson/discovery-react-components run build
   ```

6. In one terminal, start the server:

   ```
   yarn workspace discovery-search-app run server
   ```

7. In another terminal, start the example app:

   ```
   yarn workspace discovery-search-app run start
   ```

8. Go to [localhost:3000](localhost:3000) in your browser. If everything is working, you should see something like this:

   ![Example app](./docs/images/example-app.png)

## Using Discovery Components in a React application

If you don't have a React application already, start with [create react app](https://github.com/facebook/create-react-app) then modify the following in your `src/App.js`. Otherwise, you may use Discovery Components inside of any existing React component.

Add the component, style, and client library to your application:

```
yarn add @ibm-watson/discovery-react-components @ibm-watson/discovery-styles ibm-watson
```

or

```
npm i @ibm-watson/discovery-react-components @ibm-watson/discovery-styles ibm-watson
```

Add the `DiscoverySearch` component with corresponding `searchClient` and optionally any components you would like to use to display Discovery Search Results.

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

For more information on how each component can be customized and configured, check out our hosted [storybook](https://watson-developer-cloud.github.io/discovery-components)

### Interacting with Discovery data in custom components

Interacting with Discovery data is facilitated by the use of [React Context](https://reactjs.org/docs/context.html). The only requirement for a component to consume or request data is that it be nested underneath the `DiscoverySearch` component.

ex.

```jsx
// src/App.js

import React from 'react';
import { DiscoverySearch } from '@ibm-watson/discovery-react-components';

const App = () => {
  // see more detailed searchClient example above
  return (
    <DiscoverySearch searchClient={searchClient} projectId={'<your discovery project id>'}>
      <MyCustomComponent />
    </DiscoverySearch>
  );
};
```

```jsx
// src/MyCustomComponent.js

import React from 'react';
import { SearchContext, SearchApi } from '@ibm-watson/discovery-react-components';

const MyCustomComponent = () => {
  // for more information about the shape of SearchContext, see SearchContextIFC defined in DiscoverySearch.tsx
  const {
    searchResponseStore: { data: searchResponse }
  } = React.useContext(SearchContext);

  const { performSearch } = useContext(SearchApi);

  // for more information about the params needed to perform searches, see the Watson Developer Cloud SDK
  // https://github.com/watson-developer-cloud/node-sdk/tree/master/discovery
  return (
    <div>
      There are {searchResponse.matching_results} results
      <button
        onClick={() => {
          performSearch(searchParameters);
        }}
      >
        {' '}
        Click here to search
      </button>
    </div>
  );
};
```

## Development

### Project structure

Discovery Components is set up as a monorepo. At the top level, the `packages` directory contains all of the modules that are offered as part of this repository.

Lerna and Yarn are used to manage shared dependencies across the packages.
Create React Library was used to generate the library of React components, `discovery-react-components`.

### Install

1. Install [Yarn](https://yarnpkg.com/lang/en/docs/install), as it is required build the components locally.

2. Download the git repository

```
git clone git@github.com:watson-developer-cloud/discovery-components.git
```

or

```
git clone https://github.com/watson-developer-cloud/discovery-components.git
```

3. To generate the dependencies for all of the packages, run the following at the root directory:

```
yarn
```

This will install and bundle all of the shared dependencies for `packages` and for `examples`, and will also create a single `yarn.lock` file at the root directory. Dependency hoisting is taken care of with Yarn Workspaces, setup inside `package.json`.

See the following for [more info about Lerna](https://github.com/lerna/lerna) or [more info about Yarn Workspaces](https://yarnpkg.com/lang/en/docs/workspaces/).

### Available commands

#### Root directory

| Command                                         | Description                                                              |
| ----------------------------------------------- | ------------------------------------------------------------------------ |
| `yarn` or `npx lerna bootstrap`                 | installs yarn dependencies in all of the packages                        |
| `yarn workspace discovery-search-app <command>` | runs the specified `yarn` script in the `discovery-search-app` workspace |

#### Example app (examples/discovery-search-app)

| Command             | Description                                       |
| ------------------- | ------------------------------------------------- |
| `yarn start`        | runs the client at http://localhost:3000/         |
| `yarn build`        | creates a production build of the example project |
| `yarn cypress`      | opens the cypress application for feature testing |
| `yarn server`       | configures and runs an express server             |
| `yarn server:setup` | configures express server only                    |
| `yarn server:run`   | runs an express server without configuring first  |
| `yarn test:e2e`     | starts the server and runs cypress headless       |

#### React components (packages/discovery-react-components)

| Command                        | Description                                                        |
| ------------------------------ | ------------------------------------------------------------------ |
| `yarn start`                   | runs the `rollup` compiler in watch mode for the component library |
| `yarn build`                   | uses `rollup` to create a production build of component library    |
| `yarn test`                    | runs the unit/integration tests for the component library          |
| `yarn test:watch`              | runs the unit/integration tests in watch mode                      |
| `yarn circular-dependencies`   | runs `madge` to identify any circular dependencies                 |
| `yarn code-coverage`           | runs the unit/integration tests code coverage report               |
| `yarn storybook`               | runs storybook on http://localhost:9002                            |
| `yarn storybook:build`         | builds storybook artifacts locally (primarily for testing build)   |
| `yarn storybook:build:release` | builds storybook artifacts and outputs into `/docs`                |

#### Styles (packages/discovery-styles)

| Command      | Description                                       |
| ------------ | ------------------------------------------------- |
| `yarn start` | runs `node-sass` in `watch` mode                  |
| `yarn build` | runs `node-sass` to compile `scss` files to `css` |

### Running the project

Developing `discovery-react-components` with real data and multiple components can be done using the [example app](#running-the-example-app). To test the components in isolation with mock data, try [running Storybook](#running-storybook).

### Running Storybook

Component documentation is done through Storybook.

To run Storybook, run the following command then open your browser to `http://localhost:9002/`:

```
yarn workspace @ibm-watson/discovery-react-components run storybook
```

### Testing

#### Unit/Integration testing

This repo uses [Jest](https://jestjs.io/) for unit and integration testing the React components. Tests are rendered through [react-testing-library](https://testing-library.com/), which also provides some additional functionality.

#### Feature tests

[Cypress](https://docs.cypress.io) is used for feature and e2e testing. All feature testing will be done in the `examples` directories (end-user application examples) to test a full client-server relationship. For CI, Cypress [server](https://docs.cypress.io/api/commands/server.html#Syntax) is used to mock out API requests and allow component expectations to be tested from the user's perspective.

The directory structure for adding feature tests in cypress looks like:

```
examples/discovery-search-app/cypress
├── fixtures         // mock data or other static assets
│   └── example.json
├── integration      // top-level directory for feature tests
│   └── spec.ts
├── plugins          // any plugins from https://docs.cypress.io/plugins/index.html#content
│   └── index.js
├── screenshots      // screenshots are stored on test failures
├── support          // other helper methods like custom commands https://docs.cypress.io/api/cypress-api/custom-commands.html#Syntax
│   ├── commands.ts
│   └── index.ts
└── videos           // recorded videos of test failures for review after a test run
```

The basic process is to add a new file/directory under `examples/discovery-search-app/cypress/integration` then run `yarn workspace discovery-search-app cypress` to open up the interactive debugger.

To start the example app server and run all Cypress tests, use `yarn workspace discovery-search-app test:e2e`, which does the following steps:

1. starts up a server to host the example application
2. once the server responds, perform the next command `cypress run` (headless version of `cypress open`)
3. after tests are complete, results are printed in the console and both the cypress server and the application server are shut down

#### Continuous integration

[Travis CI](https://travis-ci.org/) is used to continuously run integration tests against this repository, and any PRs that are made against it.

When triggered, Travis will build the project, then run the test scripts, and output the pass/fail to whichever branch/PR triggered the build.

Steps in the automation can be set in `.travis.yml`, located in the root directory.

### Releasing

To perform a release of any changed packages, run

```
lerna publish
```

More information about this command can be found in the README for [lerna publish](https://github.com/lerna/lerna/tree/master/commands/publish)

#### A note on versioning

We use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-beta.4/) when commiting to our repository, although it is not required. If a group of commits are merged into our repo which use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-beta.4/) syntax, then the versioning of our NPM package will be determined by [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-beta.4/) specification. If not, then the patch version will automatically be bumped.

## Helpful links

- [Typescript](https://www.typescriptlang.org/docs/home.html)
- To test publishing to the npm registry locally, you can use [Verdaccio](https://www.npmjs.com/package/verdaccio)

## Contributors

This repository is maintained by the Watson Discovery team <-- maybe we can add something cool like [this](https://github.com/all-contributors/all-contributors/blob/master/README.md)?
