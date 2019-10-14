import * as React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { wrapWithContext } from '../../../utils/testingUtils';
import { SearchContextIFC } from '../../DiscoverySearch/DiscoverySearch';
import { SearchRefinements } from '../SearchRefinements';
import refinementsQueryResponse from '../fixtures/refinementsQueryResponse';
import { invalidConfigurationMessage } from '../utils/searchRefinementMessages';

const setup = (filter: string) => {
  const context: Partial<SearchContextIFC> = {
    aggregationResults: {
      aggregations: refinementsQueryResponse.aggregations
    },
    searchParameters: {
      project_id: '',
      filter: filter
    }
  };
  const onRefinementsMountMock = jest.fn();
  context.onRefinementsMount = onRefinementsMountMock;
  const onUpdateAggregationQueryMock = jest.fn();
  context.onUpdateAggregationQuery = onUpdateAggregationQueryMock;
  const onUpdateFilterMock = jest.fn();
  context.onUpdateFilter = onUpdateFilterMock;
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
    context,
    onRefinementsMountMock,
    onUpdateAggregationQueryMock,
    onUpdateFilterMock,
    searchRefinementsComponent
  };
};

describe('SearchRefinementsComponent', () => {
  describe('legend header elements', () => {
    test('contains first refinement header with author field text', () => {
      const { searchRefinementsComponent } = setup('');
      const headerAuthorField = searchRefinementsComponent.getByText('author');
      expect(headerAuthorField).toBeDefined();
    });

    test('contains second refinement header with subject field text', () => {
      const { searchRefinementsComponent } = setup('');
      const headerSubjectField = searchRefinementsComponent.getByText('subject');
      expect(headerSubjectField).toBeDefined();
    });
  });

  describe('checkbox elements', () => {
    test('contains first refinement checkboxes with correct labels', () => {
      const { searchRefinementsComponent } = setup('');
      const ABMNStaffCheckbox = searchRefinementsComponent.getByLabelText('ABMN Staff');
      const newsStaffCheckbox = searchRefinementsComponent.getByLabelText('News Staff');
      const editorCheckbox = searchRefinementsComponent.getByLabelText('editor');
      expect(ABMNStaffCheckbox).toBeDefined();
      expect(newsStaffCheckbox).toBeDefined();
      expect(editorCheckbox).toBeDefined();
    });

    test('contains second refinement checkboxes with correct labels', () => {
      const { searchRefinementsComponent } = setup('');
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
      const { searchRefinementsComponent } = setup('');
      const animalsCheckbox = searchRefinementsComponent.getByLabelText('Animals');
      expect(animalsCheckbox['defaultChecked']).toEqual(false);
      expect(animalsCheckbox['checked']).toEqual(false);
    });

    test('checkboxes can be checked and checkbox is not disabled', () => {
      const { searchRefinementsComponent } = setup('');
      const animalsCheckbox = searchRefinementsComponent.getByLabelText('Animals');
      expect(animalsCheckbox['checked']).toEqual(false);
      fireEvent.click(animalsCheckbox);
      expect(animalsCheckbox['checked']).toEqual(true);
    });
  });

  describe('component load', () => {
    test('it calls onAggregationRequest with configuration', () => {
      const { onUpdateAggregationQueryMock } = setup('');
      expect(onUpdateAggregationQueryMock).toBeCalledTimes(1);
      expect(onUpdateAggregationQueryMock).toBeCalledWith(
        '[term(author,count:3),term(subject,count:4)]'
      );
    });

    test('it calls onSearch', () => {
      const { onRefinementsMountMock } = setup('');
      expect(onRefinementsMountMock).toBeCalledTimes(1);
    });
  });

  describe('checkboxes apply filters', () => {
    test('it adds correct filter when one checkbox within single refinement is checked', () => {
      const { searchRefinementsComponent, onUpdateFilterMock } = setup('');
      const animalsCheckbox = searchRefinementsComponent.getByLabelText('Animals');
      fireEvent.click(animalsCheckbox);
      expect(onUpdateFilterMock).toBeCalledTimes(1);
      expect(onUpdateFilterMock).toBeCalledWith('subject:Animals');
    });

    test('it adds correct filters when second checkbox within single refinement is checked', () => {
      const { searchRefinementsComponent, onUpdateFilterMock } = setup('subject:Animals');
      const peopleCheckbox = searchRefinementsComponent.getByLabelText('People');
      fireEvent.click(peopleCheckbox);
      expect(onUpdateFilterMock).toBeCalledTimes(1);
      expect(onUpdateFilterMock).toBeCalledWith('subject:Animals|People');
    });

    test('it adds correct filter when checkboxes from multiple refinements are checked', () => {
      const { searchRefinementsComponent, onUpdateFilterMock } = setup('subject:Animals');
      const newsStaffCheckbox = searchRefinementsComponent.getByLabelText('News Staff');
      fireEvent.click(newsStaffCheckbox);
      expect(onUpdateFilterMock).toBeCalledTimes(1);
      expect(onUpdateFilterMock).toBeCalledWith('author:News Staff,subject:Animals');
    });
  });

  describe('checkboxes remove filters', () => {
    test('it removes correct filter when checkbox within single refinement is unchecked', () => {
      const { searchRefinementsComponent, onUpdateFilterMock } = setup('subject:Animals');
      const animalsCheckbox = searchRefinementsComponent.getByLabelText('Animals');
      fireEvent.click(animalsCheckbox);
      // For the test, have to check the checkbox twice to get it in the 'checked' state to uncheck
      fireEvent.click(animalsCheckbox);
      expect(onUpdateFilterMock).toBeCalledTimes(2);
      expect(onUpdateFilterMock).toBeCalledWith('');
    });
  });

  describe('provides invalid error message in console when invalid configuration is provided', () => {
    const originalError = console.error;
    afterEach(() => (console.error = originalError));
    const consoleOutput: string[] = [];
    const mockedError = (output: string) => {
      consoleOutput.push(output);
    };
    beforeEach(() => (console.error = mockedError));

    test('it provides invalid message in console error when empty array is provided for configuration', () => {
      const { context } = setup('');
      render(wrapWithContext(<SearchRefinements configuration={[]} />, context));
      expect(consoleOutput).toEqual([invalidConfigurationMessage]);
    });

    test('it provides invalid message in console error when field is missing in provided configuration', () => {
      const { context } = setup('');
      render(
        wrapWithContext(
          <SearchRefinements
            configuration={[
              {
                field: 'enriched_text.entities.text',
                count: 10
              },
              {
                count: 5
              }
            ]}
          />,
          context
        )
      );
      expect(consoleOutput).toEqual([invalidConfigurationMessage, invalidConfigurationMessage]);
    });
  });
});
