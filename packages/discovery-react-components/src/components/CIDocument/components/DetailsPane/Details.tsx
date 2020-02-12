import React, { FC, ReactElement } from 'react';
import capitalize from 'lodash/capitalize';
import cx from 'classnames';
import { Link } from 'carbon-components-react';
import { documentDisplayNames } from 'components/CIDocument//utils/documentDisplayNames';
import { Item, ItemLink, ItemLabel, OnActiveLinkChangeFn } from './types';
import { defaultMessages, Messages } from './messages';

interface DetailsProps {
  title: string;
  items: Item[];
  selectedLink?: string;
  messages?: Messages;
  onClick: OnActiveLinkChangeFn;
}

const Details: FC<DetailsProps> = ({
  title,
  items,
  selectedLink,
  messages = defaultMessages,
  onClick
}) => {
  const renderItems = (): ReactElement => {
    return (
      <ul>
        {items.map(item =>
          (item as ItemLink).link === true
            ? renderLinks(item as ItemLink, onClick, selectedLink, title)
            : renderContent(item as string | ItemLabel)
        )}
      </ul>
    );
  };

  return (
    <div className="section" data-testid={'details-pane-' + title}>
      <h3 className="sectionHeader">{capitalize(title)}</h3>
      {items && items.length > 0 ? renderItems() : messages.noneLabel}
    </div>
  );
};

function renderLinks(
  { type, label, value }: ItemLink,
  onClick: OnActiveLinkChangeFn,
  selectedLink: string | undefined,
  sectionTitle: string
): ReactElement {
  return (
    <li key={type} className="content">
      {value && <div className="display-name">{documentDisplayNames[type]}</div>}
      <Link
        className={cx({ selected: selectedLink === type })}
        href="#"
        onClick={(evt: MouseEvent): void => {
          evt.preventDefault();
          onClick({ sectionTitle, type });
        }}
      >
        {value && value.label ? value.label : label}
      </Link>
    </li>
  );
}

function renderContent(item: string | ItemLabel): ReactElement {
  return (
    <li className="content" key={(item as ItemLabel).label || (item as string)}>
      {renderText(item)}
    </li>
  );
}

function renderText(item: string | ItemLabel): string | undefined {
  if ((item as ItemLabel).label) {
    return (item as ItemLabel).label;
  }
  return documentDisplayNames[item as string] || item;
}

export default Details;
