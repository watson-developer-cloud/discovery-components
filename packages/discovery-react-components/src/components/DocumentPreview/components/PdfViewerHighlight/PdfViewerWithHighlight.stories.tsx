import React, { useCallback, useMemo, useRef, useState } from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, radios, number } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import PdfViewerWithHighlight from './PdfViewerWithHighlight';
import { flatten } from 'lodash';
import { DocumentFieldHighlight } from './types';
import './PdfViewerWithHighlight.stories.scss';

import { document as doc } from 'components/DocumentPreview/__fixtures__/Art Effects.pdf';
import document from 'components/DocumentPreview/__fixtures__/Art Effects Koya Creative Base TSA 2008.pdf.json';

import { document as docJa } from 'components/DocumentPreview/__fixtures__/DiscoComponent-ja.pdf';
import documentJa from 'components/DocumentPreview/__fixtures__/DiscoComponents-ja_document.json';

import PDFJS from 'pdfjs-dist';
import { getDocFieldValue } from './utils/common/documentUtils';
(PDFJS as any).cMapUrl = './node_modules/pdfjs-dist/cmaps/';
(PDFJS as any).cMapPacked = true;

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

const EMPTY: never[] = [];

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
    const fields = Object.keys(document).filter(field => {
      return !field.match(/^(document_id|extracted_|enriched_)/) && document[field]?.length > 0;
    });

    return flatten(
      fields.map(field => {
        const documentFields = Array.isArray(document[field]) ? document[field] : [document[field]];
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
    const fieldText = getDocFieldValue(document, selectedFieldName, selectedFieldIndex);

    const highlight: DocumentFieldHighlight = {
      field: selectedFieldName,
      fieldIndex: selectedFieldIndex,
      location: { begin: Math.min(begin, end), end: Math.max(begin, end) },
      text: fieldText?.substring(begin, end)
    } as DocumentFieldHighlight;
    setHighlights([highlight]);
  };

  return (
    <div className="withTextSelection">
      <PdfViewerWithHighlight {...props} highlights={highlights} highlightClassName="highlight" />
      <div className="rightPane">
        <h6>
          <label htmlFor="field_select">Select field</label>
        </h6>
        <p>
          {/* eslint-disable-next-line jsx-a11y/no-onchange*/}
          <select name="field_select" id="field_select" onChange={handleOnChangeField}>
            {fieldOptions.map(option => (
              <option
                key={option.value}
                value={option.value}
                selected={option.value === selectedField}
              >
                {option.label}
              </option>
            ))}
          </select>
        </p>
        <h6>Select text to highlight</h6>
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <p className="text" onMouseUp={handleOnMouseUp as any} ref={fieldTextNodeRef}>
          {selectedField &&
            getDocFieldValue(document, selectedFieldName, selectedFieldIndex)!
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
    const setLoadingAction = action('setLoading');

    return (
      <PdfViewerWithHighlight
        file={atob(doc)}
        page={page}
        scale={scale}
        setLoading={setLoadingAction}
        document={document}
        highlights={EMPTY}
      />
    );
  })
  .add('with text selection', () => {
    const page = number(pageKnob.label, pageKnob.defaultValue, pageKnob.options);
    const zoom = radios(zoomKnob.label, zoomKnob.options, zoomKnob.defaultValue);
    const scale = parseFloat(zoom);
    const setLoadingAction = action('setLoading');

    return (
      <WithTextSelection
        file={atob(doc)}
        page={page}
        scale={scale}
        setLoading={setLoadingAction}
        document={document}
        highlights={EMPTY}
      />
    );
  })
  .add('with PDF in Japanese', () => {
    const page = number(pageKnob.label, pageKnob.defaultValue, pageKnob.options);
    const zoom = radios(zoomKnob.label, zoomKnob.options, zoomKnob.defaultValue);
    const scale = parseFloat(zoom);
    const setLoadingAction = action('setLoading');

    return (
      <WithTextSelection
        file={atob(docJa)}
        page={page}
        scale={scale}
        setLoading={setLoadingAction}
        document={documentJa}
        highlights={EMPTY}
      />
    );
  });
