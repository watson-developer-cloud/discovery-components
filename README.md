# Discovery Components

[![Build Status](https://travis.com/watson-developer-cloud/discovery-components.svg?token=TBD&branch=master)](https://travis.com/watson-developer-cloud/discovery-components)
[![Apache-2.0 license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](https://github.com/watson-developer-cloud/discovery-components/blob/master/LICENSE)
[![Lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/watson-developer-cloud/discovery-components/blob/master/.github/CONTRIBUTING.md)
[![CLA assistant](https://cla-assistant.io/readme/badge/watson-developer-cloud/discovery-components)](https://cla-assistant.io/watson-developer-cloud/discovery-components)

A collection of React components used to interact with the Watson Discovery service on CloudPakForData.

## Quick Start

```
npm i @ibm-watson/discovery-components-react @ibm-watson/discovery-components-styles ibm-watson
```

OR

```
yarn add @ibm-watson/discovery-components-react @ibm-watson/discovery-components-styles ibm-watson
```

If you haven't already, start with [create react app](https://github.com/facebook/create-react-app) then modify the following in your `src/App.js`

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
} from '@ibm-watson/discovery-components-react';
import { CloudPackForDataAuthenticator, DiscoveryV2 } from 'ibm-watson';

// optionally import SASS styles
import '@ibm-watson/discovery-components-styles/scss/index.scss';
// or load vanilla CSS
// import '@ibm-watson/discovery-components-styles/css/index.css';

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

For more information on how each component can be customized and configured, check out our hosted [storybook](https://pages.github.ibm.com/Watson-Discovery/disco-widgets/storybook)

## Development

### Prerequisites

- [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [nvm](https://github.com/nvm-sh/nvm#installation-and-update)
- [yarn](https://yarnpkg.com/en/docs/install)

### Download git repository

```
git clone git@github.com:watson-developer-cloud/discovery-components.git
```

OR

```
git clone https://github.com/watson-developer-cloud/discovery-components.git
```

### Project Structure

Discovery Components is setup as a monorepo. At the top level, the `packages` directory contains all of the modules that will be offered as part of this repository.

Lerna and Yarn are used to manage shared dependencies across the packages.
Create React Library was used to generate the library of React components, `discovery-components-react`.

### Install

To generate the dependencies for all of the packages, run the following at the root directory:

```
yarn
```

This will install and bundle all of the shared dependencies for `packages` and for `examples`, and will also create a single `yarn.lock` file at the root directory. Dependency hoisting is taken care of with Yarn Workspaces, setup inside `package.json`.

See the following for [more info about Lerna](https://github.com/lerna/lerna) or [more info about Yarn Workspaces](https://yarnpkg.com/lang/en/docs/workspaces/).

### Available Commands

| Root Directory                                                | Description                                                                            |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `yarn`                                                        | installs yarn dependencies in all of the packages                                      |
| `npx lerna bootstrap`                                         | (effectively the same as `yarn`) installs dependencies in all of the packages          |
| `yarn workspace discovery-search-app <command>` | runs the specified `yarn` script in the `discovery-search-app` workspace |

| examples/discovery-search-app | Description                                       |
| ------------------------------------------- | ------------------------------------------------- |
| `yarn start`                                | runs the client at http://localhost:3000/         |
| `yarn build`                                | creates a production build of the example project |
| `yarn cypress`                              | opens the cypress application for feature testing |
| `yarn server`                               | configures and runs an express server             |
| `yarn server:setup`                         | configures express server only                    |
| `yarn server:run`                           | runs an express server without configuring first  |
| `yarn test:e2e`                             | starts the server and runs cypress headless       |

| packages/discovery-components-react | Description                                                        |
| ----------------------------------- | ------------------------------------------------------------------ |
| `yarn start`                        | runs the `rollup` compiler in watch mode for the component library |
| `yarn build`                        | uses `rollup` to create a production build of component library    |
| `yarn test`                         | runs the unit/integration tests for the component library          |
| `yarn test:watch`                   | runs the unit/integration tests in watch mode                      |
| `yarn code-coverage`                | runs the unit/integration tests code coverage report               |
| `yarn storybook`                    | runs storybook on http://localhost:9002                            |
| `yarn storybook:build`              | builds storybook artifacts locally (primarily for testing build)   |
| `yarn storybook:build:release`      | builds storybook artifacts and outputs into `/docs`                |

| packages/discovery-styles | Description                                       |
| ------------------------- | ------------------------------------------------- |
| `yarn start`              | runs `node-sass` in `watch` mode                  |
| `yarn build`              | runs `node-sass` to compile `scss` files to `css` |

### Running the Project

1. Setup your [`.env.local`](#environment-file)
2. Build the react components

   ```
   yarn workspace @ibm-watson/discovery-components-react run build
   ```

3. Then, in the **first** terminal window, run:

   ```
   yarn workspace discovery-search-app server
   ```

4. In the **second** terminal window, run:

   ```
   yarn workspace discovery-search-app start
   ```

This allows you to run the client and server examples separately (and restart as necessary).

#### Environment file

Running both example client and server setup script require additional information to be provided through the environment. This is done via the `examples/discovery-search-app/.env.local` file, which is ignored by git due to its sensitive contents. The contents of the file are:

```
REACT_APP_PROJECT_ID=<project_id to query>
CLUSTER_USERNAME=<cluster username>
CLUSTER_PASSWORD=<cluster password>
CLUSTER_PORT=<cluster port>
CLUSTER_HOST=<cluster hostname>
```

### Running Storybook

Component documentation is done through Storybook.

To run Storybook, run the following command then open your browser to `http://localhost:9002/`:

```
yarn workspace @ibm-watson/discovery-components-react run storybook
```

### Styling

We follow the [carbon styleguide](https://www.carbondesignsystem.com) for styling principles which follows a slightly modified [BEM](http://getbem.com/naming/) syntax -> i.e. `bx--block__element--modifier` where `bx` is just the prefix to prevent naming collisions. All styles belong in the `discovery-components-styles` package.

Wherever possible, we should be using

- `vars` like "prefix"
  - almost on all files add-in -> `@import '~carbon-components/scss/globals/scss/vars';`
  - we may revisit this when doing optimizations
- [color tokens](https://www.carbondesignsystem.com/guidelines/color/usage/#tokens-by-theme)
- [spacing tokens](https://www.carbondesignsystem.com/guidelines/themes#spacing)

### Unit/Integration Testing

For our React components, we're using Jest for our unit and integration. Tests are rendered through [react-testing-library](https://testing-library.com/), which also provides some additional functionality.

### Feature Tests

[Cypress](https://docs.cypress.io) is being used for our feature/e2e testing. All feature testing will be done in the `examples` directories (end-user application examples) to test a full client-server relationship. For our CI, we will use the Cypress [server](https://docs.cypress.io/api/commands/server.html#Syntax) to mock out API requests and allow us to test our component expectations from the user's perspective.

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

To start up our server and run all Cypress tests, use `yarn workspace discovery-search-app test:e2e`, which does the following steps:

1. starts up a server to host the example application
2. once the server responds, it moves on to perform the next command `cypress run` (headless version of `cypress open`)
3. after tests are complete, results are printed in the console and both the cypress server and the application server are shut down

### Continuous Integration

[Travis CI](https://travis-ci.org/) is used to continuously run integration tests against this repository, and any PRs that are made against it.

When triggered, Travis will build the project, then run the test scripts, and output the pass/fail to whichever branch/pr triggered the build.

Steps in the automation can be set in `.travis.yml`, located in the root directory.

### Releasing

To perform a release of any changed packages, run

```
lerna publish
```

More information about this command can be found in the README for [lerna publish](https://github.com/lerna/lerna/tree/master/commands/publish)

#### A note on versioning

We use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-beta.4/) when commiting to our repository, although it is not required. If a group of commits are merged into our repo which use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-beta.4/) syntax, then the versioning of our NPM package will be determined by [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-beta.4/) specification. If not, then the patch version will automatically be bumped.

## Helpful Links

- [Typescript](https://www.typescriptlang.org/docs/home.html)
- To test publishing to the npm registry locally, you can use [Verdaccio](https://www.npmjs.com/package/verdaccio)
