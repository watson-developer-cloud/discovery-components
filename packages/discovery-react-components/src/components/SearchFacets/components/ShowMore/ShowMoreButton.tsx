import React, { FC } from 'react';
import { Button } from 'carbon-components-react';
import { Messages } from 'components/SearchFacets/messages';

interface ShowMoreButtonProps {
  /**
   * onClick handler to call for the Show more button
   */
  onClick: () => void;
  /**
   * Suffix to use for the button's data-testid
   */
  idSuffix: string;
  /**
   * If the button is expanded to show more or collapsed
   */
  isCollapsed: boolean;
  /**
   * If the button text will be for opening a modal or expanding the list
   */
  isShowAllMessage: boolean;
  /**
   * i18n messages for the component
   */
  messages: Messages;
}

export const ShowMoreButton: FC<ShowMoreButtonProps> = ({
  onClick,
  idSuffix,
  isCollapsed,
  isShowAllMessage,
  messages
}) => {
  const showMessage = () => {
    console.log('sohw message');
    if (isShowAllMessage) {
      return messages.collapsedFacetShowAllText;
    } else if (isCollapsed) {
      return messages.collapsedFacetShowMoreText;
    }
    return messages.collapsedFacetShowLessText;
  };

  return (
    <Button kind="ghost" size="small" onClick={onClick} data-testid={`show-more-less-${idSuffix}`}>
      {showMessage()}
    </Button>
  );
};
