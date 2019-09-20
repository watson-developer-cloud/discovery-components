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
├── README.md
├── docs                                     // docs published at pages.github.com
│   ├── _config.yml
│   ├── components
│   │   └── components.md
│   ├── getting-started
│   │   ├── contributing.md
│   │   ├── getting-started.md
│   │   └── overview.md
│   ├── index.md
│   └── storybook                            // static storybook build
├── examples                                 // examples directory to demo use-cases
│   └── discovery-components-react-example   // kitchen-sink example application
│       ├── CHANGELOG.md
│       ├── README.md
│       ├── cypress                          // e2e testing suite
│       ├── cypress.json
│       ├── package.json
│       ├── server.js                        // example server
│       └── src                              // client-side source
│           ├── App.js
│           ├── __tests__
│           │   └── App.test.js
│           ├── index.js
│           └── index.scss
└──  packages                                 // libraries
    ├── discovery-components-react           // react components package
    │   ├── src
    │   │   ├── components
    │   │   │   ├── DiscoverySearch
    │   │   │   │   ├── DiscoverySearch.tsx
    │   │   │   │   └── __stories__          // per-component stories directory
    │   │   │   │       ├── DiscoverySearch.stories.tsx
    │   │   │   │       ├── custom_client.md
    │   │   │   │       └── default.md
    │   │   │   ├── ExampleComponent
    │   │   │   │   ├── ExampleComponent.stories.tsx
    │   │   │   │   ├── ExampleComponent.tsx
    │   │   │   │   └── __tests__
    │   │   │   │       └── ExampleComponent.test.tsx
    │   │   │   └── SearchInput
    │   │   │       └── SearchInput.tsx
    │   │   ├── typings.d.ts                // type declarations
    │   │   └── utils                       // utilities used across components
    │   ├── tsconfig.json
    │   └── tsconfig.prod.json
    └── discovery-styles                    // SASS styles agnostic to JS framework
        └── scss
            ├── components
            │   └── example-component
            │       └── _example-component.scss
            └── index.scss
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
| `yarn cypress`                              | opens the cypress application for feature testing |
| `yarn server`                               | runs an express server                            |
| `yarn test:e2e`                             | starts the server and runs cypress headless       |

| packages/discovery-components-react | Description                                                        |
| ----------------------------------- | ------------------------------------------------------------------ |
| `yarn start`                        | runs the `rollup` compiler in watch mode for the component library |
| `yarn build`                        | uses `rollup` to create a production build of component library    |
| `yarn test`                         | runs the unit/integration tests for the component library          |
| `yarn test:watch`                   | runs the unit/integration tests in watch mode                      |
| `yarn code-coverage`                | runs the unit/integration tests code coverage report               |

| packages/discovery-styles | Description                                       |
| ------------------------- | ------------------------------------------------- |
| `yarn start`              | runs `node-sass` in `watch` mode                  |
| `yarn build`              | runs `node-sass` to compile `scss` files to `css` |

## Running the Project

To start the examples, run the following commands:

```
yarn
yarn workspace @disco-widgets/react-components build
yarn workspace discovery-components-react-example start
```

### Styling

We will be following the [carbon styleguide](https://www.carbondesignsystem.com) for styling principles which follows a slightly modified [BEM](http://getbem.com/naming/) syntax -> i.e. `bx--block__element--modifier` where `bx` is just the prefix to prevent naming collisions. All styles belong in the `discovery-styles` package.

Wherever possible, we should be using

- `vars` like "prefix"
  - almost on all files add-in -> `@import '~carbon-components/scss/globals/scss/vars';`
  - we may revisit this when doing optimizations
- [color tokens](https://www.carbondesignsystem.com/guidelines/color/usage/#tokens-by-theme)
- [spacing tokens](https://www.carbondesignsystem.com/guidelines/themes#spacing)

## Running Storybook

Component documentation is done through Storybook.

To run Storybook, run the following commands:

```
cd packages/discovery-components-react
yarn storybook
```

## Developing Storybook

If a component's storybook story isn't correctly including the defined propTypes and description, check in your component definition file that you are importing React with:

```
import * as React from 'react';
```

## Unit/Integration Testing

For our React components, we're using Jest for our unit and integration. Tests are rendered through [react-testing-library](https://testing-library.com/), which also provides some additional functionality.

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
- To test publishing to the npm registry locally, you can use [Verdaccio](https://www.npmjs.com/package/verdaccio)
