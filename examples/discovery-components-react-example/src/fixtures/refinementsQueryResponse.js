const refinementsQueryResponse = {
  matching_results: 123456,
  results: [],
  aggregations: [
    {
      type: 'term',
      field: 'author',
      count: 10,
      results: [
        {
          key: 'ABMN Staff',
          matching_results: 138993
        },
        {
          key: 'admin',
          matching_results: 133760
        },
        {
          key: 'wn.com',
          matching_results: 129139
        },
        {
          key: 'AAP Newswire (aap@cognitives.io)',
          matching_results: 76403
        },
        {
          key: 'News Staff',
          matching_results: 57158
        },
        {
          key: 'www.4-traders.com',
          matching_results: 53796
        },
        {
          key: 'indiatimes.com',
          matching_results: 39150
        },
        {
          key: 'The Canadian Press',
          matching_results: 36928
        },
        {
          key: 'EPA연합뉴스 | 네이버',
          matching_results: 36635
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
          matching_results: 138995
        },
        {
          key: 'puppies',
          matching_results: 133761
        },
        {
          key: 'pandas',
          matching_results: 129140
        },
        {
          key: 'tigers',
          matching_results: 76414
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
