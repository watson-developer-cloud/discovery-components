import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, radios, number } from '@storybook/addon-knobs';
import PdfViewer from './PdfViewer';
import { document } from '../../__fixtures__/intro_to_watson_discovery';

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

storiesOf('RichPreview/PdfViewer', module)
  .addDecorator(withKnobs)
  .add('default', () => {
    const page = number(pageKnob.label, pageKnob.defaultValue, pageKnob.options);

    const zoom = radios(zoomKnob.label, zoomKnob.options, zoomKnob.defaultValue);
    const scale = parseFloat(zoom);

    return <PdfViewer file={atob(document)} page={page} scale={scale} />;
  });
