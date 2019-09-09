/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/**
 * @class ExampleComponent
 */

import * as React from 'react';
import styles from './styles.css';
import querySuggestions from './suggestions';

// Currently only the placholder description is show by addon-info. The
// nested descriptions under suggestions are squashed since the addon doesn't
// expand shape types.
// https://github.com/storybookjs/storybook/issues/3493
interface Props {
  /**
   * Placeholder text for the input
   */
  placeholder: string;
  suggestions: {
    /**
     * Show suggestions
     */
    enabled: boolean;

    /**
     * Limit number of suggestions shown
     */
    limit: number;
  };
  /**
   * Query submit callback
   */
  querySubmit: () => void;
}

interface State {
  query: string;
}

export class ExampleComponent extends React.Component<Props, State> {
  static defaultProps = {
    placeholder: 'Check this out',
    suggestions: {
      enabled: true,
      limit: 5
    },
    querySubmit: () => alert('Query submitted')
  };

  state = {
    query: ''
  };

  updateQueryString = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ query: evt.target.value });
  };

  render() {
    const {
      placeholder,
      suggestions: { enabled, limit },
      querySubmit
    } = this.props;

    return (
      <div className={styles.test}>
        <input type="text" placeholder={placeholder} onChange={this.updateQueryString} />
        <button onClick={querySubmit}>Submit Query</button>
        {!!enabled && this.state.query.length > 0 && (
          <div>
            {querySuggestions
              .filter(suggestion => suggestion.startsWith(this.state.query))
              .slice(0, limit)
              .map(suggestion => (
                <div key={suggestion}>{suggestion}</div>
              ))}
          </div>
        )}
      </div>
    );
  }
}

export default ExampleComponent;
