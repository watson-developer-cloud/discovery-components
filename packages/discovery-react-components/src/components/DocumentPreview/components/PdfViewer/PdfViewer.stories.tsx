import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, radios, number, boolean } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import PdfViewer from './PdfViewer';
import { document as doc } from 'components/DocumentPreview/__fixtures__/Art Effects.pdf';

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

storiesOf('DocumentPreview/components/PdfViewer', module)
  .addDecorator(withKnobs)
  .add('default', () => {
    const page = number(pageKnob.label, pageKnob.defaultValue, pageKnob.options);

    const zoom = radios(zoomKnob.label, zoomKnob.options, zoomKnob.defaultValue);
    const scale = parseFloat(zoom);
    const showTextLayer = boolean('Show text layer', false);

    const setLoadingAction = action('setLoading');
    const setTextLayerInfoAction = action('setTextLayerInfo');

    return (
      <PdfViewer
        file={atob(doc)}
        page={page}
        scale={scale}
        showTextLayer={showTextLayer}
        setLoading={setLoadingAction}
        setTextLayerInfo={setTextLayerInfoAction}
      />
    );
  });
