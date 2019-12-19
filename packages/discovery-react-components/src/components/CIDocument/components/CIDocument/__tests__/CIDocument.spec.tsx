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
  FindByText
} from '@testing-library/react';
import 'components/CIDocument/utils/test/createRange.mock';
import CIDocument from '../CIDocument';
import contract from '../__fixtures__/contract.json';

describe('<CIDocument />', () => {
  let getAllByRole: BoundFunction<GetAllBy<any[]>>,
    getByTestId: BoundFunction<GetByText>,
    getByText: BoundFunction<GetByText>,
    getByTitle: BoundFunction<GetByText>,
    findByText: BoundFunction<FindByText>;

  beforeEach(() => {
    act(() => {
      ({ getAllByRole, getByTestId, getByText, getByTitle, findByText } = render(
        <CIDocument document={contract} overrideDocWidth={400} overrideDocHeight={600} />
      ));
    });
  });

  it('filters and navigates forward through the list of elements', async () => {
    const filterCheckbox = await waitForElement(() => {
      const filters = getByTestId('Filters');
      return globalGetByLabelText(filters, 'Confidentiality(16)');
    });
    fireEvent.click(filterCheckbox);

    const nextButton = getByTitle('Next', { selector: 'button' });

    const nav = getAllByRole('navigation')[0];
    globalGetByText(nav, '1 / 16');

    fireEvent.click(nextButton);
    globalGetByText(nav, '2 / 16');

    fireEvent.click(nextButton);
    globalGetByText(nav, '3 / 16');
  });

  it('filters and navigates backward through the list of elements', async () => {
    const filterCheckbox = await waitForElement(() => {
      const filters = getByTestId('Filters');
      return globalGetByLabelText(filters, 'Communication(96)');
    });
    fireEvent.click(filterCheckbox);

    const previousButton = getByTitle('Previous', { selector: 'button' });

    const nav = getAllByRole('navigation')[0];
    globalGetByText(nav, '1 / 96');

    fireEvent.click(previousButton);
    globalGetByText(nav, '96 / 96');

    fireEvent.click(previousButton);
    globalGetByText(nav, '95 / 96');
  });

  it('renders without crashing', async () => {
    // check for (partial) document text
    findByText('On 22 December 2008 ART EFFECTS LIMITED and Customer', { exact: false });
    // check for file name
    getByText('Art Effects Koya Creative Base TSA 2008.pdf');
    // check for a filter name
    const filters = getByTestId('Filters');
    globalGetByText(filters, 'Amendments');
  });
});
