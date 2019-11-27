import { configure, addDecorator } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import '@ibm-watson/discovery-styles';

const req =
  process.env.STORYBOOK_BUILD_MODE == 'production'
    ? require.context('../src', true, /.*\/__stories__\/.*\.stories.tsx$/)
    : require.context('../src', true, /\.stories.tsx$/);

addDecorator(withInfo());

function loadStories() {
  req.keys().forEach(req);
}

configure(loadStories, module);
