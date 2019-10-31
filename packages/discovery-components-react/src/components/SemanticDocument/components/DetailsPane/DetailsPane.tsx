import React, { FC } from 'react';
import { settings } from 'carbon-components';
import { Items, OnActiveLinkChangeFn } from './types';
import Details from './Details';

const base = `${settings.prefix}--semantic-doc-details`;

interface DetailsPaneProps {
  items: Items[];
  selectedLink?: string;
  detailsTitle?: string;
  noneSelectedMessage?: string;
  onActiveLinkChange: OnActiveLinkChangeFn;
}

const DetailsPane: FC<DetailsPaneProps> = ({
  items,
  selectedLink,
  detailsTitle = 'Details',
  noneSelectedMessage = 'Nothing selected',
  onActiveLinkChange
}) => {
  return (
    <div className={base}>
      <h2 className="title">{detailsTitle}</h2>
      {items.length > 0 ? (
        items.map(({ heading, items }) => (
          <Details
            title={heading}
            items={items}
            onClick={onActiveLinkChange}
            key={heading}
            selectedLink={selectedLink}
          />
        ))
      ) : (
        <span className="nothingSelected">{noneSelectedMessage}</span>
      )}
    </div>
  );
};

export default DetailsPane;
