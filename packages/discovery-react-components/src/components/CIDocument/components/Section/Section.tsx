/**
 * A section of a CI (HTML) document. Rendered as a row within a virtual
 * "infinite" list.
 */

import React, {
  FC,
  Dispatch,
  SetStateAction,
  MouseEvent,
  useEffect,
  useRef,
  useState,
  useCallback
} from 'react';
import cx from 'classnames';
import debounce from 'debounce';
import { settings } from 'carbon-components';
import ReactResizeDetector from 'react-resize-detector';
import { getId } from 'utils/document/idUtils';
import { createFieldRects, findOffsetInDOM } from 'utils/document/documentUtils';
import { clearNodeChildren } from 'utils/dom';
import elementFromPoint from 'components/CIDocument/utils/elementFromPoint';
import { SectionType, Field, Item } from 'components/CIDocument/types';
import { FacetInfoMap } from '../../../DocumentPreview/types';
import { TooltipAction, TooltipEvent, OnTooltipShowFn } from '../../../TooltipHighlight/types';
import { TooltipHighlight, calcToolTipContent } from '../../../TooltipHighlight/TooltipHighlight';

export type OnFieldClickFn = (field: Field) => void;

const baseClassName = `${settings.prefix}--ci-doc-section`;

interface SectionProps {
  /**
   * Section to display in this component
   */
  section: SectionType;
  /**
   * Function to call when a field is clicked
   */
  onFieldClick?: OnFieldClickFn;

  /**
   * Meta-data on facets
   */
  facetInfoMap?: FacetInfoMap;
}

