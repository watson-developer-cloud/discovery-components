const refinementsQueryResponse: object = {
  matching_results: 123456,
  results: [],
  aggregations: [
    {
      type: 'term',
      field: 'author',
      count: 3,
      results: [
        {
          key: 'ABMN Staff',
          matching_results: 138993
        },
        {
          key: 'News Staff',
          matching_results: 57158
        },
        {
          key: 'editor',
          matching_results: 32444
        }
      ]
    },
    {
      type: 'term',
      field: 'subject',
      count: 5,
      results: [
        {
          key: 'kittens',
          matching_results: 138993
        },
        {
          key: 'puppies',
          matching_results: 133760
        },
        {
          key: 'pandas',
          matching_results: 129139
        },
        {
          key: 'tigers',
          matching_results: 76403
        },
        {
          key: 'elephants',
          matching_results: 57158
        }
      ]
    }
  ]
};

export default refinementsQueryResponse;
