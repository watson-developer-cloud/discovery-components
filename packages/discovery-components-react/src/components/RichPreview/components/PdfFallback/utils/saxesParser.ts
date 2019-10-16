/* eslint-disable @typescript-eslint/no-use-before-define */
import saxes, { SaxesParser as _SaxesParser } from 'saxes';

/**
 * SAXES Parser
 * ------------
 *
 * - Streaming parser, so full source is not handled in memory at once
 * - `position` is 1-based index of end of tag ('>'), within the source
 *   HTML string
 */

// There are many other Saxes events, but we only change around these:
const SAXES_EVENTS = ['onclosetag', 'onopentag', 'ontext'];

export default class SaxesParser {
  state: any[];
  parser: _SaxesParser;

  constructor() {
    // parser state stack which manages the current callbacks
    this.state = [];

    this.parser = new saxes.SaxesParser({
      // track position within HTML string
      position: true
    });
  }

  parse(html: string): Promise<void> {
    const { parser } = this;

    const promise = new Promise<void>((resolve, reject): void => {
      parser.onerror = function(err): void {
        // eslint-disable-next-line no-console
        console.error('DOC PARSER', err);
        reject(new ParsingError(err));
      };
      parser.onend = function(): void {
        resolve();
      };
    });

    parser.write(html).close();

    return promise;
  }

  pushState(newState: any): void {
    const { parser } = this;

    // store existing callbacks state
    const oldState = {};
    for (const ev of SAXES_EVENTS) {
      if (parser[ev]) {
        oldState[ev] = parser[ev];
      }
    }
    this.state.push(oldState);

    this.resetCallbacks();

    // set new state in parser
    for (const ev of SAXES_EVENTS) {
      if (newState[ev]) {
        parser[ev] = newState[ev];
      }
    }
  }

  popState(): void {
    this.resetCallbacks();

    const prevState = this.state.pop();
    for (const ev of SAXES_EVENTS) {
      if (prevState[ev]) {
        this.parser[ev] = prevState[ev];
      }
    }
  }

  resetCallbacks(): void {
    for (const ev of SAXES_EVENTS) {
      delete this.parser[ev];
    }
  }
}

export class ParsingError extends Error {
  constructor(...params: any) {
    super(...params);
    this.name = 'ParsingError';
  }
}
