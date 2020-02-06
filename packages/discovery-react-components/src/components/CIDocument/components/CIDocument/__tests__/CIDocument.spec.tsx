import React from 'react';
import {
  render,
  act,
  fireEvent,
  waitForElement,
  getByText as globalGetByText,
  getByLabelText as globalGetByLabelText,
  BoundFunction,
  GetAllBy,
  GetByText,
  FindByText,
  QueryByText
} from '@testing-library/react';
import 'utils/test/createRange.mock';
import CIDocument from '../CIDocument';
import purchaseOrder from '../__fixtures__/po-index_op.json';
import invoice from '../__fixtures__/invoice-index_op.json';
import shortContract from '../__fixtures__/shortenedContract.json';

describe('<CIDocument />', () => {
  let getAllByRole: BoundFunction<GetAllBy<any[]>>,
    getByTestId: BoundFunction<GetByText>,
    getByText: BoundFunction<GetByText>,
    findByText: BoundFunction<FindByText>,
    findByTitle: BoundFunction<FindByText>,
    findByTestId: BoundFunction<FindByText>,
    queryByTitle: BoundFunction<QueryByText>;

  describe('Invoice Document', () => {
    beforeEach(() => {
      act(() => {
        ({ getAllByRole, getByTestId, getByText, findByText, findByTitle, queryByTitle } = render(
          <CIDocument document={invoice} overrideDocWidth={400} overrideDocHeight={600} />
        ));
      });
    });

    it('loads correct document', async () => {
      // check for (partial) document text
      await findByText('New Zealand - BOC New Zealand Ltd - Weekly - Service Fee Per Employee', {
        exact: false
      });
      // check for file name
      getByText('invoice.pdf');
      // check for a filter name
      const filters = getByTestId('Filters');
      globalGetByText(filters, 'Currency');
    });

    it('selects Relations and checks details panel', async () => {
      const tabButton = await waitForElement(() => {
        const tabs = getByTestId('document-info-tabs');
        return globalGetByText(tabs, 'Relations');
      });
      fireEvent.click(tabButton);

      const filterSet = await waitForElement(() => {
        const filters = getByTestId('Filters');
        return globalGetByLabelText(filters, 'Invoice parts(5)');
      });
      fireEvent.click(filterSet);

      const detailsPane = getByTestId('details-pane');
      globalGetByText(detailsPane, 'Invoice parts');
      globalGetByText(detailsPane, 'Part description');
    });
  });

  describe('Purchase Order', () => {
    beforeEach(() => {
      act(() => {
        ({ getAllByRole, getByTestId, getByText, findByText, findByTitle } = render(
          <CIDocument document={purchaseOrder} overrideDocWidth={400} overrideDocHeight={600} />
        ));
      });
    });

    it('loads correct document', async () => {
      // check for (partial) document text
      await findByText('Line Price in EUR', { exact: false });
      // check for file name
      getByText('purchase_orders.pdf');
      // check for a filter name
      const filters = getByTestId('Filters');
      globalGetByText(filters, 'Currency');
    });

    it('filters and navigates forward through the list of elements', async () => {
      const filterCheckbox = await waitForElement(() => {
        const filters = getByTestId('Filters');
        return globalGetByLabelText(filters, 'Currency(2)');
      });
      fireEvent.click(filterCheckbox);

      const nextButton = await findByTitle('Next', { selector: 'button' });

      const nav = getAllByRole('navigation')[0];
      globalGetByText(nav, '1 / 2');

      fireEvent.click(nextButton);
      globalGetByText(nav, '2 / 2');

      fireEvent.click(nextButton);
      globalGetByText(nav, '1 / 2');
    });

    it('filters and navigates backward through the list of elements', async () => {
      const filterCheckbox = await waitForElement(() => {
        const filters = getByTestId('Filters');
        return globalGetByLabelText(filters, 'Currency(2)');
      });
      fireEvent.click(filterCheckbox);

      const previousButton = await findByTitle('Previous', { selector: 'button' });

      const nav = getAllByRole('navigation')[0];
      globalGetByText(nav, '1 / 2');

      fireEvent.click(previousButton);
      globalGetByText(nav, '2 / 2');

      fireEvent.click(previousButton);
      globalGetByText(nav, '1 / 2');
    });

    it('selects a filter and then resets filters', async () => {
      const filterCheckbox = await waitForElement(() => {
        const filters = getByTestId('Filters');
        return globalGetByLabelText(filters, 'Suppliers(1)');
      });
      fireEvent.click(filterCheckbox);

      const filters = getByTestId('Filters');
      const resetButton = globalGetByText(filters, 'Reset filters');
      fireEvent.click(resetButton);

      // Navigation should be disabled now
      expect(queryByTitle('Next', { selector: 'button' })).toBeNull();
    });
  });

  // Uses a shorter version of the contract.json file as larger files will cause long test times
  describe('Contract', () => {
    beforeEach(() => {
      act(() => {
        ({ getAllByRole, getByTestId, getByText, findByText, findByTitle, findByTestId } = render(
          <CIDocument document={shortContract} overrideDocWidth={400} overrideDocHeight={600} />
        ));
      });
    });

    it('loads correct document', async () => {
      // check for (partial) document text
      await findByText('On 22 December 2008 ART EFFECTS LIMITED and Customer', { exact: false });
      // check for file name
      getByText('Art Effects Koya Creative Base TSA 2008.pdf');
      // check for a filter name
      const filters = getByTestId('Filters');
      globalGetByText(filters, 'Intellectual Property');
    });

    it('correctly filters contract elements', async () => {
      const filters = await findByTestId('Filters');

      const categoryCheckbox = globalGetByLabelText(filters, 'Intellectual Property(1)');
      fireEvent.click(categoryCheckbox);

      const natureCheckbox = globalGetByLabelText(filters, 'Definition(1)');
      fireEvent.click(natureCheckbox);

      const partyCheckbox = globalGetByLabelText(filters, 'None(1)');
      fireEvent.click(partyCheckbox);

      const attributeCheckbox = globalGetByLabelText(filters, 'DefinedTerm(1)');
      fireEvent.click(attributeCheckbox);

      // unselect filter
      fireEvent.click(categoryCheckbox);
      // other filter should reflect changes
      globalGetByLabelText(filters, 'DefinedTerm(26)');
    });
  });
});
