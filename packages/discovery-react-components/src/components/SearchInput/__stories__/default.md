#### Overview

The SearchInput component is used to make queries against your project. After typing a search query into the input, hit `Enter` to perform a query. By default, autocomplete suggestions are enabled, providing suggestions for the last word of the search query. Spelling suggestions are also enabled by default, which, when used with the SearchResults component, provide corrections for any typos detected in the search query. You can set the values of optional parameters to affect the functionality of the SearchInput component, or to affect the results returned when a query is made.

##### Carbon Props

The SearchInput component uses [Carbon's Search component](https://github.com/carbon-design-system/carbon/tree/master/packages/components/src/components/search) as a basis, and lets you pass in any props from that component that are not already being used. These will get passed into the Search component. You can see what props are available at [Carbon's storybook page](http://react.carbondesignsystem.com/?path=/story/search--default).
