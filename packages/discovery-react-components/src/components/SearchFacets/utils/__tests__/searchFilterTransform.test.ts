import { SearchFilterTransform } from '../searchFilterTransform';

const weirdAggs = [
  {
    type: 'term',
    field: 'extracted_stuff.weirdAggs',
    results: [
      {
        key: 'this | that',
        matching_results: 825192,
        selected: true
      },
      {
        key: '1:30',
        matching_results: 793668,
        selected: true
      },
      {
        key: '1,200',
        matching_results: 293668,
        selected: true
      },
      {
        key: 'double " quote',
        matching_results: 2968,
        selected: true
      }
    ]
  },
  {
    type: 'term',
    field: 'extracted_stuff.oddAggs',
    results: [
      {
        key: 'something, new',
        matching_results: 293668,
        selected: true
      },
      {
        key: 'blah|junk',
        matching_results: 2968,
        selected: true
      }
    ]
  },
  {
    type: 'term',
    field: 'extracted_stuff.normalAggs',
    results: [
      {
        key: 'something normal',
        matching_results: 293668,
        selected: true
      },
      {
        key: 'nospaces',
        matching_results: 2968,
        selected: true
      }
    ]
  },
  {
    type: 'term',
    field: 't(ext)',
    results: [
      {
        key: 'something normal',
        matching_results: 293668,
        selected: true
      },
      {
        key: 'nospaces',
        matching_results: 2968,
        selected: true
      }
    ]
  }
];
const weirdFilters =
  'extracted_stuff.weirdAggs::"this | that"|extracted_stuff.weirdAggs::"1:30"|extracted_stuff.weirdAggs::"1,200"|extracted_stuff.weirdAggs::"double \\" quote",' +
  'extracted_stuff.oddAggs::"something, new"|extracted_stuff.oddAggs::"blah|junk",' +
  'extracted_stuff.normalAggs::"something normal"|extracted_stuff.normalAggs::"nospaces",' +
  't\\(ext\\)::"something normal"|t\\(ext\\)::"nospaces"';

describe('QueryTermAggregation array to filter string', () => {
  test('it properly handles aggregations with reserved characters', () => {
    expect(SearchFilterTransform.fieldsToString(weirdAggs)).toEqual(weirdFilters);
  });
});

describe('Filter string to QueryTermAggregation array', () => {
  test('it properly handles unquoted terms', () => {
    expect(
      SearchFilterTransform.fromString('field::term|field::two words,field2::blah\\"stuff')
        .filterFields
    ).toEqual([
      {
        type: 'term',
        field: 'field',
        results: expect.arrayContaining([
          expect.objectContaining({ key: 'term', selected: true }),
          expect.objectContaining({ key: 'two words', selected: true })
        ])
      },
      {
        type: 'term',
        field: 'field2',
        results: expect.arrayContaining([
          expect.objectContaining({ key: 'blah"stuff', selected: true })
        ])
      }
    ]);
  });

  test('it properly handles aggregations with reserved characters', () => {
    expect(SearchFilterTransform.fromString(weirdFilters).filterFields).toEqual([
      {
        type: 'term',
        field: 'extracted_stuff.weirdAggs',
        results: expect.arrayContaining([
          expect.objectContaining({ key: 'this | that', selected: true }),
          expect.objectContaining({ key: '1:30', selected: true }),
          expect.objectContaining({ key: '1,200', selected: true }),
          expect.objectContaining({ key: 'double " quote', selected: true })
        ])
      },
      {
        type: 'term',
        field: 'extracted_stuff.oddAggs',
        results: expect.arrayContaining([
          expect.objectContaining({ key: 'something, new', selected: true }),
          expect.objectContaining({ key: 'blah|junk', selected: true })
        ])
      },
      {
        type: 'term',
        field: 'extracted_stuff.normalAggs',
        results: expect.arrayContaining([
          expect.objectContaining({ key: 'something normal', selected: true }),
          expect.objectContaining({ key: 'nospaces', selected: true })
        ])
      },
      {
        type: 'term',
        field: 't(ext)',
        results: expect.arrayContaining([
          expect.objectContaining({ key: 'something normal', selected: true }),
          expect.objectContaining({ key: 'nospaces', selected: true })
        ])
      }
    ]);
  });
});
