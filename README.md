# Discovery Components

[![ci](https://github.com/watson-developer-cloud/discovery-components/workflows/ci/badge.svg)](https://github.com/watson-developer-cloud/discovery-components/actions?query=branch%3Amaster)
[![Apache-2.0 license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](https://github.com/watson-developer-cloud/discovery-components/blob/master/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/watson-developer-cloud/discovery-components/blob/master/.github/CONTRIBUTING.md)
[![CLA assistant](https://cla-assistant.io/readme/badge/watson-developer-cloud/discovery-components)](https://cla-assistant.io/watson-developer-cloud/discovery-components)

## Table of contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [About](#about)
- [Quick Links](#quick-links)
- [Using Discovery Components](#using-discovery-components)
- [Prerequisites](#prerequisites)
- [Development](#development)
  - [Project structure](#project-structure)
  - [Install](#install)
  - [Commonly-used commands](#commonly-used-commands)
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

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## About

This is a repository created and maintained by the IBM Watson Discovery UI team. It contains a collection of components, to be used by internal and external applications to query [Watson Discovery](https://www.ibm.com/products/watson-discovery) projects. For a quick look at the available components, take a look at them in [Storybook](https://watson-developer-cloud.github.io/discovery-components/storybook/)

## Quick Links

- [Example App](./examples/discovery-search-app/README.md)
- [React Components Library](./packages/discovery-react-components/README.md)
- [Hosted Storybook](https://watson-developer-cloud.github.io/discovery-components/storybook/)

## Using Discovery Components

First, you will need to customize and improve your document retrieval project on the [Improve and Customize page](https://cloud.ibm.com/docs/discovery-data?topic=discovery-data-improvements) in IBM Watson Discovery. For example, you can [configure facets](https://cloud.ibm.com/docs/discovery-data?topic=discovery-data-facets), as well as the search bar and search results for your project. Then, you can build your application using Discovery Components, and it will pull in your specified project's configuration.

## Prerequisites

- [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [nvm](https://github.com/nvm-sh/nvm#installation-and-update)
  - Set Node version `nvm use` (uses value defined in `.nvmrc` file)
- [yarn](https://yarnpkg.com/getting-started/install) or [npm](https://www.npmjs.com/get-npm)
- On MacOS, install any waiting OS Software Updates and install Xcode Command Line Tools by running `xcode-select --install` in terminal.

## Development

### Project structure

Discovery Components is set up as a monorepo. At the top level, the `packages` directory contains all of the modules that are offered as part of this repository.

[Lerna](https://github.com/lerna/lerna) and [Yarn](https://yarnpkg.com/) are used to manage shared dependencies across the packages.
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

3. Install OS dependencies for building NPM packages (required for building `cairo`, which is used by `pdfjs`):

    Follow the installation instructions for your OS from https://github.com/Automattic/node-canvas#compiling.

4. To generate the dependencies for all of the packages, run the following at the root directory:

```
yarn
```

This will install and bundle all of the shared dependencies for `packages` and for `examples`, and will also create a single `yarn.lock` file at the root directory. Dependency hoisting is taken care of with [Yarn Workspaces](https://yarnpkg.com/features/workspaces), setup inside `package.json`.

### Commonly-used commands

#### Root directory

| Command                                   | Description                                                                                   |
| ----------------------------------------- | --------------------------------------------------------------------------------------------- |
| `yarn`                                    | installs yarn dependencies in all of the packages                                             |
| `yarn workspace <package-name> <command>` | runs the specified `yarn` script in the workspace of your choice (ex: `discovery-search-app`) |

#### Example app (examples/discovery-search-app)

[See here for a full list](./examples/discovery-search-app/README.md#available-commands)

| Command             | Description                                                           |
| ------------------- | --------------------------------------------------------------------- |
| `yarn start`        | runs the client and runs the express server without configuring first |
| `yarn start:client` | runs the client at http://localhost:3000/                             |
| `yarn server:run`   | runs an express server without configuring first                      |

#### React components (packages/discovery-react-components)

[See here for a full list](./packages/discovery-react-components/README.md#available-commands)

| Command                | Description                                                      |
| ---------------------- | ---------------------------------------------------------------- |
| `yarn build`           | uses `rollup` to create a production build of component library  |
| `yarn test:watch`      | runs the unit/integration tests in watch mode                    |
| `yarn storybook`       | runs storybook on http://localhost:9002                          |
| `yarn storybook:build` | builds storybook artifacts locally (primarily for testing build) |

#### Styles (packages/discovery-styles)

| Command      | Description                                  |
| ------------ | -------------------------------------------- |
| `yarn start` | runs `sass` in `watch` mode                  |
| `yarn build` | runs `sass` to compile `scss` files to `css` |

### Running the project

Developing `discovery-react-components` with real data and multiple components can be done using the [example app](./examples/discovery-search-app/README.md#running-the-example-app). To test the components in isolation with mock data, try [running Storybook](#running-storybook).

### Running Storybook

Component documentation is done through Storybook.

To run Storybook, run the following command, then open your browser to `http://localhost:9002/`:

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

1. Starts up a server to host the example application
2. Once the server responds, perform the next command `cypress run` (headless version of `cypress open`)
3. After tests are complete, results are printed in the console, and both the cypress server and the application server are shut down

#### Continuous integration

[GitHub Actions](https://github.com/watson-developer-cloud/discovery-components/actions) is used to continuously run integration tests against this repository, and any PRs that are made against it.

When triggered, GitHub Actions will build the project, then run the test scripts, and output the pass/fail to whichever branch/PR triggered the build.

Steps in the automation can be set in `.github/workflows/ci.yml`, located in the root directory.

### Branching and Releasing

- `master` is an eternal branch with latest stable code that will have automated releases on using the continuous integration described above
- for hotfix/patch-style releases, perform the following steps:
  1. `git checkout -b hotfix/1.4.0-patch-1 v1.4.0-beta.2` (checks out a new branch from the tag needing the hotfix)
  2. Make changes and push changes to `hotfix/1.4.0-patch-1` as usual
  3. Ensure you have access to publish the package `npm login && npm whoami && npm access ls-collaborators` (must have `read-write`, contact someone from https://www.npmjs.com/settings/ibm-watson/members to gain access)
  4. `lerna publish 1.4.0-patch-1.0 --dist-tag patch-1 --allow-branch hotfix/1.4.0` (see [lerna publish](https://github.com/lerna/lerna/tree/master/commands/publish))
  5. `git checkout master && git merge hotfix/1.4.0 || git mergetool && git push origin master` (merge changes/tags back to `master`, resolving merge conflicts by taking `lerna.json` version from `master` branch)

The only branch permitted for automatic releasing on CI is `master`

More information about the `lerna publish` command can be found in the README for [lerna publish](https://github.com/lerna/lerna/tree/master/commands/publish)

To test publishing to the npm registry locally, you can use [Verdaccio](https://www.npmjs.com/package/verdaccio)
