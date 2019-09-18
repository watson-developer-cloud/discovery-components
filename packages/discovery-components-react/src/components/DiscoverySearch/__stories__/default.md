#### Overview

This component serves as a state provider in order for children components to have access to and interact with one another through a shared context using [React context](https://reactjs.org/docs/context.html).

#### Child Component Context

Components nested within this parent component can access this context either using [React hooks useContext](https://reactjs.org/docs/hooks-reference.html#usecontext) with the `SearchContext` like

```jsx
import React, { useContext } from 'react';
import { SearchContext } from '@disco-widgets/react-components';
const MyComponent = () => {
  const { searchResults } = useContext(SearchContext);
  return <div>{searchResults}</div>;
};
```

or with a traditional class component context `Consumer` like

```jsx
import React from 'react';
import { SearchContext } from '@disco-widgets/react-components';
class MyComponent extends React.Component {
  render() {
    return (
      <SearchContext.Consumer>
        {({ searchResults }) => <div>{searchResults}</div>}
      </SearchContext.Consumer>
    );
  }
}
```

### DiscoverySearch Component Context API

- `searchResults` (type: `object`) [spec](https://cloud.ibm.com/apidocs/discovery-data#query-a-collection)
- `searchParameters` (type: `object`) [spec](https://cloud.ibm.com/apidocs/discovery-data#query-a-collection)
- `onSearch` (type: `function`) executes the query using the `searchParameters` context value against the Watson Discovery service
  - **arguments**: none
  - **return value**: `Promise<void>` - search results can be retrieved from the `searchResults` context value
- `onUpdateNaturalLanguageQuery` (type: `function`) updates the `natural_language_query` parameter in the `searchParameters` context value used for searching
  - **arguments**:
    - `nlq` (type: `string`) the natural language query to update
  - **return value**: `Promise<void>` - search parameters can be retrieved from the `searchParameters` context value
