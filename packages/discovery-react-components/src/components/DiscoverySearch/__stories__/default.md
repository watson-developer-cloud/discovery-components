#### Overview

This component serves as a state provider in order for children components to have access to and interact with one another through a shared context using [React context](https://reactjs.org/docs/context.html).

#### Child Component Context

Components nested within this parent component can access this context either using [React hooks useContext](https://reactjs.org/docs/hooks-reference.html#usecontext) with the `SearchContext` like

```jsx
import React, { useContext } from 'react';
import { SearchContext } from '@ibm-watson/discovery-react-components';
const MyComponent = () => {
  const { searchResponse } = useContext(SearchContext);
  return <div>{searchResponse}</div>;
};
```

or with a traditional class component context `Consumer` like

```jsx
import React from 'react';
import { SearchContext } from '@ibm-watson/discovery-react-components';
class MyComponent extends React.Component {
  render() {
    return (
      <SearchContext.Consumer>
        {({ searchResponse }) => <div>{searchResponse}</div>}
      </SearchContext.Consumer>
    );
  }
}
```

### DiscoverySearch Component Context API

- `searchResponse` (type: `object`) [spec](https://cloud.ibm.com/apidocs/discovery-data#query-a-collection)
- `searchParameters` (type: `object`) [spec](https://cloud.ibm.com/apidocs/discovery-data#query-a-collection)
