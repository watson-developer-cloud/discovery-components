import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { COLLECTION_ID_1 } from '@SearchResults/__fixtures__/collectionsResponse';

const searchResults: DiscoveryV2.QueryResponse = {
  matching_results: 20967,
  retrieval_details: {
    document_retrieval_strategy: 'untrained'
  },
  results: [
    {
      document_id: 'd1dadc06c2b0855289c728b2c3819514',
      result_metadata: {
        collection_id: COLLECTION_ID_1
      },
      title: 'alternate title',
      document_passages: [
        {
          passage_text:
            '<em>Machine-learning</em> techniques are required to improve the accuracy of predictive models. Depending on the nature of the business problem being addressed, there are different approaches based on the type and volume of the data.'
        }
      ],
      extracted_metadata: {
        title: 'IBM_Analytics_Machine_Learning.pdf'
      }
    },
    {
      document_id: '59ee2403f45647091eafe392664588cd',
      result_metadata: {
        collection_id: COLLECTION_ID_1
      },
      title: 'alternate title',
      document_passages: [
        {
          passage_text:
            "Deep learning is a specific method of the <em>machine learning</em> that incorporates nueral networks in successive layers from data in an iterative manner. Deep learning is especially userful when you're tring to learn patterns from unstructured data"
        }
      ],
      extracted_metadata: {
        title: 'IBM_Analytics_Machine_Learning.pdf'
      }
    },
    {
      document_id: '79953f3b6f304adef09b4707627495ca',
      result_metadata: {
        collection_id: COLLECTION_ID_1
      },
      extracted_metadata: {
        title: 'IBM_Analytics_Machine_Learning.pdf'
      },
      title: 'alternate title',
      text:
        '<em>Machine learning</em> trains a model from patterns in your data, exploring a space of possible models defined by parameters. If your parameter space is too big, you’ll overfit to your training data and train a model that doesn’t generalize beyond it. A detailed explanation requires more math, but as a rule you should keep your models as simple as possible.'
    },
    {
      document_id: '79953f3b6f304adef09b470762567435',
      result_metadata: {
        collection_id: COLLECTION_ID_1
      },
      title: 'alternate title',
      extracted_metadata: {
        title: 'IBM_Analytics_Machine_Learning.pdf'
      }
    }
  ],
  table_results: [
    {
      table_id: '558ada041262d5b0aa02a05429d798c9',
      source_document_id: '59ee2403f45647091eafe392664588cd',
      collection_id: '8713a92b-28aa-b291-0000-016ddc68aa2a',
      table_html:
        '<table style="width:100%"><tr><th>Supervised Learning</th><th>Unsupervised Learning</th></tr><tr><td>Support Vector Machines</td><td>K-Means</td></tr><tr><td>Nearest Neighbor</td><td>Hidden Markov Model</td></tr></table>'
    },
    {
      table_id: '558ada041262d5b0aa02a05429d798c7',
      source_document_id: '66666603f45647091eafe392664588cd',
      collection_id: '8713a92b-28aa-b291-0000-016ddc68aa2a',
      table_html:
        '<table style="width:100%"><tr><th>Supervised Learning</th><th>Unsupervised Learning</th></tr><tr><td>Support Vector Machines</td><td>K-Means</td></tr><tr><td>Nearest Neighbor</td><td>Hidden Markov Model</td></tr></table>'
    }
  ]
};

export default searchResults;
