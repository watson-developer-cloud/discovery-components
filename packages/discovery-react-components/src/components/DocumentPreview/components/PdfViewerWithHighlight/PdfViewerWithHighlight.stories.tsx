import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, radios, number, select, files } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import PdfViewerWithHighlight from './PdfViewerWithHighlight';
import { flatten } from 'lodash';
import { DocumentFieldHighlight } from '../PdfHighlight/types';
import './PdfViewerWithHighlight.stories.scss';
import { nonEmpty } from 'utils/nonEmpty';
import { getDocFieldValue } from '../PdfHighlight/utils/common/documentUtils';

import { document as doc } from 'components/DocumentPreview/__fixtures__/Art Effects.pdf';
import document from 'components/DocumentPreview/__fixtures__/Art Effects Koya Creative Base TSA 2008.pdf.json';

import { document as docJa } from 'components/DocumentPreview/__fixtures__/DiscoComponent-ja.pdf';
import documentJa from 'components/DocumentPreview/__fixtures__/DiscoComponents-ja_document.json';

const pageKnob = {
  label: 'Page',
  options: {
    range: true,
    min: 1,
    max: 8,
    step: 1
  },
  defaultValue: 1
};

const zoomKnob = {
  label: 'Zoom',
  options: {
    'Zoom out (50%)': '0.5',
    'Default (100%)': '1',
    'Zoom in (150%)': '1.5'
  },
  defaultValue: '1'
};

const pdfFileKnob = {
  label: 'PDF file',
  accept: '.pdf'
};

const documentFileKnob = {
  label: 'Document JSON file',
  accept: '.json'
};

const EMPTY: DocumentFieldHighlight[] = [];
const HIGHLIGHT_COMPANIES: DocumentFieldHighlight[] = [
  { id: 'highlight0', field: 'text', fieldIndex: 0, location: { end: 404, begin: 385 } },
  { id: 'highlight1', field: 'text', fieldIndex: 0, location: { end: 436, begin: 419 } },
  { id: 'highlight2', field: 'text', fieldIndex: 0, location: { end: 10334, begin: 10319 } }
];

const HIGHLIGHT_CUSTOMER_GROUPS: DocumentFieldHighlight[] = [
  { id: 'highlight0', field: 'text', fieldIndex: 0, location: { end: 3495, begin: 3481 } },
  { id: 'highlight1', field: 'text', fieldIndex: 0, location: { end: 5566, begin: 5552 } },
  { id: 'highlight2', field: 'text', fieldIndex: 0, location: { end: 8576, begin: 8562 } },
  { id: 'highlight3', field: 'text', fieldIndex: 0, location: { end: 8975, begin: 8961 } },
  { id: 'highlight4', field: 'text', fieldIndex: 0, location: { end: 68800, begin: 68786 } },
  { id: 'highlight5', field: 'text', fieldIndex: 0, location: { end: 135747, begin: 135733 } },
  { id: 'highlight6', field: 'text', fieldIndex: 0, location: { end: 139911, begin: 139897 } }
];

const highlightKnob = {
  label: 'Highlights',
  options: {
    empty: 'empty',
    '3 companies': 'companies',
    '7 customer groups': 'customerGroups'
  },
  defaultValue: 'empty',
  data: {
    empty: EMPTY,
    companies: HIGHLIGHT_COMPANIES,
    customerGroups: HIGHLIGHT_CUSTOMER_GROUPS
  }
};

const WithTextSelection: typeof PdfViewerWithHighlight = props => {
  const [selectedField, setSelectedField] = useState<string | null>('text|||0');
  const { document } = props;

  const handleOnChangeField = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedField(e.target.value);
  }, []);
  const [selectedFieldName, selectedFieldIndex] = useMemo(() => {
    const [n, i] = selectedField?.split('|||') || [];
    return [n, Number(i)];
  }, [selectedField]);
  const fieldOptions = useMemo(() => {
    const fields = Object.keys(document || {}).filter(field => {
      return !field.match(/^(document_id|extracted_|enriched_)/) && document?.[field]?.length > 0;
    });

    return flatten(
      fields.map(field => {
        const documentFields = Array.isArray(document?.[field])
          ? document?.[field]
          : [document?.[field]];
        return documentFields
          .map((content: any, index: number) => {
            if (typeof content === 'string') {
              return {
                value: `${field}|||${index}`,
                label: `${field}[${index}]`
              };
            }
            return null;
          })
          .filter((x: any) => !!x);
      })
    );
  }, [document]);

  // text selection & highlights
  const [highlights, setHighlights] = useState<DocumentFieldHighlight[]>([]);

  const fieldTextNodeRef = useRef<HTMLParagraphElement | null>(null);
  const getFieldTextSelection = () => {
    const selection = window.getSelection();
    if (!fieldTextNodeRef.current) {
      return null;
    }
    if (!selection || selection.rangeCount < 1 || selection.isCollapsed) {
      return null;
    }

    const { anchorNode, focusNode, anchorOffset, focusOffset } = selection;
    const anchorParentNode = anchorNode?.parentNode as HTMLElement;
    const focusParentNode = focusNode?.parentNode as HTMLElement;
    if (
      anchorParentNode !== fieldTextNodeRef.current ||
      focusParentNode !== fieldTextNodeRef.current
    ) {
      return null;
    }

    const text = selection.toString();
    return { text, begin: anchorOffset, end: focusOffset };
  };
  const handleOnMouseUp = (_: MouseEvent) => {
    const textSelection = getFieldTextSelection();
    if (!textSelection) {
      return;
    }

    const { begin, end } = textSelection;
    const fieldText = getDocFieldValue(document || {}, selectedFieldName, selectedFieldIndex);

    const highlight: DocumentFieldHighlight = {
      id: 'highlight',
      field: selectedFieldName,
      fieldIndex: selectedFieldIndex,
      location: { begin: Math.min(begin, end), end: Math.max(begin, end) },
      text: fieldText?.substring(begin, end)
    } as DocumentFieldHighlight;
    setHighlights([highlight]);
  };

  const activeIds = useMemo(() => highlights.map(hl => hl.id).filter(nonEmpty), [highlights]);

  return (
    <div className="withTextSelection">
      <PdfViewerWithHighlight
        {...props}
        highlights={highlights}
        activeIds={activeIds}
        highlightClassName="highlight"
      />
      <div className="rightPane">
        <h6>
          <label htmlFor="field_select">Select field</label>
        </h6>
        <p>
          {/* eslint-disable-next-line jsx-a11y/no-onchange*/}
          <select
            name="field_select"
            id="field_select"
            value={selectedField || ''}
            onChange={handleOnChangeField}
          >
            {fieldOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </p>
        <h6>Select text to highlight</h6>
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <p className="text" onMouseUp={handleOnMouseUp as any} ref={fieldTextNodeRef}>
          {selectedField &&
            getDocFieldValue(document || {}, selectedFieldName, selectedFieldIndex)!
              .replace(/ /g, '\u00a0') // NBSP
              .replace(/\n/g, '\\n')}
        </p>
      </div>
    </div>
  );
};

