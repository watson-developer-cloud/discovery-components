/* eslint-disable @typescript-eslint/no-use-before-define */
import React, {
  FC,
  useEffect,
  useReducer,
  useState,
  Reducer,
  ReactElement,
  SetStateAction,
  Dispatch
} from 'react';
import { settings } from 'carbon-components';
import { Tab, Tabs } from 'carbon-components-react';
import { QueryResult } from 'ibm-watson/discovery/v2';
import get from 'lodash/get';
import flattenDeep from 'lodash/flattenDeep';
import difference from 'lodash/difference';
import isEqual from 'lodash/isEqual';
import DetailsPane from '../DetailsPane/DetailsPane';
import FilterPanel from '../FilterPanel/FilterPanel';
import MetadataPane from '../MetadataPane/MetadataPane';
import NavigationToolbar from '../NavigationToolbar/NavigationToolbar';
import CIDocumentContent from '../CIDocumentContent/CIDocumentContent';
import { processDoc } from 'utils/document';
import { getEnrichmentName } from 'components/CIDocument/utils/enrichmentUtils';
import { getDetailsFromItem, getDetailsFromMetadata } from 'components/CIDocument/utils/details';
import { getFilterHelper, ProcessFilter } from 'components/CIDocument/utils/filterHelper';
import { isFilterEmpty, updateFilter } from 'components/CIDocument/utils/filterUtils';
import { getId, findElement, findElementIndex } from 'utils/document/idUtils';
import {
  hasRelation,
  isRelationObject,
  isInvoiceOrPurchaseOrder
} from 'utils/document/nonContractUtils';
import { withErrorBoundary, WithErrorBoundaryProps } from 'utils/hoc/withErrorBoundary';
import { Filter, FilterGroup, FilterChangeArgs } from '../FilterPanel/types';
import {
  Metadata,
  MetadataData,
  EnrichedHtml,
  Contract,
  Item,
  Field,
  Attributes,
  Relations
} from 'components/CIDocument/types';
import { Address, Mention } from '../MetadataPane/types';
import { Items } from '../DetailsPane/types';
import { defaultTheme, Theme } from 'utils/theme';
import {
  defaultMessages as detailsPaneDefaultMsgs,
  Messages as DetailsPaneMessages
} from '../DetailsPane/messages';
import {
  defaultMessages as filterPanelDefaultMsgs,
  Messages as FilterPanelMessages
} from '../FilterPanel/messages';
import {
  defaultMessages as metadataPaneDefaultMsgs,
  Messages as MetadataPaneMessages
} from '../MetadataPane/messages';
import {
  defaultMessages as navigationToolbarDefaultMsgs,
  Messages as NavigationToolbarMessages
} from '../NavigationToolbar/messages';
import {
  defaultMessages as CIDocumentDefaultMsgs,
  Messages as CIDocumentMessages
} from './messages';

export type Messages = DetailsPaneMessages &
  FilterPanelMessages &
  MetadataPaneMessages &
  NavigationToolbarMessages &
  CIDocumentMessages;

const defaultMessages = {
  ...detailsPaneDefaultMsgs,
  ...filterPanelDefaultMsgs,
  ...metadataPaneDefaultMsgs,
  ...navigationToolbarDefaultMsgs,
  ...CIDocumentDefaultMsgs
};

interface State {
  isError: boolean;
  styles: string[];
  sections: any[];
  itemMap: {
    byItem: any;
    bySection: any;
  };
  metadata: Metadata[];
  attributes: Attributes[];
  relations: Relations[];
}

enum ActionType {
  RESET = 'RESET',
  SET = 'SET',
  ERROR = 'ERROR'
}

interface Action {
  type: ActionType;
  data: any;
}

const INITIAL_STATE: State = {
  isError: false,
  styles: [],
  sections: [],
  itemMap: { byItem: {}, bySection: {} },
  metadata: [],
  attributes: [],
  relations: []
};

