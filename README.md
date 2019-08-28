# Disco Widgets (a.k.a. Search Results Visualization)

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

Disco Widgets is setup as a monorepo. At the top level, `packages` contains all of the individual packages that will be offered as part of this library.
(As of this writing, Disco Widgets is only available as a package of React components).

Lerna and Yarn are used to manage shared dependencies across the packages.
Create React Library was used to generate the library of React components, `discovery-components-react`.

### Lerna
To generate the dependencies for all of the packages, run the following at the root directory:
```
npx lerna bootstrap
```
This will install and bundle all of the shared dependencies for `packages` and for `examples`, and will also create a single `yarn.lock` file at the root directory. Dependency hoisting is taken care of with Yarn Workspaces, setup inside `package.json`.

See the following for [more info about Lerna](https://github.com/lerna/lerna) or [more info about Yarn Workspaces](https://yarnpkg.com/lang/en/docs/workspaces/).

### Create React Library

Our React package uses [Create React Library](https://www.npmjs.com/package/create-react-library), which in turn uses [Create React App](https://github.com/facebook/create-react-app). This bundles in several frameworks and tools such as Babel, Rollup, Jest, and Typescript support.

## Available Commands

|  Root Directory  |  Description  |
|------------|-----------------|
| `yarn`    |  installs yarn dependencies  |
| `npx lerna bootstrap` | installs dependencies in all of the packages |

|  examples/discovery-components-react  |  Description |
|---------------------------------------|-------------|
|  `yarn start`  |  runs the client at http://localhost:3000/  |
|  `yarn build`  |  creates a production build of the example project  |
|  `yarn test`   |  runs the feature tests against the examples  |

## Running the Project

At the moment, only the examples are runnable. This may change in the near future as the React components are added to the `discovery-components-react` package.

To start the examples, run the following commands:
```
yarn
cd examples/discovery-components-react
yarn start
```

## Testing

<!-- ### Unit Tests
(Won't be much info here until we set up some unit testing framework) -->

### Feature Tests
For our React components, we're using Jest for our feature tests. <!-- change later if we decide otherwise-->

Currently, tests can be run from our examples 

### Continuous Integration
[Travis CI](https://travis-ci.org/) is used to continuously run integration tests against this repository, and any PRs that are made against it.

When triggered, Travis will build the project, then run the test scripts, and output the pass/fail to whichever branch/pr triggered the build. 

Steps in the automation can be set in `.travis.yml`, located in the root directory.

## Helpful Links
- [Typescript](https://www.typescriptlang.org/docs/home.html)
