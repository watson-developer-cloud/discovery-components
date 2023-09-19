import React from 'react';
import {
  screen,
  render,
  fireEvent,
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
import { defineDOMRect, removeDOMRect } from 'setupTestsUtil';

beforeAll(() => {
  defineDOMRect();
});
afterAll(() => {
  removeDOMRect();
});

describe('<CIDocument />', () => {
  describe('Invoice Document', () => {
    let getByTestId: BoundFunction<GetByText>,
      getByText: BoundFunction<GetByText>,
      findByText: BoundFunction<FindByText>,
      findByTestId: BoundFunction<FindByText>,
      queryByTestId: BoundFunction<QueryByText>;

    beforeEach(async () => {
      ({ getByTestId, getByText, findByText, findByTestId, queryByTestId } = render(
        <CIDocument document={invoice} overrideDocWidth={400} overrideDocHeight={600} />
      ));
      // wait for component to finish rendering (prevent "act" warning)
      await screen.findByText('invoice.pdf');
    });

    it('loads correct document', async () => {
      // check for (partial) document text
      await findByText('New Zealand - BOC New Zealand Ltd - Weekly - Service Fee Per Employee', {
        exact: false
      });
      // check for file name
      getByText('invoice.pdf');
      // check for a filter name
      const filters = getByTestId('CIDocument_filterPanel');
      globalGetByText(filters, 'Currency');
    });

    it('loads the correct tabs and pane sections titles', async () => {
      // Attribute and Relations tabs exist
      const attributesTab = getByTestId('attributes-tab');
      const relationsTab = getByTestId('relations-tab');
      expect(attributesTab.textContent).toEqual('Attributes');
      expect(relationsTab.textContent).toEqual('Relations');
      expect(queryByTestId('filters-tab')).toBeNull();
      expect(queryByTestId('metadata-tab')).toBeNull();

      // If an attribute is selected, DetailsPane type value is the same as the selected attribute
      const filters = await findByTestId('CIDocument_filterPanel');
      const currencyButton = globalGetByLabelText(filters, 'Currency(2)');
      fireEvent.click(currencyButton);

      const detailsPane = getByTestId('details-pane');
      expect(detailsPane.textContent).toContain('Currency');
    });

    it('displays the correct relations information on the details pane', async () => {
      const relationsTab = getByTestId('relations-tab');
      fireEvent.click(relationsTab);

      const filters = await findByTestId('CIDocument_filterPanel');
      const invoiceButton = globalGetByLabelText(filters, 'Invoice parts(5)');
      fireEvent.click(invoiceButton);

      const detailsPaneType = getByTestId('details-pane-type');
      const detailsPaneAttributes = getByTestId('details-pane-attributes');
      expect(detailsPaneType.textContent).toContain('Invoice parts');
      expect(detailsPaneAttributes.textContent).toContain(
        'New Zealand - BOC New Zealand Ltd - Weekly - Service Fee Per Employee'
      );
    });
  });

  describe('Purchase Order', () => {
    let getAllByRole: BoundFunction<GetAllBy<any[]>>,
      getByTestId: BoundFunction<GetByText>,
      getByText: BoundFunction<GetByText>,
      findByText: BoundFunction<FindByText>,
      findByTitle: BoundFunction<FindByText>,
      queryByTitle: BoundFunction<QueryByText>;

    beforeEach(async () => {
      ({ getAllByRole, getByTestId, getByText, findByText, findByTitle, queryByTitle } = render(
        <CIDocument document={purchaseOrder} overrideDocWidth={400} overrideDocHeight={600} />
      ));
      // wait for component to finish rendering (prevent "act" warning)
      await screen.findByText('purchase_orders.pdf');
    });

    it('loads correct document', async () => {
      // check for (partial) document text
      await findByText('Line Price in EUR', { exact: false });
      // check for file name
      getByText('purchase_orders.pdf');
      // check for a filter name
      const filters = getByTestId('CIDocument_filterPanel');
      globalGetByText(filters, 'Currency');
    });

    it('filters and navigates forward through the list of elements', async () => {
      const filters = await screen.findByTestId('CIDocument_filterPanel');
      const filterCheckbox = globalGetByLabelText(filters, 'Currency(2)');
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
      const filters = await screen.findByTestId('CIDocument_filterPanel');
      const filterCheckbox = globalGetByLabelText(filters, 'Currency(2)');
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
      const filters = await screen.findByTestId('CIDocument_filterPanel');
      const filterCheckbox = globalGetByLabelText(filters, 'Suppliers(1)');
      fireEvent.click(filterCheckbox);

      const filters2 = getByTestId('CIDocument_filterPanel');
      const resetButton = globalGetByText(filters2, 'Reset filters');
      fireEvent.click(resetButton);

      // Navigation should be disabled now
      expect(queryByTitle('Next', { selector: 'button' })).toBeNull();
    });
  });

  // Uses a shorter version of the contract.json file as larger files will cause long test times
  describe('Contract', () => {
    let getByTestId: BoundFunction<GetByText>,
      getByText: BoundFunction<GetByText>,
      findByText: BoundFunction<FindByText>,
      findByTestId: BoundFunction<FindByText>,
      queryByTestId: BoundFunction<QueryByText>;

    beforeEach(async () => {
      ({ getByTestId, getByText, findByText, findByTestId, queryByTestId } = render(
        <CIDocument document={shortContract} overrideDocWidth={400} overrideDocHeight={1200} />
      ));
      // wait for component to finish rendering (prevent "act" warning)
      await screen.findByText('Art Effects Koya Creative Base TSA 2008.pdf');
    });

    it('loads correct document', async () => {
      // check for (partial) document text
      await findByText('On 22 December 2008 ART EFFECTS LIMITED and Customer', { exact: false });
      // check for file name
      getByText('Art Effects Koya Creative Base TSA 2008.pdf');
      // check for a filter name
      const filters = getByTestId('CIDocument_filterPanel');
      globalGetByText(filters, 'Intellectual Property');
    });

    it('loads the correct tabs and pane sections titles', async () => {
      // Filters and Metadata tabs exist
      const filterTab = getByTestId('filters-tab');
      const metadataTab = getByTestId('metadata-tab');
      expect(filterTab.textContent).toEqual('Filters');
      expect(metadataTab.textContent).toEqual('Metadata');
      expect(queryByTestId('attributes-tab')).toBeNull();
      expect(queryByTestId('relations-tab')).toBeNull();

      // Once a filter is selected, DetailsPane has Categories, Types, and Attributes sections
      const filters = await findByTestId('CIDocument_filterPanel');
      const categoryCheckbox = globalGetByLabelText(filters, 'Intellectual Property(1)');
      fireEvent.click(categoryCheckbox);

      const detailsCategories = getByTestId('details-pane-categories');
      const detailsTypes = getByTestId('details-pane-types');
      const detailsAttributes = getByTestId('details-pane-attributes');
      expect(detailsCategories.textContent).toContain('Intellectual Property');
      expect(detailsTypes.textContent).toContain('Nature: Definition, Party: None');
      expect(detailsAttributes.textContent).toContain('DefinedTerm (1)');
    });

    it('displays the correct party information on the details pane', async () => {
      // Expects metadata pane to be hidden until selected
      const metadataPane = getByTestId('metadata-pane').parentElement!;
      expect(metadataPane).toHaveProperty('hidden', true);

      const metadataTabTest = getByTestId('metadata-tab');
      fireEvent.click(metadataTabTest);
      expect(metadataPane).toHaveProperty('hidden', false);

      const partyButton = globalGetByText(metadataPane, 'ART EFFECTS (Buyer) (2)');
      fireEvent.click(partyButton);

      const detailsPaneParty = getByTestId('details-pane-party');
      expect(detailsPaneParty.textContent).toContain('Party');
    });

    it('correctly filters contract elements', async () => {
      const filters = await findByTestId('CIDocument_filterPanel');

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
      globalGetByLabelText(filters, 'DefinedTerm(22)');
    });
  });
});
