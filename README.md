# Discovery Components

[![ci](https://github.com/watson-developer-cloud/discovery-components/workflows/ci/badge.svg)](https://github.com/watson-developer-cloud/discovery-components/actions?query=branch%3Amaster)
[![Apache-2.0 license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](https://github.com/watson-developer-cloud/discovery-components/blob/master/LICENSE)
[![Lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/watson-developer-cloud/discovery-components/blob/master/.github/CONTRIBUTING.md)
[![CLA assistant](https://cla-assistant.io/readme/badge/watson-developer-cloud/discovery-components)](https://cla-assistant.io/watson-developer-cloud/discovery-components)

## Table of contents

<!-- toc -->

- [Using Discovery Components](#using-discovery-components)
- [Prerequisites](#prerequisites)
- [Running the example app](#running-the-example-app)
  - [Setup script](#setup-script)
  - [Manual setup](#manual-setup)
    - [Windows Only](#windows-only)
- [Using Discovery Components in a React application](#using-discovery-components-in-a-react-application)
  - [Interacting with Discovery data in custom components](#interacting-with-discovery-data-in-custom-components)
  - [Optimize CSS](#optimize-css)
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
  - [Branching and Releasing](#branching-and-releasing)
- [Helpful links](#helpful-links)
- [Contributors](#contributors)

<!-- tocstop -->

## Using Discovery Components

First, you will need to customize and improve your document retrieval project on the [Improve and Customize page](https://cloud.ibm.com/docs/discovery-data?topic=discovery-data-improve) in IBM Watson Discovery. For example, you can [configure facets](https://cloud.ibm.com/docs/discovery-data?topic=discovery-data-facets), as well as the search bar and search results for your project. Then, you can build your application using Discovery Components, and it will pull in your specified project's configuration.

## Prerequisites

- [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [nvm](https://github.com/nvm-sh/nvm#installation-and-update)
- [yarn](https://yarnpkg.com/getting-started/install) or [npm](https://www.npmjs.com/get-npm)

## Running the example app

The example app is a catalogue of the core components provided by this library. With little effort, you can see the functionality of each component using your real data. You can also modify the example code to see how you can customize Discovery Components to fit your needs.

### Setup script

The `runExampleApp.sh` script provides prompts to help configure and run the example application. The script iterates through the following steps:

1. Verify all prerequisite programs are installed
1. Prompt you for necessary credential information
1. Configure the example application server
1. Build the React components
1. Ask you if you'd like to start the example application

Run the following command from the project root directory

```
./runExampleApp.sh
```

If you choose not to start the example application, all previous configuration steps will be left intact so the application can be run at another time by running

```
yarn workspace discovery-search-app run start
```

### Manual setup

1. Install [Yarn](https://yarnpkg.com/getting-started/install), as it is required to build the components locally.

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

   Copy the `examples/discovery-search-app/.env` file to `examples/discovery-search-app/.env.local` file, and populate the following values from your Discovery project:

   ```
   REACT_APP_PROJECT_ID={REPLACE_ME}
   ```

   1. `REACT_APP_PROJECT_ID` is a guid contained in the URL (ex: `97ba736d-6563-4270-a489-c19d682b6369`)
      - CP4D sample URL: `https://zen-25-cpd-zen-25.apps.my-cluster-name.com/discovery/wd/projects/{REACT_APP_PROJECT_ID}/workspace`)
      - Cloud sample URL: `https://us-south.discovery.cloud.ibm.com/v2/instances/123/projects/{REACT_APP_PROJECT_ID}/workspace`)

   #### Windows Only

   On Windows, the default `SASS_PATH` environment variable must be updated. Append the following to the `.env.local` file:

   ```
   SASS_PATH="./node_modules;./src"
   ```

5. After [retrieving your credentials](https://github.com/watson-developer-cloud/node-sdk#getting-credentials), Either create a `examples/discovery-search-app/ibm-credentials.env` file or populate your environment with the following values:

   - CP4D:
     ```
     DISCOVERY_AUTH_TYPE=cp4d
     DISCOVERY_AUTH_URL={REPLACE_ME}
     DISCOVERY_AUTH_DISABLE_SSL=true
     DISCOVERY_URL={REPLACE_ME}
     DISCOVERY_USERNAME={REPLACE_ME}
     DISCOVERY_PASSWORD={REPLACE_ME}
     DISCOVERY_DISABLE_SSL=true
     ```
     where:
     - `DISCOVERY_AUTH_URL` is the URL to your base CP4D installation (ex. `https://zen-25-cpd-zen-25.apps.my-cluster-name.com`)
     - `DISCOVERY_URL` is the API URL to your Discovery installation (ex. `https://zen-25-cpd-zen-25.apps.my-cluster-name.com/discovery/wd/instances/1578610482214/api`)
     - `DISCOVERY_USERNAME` the username used to login to `DISCOVERY_AUTH_URL`
     - `DISCOVERY_PASSWORD` the password used to login to `DISCOVERY_AUTH_URL`
   - Cloud:
     ```
     DISCOVERY_AUTH_TYPE=iam
     DISCOVERY_URL={REPLACE_ME}
     DISCOVERY_APIKEY={REPLACE_ME}
     ```
     where:
     - `DISCOVERY_URL` is the API URL to your Discovery instance (ex. `https://api.us-south.discovery.cloud.ibm.com/instances/2386cfd4-a584-41d0-868d-671d8be819bc`)
     - `DISCOVERY_APIKEY` the api key associated with `DISCOVERY_URL`

6. Build the React components:

   ```
   yarn workspace @ibm-watson/discovery-react-components run build
   ```

7. Start the example app:

   ```
   yarn workspace discovery-search-app run start
   ```

8. Go to [localhost:3000](localhost:3000) in your browser. If everything is working, you should see something like this:

   ![Example app](./docs/images/example-app.png)

For more information on how each component can be customized and configured, check out our hosted [storybook](https://watson-developer-cloud.github.io/discovery-components/storybook)

## Using Discovery Components in a React application

If you don't have a React application already, start with [create react app](https://github.com/facebook/create-react-app) then modify the following in your `src/App.js`. Otherwise, you may use Discovery Components inside of any existing React component.

1. Add the component, style, and client library to your application:

   ```
   yarn add @ibm-watson/discovery-react-components @ibm-watson/discovery-styles ibm-watson carbon-components carbon-components-react carbon-icons
   ```

   or

   ```
   npm install --save @ibm-watson/discovery-react-components @ibm-watson/discovery-styles ibm-watson carbon-components carbon-components-react carbon-icons
   ```

2. Add `node-sass` as a dev dependency

   ```
   yarn add -D node-sass
   ```

   or

   ```
   npm install --save-dev node-sass
   ```

3. Add the `DiscoverySearch` component with corresponding `searchClient` and optionally any components you would like to use to display Discovery Search Results.

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
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import '@ibm-watson/discovery-styles/scss/index.scss';
// the DiscoveryV2 class reads credentials from your environment variables for authentication
// Make sure to setup your ibm-credentials.env file first
// see https://github.com/IBM/node-sdk-core/blob/master/Authentication.md for low-level details
// see https://github.com/watson-developer-cloud/node-sdk#authentication for high-level usage
// Then replace these variables:
const version = '{REPLACE_ME}'; // YYYY-MM-DD date format
const projectId = '{REPLACE_ME}'; // retrieved from Discovery Tooling UI, ex.
const App = () => {
  let searchClient, success;
  try {
    searchClient = new DiscoveryV2({ version });
    success = true;
  } catch (err) {
    console.error(err);
  }
  return success ? (
    <DiscoverySearch searchClient={searchClient} projectId={projectId}>
      <SearchInput />
      <SearchResults />
      <SearchFacets />
      <ResultsPagination />
      <DocumentPreview />
    </DiscoverySearch>
  ) : (
    setupMessage()
  );
};
function setupMessage() {
  return (
    <div
      style={{
        textAlign: 'center',
        margin: '20%',
        fontSize: '1.5rem'
      }}
    >
      Please replace the constants in App.js along with setting up your credentials file in order to
      see the Discovery sample application.
      <br />
      <br />
      Check the console log for more information if you have replaced these constants and are still seeing
      this message.
    </div>
  );
}
export default App;
```

For more information on how each component can be customized and configured, check out our hosted [storybook](https://watson-developer-cloud.github.io/discovery-components/storybook/)

### Interacting with Discovery data in custom components

Interacting with Discovery data is facilitated by the use of [React Context](https://reactjs.org/docs/context.html). The only requirement for a component to consume or request data is that it be nested underneath the `DiscoverySearch` component.

ex.

```jsx
// src/App.js

import React from 'react';
import { DiscoverySearch } from '@ibm-watson/discovery-react-components';
import { MyCustomComponent } from './MyCustomComponent.js';

const App = () => {
  // see more detailed searchClient example above for `searchClient` variable
  return (
    <DiscoverySearch searchClient={searchClient} projectId={'REPLACE_ME'}>
      <MyCustomComponent />
    </DiscoverySearch>
  );
};

export default App;
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
  // DiscoveryV2.QueryParams in https://github.com/watson-developer-cloud/node-sdk/blob/master/discovery/v2.ts
  const searchParameters = {
    projectId: 'REPLACE_ME',
    naturalLanguageQuery: 'SEARCH TERM'
  };

  return (
    <div>
      There are {searchResponse.matching_results} results
      <button
        onClick={() => {
          performSearch(searchParameters);
        }}
      >
        Click here to search
      </button>
    </div>
  );
};

export default MyCustomComponent;
```

### Optimize CSS

The Discovery Components styles package can be consumed in three ways

1. Wholesale SCSS

```css
@import '~@ibm-watson/discovery-styles/scss/index';
```

This method will bring in everything you will need including the Carbon Components base styles required. Use this method if you are not already importing Carbon Component styles or are not concerned with direct use of the base Carbon Components used for Discovery Components.

2. À la carte SCSS

```css
// Global Carbon styles
@import '~carbon-components/scss/globals/scss/_css--font-face.scss';
@import '~carbon-components/scss/globals/scss/_typography.scss';
@import '~carbon-components/scss/globals/scss/_colors.scss';
@import '~carbon-components/scss/globals/scss/_layout.scss';

// Base Carbon Components for search-input
@import '~carbon-components/scss/components/search/search';
@import '~carbon-components/scss/components/list-box/list-box';

// Make sure this is imported after all of your Carbon Components
@import 'components/search-input/search-input';
```

This method brings in Discovery Component styles as needed. Use this method if you only need to use a subset of the Discovery Components or if you are already importing Carbon Component styles directly into your application. This will help keep your css minimal and prevent duplicate imports. The required Carbon Components per Discovery Component import are defined [here](packages/discovery-styles/scss/carbon-components.scss).

3. Wholesale CSS

```html
<link rel="stylesheet" href="/path/to/discoverey-components/index.css" />
```

This method uses the vanilla CSS that is built from the Discovery Component styles SCSS files and also includes the Carbon Component styles. Use this method if you do not have SCSS importing as part of your application build pipeline.

## Development

### Project structure

Discovery Components is set up as a monorepo. At the top level, the `packages` directory contains all of the modules that are offered as part of this repository.

Lerna and Yarn are used to manage shared dependencies across the packages.
Create React Library was used to generate the library of React components, `discovery-react-components`.

### Install

1. Install [Yarn](https://yarnpkg.com/getting-started/install), as it is required build the components locally.

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

See the following for [more info about Lerna](https://github.com/lerna/lerna) or [more info about Yarn Workspaces](https://yarnpkg.com/features/workspaces).

### Available commands

#### Root directory

| Command                                         | Description                                                              |
| ----------------------------------------------- | ------------------------------------------------------------------------ |
| `yarn`                                          | installs yarn dependencies in all of the packages                        |
| `yarn workspace discovery-search-app <command>` | runs the specified `yarn` script in the `discovery-search-app` workspace |

#### Example app (examples/discovery-search-app)

| Command             | Description                                                           |
| ------------------- | --------------------------------------------------------------------- |
| `yarn start`        | runs the client and runs the express server without configuring first |
| `yarn start:client` | runs the client at http://localhost:3000/                             |
| `yarn build`        | creates a production build of the example project                     |
| `yarn cypress`      | opens the cypress application for feature testing                     |
| `yarn lint`         | runs `eslint` on `src` and `cypress`                                  |
| `yarn server`       | configures and runs an express server                                 |
| `yarn server:setup` | configures express server only                                        |
| `yarn server:run`   | runs an express server without configuring first                      |
| `yarn test:e2e`     | starts the server and runs cypress headless                           |

#### React components (packages/discovery-react-components)

| Command                        | Description                                                        |
| ------------------------------ | ------------------------------------------------------------------ |
| `yarn start`                   | runs the `rollup` compiler in watch mode for the component library |
| `yarn build`                   | uses `rollup` to create a production build of component library    |
| `yarn test`                    | runs the unit/integration tests for the component library          |
| `yarn test:watch`              | runs the unit/integration tests in watch mode                      |
| `yarn test:coverage`           | runs the unit/integration tests code coverage report               |
| `yarn circular`                | runs `madge` to identify any circular dependencies                 |
| `yarn eslint`                  | runs `eslint` on `src` and `.storybook`                            |
| `yarn lint`                    | runs both `eslint` and `circular` commands                         |
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

[Github Actions](https://github.com/watson-developer-cloud/discovery-components/actions) is used to continuously run integration tests against this repository, and any PRs that are made against it.

When triggered, Github Actions will build the project, then run the test scripts, and output the pass/fail to whichever branch/PR triggered the build.

Steps in the automation can be set in `.github/workflows/ci.yml`, located in the root directory.

### Branching and Releasing

- `master` is an eternal branch with latest stable code that will have automated releases on using the continuous integration described above
- for hotfix/patch-style releases, perform the following steps:
  1. `git checkout -b hotfix/1.4.0-patch-1 v1.4.0-beta.2` (checks out a new branch from the tag needing the hotfix)
  2. make changes and push changes to `hotfix/1.4.0-patch-1` as usual
  3. ensure you have access to publish the package `npm login && npm whoami && npm access ls-collaborators` (must have `read-write`, contact someone from https://www.npmjs.com/settings/ibm-watson/members to gain access)
  4. `lerna publish 1.4.0-patch-1.0 --dist-tag patch-1 --allow-branch hotfix/1.4.0` (see [lerna publish](https://github.com/lerna/lerna/tree/master/commands/publish))
  5. `git checkout master && git merge hotfix/1.4.0 || git mergetool && git push origin master` (merge changes/tags back to `master`, resolving merge conflicts by taking `lerna.json` version from `master` branch)

The only branch permitted for automatic releasing on CI is `master`

More information about the `lerna publish` command can be found in the README for [lerna publish](https://github.com/lerna/lerna/tree/master/commands/publish)

## Helpful links

- [Typescript](https://www.typescriptlang.org/docs/home.html)
- To test publishing to the npm registry locally, you can use [Verdaccio](https://www.npmjs.com/package/verdaccio)

## Contributors

This repository is maintained by the Watson Discovery team <-- maybe we can add something cool like [this](https://github.com/all-contributors/all-contributors/blob/master/README.md)?
