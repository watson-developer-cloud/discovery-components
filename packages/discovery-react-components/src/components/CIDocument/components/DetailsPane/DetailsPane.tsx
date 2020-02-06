import React, { FC } from 'react';
import { settings } from 'carbon-components';
import { Items, OnActiveLinkChangeFn } from './types';
import Details from './Details';
import { defaultMessages, Messages } from './messages';

const base = `${settings.prefix}--ci-doc-details`;

interface DetailsPaneProps {
  items: Items[];
  selectedLink?: string;
  messages?: Messages;
  onActiveLinkChange: OnActiveLinkChangeFn;
}

const DetailsPane: FC<DetailsPaneProps> = ({
  items,
  selectedLink,
  messages = defaultMessages,
  onActiveLinkChange
}) => {
  return (
    <div className={base} data-testid="details-pane">
      <h2 className="title" id="documentDetailsId">
        {messages.detailsTitle}
      </h2>
      {items.length > 0 ? (
        items.map(({ heading, items }) => (
          <Details
            title={heading}
            items={items}
            onClick={onActiveLinkChange}
            key={heading}
            selectedLink={selectedLink}
            messages={messages}
          />
        ))
      ) : (
        <div className="nothingSelected">{messages.noneSelectedMessage}</div>
      )}
    </div>
  );
};

export default DetailsPane;
