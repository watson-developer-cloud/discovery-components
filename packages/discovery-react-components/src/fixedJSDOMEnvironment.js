import JSDOMEnvironment from 'jest-environment-jsdom';

export default class FixedJSDOMEnvironment extends JSDOMEnvironment {
  constructor(...args) {
    super(...args);

    // Set JSDom's `structuredClone` to that implemented by Node.js
    // @see https://github.com/jsdom/jsdom/issues/3363
    if (!('structuredClone' in this.global)) {
      this.global.structuredClone = structuredClone;
    }
  }
}
