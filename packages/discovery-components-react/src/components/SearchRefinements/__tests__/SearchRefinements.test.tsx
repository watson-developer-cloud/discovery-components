import * as React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { SearchRefinements } from '../SearchRefinements';
import refinementsQueryResponse from '../fixtures/refinementsQueryResponse';

const setup = () => {
  const searchRefinementsComponent = render(
    <SearchRefinements queryResponse={refinementsQueryResponse} />
  );
  return {
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
      const kittensCheckbox = searchRefinementsComponent.getByLabelText('kittens');
      const puppiesCheckbox = searchRefinementsComponent.getByLabelText('puppies');
      const pandasCheckbox = searchRefinementsComponent.getByLabelText('pandas');
      const tigersCheckbox = searchRefinementsComponent.getByLabelText('tigers');
      const elephantsCheckbox = searchRefinementsComponent.getByLabelText('elephants');
      expect(kittensCheckbox).toBeDefined();
      expect(puppiesCheckbox).toBeDefined();
      expect(pandasCheckbox).toBeDefined();
      expect(tigersCheckbox).toBeDefined();
      expect(elephantsCheckbox).toBeDefined();
    });

    test('checkboxes are unchecked when initially rendered', () => {
      const { searchRefinementsComponent } = setup();
      const kittensCheckbox = searchRefinementsComponent.getByLabelText('kittens');
      expect(kittensCheckbox['defaultChecked']).toEqual(false);
      expect(kittensCheckbox['checked']).toEqual(false);
    });

    test('checkboxes can be checked and checkbox is not disabled', () => {
      const { searchRefinementsComponent } = setup();
      const kittensCheckbox = searchRefinementsComponent.getByLabelText('kittens');
      expect(kittensCheckbox['checked']).toEqual(false);
      fireEvent.click(kittensCheckbox);
      expect(kittensCheckbox['checked']).toEqual(true);
    });
  });
});
