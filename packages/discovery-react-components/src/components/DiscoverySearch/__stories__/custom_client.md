#### Overview

When using the `<DiscoverySearch>` component, users can override the `searchClient` input by implementing a class that implements the same functionality in case users want to perform interactions with the Watson Discovery service independently from the component library defaults.

#### Search Client Example

A custom implementation of the search client could look like:

```jsx
import React from 'react';
window.myQueryParameters = {
  naturalLanguageQuery: ''
};
window.mySearchResults = {};
class MyCustomSearchClient extends React.Component {
  async query(searchParameters, callback) {
    await window
      .fetch('/api/query', {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, cors, *same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          'Content-Type': 'application/json'
        },
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // no-referrer, *client
        body: JSON.stringify(searchParameters) // body data type must match "Content-Type" header
      })
      .then(response => response.json())
      .then(results => {
        window.mySearchResults = results;
      });
  }
}
const MyApp = () => {
  return (
    <DiscoverySearch
      searchClient={new MyCustomSearchClient()}
      searchResponse={window.mySearchResults}
      queryParameters={window.myQueryParameters}
    >
      <div>Other components here</div>
    </DiscoverySearch>
  );
};
```

The response body can be stored in whatever state management tools the user's application chooses. Then, the custom search client can pass those results back to the `<DiscoverySearch>` component

**NOTE** Below you will see an `<Unknown>` component which corresponds to the `<SearchContext.Consumer>` due to a bug with the `addon-info` storybook addon. This may be fixed when we switch to using storybook docs.
