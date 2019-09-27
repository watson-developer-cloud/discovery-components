import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { SearchContextIFC } from '../../DiscoverySearch/DiscoverySearch';
import DiscoveryV1 from 'ibm-watson/discovery/v1';

import { wrapWithContext } from '../../../utils/testingUtils';
import { SearchResults } from '../SearchResults';

const context: Partial<SearchContextIFC> = {
  searchResults: {
    matching_results: 1,
    results: []
  }
};

describe('<Result />', () => {
  describe('when clicked', () => {
    test('will call onSelectResult with result as a parameter', () => {
      const mockResult = {
        document_id: 'some document_id',
        extracted_metadata: {
          filename: 'some file name',
          title: 'some title'
        }
      };
      const mockselectResult = jest.fn();
      context.onSelectResult = mockselectResult;
      (context.searchResults as DiscoveryV1.QueryResponse).results = [mockResult];
      const { getByText } = render(wrapWithContext(<SearchResults />, context));
      fireEvent.click(getByText('preview'));
      expect(mockselectResult.mock.calls.length).toBe(1);
      expect(mockselectResult.mock.calls[0][0]).toBe(mockResult);
    });
  });

  describe('when the result prop has a title and filename property', () => {
    test('we display both', () => {
      (context.searchResults as DiscoveryV1.QueryResponse).results = [
        {
          document_id: 'some document_id',
          extracted_metadata: {
            filename: 'some file name',
            title: 'some title'
          }
        }
      ];

      const { getByText } = render(wrapWithContext(<SearchResults />, context));
      expect(getByText('some file name')).toBeInTheDocument();
      expect(getByText('some title')).toBeInTheDocument();
    });
  });

  describe('when the result prop has a title but no filename property', () => {
    test('we display title and document_id', () => {
      (context.searchResults as DiscoveryV1.QueryResponse).results = [
        {
          document_id: 'some document_id',
          extracted_metadata: {
            title: 'some title'
          }
        }
      ];

      const { getByText } = render(wrapWithContext(<SearchResults />, context));
      expect(getByText('some title')).toBeInTheDocument();
      expect(getByText('some document_id')).toBeInTheDocument();
    });
  });

  describe('when the result prop has a filename but no title property', () => {
    test('we display filename and document_id', () => {
      (context.searchResults as DiscoveryV1.QueryResponse).results = [
        {
          document_id: 'some document_id',
          extracted_metadata: {
            filename: 'some file name'
          }
        }
      ];
      const { getByText } = render(wrapWithContext(<SearchResults />, context));
      expect(getByText('some file name')).toBeInTheDocument();
      expect(getByText('some document_id')).toBeInTheDocument();
    });
  });

  describe('when the result prop has no filename or title property', () => {
    test('we display the document_id once', () => {
      (context.searchResults as DiscoveryV1.QueryResponse).results = [
        {
          document_id: 'some document_id',
          extracted_metadata: {
            filename: 'some title'
          }
        }
      ];
      const { getByText } = render(wrapWithContext(<SearchResults />, context));
      expect(getByText('some document_id')).toBeInTheDocument();
    });
  });
});
