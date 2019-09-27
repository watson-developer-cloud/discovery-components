import * as React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { wrapWithContext } from '../../../utils/testingUtils';
import { SearchContextIFC } from '../../DiscoverySearch/DiscoverySearch';
import { SearchRefinements } from '../SearchRefinements';
import refinementsQueryResponse from '../fixtures/refinementsQueryResponse';

const setup = () => {
  const context: Partial<SearchContextIFC> = {
    searchResults: {
      aggregations: refinementsQueryResponse.aggregations
    }
  };
  const searchMock = jest.fn();
  context.onSearch = searchMock;
  const onUpdateAggregationQueryMock = jest.fn();
  context.onUpdateAggregationQuery = onUpdateAggregationQueryMock;
  const searchRefinementsComponent = render(
    wrapWithContext(
      <SearchRefinements
        configuration={[
          {
            field: 'author',
            count: 3
          },
          {
            field: 'subject',
            count: 4
          }
        ]}
      />,
      context
    )
  );
  return {
    searchMock,
    onUpdateAggregationQueryMock,
    searchRefinementsComponent
  };
};

describe('SearchRefinementsComponent', () => {
  describe('legend header elements', () => {
    test('contains first refinement header with author field text', () => {
      const { searchRefinementsComponent } = setup();
      const headerAuthorField = searchRefinementsComponent.getByText('author');
      expect(headerAuthorField).toBeDefined();
    });

    test('contains second refinement header with subject field text', () => {
      const { searchRefinementsComponent } = setup();
      const headerSubjectField = searchRefinementsComponent.getByText('subject');
      expect(headerSubjectField).toBeDefined();
    });
  });

  describe('checkbox elements', () => {
    test('contains first refinement checkboxes with correct labels', () => {
      const { searchRefinementsComponent } = setup();
      const ABMNStaffCheckbox = searchRefinementsComponent.getByLabelText('ABMN Staff');
      const newsStaffCheckbox = searchRefinementsComponent.getByLabelText('News Staff');
      const editorCheckbox = searchRefinementsComponent.getByLabelText('editor');
      expect(ABMNStaffCheckbox).toBeDefined();
      expect(newsStaffCheckbox).toBeDefined();
      expect(editorCheckbox).toBeDefined();
    });

    test('contains second refinement checkboxes with correct labels', () => {
      const { searchRefinementsComponent } = setup();
      const animalsCheckbox = searchRefinementsComponent.getByLabelText('Animals');
      const peopleCheckbox = searchRefinementsComponent.getByLabelText('People');
      const placesCheckbox = searchRefinementsComponent.getByLabelText('Places');
      const thingsCheckbox = searchRefinementsComponent.getByLabelText('Things');
      expect(animalsCheckbox).toBeDefined();
      expect(peopleCheckbox).toBeDefined();
      expect(placesCheckbox).toBeDefined();
      expect(thingsCheckbox).toBeDefined();
    });

    test('checkboxes are unchecked when initially rendered', () => {
      const { searchRefinementsComponent } = setup();
      const animalsCheckbox = searchRefinementsComponent.getByLabelText('Animals');
      expect(animalsCheckbox['defaultChecked']).toEqual(false);
      expect(animalsCheckbox['checked']).toEqual(false);
    });

    test('checkboxes can be checked and checkbox is not disabled', () => {
      const { searchRefinementsComponent } = setup();
      const animalsCheckbox = searchRefinementsComponent.getByLabelText('Animals');
      expect(animalsCheckbox['checked']).toEqual(false);
      fireEvent.click(animalsCheckbox);
      expect(animalsCheckbox['checked']).toEqual(true);
    });
  });

  describe('component load', () => {
    test('it calls onAggregationRequest with configuration', () => {
      const { onUpdateAggregationQueryMock } = setup();
      expect(onUpdateAggregationQueryMock).toBeCalledTimes(1);
      expect(onUpdateAggregationQueryMock).toBeCalledWith(
        '[term(author,count:3),term(subject,count:4)]'
      );
    });

    test('it calls onSearch', () => {
      const { searchMock } = setup();
      expect(searchMock).toBeCalledTimes(1);
    });
  });
});
