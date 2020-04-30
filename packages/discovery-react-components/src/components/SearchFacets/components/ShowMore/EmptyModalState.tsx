import React, { FC } from 'react';
import { Messages } from 'components/SearchFacets/messages';

interface EmptyModalStateProps {
  /**
   * i18n messages for the component
   */
  messages: Messages;
}
export const EmptyModalState: FC<EmptyModalStateProps> = ({ messages }) => {
  return <p>{messages.emptyModalSearch}</p>;
};
