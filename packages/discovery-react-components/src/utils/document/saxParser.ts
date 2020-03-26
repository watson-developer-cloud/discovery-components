/* eslint-disable @typescript-eslint/no-use-before-define */
import { Parser as _Parser, EVENTS } from 'htmlparser2';

/**
 * SAX-style Parser
 * ------------
 *
 * Streaming parser, so full source is not handled in memory at once
 *
 */

export type Parser = _Parser;
export interface Attributes {
  [s: string]: string;
}

export type StateItem = Record<string, (...args: any[]) => void>;

export class SaxParser {
  public parser: Parser;
  /**
   * Stack of function states. Each array item is an object of parser functions
   * to be used at that time. When pushing on to the stack, the top state (index 0)
   * is a merge of the old state and incoming state, with latter overriding.
   * The top of the stack is at index 0.
   */
  public state: StateItem[];
  /**
   * Base event handlers used by this class. These are available no matter what
   * the current `state` is.
   */
  private baseHandlers: StateItem = {};

  public constructor() {
    // parser state stack which manages the current callbacks
    this.state = [];

    // create a handler function which responds to all events, forwarding them
    // to our `onEvent` handler
    const handler = Object.keys(EVENTS).reduce((handler: any, evt: string): any => {
      const fnName = `on${evt}`;
      handler[fnName] = this.onEvent.bind(this, fnName);
      return handler;
    }, {});

    this.parser = new _Parser(handler, { decodeEntities: false });
  }

  /**
   * On a parser event, check if our current state contains a handler function.
   * If so, call that function, passing the parser object as first argument,
   * followed by event arguments.
   *
   * @param fnName parser event name
   * @param args parser event arguments
   */
  private onEvent(fnName: string, ...args: []): void {
    const { parser, state, baseHandlers } = this;
    if (state[0][fnName]) {
      return state[0][fnName](parser, ...args);
    }
    if (baseHandlers[fnName]) {
      return baseHandlers[fnName](...args);
    }
  }

  public parse(html: string): Promise<void> {
    const { parser } = this;

    const promise = new Promise<void>((resolve, reject): void => {
      this.baseHandlers = {
        onerror: (err: Error): void => {
          // eslint-disable-next-line no-console
          console.error('Document Parsing Error', err);
          reject(new ParsingError(err));
        },

        onend: (): void => {
          resolve();
        }
      };
    });

    parser.write(html);
    parser.end();

    return promise;
  }

  public pushState(newState: StateItem): void {
    this.state.unshift(newState);
  }

  public popState(): void {
    this.state.shift();
  }
}

export class ParsingError extends Error {
  public constructor(...params: any) {
    super(...params);
    this.name = 'ParsingError';
  }
}