const RELATIONS = 'relations';
const ATTRIBUTES = 'attributes';
const FILTERS = 'filters';
const METADATA = 'metadata';
const contractTabs = [FILTERS, METADATA];
const nonContractTabs = [ATTRIBUTES, RELATIONS];

export function canRenderCIDocument(document: QueryResult): boolean {
  return (
    !!get(document, 'html') &&
    (!!get(document, 'enriched_html[0].contract') ||
      !!get(document, 'enriched_html[0].invoice') ||
      !!get(document, 'enriched_html[0].purchase_order'))
  );
}

const base = `${settings.prefix}--ci-doc`;

export interface CIDocumentProps extends WithErrorBoundaryProps {
  /**
   * Document data, as that returned by a query. Overrides result from SearchContext
   */
  document: QueryResult;
  /**
   * i18n messages for the component
   */
  messages?: Messages;
  /**
   * Color theme, for select areas which cannot be specified in CSS
   */
  theme?: Theme;
  /**
   * Override autosizing of document content with specified width. Useful for testing.
   */
  overrideDocWidth?: number;
  /**
   * Override autosizing of document content with specified height. Useful for testing.
   */
  overrideDocHeight?: number;
}

const CIDocument: FC<CIDocumentProps> = ({
  document,
  messages = defaultMessages,
  theme = defaultTheme,
  overrideDocWidth,
  overrideDocHeight,
  didCatch
}) => {
  const [state, dispatch] = useReducer<Reducer<State, Action>>(docStateReducer, INITIAL_STATE);

  const filename = get(document, 'extracted_metadata.filename', messages.defaultDocumentName);
  const documentId = get(document, 'document_id', messages.defaultDocumentId);
  const enrichedHtml: EnrichedHtml = get(document, ['enriched_html', '0'], {});
  const enrichmentName = getEnrichmentName(enrichedHtml);

  const [selectedType, setSelectedType] = useState(ATTRIBUTES);
  const [selectedContractFilter, setSelectedContractFilter] = useState(FILTERS);

  const enrichment = get(enrichedHtml, enrichmentName, {});
  const { elements = [], parties = [] }: Contract = enrichment;

  let itemList = elements;
  if (isInvoiceOrPurchaseOrder(enrichmentName)) {
    itemList = state[selectedType] || [];
  }

  const resetTabs = (): void => {
    setSelectedType(nonContractTabs[0]);
    setSelectedContractFilter(contractTabs[0]);
  };

  const resetStates = (): void => {
    setActivePartIds([]);
    setActiveIds([]);
    setHighlightedList([]);
    setCurrentFilter({});
    setActiveMetadataIds([]);
  };

  useEffect(() => {
    let didCancel = false;

    async function process(): Promise<void> {
      if (!didCancel) {
        try {
          const doc = await processDoc(document, { sections: true, itemMap: true });
          dispatch({
            type: ActionType.SET,
            data: {
              styles: doc.styles,
              sections: doc.sections,
              itemMap: doc.itemMap,
              metadata: doc.metadata,
              attributes: doc.attributes,
              relations: doc.relations
            }
          });
        } catch (err) {
          dispatch({ type: ActionType.ERROR, data: err });
        }
      }
    }

    resetStates();
    resetTabs();
    process();

    return (): void => {
      didCancel = true;
    };
  }, [didCatch, document]);

  const [filterHelper, setFilterHelper] = useState<ProcessFilter | null>(null);
  const [currentFilter, setCurrentFilter] = useState<Filter>({});
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([]);

  useEffect(() => {
    if (canRenderCIDocument(document) && !didCatch) {
      const helper = getFilterHelper({
        enrichmentName,
        itemList,
        messages: messages as Record<string, string>
      });
      setFilterHelper(helper);
      setCurrentFilter({});
      setFilterGroups(helper.processFilter({}).filterGroups);
    }
  }, [enrichmentName, document, itemList, messages, didCatch]);

  const [highlightedList, setHighlightedList] = useState<any[]>([]);

  useEffect(() => {
    if (filterHelper && !didCatch) {
      if (isFilterEmpty(currentFilter)) {
        setHighlightedList([]);
        setFilterGroups(filterHelper.processFilter(currentFilter).filterGroups);
      } else {
        const { filteredList, filterGroups: groups } = filterHelper.processFilter(currentFilter);
        setHighlightedList(filteredList);
        setFilterGroups(groups);
      }
    }
  }, [filterHelper, currentFilter, itemList, didCatch]);

  const [activeIds, setActiveIds] = useState<string[]>([]);
  useEffect(() => {
    if (highlightedList.length === 0) {
      setActiveIds([]);
      setActivePartIds([]);
    } else if (!findElement(highlightedList, activeIds)) {
      if (hasRelation(highlightedList)) {
        setActiveIds(highlightedList[0].allAttributeIds);
      } else {
        setActiveIds([getId(highlightedList[0])]);
      }
    }
    // This should only run when the list updates,
    // to set the active id to the first item in the list, as necessary
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightedList]);

  const [activePartIds, setActivePartIds] = useState<string[]>([]);
  useEffect(() => {
    setActivePartIds([]);
  }, [activeIds]);

  const [activeMetadataIds, setActiveMetadataIds] = useState<string[]>([]);
  useEffect(() => {
    setActiveIds([]);
    setActivePartIds([]);
  }, [activeMetadataIds]);

  // generate render variables from state
  const activeElement = getActiveElement(activeIds, itemList);
  let activeIndex = getActiveIndex(activeIds, highlightedList);
  let activeDetails = getActiveDetails(activeElement, getDetailsFromItem(enrichmentName));

  if (selectedContractFilter === METADATA) {
    activeIndex = getActiveIndex(activeMetadataIds, highlightedList);
    if (activeMetadataIds.length > 0 && !(activeIds && activeIds.length > 0)) {
      activeDetails = getDetailsFromMetadata(highlightedList[activeIndex]);
    }
  }

  let highlightedIds = [];
  if (hasRelation(highlightedList)) {
    highlightedIds = flattenDeep(highlightedList.map(item => item.allAttributeIds));
  } else {
    highlightedIds = highlightedList.map(getId) ? highlightedList.map(getId) : [];
  }

  const hasError = state.isError || didCatch;

  const renderSidebar = (): ReactElement => {
    const nonContractFilterGroups = filterGroups.filter(group => group.id === selectedType);

    const tabLabels = {
      attributes: messages.attributesTabLabel,
      relations: messages.relationsTabLabel,
      filters: messages.filtersTabLabel,
      metadata: messages.metadataTabLabel
    };

    return (
      <>
        {isInvoiceOrPurchaseOrder(enrichmentName) ? (
          <Tabs
            className={`${base}__tabs`}
            selected={nonContractTabs.indexOf(selectedType)}
            onSelectionChange={(index: number): void => setSelectedType(nonContractTabs[index])}
            aria-label={messages.filtersTabLabel}
            data-testid="document-info-tabs"
          >
            {nonContractTabs.map(tab => (
              <Tab tabIndex={0} label={tabLabels[tab]} key={tab} data-testid={tab + '-tab'}>
                {!hasError &&
                  tab === selectedType &&
                  renderFilterPanel(
                    currentFilter,
                    nonContractFilterGroups,
                    setCurrentFilter,
                    resetStates,
                    messages
                  )}
              </Tab>
            ))}
          </Tabs>
        ) : (
          <Tabs
            className={`${base}__tabs`}
            selected={contractTabs.indexOf(selectedContractFilter)}
            onSelectionChange={(index: number): void =>
              onSelectionChangeContractTabs(index, setSelectedContractFilter, resetStates)
            }
            aria-label={messages.filtersTabLabel}
            data-testid="document-info-tabs"
          >
            <Tab tabIndex={0} label={messages.filtersTabLabel} data-testid="filters-tab">
              {!hasError &&
                renderFilterPanel(
                  currentFilter,
                  filterGroups,
                  setCurrentFilter,
                  resetStates,
                  messages
                )}
            </Tab>
            <Tab tabIndex={0} label={messages.metadataTabLabel} data-testid="metadata-tab">
              {!hasError && (
                <MetadataPane
                  metadata={state.metadata}
                  activeMetadataId={activeMetadataIds[0]}
                  parties={parties}
                  messages={messages}
                  onActiveMetadataChange={({ metadataId, data }): void =>
                    onActiveMetadataChange({
                      metadataId,
                      data,
                      setHighlightedList,
                      setActiveMetadataIds
                    })
                  }
                  onActivePartyChange={(party): void =>
                    onActivePartyChange({
                      party,
                      setHighlightedList,
                      setActiveMetadataIds
                    })
                  }
                />
              )}
            </Tab>
          </Tabs>
        )}
      </>
    );
  };

  const allClickableIds = getAllClickableIds(itemList);
  let nonContractProps = {};
  if (isInvoiceOrPurchaseOrder(enrichmentName)) {
    nonContractProps = {
      activeIds: difference(activeIds, allClickableIds).length === 0 ? activeIds : [],
      selectableIds: allClickableIds
    };
  }

  return (
    <div className={base}>
      <nav className={`${base}__toolbar`} aria-label={messages.navigationToolbarLabel}>
        <div className={`${base}__title`} data-testid="CIDocument_title">
          {filename}
        </div>
        {highlightedList.length > 0 && (
          <>
            <NavigationToolbar
              className={`${base}__nav`}
              index={activeIndex + 1}
              max={highlightedList.length}
              messages={messages}
              onChange={onNavigationChange({
                setActiveIds:
                  selectedContractFilter === METADATA ? setActiveMetadataIds : setActiveIds,
                highlightedList
              })}
            />
            <div className={`${base}__rightGutter`} />
          </>
        )}
      </nav>
      <div className={`${base}__main`}>
        <aside className={`${base}__sidebar`} aria-label={messages.filtersTabLabel}>
          {renderSidebar()}
        </aside>
        <article className={`${base}__doc`} aria-label={messages.defaultDocumentName}>
          {state.isError || didCatch ? (
            <p className={`${base}__docError`}>{messages.parseErrorMessage}</p>
          ) : (
            <CIDocumentContent
              styles={state.styles}
              sections={state.sections}
              itemMap={state.itemMap}
              highlightedIds={highlightedIds}
              activeIds={activeIds}
              activePartIds={activePartIds}
              onItemClick={onItemClick({
                setActiveIds,
                elementList: itemList
              })}
              activeMetadataIds={activeMetadataIds}
              theme={theme}
              width={overrideDocWidth}
              height={overrideDocHeight}
              documentId={documentId}
              {...nonContractProps}
            />
          )}
        </article>
        <aside className={`${base}__details`} aria-labelledby="documentDetailsId">
          <DetailsPane
            items={activeDetails}
            selectedLink={getSelectedLink({ activeElement, activePartIds })}
            messages={messages}
            onActiveLinkChange={onDetailsLink({ activeElement, setActivePartIds })}
          />
        </aside>
      </div>
    </div>
  );
};

function docStateReducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.RESET: {
      return { ...state, ...INITIAL_STATE };
    }
    case ActionType.SET: {
      return { ...state, isError: false, ...action.data };
    }
    case ActionType.ERROR: {
      return { ...state, isError: true };
    }
    default: {
      throw new Error(`Doc state reducer called with invalid action type: ${action.type}`);
    }
  }
}

function renderFilterPanel(
  currentFilter: Filter,
  filterGroups: FilterGroup[],
  setCurrentFilter: Dispatch<SetStateAction<Filter>>,
  resetStates: () => void,
  messages: Messages
): ReactElement {
  return (
    <FilterPanel
      filter={currentFilter}
      filterGroups={filterGroups}
      messages={messages}
      onFilterChange={onFilterChange({ currentFilter, setCurrentFilter })}
      onFilterClear={resetStates}
    />
  );
}

function onSelectionChangeContractTabs(
  index: number,
  setSelectedContractFilter: Dispatch<SetStateAction<string>>,
  resetStates: () => void
): void {
  setSelectedContractFilter(contractTabs[index]);
  resetStates();
}

function onActiveMetadataChange({
  metadataId,
  data,
  setHighlightedList,
  setActiveMetadataIds
}: {
  metadataId: string;
  data: MetadataData[];
  setHighlightedList: Dispatch<SetStateAction<any[]>>;
  setActiveMetadataIds: React.Dispatch<React.SetStateAction<string[]>>;
}): void {
  setHighlightedList(data);
  setActiveMetadataIds([metadataId]);
}

