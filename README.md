# Disco Widgets (a.k.a. Search Results Visualization)

[![Build Status](https://travis.ibm.com/Watson-Discovery/disco-widgets.svg?token=p1iBXWqKFC4fGyYjjz9R&branch=master)](https://travis.ibm.com/Watson-Discovery/disco-widgets)

## Project Setup

### Prerequisites

- [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [nvm](https://github.com/nvm-sh/nvm#installation-and-update)
- [yarn](https://yarnpkg.com/en/docs/install)

### Download git repository

```
git clone git@github.ibm.com:Watson-Discovery/disco-widgets.git
```

OR

```
git clone https://github.ibm.com/Watson-Discovery/disco-widgets.git
```

## Project Structure

```
.
├── examples
│   └── discovery-components-react-example // use-case of the component library
│       ├── cypress // feature tests
│       └── src // source code for an example application
│           ├── App.js
│           ├── __tests__
│           │   └── App.test.js
│           ├── index.css
│           └── index.js
└── packages
    └── discovery-components-react // react component library
        ├── dist // distributable files to be consumed in a client application `npm/yarn install`
        │   ├── index.d.ts
        │   ├── index.es.js
        │   ├── index.es.js.map
        │   ├── index.js
        │   └── index.js.map
        └── src // source code for component library
```

Disco Widgets is setup as a monorepo. At the top level, `packages` contains all of the individual packages that will be offered as part of this library.

Lerna and Yarn are used to manage shared dependencies across the packages.
Create React Library was used to generate the library of React components, `discovery-components-react`.

### Lerna

To generate the dependencies for all of the packages, run the following at the root directory:

```
npx lerna bootstrap
```

OR

```
yarn
```

This will install and bundle all of the shared dependencies for `packages` and for `examples`, and will also create a single `yarn.lock` file at the root directory. Dependency hoisting is taken care of with Yarn Workspaces, setup inside `package.json`.

See the following for [more info about Lerna](https://github.com/lerna/lerna) or [more info about Yarn Workspaces](https://yarnpkg.com/lang/en/docs/workspaces/).

### Create React Library

Our React package uses [Create React Library](https://www.npmjs.com/package/create-react-library), which in turn uses [Create React App](https://github.com/facebook/create-react-app). This bundles in several frameworks and tools such as Babel, Rollup, Jest, and Typescript support.

## Available Commands

| Root Directory                                                | Description                                                                            |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `yarn`                                                        | installs yarn dependencies in all of the packages                                      |
| `npx lerna bootstrap`                                         | (effectively the same as `yarn`) installs dependencies in all of the packages          |
| `yarn workspace discovery-components-react-example <command>` | runs the specified `yarn` script in the `discovery-components-react-example` workspace |
| `yarn storybook`                                              | runs storybook and opens browser to correct port                                       |

| examples/discovery-components-react-example | Description                                       |
| ------------------------------------------- | ------------------------------------------------- |
| `yarn start`                                | runs the client at http://localhost:3000/         |
| `yarn build`                                | creates a production build of the example project |
| `yarn test`                                 | runs the feature tests against the examples       |
| `yarn cypress`                              | opens the cypress application for feature testing |
| `yarn server`                               | runs an express server                            |
| `yarn test:e2e`                             | starts the server and runs cypress headless       |

| packages/discovery-components-react | Description                                                        |
| ----------------------------------- | ------------------------------------------------------------------ |
| `yarn start`                        | runs the `rollup` compiler in watch mode for the component library |
| `yarn build`                        | uses `rollup` to create a production build of component library    |
| `yarn test`                         | runs the unit/integration tests for the component library          |

## Running the Project

To start the examples, run the following commands:

```
yarn
yarn workspace @disco-widgets/react-components build
yarn workspace discovery-components-react-example start
```

## Running Storybook

Component documentation is done through Storybook.

To run Storybook, run the following commands:

```
cd packages/discovery-components-react
yarn storybook
```

## Unit/Integration Testing

For our React components, we're using Jest for our feature tests through `react-scripts` (utility provided from [create react app testing](https://create-react-app.dev/docs/running-tests))

### Feature Tests

[Cypress](https://docs.cypress.io) is being used for our feature/e2e testing. All feature testing will be done in the `examples` directories (end-user application examples) to test a full client-server relationship. For our CI, we will use the Cypress [server](https://docs.cypress.io/api/commands/server.html#Syntax) to mock out API requests and allow us to test our component expectations from the user's perspective.

The directory structure for adding feature tests in cypress looks like:

```
examples/discovery-components-react-example/cypress
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

The basic process will be to add a new file/directory (depending on how we want to organize tests) under `cypress/integration` then run `yarn cypress` (from the `discovery-components-react-example` directory) to open up the interactive debugger.

To start up our server and run all Cypress tests, use `yarn test:e2e`, which does the following steps:

1. starts up a server to host the example application
2. once the server responds, it moves on to perform the next command `cypress run` (headless version of `cypress open`)
3. after tests are complete, results are printed in the console and both the cypress server and the application server are shut down

### Continuous Integration

[Travis CI](https://travis-ci.org/) is used to continuously run integration tests against this repository, and any PRs that are made against it.

When triggered, Travis will build the project, then run the test scripts, and output the pass/fail to whichever branch/pr triggered the build.

Steps in the automation can be set in `.travis.yml`, located in the root directory.

#### A note on versioning

We use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-beta.4/) when commiting to our repository, although it is not required. If a group of commits are merged into our repo which use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-beta.4/) syntax, then the versioning of our NPM package will be determined by [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-beta.4/) specification. If not, then the patch version will automatically be bumped.

## Helpful Links

- [Typescript](https://www.typescriptlang.org/docs/home.html)