storiesOf('DocumentPreview/components/PdfViewerWithHighlight', module)
  .addDecorator(withKnobs)
  .add('default', () => {
    const page = number(pageKnob.label, pageKnob.defaultValue, pageKnob.options);
    const zoom = radios(zoomKnob.label, zoomKnob.options, zoomKnob.defaultValue);
    const scale = parseFloat(zoom);
    const highlights = select(
      highlightKnob.label,
      highlightKnob.options,
      highlightKnob.defaultValue
    );
    const activeId = number('Active highlight index', 0);
    const setLoadingAction = action('setLoading');
    const setCurrentPageAction = action('setCurrentPage');

    const [currentPage, setCurrentPage] = useState(0);
    useEffect(() => {
      setCurrentPage(page);
    }, [page]);
    const handleSetCurrentPage = useCallback(
      (p: number) => {
        setCurrentPageAction(p);
        setCurrentPage(p);
      },
      [setCurrentPageAction]
    );

    const [activeIds, setActiveIds] = useState<string[]>([]);
    useEffect(() => {
      const items = highlightKnob.data[highlights];
      const item = items[activeId];
      setActiveIds(item ? [item.id] : []);
    }, [activeId, highlights]);

    return (
      <PdfViewerWithHighlight
        file={atob(doc)}
        page={currentPage}
        scale={scale}
        setLoading={setLoadingAction}
        document={document}
        highlights={highlightKnob.data[highlights]}
        activeIds={activeIds}
        setCurrentPage={handleSetCurrentPage}
      />
    );
  })
  .add('with text selection', () => {
    const page = number(pageKnob.label, pageKnob.defaultValue, pageKnob.options);
    const zoom = radios(zoomKnob.label, zoomKnob.options, zoomKnob.defaultValue);
    const scale = parseFloat(zoom);
    const setLoadingAction = action('setLoading');
    const setCurrentPage = action('setCurrentPage');

    return (
      <WithTextSelection
        file={atob(doc)}
        page={page}
        scale={scale}
        setLoading={setLoadingAction}
        document={document}
        highlights={EMPTY}
        setCurrentPage={setCurrentPage}
      />
    );
  })
  .add('with PDF in Japanese', () => {
    const page = number(pageKnob.label, pageKnob.defaultValue, pageKnob.options);
    const zoom = radios(zoomKnob.label, zoomKnob.options, zoomKnob.defaultValue);
    const scale = parseFloat(zoom);
    const setLoadingAction = action('setLoading');
    const setCurrentPage = action('setCurrentPage');

    return (
      <WithTextSelection
        file={atob(docJa)}
        page={page}
        scale={scale}
        setLoading={setLoadingAction}
        document={documentJa}
        highlights={EMPTY}
        setCurrentPage={setCurrentPage}
      />
    );
  })
  .add("with user's PDF and JSON", () => {
    const pdfFile = files(pdfFileKnob.label, pdfFileKnob.accept);
    const documentFile = files(documentFileKnob.label, documentFileKnob.accept);
    const page = number(pageKnob.label, pageKnob.defaultValue, pageKnob.options);
    const zoom = radios(zoomKnob.label, zoomKnob.options, zoomKnob.defaultValue);
    const scale = parseFloat(zoom);
    const setLoadingAction = action('setLoading');
    const setCurrentPage = action('setCurrentPage');

    if (pdfFile.length === 0 || documentFile.length === 0) {
      return <div>Select PDF file and Document JSON file</div>;
    }

    const document = JSON.parse(
      Buffer.from(
        documentFile[0].substring('data:application/json;base64,'.length),
        'base64'
      ).toString('utf-8')
    );
    const file = atob(pdfFile[0].substring('data:application/pdf;base64,'.length));
    return (
      <WithTextSelection
        file={{ data: file, cMapPacked: true, cMapUrl: '/cmaps/' }}
        page={page}
        scale={scale}
        setLoading={setLoadingAction}
        document={document}
        highlights={EMPTY}
        setCurrentPage={setCurrentPage}
      />
    );
  });
