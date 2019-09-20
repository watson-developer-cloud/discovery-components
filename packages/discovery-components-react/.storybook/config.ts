import { configure, addDecorator } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import '@disco-widgets/styles';

const req = require.context('../src', true, /\.stories.tsx$/);

addDecorator(withInfo());

function loadStories() {
  req.keys().forEach(req);
}

configure(loadStories, module);
