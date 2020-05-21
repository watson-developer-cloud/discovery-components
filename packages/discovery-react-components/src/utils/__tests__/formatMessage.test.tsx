import React from 'react';
import { render } from '@testing-library/react';
import { formatMessage } from '../formatMessage';

describe('formatMessage util', () => {
  test('correctly formats a message when provided with a message and elements to interpolate', () => {
    const messageToFormat = 'Format me with a {button} and a {link}';
    const button = <button>I am button</button>;
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    const link = <a>I am link</a>;
    const formattedMessage = render(
      <div>{formatMessage(messageToFormat, { button: button, link: link })}</div>
    );
    const buttonMatch = formattedMessage.getByText('I am button');
    const linkMatch = formattedMessage.getByText('I am link');
    const messageOneMatch = formattedMessage.getByText('Format me with a');
    const messageTwoMatch = formattedMessage.getByText('and a');
    expect(buttonMatch).toBeDefined();
    expect(linkMatch).toBeDefined();
    expect(messageOneMatch).toBeDefined();
    expect(messageTwoMatch).toBeDefined();
  });
});
