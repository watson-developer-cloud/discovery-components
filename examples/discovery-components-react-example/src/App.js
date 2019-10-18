import React from 'react';
import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';
import './app.scss';
import { document as pdfDocument } from './__fixtures__/WEA.Glossary_pdf';
import documentData from './__fixtures__/WEA.Glossary.pdf.json';

import {
  DiscoverySearch,
  SearchInput,
  SearchResults,
  SearchRefinements,
  ResultsPagination,
  RichPreview
} from '@disco-widgets/react-components';

const App = () => {
  // TODO: this is a dummy client to route requests to the server since CP4D doesn't support CORS
  const searchClient = new DiscoveryV1({
    url: 'http://localhost:4000/api',
    version: '2019-01-01',
    use_unauthenticated: true
  });

  return (
    <DiscoverySearch searchClient={searchClient} projectId={process.env.REACT_APP_PROJECT_ID}>
      <SearchInput
        light={false}
        small={false}
        placeHolderText={'This is some placeholder text...'}
        labelText={'This is some label text...'}
        spellingSuggestions={true}
      />
      <SearchResults bodyField={'highlight.text[0]'} />
      <SearchRefinements
        showCollections={true}
        configuration={[
          {
            field: 'enriched_text.entities.text',
            count: 10
          },
          {
            field: 'enriched_title.entities.text',
            count: 10
          }
        ]}
      />
      <ResultsPagination />
      <RichPreview document={documentData} file={atob(pdfDocument)} />
    </DiscoverySearch>
  );
};
export default App;
