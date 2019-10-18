import * as React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { wrapWithContext } from '../../../utils/testingUtils';
import { SearchContextIFC } from '../../DiscoverySearch/DiscoverySearch';
import { SearchRefinements } from '../SearchRefinements';
import refinementsQueryResponse from '../fixtures/refinementsQueryResponse';

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
  const onUpdateQueryOptionsMock = jest.fn();
  context.onUpdateQueryOptions = onUpdateQueryOptionsMock;
  const fieldRefinementsComponent = render(
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
    onRefinementsMountMock,
    onUpdateQueryOptionsMock,
    fieldRefinementsComponent
  };
};

describe('FieldRefinementsComponent', () => {
  describe('legend header elements', () => {
    test('contains first refinement header with author field text', () => {
      const { fieldRefinementsComponent } = setup('');
      const headerAuthorField = fieldRefinementsComponent.getByText('author');
      expect(headerAuthorField).toBeDefined();
    });

    test('contains second refinement header with subject field text', () => {
      const { fieldRefinementsComponent } = setup('');
      const headerSubjectField = fieldRefinementsComponent.getByText('subject');
      expect(headerSubjectField).toBeDefined();
    });
  });

  describe('checkbox elements', () => {
    test('contains first refinement checkboxes with correct labels', () => {
      const { fieldRefinementsComponent } = setup('');
      const ABMNStaffCheckbox = fieldRefinementsComponent.getByLabelText('ABMN Staff');
      const newsStaffCheckbox = fieldRefinementsComponent.getByLabelText('News Staff');
      const editorCheckbox = fieldRefinementsComponent.getByLabelText('editor');
      expect(ABMNStaffCheckbox).toBeDefined();
      expect(newsStaffCheckbox).toBeDefined();
      expect(editorCheckbox).toBeDefined();
    });

    test('contains second refinement checkboxes with correct labels', () => {
      const { fieldRefinementsComponent } = setup('');
      const animalsCheckbox = fieldRefinementsComponent.getByLabelText('Animals');
      const peopleCheckbox = fieldRefinementsComponent.getByLabelText('People');
      const placesCheckbox = fieldRefinementsComponent.getByLabelText('Places');
      const thingsCheckbox = fieldRefinementsComponent.getByLabelText('Things');
      expect(animalsCheckbox).toBeDefined();
      expect(peopleCheckbox).toBeDefined();
      expect(placesCheckbox).toBeDefined();
      expect(thingsCheckbox).toBeDefined();
    });

    test('checkboxes are unchecked when initially rendered', () => {
      const { fieldRefinementsComponent } = setup('');
      const animalsCheckbox = fieldRefinementsComponent.getByLabelText('Animals');
      expect(animalsCheckbox['defaultChecked']).toEqual(false);
      expect(animalsCheckbox['checked']).toEqual(false);
    });

    test('checkboxes can be checked and checkbox is not disabled', () => {
      const { fieldRefinementsComponent } = setup('');
      const animalsCheckbox = fieldRefinementsComponent.getByLabelText('Animals');
      expect(animalsCheckbox['checked']).toEqual(false);
      fireEvent.click(animalsCheckbox);
      expect(animalsCheckbox['checked']).toEqual(true);
    });
  });

  describe('checkboxes apply filters', () => {
    test('it adds correct filter when one checkbox within single refinement is checked', () => {
      const { fieldRefinementsComponent, onUpdateQueryOptionsMock } = setup('');
      const animalsCheckbox = fieldRefinementsComponent.getByLabelText('Animals');
      onUpdateQueryOptionsMock.mockReset();
      fireEvent.click(animalsCheckbox);
      expect(onUpdateQueryOptionsMock).toBeCalledTimes(1);
      expect(onUpdateQueryOptionsMock).toBeCalledWith({
        filter: 'subject:Animals',
        offset: 0
      });
    });

    test('it adds correct filters when second checkbox within single refinement is checked', () => {
      const { fieldRefinementsComponent, onUpdateQueryOptionsMock } = setup('subject:Animals');
      const peopleCheckbox = fieldRefinementsComponent.getByLabelText('People');
      onUpdateQueryOptionsMock.mockReset();
      fireEvent.click(peopleCheckbox);
      expect(onUpdateQueryOptionsMock).toBeCalledTimes(1);
      expect(onUpdateQueryOptionsMock).toBeCalledWith({
        filter: 'subject:Animals|People',
        offset: 0
      });
    });

    test('it adds correct filter when checkboxes from multiple refinements are checked', () => {
      const { fieldRefinementsComponent, onUpdateQueryOptionsMock } = setup('subject:Animals');
      const newsStaffCheckbox = fieldRefinementsComponent.getByLabelText('News Staff');
      onUpdateQueryOptionsMock.mockReset();
      fireEvent.click(newsStaffCheckbox);
      expect(onUpdateQueryOptionsMock).toBeCalledTimes(1);
      expect(onUpdateQueryOptionsMock).toBeCalledWith({
        filter: 'author:News Staff,subject:Animals',
        offset: 0
      });
    });
  });

  describe('checkboxes remove filters', () => {
    test('it removes correct filter when checkbox within single refinement is unchecked', () => {
      const { fieldRefinementsComponent, onUpdateQueryOptionsMock } = setup('subject:Animals');
      const animalsCheckbox = fieldRefinementsComponent.getByLabelText('Animals');
      fireEvent.click(animalsCheckbox);
      // For the test, have to check the checkbox twice to get it in the 'checked' state to uncheck
      onUpdateQueryOptionsMock.mockReset();
      fireEvent.click(animalsCheckbox);
      expect(onUpdateQueryOptionsMock).toBeCalledTimes(1);
      expect(onUpdateQueryOptionsMock).toBeCalledWith({
        filter: '',
        offset: 0
      });
    });
  });
});
