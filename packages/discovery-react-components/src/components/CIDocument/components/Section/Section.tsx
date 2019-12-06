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
  useState
} from 'react';
import cx from 'classnames';
import debounce from 'debounce';
import { settings } from 'carbon-components';
import { getId } from 'utils/document/idUtils';
import { createFieldRects, findOffsetInDOM } from 'utils/document/documentUtils';
import { clearNodeChildren } from 'utils/dom';
import elementFromPoint from 'components/CIDocument/utils/elementFromPoint';
import { SectionType, Field, Item } from 'components/CIDocument/types';

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
}

export const Section: FC<SectionProps> = ({ section, onFieldClick }) => {
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

  useEffect(() => {
    createSectionFields();
    // Run every time this section changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  useEffect(() => {
    const resizeFn = debounce(createSectionFields, 100);
    window.addEventListener('resize', resizeFn);
    return (): void => {
      window.removeEventListener('resize', resizeFn);
    };
    // passing empty array to `useEffect` so that this only runs on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={cx(`${baseClassName}`, { hasTable: hasTable(html) })}
      ref={sectionNode}
      onMouseMove={mouseMoveListener(hoveredField, setHoveredField)}
      onMouseLeave={mouseLeaveListener(hoveredField, setHoveredField)}
      onClick={mouseClickListener(onFieldClick)}
    >
      <div className="fields" ref={fieldsNode} />
      <div
        className="content htmlReset htmlOverride"
        ref={contentNode}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};

function mouseMoveListener(
  hoveredField: HTMLElement | null,
  setHoveredField: Dispatch<SetStateAction<HTMLElement | null>>
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
      }
      return;
    }

    const fieldNode = fieldRect.closest('.field');
    if (hoveredField !== fieldNode) {
      if (hoveredField) {
        hoveredField.classList.remove('hover');
      }
      setHoveredField(fieldNode as HTMLElement);
      if (fieldNode) {
        fieldNode.classList.add('hover');
      }
      document.body.style.cursor = 'pointer';
    }
  };
}

function mouseLeaveListener(
  hoveredField: HTMLElement | null,
  setHoveredField: Dispatch<SetStateAction<HTMLElement | null>>
) {
  return function _mouseLeaveListener(): void {
    if (hoveredField) {
      hoveredField.classList.remove('hover');
      setHoveredField(null);
      document.body.style.cursor = 'initial';
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
    const fieldType = field.__type;
    const { begin, end } = field.location;

    const offsets = findOffsetInDOM(contentNode, begin, end);

    createFieldRects({
      fragment,
      parentRect: sectionRect as DOMRect,
      fieldType,
      fieldId: getId((field as unknown) as Item),
      ...offsets
    });
  }

  fieldsNode.appendChild(fragment);
}

function hasTable(html: string): boolean {
  return html.toLowerCase().includes('<table');
}

export default Section;
