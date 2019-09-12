/**
 * @class ExampleComponent
 */

import * as React from 'react';
import styles from './styles.css';
import { Search } from 'carbon-components-react';

interface Props {
  /**
   * The type of input (optional)
   */
  type: string;
  /**
   * True to use small variant of Search
   */
  small: boolean;
  /**
   * Placeholder text for the SearchInput
   */
  placeHolderText: string;
  /**
   * Function to run when the SearchInput changes
   */
  onChange: (event: React.KeyboardEvent) => void;
  /**
   * className to style SearchInput
   */
  className: string;
  /**
   * Label text for the SearchInput
   */
  labelText: React.ReactNode;
  /**
   * True to use the light theme
   */
  light: boolean;
  /**
   * A custom id for the SearchInput
   */
  id: string;
  /**
   * Label text for the close button
   */
  closeButtonLabelText: string;
  /**
   * Set the default value of the query in SearchInput
   */
  defaultValue: string | number;
  /**
   * Hides the magnifying glass icon in the search bar
   */
  hideSearchIcon: boolean;
  /**
   * Hides the clear search text icon in the search bar
   */
  hideClearIcon: boolean;
}

interface State {
  query: string;
}

export class SearchInput extends React.Component<Props, State> {
  static defaultProps = {
    className: '',
    placeholder: '',
    hideSearchIcon: false,
    hideClearIcon: false
  };

  state = {
    query: ''
  };

  render() {
    const {
      type,
      small,
      placeHolderText,
      onChange,
      className,
      labelText,
      light,
      id,
      closeButtonLabelText,
      defaultValue
    } = this.props;

    const { query } = this.state;

    return (
      <Search
        type={type}
        small={small}
        placeHolderText={placeHolderText}
        onChange={onChange}
        className={className}
        labelText={labelText}
        light={light}
        id={id}
        closeButtonLabelText={closeButtonLabelText}
        defaultValue={defaultValue}
        value={query}
      />
    );
  }
}

export default SearchInput;