function onActivePartyChange({
  party,
  setHighlightedList,
  setActiveMetadataIds
}: {
  party: Address[] | Mention[];
  setHighlightedList: Dispatch<SetStateAction<any[]>>;
  setActiveMetadataIds: React.Dispatch<React.SetStateAction<string[]>>;
}): void {
  setHighlightedList(party);
  setActiveMetadataIds([getId(party[0])]);
}

function onFilterChange({
  currentFilter,
  setCurrentFilter
}: {
  currentFilter: Filter;
  setCurrentFilter: Dispatch<SetStateAction<Filter>>;
}) {
  return function (filterPart: FilterChangeArgs): void {
    setCurrentFilter(updateFilter(currentFilter, filterPart));
  };
}

function onNavigationChange({
  setActiveIds,
  highlightedList
}: {
  setActiveIds: Dispatch<SetStateAction<string[]>>;
  highlightedList: any[];
}) {
  return function (index: number): void {
    const activeItem = highlightedList[index - 1]; // turn 1-based index to 0-based index
    if (isRelationObject(activeItem)) {
      setActiveIds(activeItem.allAttributeIds);
    } else {
      setActiveIds([getId(activeItem)]);
    }
  };
}

function onItemClick({
  setActiveIds,
  elementList
}: {
  setActiveIds: Dispatch<SetStateAction<string[]>>;
  elementList: any[];
}) {
  return function (clickedItem: Field): void {
    if (clickedItem) {
      if (hasRelation(elementList)) {
        const relation = elementList.find(rel => rel.allAttributeIds.includes(clickedItem.id));
        if (relation) {
          setActiveIds(relation.allAttributeIds);
        }
      } else if (clickedItem.id) {
        setActiveIds([clickedItem.id]);
      }
    }
  };
}

