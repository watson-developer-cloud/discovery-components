---
layout: default
title: Custom Components
parent: Components
---

# Implementing a Custom Component

The components provided here may not fit your specific needs, and you'll need to write a custom component. The following example shows you how this could be done using React.

## Scenario

Let's say you want to use the Watson Discovery [answer finding](https://medium.com/ibm-data-ai/finding-concise-answers-to-questions-in-enterprise-documents-53a865898dbd) capability. Instead of returning _documents_, you want to get _answers_ from within those documents.

## Implement a custom Answers component

To make things easier, we're going to edit the existing code for `discovery-search-app` in `src/App.js`. We'll keep using the search field, but create a custom component to show the top 3 answers.

The `<SearchInput>` component renders the search field. It takes a string input value and generates a `/query` request, passing the value in the `natural_language_query` field for the request body. You will need to update that to enable _answers_, as described in the article. To do so, set the `overrideQueryParameters` property for `<DiscoverySearch>`:

{% raw %}

```diff
   ) : isError ? (
     <div>Unable to load Discovery projects. Please check your console for more details.</div>
   ) : (
-    <DiscoverySearch searchClient={searchClient} projectId={projectId}>
+    <DiscoverySearch
+      searchClient={searchClient}
+      projectId={projectId}
+      overrideQueryParameters={{
+        passages: {
+          enabled: true,
+          max_per_document: 3,
+          characters: 850,
+          fields: ['title', 'text'],
+          find_answers: true,
+          max_answers_per_document: 1
+        },
+        _return: ['document_passages', 'extracted_metadata']
+      }}
+    >
       <AppView />
     </DiscoverySearch>
   );
```

{% endraw %}

The overall details are explained in the article, but here are a few things to keep in mind. First, `fields` should be set to reflect the data in your project/collection. This property tells Discovery in which document fields to look for answers. Second, this sets `_return` to a set of top-level fields in the document results. Only the fields listed will be returned, cutting down on the response size (especially since it doesn't list `text` and `html`, which can be quite large).

(Note: Besides `overrideQueryParameters`, you can also update the query parameters by calling the `setSearchParameters` function on the `SearchApi` context.)

Now let's build our custom component. The Discovery Components use [React Context](https://reactjs.org/docs/context.html) to pass data and give access to their API. The results of a search are provided in the `searchResponseStore` property of the `SearchContext`. From within that, you'll find the most relevant `answers`, based on their `confidence` score.

Copy the following code into `src/App.js`:

```javascript
// Show top 3 answers from within search results
function Answers() {
  // Use the context provided by <DiscoverySearch> to get search results
  const {
    searchResponseStore: { data: searchResponse }
  } = useContext(SearchContext);

  if (!searchResponse) {
    return null;
  }

  const top3Answers = searchResponse.results
    // extract document passages from documents in the results...
    .reduce((acc, doc) => acc.concat(doc.document_passages), [])
    // extract answers from the passages...
    .reduce((acc, psg) => acc.concat(psg.answers), [])
    // sort based on confidence score...
    .sort((a, b) => b.confidence - a.confidence)
    // and take the top 3
    .slice(0, 3);

  // render the answers as an ordered list
  return (
    <div>
      <ol>
        {top3Answers.map(answer => (
          <li>{answer.answer_text}</li>
        ))}
      </ol>
    </div>
  );
}
```

To make use of this new component, replace `<SearchResults>`:

```diff
             <div
               className={`${settings.prefix}--col-md-6 ${settings.prefix}--search-app__facets-and-results__results`}
             >
-              {!isError ? <SearchResults /> : <p>An error occurred during search.</p>}
+              {!isError ? <Answers /> : <p>An error occurred during search.</p>}
             </div>
           </div>
         </div>
```

## Write everything from scratch

The previous example uses a custom component along with several existing Discovery Components. But you might want to create everything from scratch. There are two ways to approach adding your own code.

First, you can continue to use `<DiscoverySearch>`. It is a component which does not render UI, but provides an API and properties for dealing with search. It is an abstraction on top of Discovery API.

For more control, you can use the full [Discovery API](https://cloud.ibm.com/apidocs/discovery-data). Consider using the [Watson APIs Node.js SDK](https://github.com/watson-developer-cloud/node-sdk) -- don't worry about the name, it can be used [client-side](https://github.com/watson-developer-cloud/node-sdk#client-side-usage) as well. Just make sure to import the `v2` version:

```javascript
import DiscoveryV2 from 'ibm-watson/discovery/v2';
```
