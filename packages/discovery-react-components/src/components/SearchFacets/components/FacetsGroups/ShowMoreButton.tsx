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
   * i18n messages for the component
   */
  messages: Messages;
}

export const ShowMoreButton: FC<ShowMoreButtonProps> = ({
  onClick,
  idSuffix,
  isCollapsed,
  messages
}) => {
  return (
    <Button kind="ghost" size="small" onClick={onClick} data-testid={`show-more-less-${idSuffix}`}>
      {isCollapsed ? messages.collapsedFacetShowMoreText : messages.collapsedFacetShowLessText}
    </Button>
  );
};
