/**
 * Default CSS definition for typescript,
 * will be overridden with file-specific definitions by rollup
 */
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.svg' {
  const svgUrl: string;
  const svgComponent: React.StatelessComponent<React.SVGAttributes<SVGElement>>;
  export default svgUrl;
  export { svgComponent as ReactComponent };
}

declare module 'carbon-components-react';
declare module 'carbon-components';
declare module '@carbon/icons-react';
declare module '*.md';
declare module 'carbon-components-react/es/components/ListBox';

// Required for storybook build
// https://github.com/storybookjs/storybook/issues/8233#issuecomment-558563086
declare module '@storybook/addon-knobs/react';