function onDetailsLink({
  activeElement,
  setActivePartIds
}: {
  activeElement: any;
  setActivePartIds: Dispatch<SetStateAction<string[]>>;
}) {
  return function (linkItem: { sectionTitle: string; type: string }): void {
    const { sectionTitle, type } = linkItem;
    // Set the active item sub-parts to the parts of the active element that match the clicked item
    // e.g. attributes of the active element that are of type "DateTime"
    setActivePartIds(
      activeElement[sectionTitle]
        .filter((part: any) => part.type === type)
        .map((part: any) => getId(part))
    );
  };
}

function getActiveIndex(activeIds: string[], highlightedList: any[]): number {
  return activeIds ? findElementIndex(highlightedList, activeIds) : -1;
}

function getActiveElement(activeIds: string[], itemList: any[]): any {
  return itemList.find(item => {
    if (item.allAttributeIds) {
      return isEqual(item.allAttributeIds.sort(), activeIds.sort());
    }
    return isEqual([getId(item)].sort(), activeIds.sort());
  });
}

function getActiveDetails(activeElement: any, getDetailsFn: (item: any) => Items[]): Items[] {
  return activeElement ? getDetailsFn(activeElement) : [];
}

function getAllClickableIds(itemList: any[]): string[] {
  return flattenDeep(itemList.map(item => item.allAttributeIds || getId(item)));
}

function getSelectedLink({
  activeElement,
  activePartIds
}: {
  activeElement: any;
  activePartIds: string[];
}): string | undefined {
  if (activeElement && activeElement.attributes) {
    const activeItem = activeElement.attributes.find((attribute: Item) =>
      activePartIds.includes(getId(attribute))
    );
    if (activeItem) {
      return activeItem.type;
    }
  }
  return undefined;
}

export default withErrorBoundary(CIDocument);
