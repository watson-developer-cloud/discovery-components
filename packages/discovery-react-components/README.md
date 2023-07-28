<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [@ibm-watson/discovery-react-components](#ibm-watsondiscovery-react-components)
  - [Install](#install)
  - [Using Discovery Components in a React application](#using-discovery-components-in-a-react-application)
    - [Interacting with Discovery data in custom components](#interacting-with-discovery-data-in-custom-components)
    - [Network performance](#network-performance)
      - [Query 'return' parameter](#query-return-parameter)
    - [Optimize CSS](#optimize-css)
  - [Usage](#usage)
  - [Rendering PDFs](#rendering-pdfs)
  - [Available Commands](#available-commands)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# @ibm-watson/discovery-react-components

>

[![NPM](https://img.shields.io/npm/v/@ibm-watson/discovery-react-components)](https://www.npmjs.com/package/@ibm-watson/discovery-react-components) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save @ibm-watson/discovery-react-components
```

## Using Discovery Components in a React application

If you would like an example of Discovery Components integrated into an existing application, [see our Example App](../../examples/discovery-search-app/README.md) for instructions on setting up and running the application against your real data.

If you don't have a React application already, start with [create-react-app](https://github.com/facebook/create-react-app), then modify the following in your `src/App.js`. Otherwise, you may use Discovery Components inside of any existing React component.

1. Add the component, style, and client libraries, along with carbon dependencies, to your application:

   ```
   yarn add @ibm-watson/discovery-react-components @ibm-watson/discovery-styles ibm-watson carbon-components carbon-components-react carbon-icons
   ```

   or

   ```
   npm install --save @ibm-watson/discovery-react-components @ibm-watson/discovery-styles ibm-watson carbon-components carbon-components-react carbon-icons
   ```

2. Add `sass` (or `sass-embedded`) as a dev dependency

   ```
   yarn add -D sass
   ```

   or

   ```
   npm install --save-dev sass
   ```

3. Add the `DiscoverySearch` component with corresponding `searchClient` and optionally any components you would like to use to display Discovery Search Results.

   ```jsx
   // src/App.js
   import React from 'react';
   import DiscoveryV2 from 'ibm-watson/discovery/v2';
   import { NoAuthAuthenticator } from 'ibm-watson/auth';
   import {
     DiscoverySearch,
     SearchInput,
     SearchResults,
     SearchFacets,
     ResultsPagination,
     DocumentPreview
   } from '@ibm-watson/discovery-react-components';
   import '@ibm-watson/discovery-styles/scss/index.scss';

   // replace these variables:
   const version = '{REPLACE_ME}'; // YYYY-MM-DD date format
   const projectId = '{REPLACE_ME}'; // retrieved from Discovery Tooling UI, ex.

   // authentication must be handled on the server
   // @see https://github.com/watson-developer-cloud/node-sdk#client-side-usage
   const authenticator = NoAuthAuthenticator();
   // tell SDK to send requests to our server's `/api` endpoint, where auth header is added
   const serviceUrl = `${window.location.href}api`;

   const App = () => {
     let searchClient, success;
     try {
       searchClient = new DiscoveryV2({ serviceUrl, version, authenticator });
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
         Please replace the constants in App.js along with setting up your credentials file in order
         to see the Discovery sample application.
         <br />
         <br />
         Check the console log for more information if you have replaced these constants and are still
         seeing this message.
       </div>
     );
   }

   export default App;
   ```

   For more information on how each component can be customized and configured, check out our hosted [storybook](https://watson-developer-cloud.github.io/discovery-components/storybook/)

4. If you are using `webpack`, you may need to [update your `webpack.config.js`](https://github.com/watson-developer-cloud/node-sdk/tree/master/examples/webpack#webpack-configuration) to allow the `ibm-watson` dependency to be used client-side.

   If you are using `webpack` v5 or greater (or `create-react-app` v5.0.0), you will need to do additional configuration and add missing packages. See [these 2 comment](https://github.com/watson-developer-cloud/discovery-components/issues/292#issuecomment-1034082638) for details.

5. Set up authentication on the server.

   a. Set up the credentials. See step (5) above in [Manual setup](#manual-setup).

   b. The client code above will send Discovery API requests to your server, to the `/api` endpoint. Set your server to proxy those requests to the URL defined by the `DISCOVERY_URL` environment variable.

   c. Add [proper authentication](https://cloud.ibm.com/apidocs/discovery-data#authentication), setting the authorization header when proxying to the Discovery API.

   To see an example of this in a Node Express server, see `examples/discovery-search-app/src/setupProxy.js`.

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

### Network performance

#### Query 'return' parameter

By default, when querying a project (e.g. using `performSearch`), all of the document data for any matching documents is returned. Depending on the type of documents in your collection and how many are returned, the size of the reponse data can be quite large.

To cut down on the size of the response, the [Discovery Query API](https://test.cloud.ibm.com/apidocs/discovery-data#query-request) allows you to set a list of fields in the `return` request body parameter. The documents returned will only contain those fields.

If you use the `SearchResults` component, it updates the default search parameters to only request the document fields it needs to render results.

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

## Rendering PDFs

If you want to use the Discovery Components (`DocumentPreview` or `PdfViewer`) to render PDF documents, you will need to set up the pdf.js worker script. This can be done in one of two ways:

1. Set the `pdfWorkerUrl` prop to the URL of the pdf.js worker script (i.e. `pdf.worker.min.js`) to any of `DocumentPreview`, `PdfViewer`, `PdfViewerWithHighlight`, or `DocumentPreview.PreviewDocument`. (see examples/discovery-search-app/src/App.js for an example)
2. Use `setPdfJsGlobalWorkerOptions({ workerSrc: 'path/to/worker.js' })` to set up the pdf.js worker script (see `src/setupTests.ts` for an example).

## Available Commands

The following are available to run from `packages/discovery-react-components`

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