export const Section: FC<SectionProps> = ({ section, onFieldClick, facetInfoMap = {} }) => {
  const { html } = section;

  const [hoveredField, setHoveredField] = useState<HTMLElement | null>(null);

  const sectionNode = useRef(null);
  const contentNode = useRef(null);
  const fieldsNode = useRef(null);

  const createSectionFields = (): void => {
    try {
      renderSectionFields(section, sectionNode.current, contentNode.current, fieldsNode.current);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to create section fields:', err);
    }
  };

  const [tooltipAction, setTooltipAction] = useState<TooltipAction>({
    tooltipEvent: TooltipEvent.LEAVE,
    rectActiveElement: new DOMRect(),
    tooltipContent: <div></div>
  });

  const onTooltipAction = useCallback(
    (tooltipAction: TooltipAction) => {
      const updateTooltipAction: TooltipAction = {
        ...{
          tooltipEvent: tooltipAction.tooltipEvent || TooltipEvent.LEAVE,
          rectActiveElement: tooltipAction.rectActiveElement || new DOMRect()
        },
        ...(tooltipAction.tooltipContent && { tooltipContent: tooltipAction.tooltipContent })
      };
      setTooltipAction(updateTooltipAction);
    },
    [setTooltipAction]
  );

  useEffect(() => {
    createSectionFields();
    // Run every time this section changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  const resizeFn = debounce(createSectionFields, 100);

  return (
    // TODO Need to think about how to properly handle keyboard events within
    // a section, where there may be multiple selectable "elements" that need
    // to be handled individually.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className={cx(`${baseClassName}`, { hasTable: hasTable(html) })}
      ref={sectionNode}
      onMouseMove={mouseMoveListener(hoveredField, setHoveredField, onTooltipAction, facetInfoMap)}
      onMouseLeave={mouseLeaveListener(hoveredField, setHoveredField, onTooltipAction)}
      onClick={mouseClickListener(onFieldClick)}
    >
      <TooltipHighlight parentDiv={sectionNode} tooltipAction={tooltipAction} />
      <div className="fields" ref={fieldsNode} />
      <div
        className="content htmlReset htmlOverride"
        ref={contentNode}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <ReactResizeDetector handleWidth handleHeight onResize={resizeFn} />
    </div>
  );
};

function mouseMoveListener(
  hoveredField: HTMLElement | null,
  setHoveredField: Dispatch<SetStateAction<HTMLElement | null>>,
  onTooltipShow: OnTooltipShowFn,
  facetInfoMap: FacetInfoMap
) {
  return function _mouseMoveListener(event: MouseEvent): void {
    const fieldRect = elementFromPoint(
      event.clientX,
      event.clientY,
      'field--rect',
      event.currentTarget
    );
    if (!fieldRect) {
      if (hoveredField) {
        hoveredField.classList.remove('hover');
        setHoveredField(null);
        document.body.style.cursor = 'initial';
        onTooltipShow({ tooltipEvent: TooltipEvent.LEAVE });
      }
      return;
    }

    const fieldNode = fieldRect.closest('.field');
    if (hoveredField !== fieldNode) {
      if (hoveredField) {
        hoveredField.classList.remove('hover');
        onTooltipShow({ tooltipEvent: TooltipEvent.LEAVE });
      }
      setHoveredField(fieldNode as HTMLElement);
      if (fieldNode) {
        fieldNode.classList.add('hover');
        const enrichValue = fieldNode.getAttribute('data-field-value') || '';
        const enrichFacetId = fieldNode.getAttribute('data-field-type') || '';
        const tooltipContent = calcToolTipContent(facetInfoMap, enrichFacetId, enrichValue);
        const fieldNodeContent = fieldNode?.firstElementChild;
        onTooltipShow({
          ...{
            tooltipEvent: TooltipEvent.ENTER,
            rectActiveElement: fieldNodeContent?.getBoundingClientRect()
          },
          ...(tooltipContent && { tooltipContent: tooltipContent })
        });
      }
      document.body.style.cursor = 'pointer';
    }
  };
}

function mouseLeaveListener(
  hoveredField: HTMLElement | null,
  setHoveredField: Dispatch<SetStateAction<HTMLElement | null>>,
  onTooltipShow: OnTooltipShowFn
) {
  return function _mouseLeaveListener(): void {
    if (hoveredField) {
      hoveredField.classList.remove('hover');
      setHoveredField(null);
      document.body.style.cursor = 'initial';
      onTooltipShow({ tooltipEvent: TooltipEvent.LEAVE });
    }
  };
}

function mouseClickListener(
  onFieldClick: OnFieldClickFn | undefined
): ((event: MouseEvent) => void) | undefined {
  if (onFieldClick) {
    return function _mouseClickListener(event: MouseEvent): void {
      const fieldRect = elementFromPoint(
        event.clientX,
        event.clientY,
        'field--rect',
        event.currentTarget
      );
      if (fieldRect) {
        const fieldNode: HTMLElement | null = fieldRect.closest('.field');
        if (fieldNode) {
          onFieldClick({
            type: fieldNode.dataset.fieldType,
            id: fieldNode.dataset.fieldId
          });
        }
      }
    };
  }
  return;
}

function renderSectionFields(
  section: SectionType,
  sectionNode: HTMLElement | null,
  contentNode: HTMLElement | null,
  fieldsNode: HTMLElement | null
): void {
  if (!sectionNode || !contentNode || !fieldsNode) {
    return;
  }

  // Clear out any existing field nodes (from previous creations)
  clearNodeChildren(fieldsNode);

  if (!section.enrichments) {
    return;
  }

  // Keep track of the last begin index and sort the enrichments array by begin
  // This brings the function down from O(m * n) to O(m + n)
  section.enrichments.sort((a, b) => {
    // Sort based on begin, and then by end (if begins are equal)
    return a.location.begin !== b.location.begin
      ? a.location.begin - b.location.begin
      : a.location.end - b.location.end;
  });

  const sectionRect = sectionNode.getBoundingClientRect();
  // Store all changes in fragment then add them at the end (to prevent unnecessary reflow)
  const fragment = document.createDocumentFragment();

  for (const field of section.enrichments) {
    try {
      const fieldType = field.__type;
      const fieldValue = field.value || '';
      const { begin, end } = field.location;

      const offsets = findOffsetInDOM(contentNode, begin, end);

      createFieldRects({
        fragment,
        parentRect: sectionRect as DOMRect,
        fieldType,
        fieldValue,
        fieldId: getId(field as unknown as Item),
        ...offsets
      });
    } catch (err) {
      // Don't log error, since some enrichments are not contained within their sections
    }
  }

  fieldsNode.appendChild(fragment);
}

function hasTable(html: string): boolean {
  return html.toLowerCase().includes('<table');
}

export default Section;
