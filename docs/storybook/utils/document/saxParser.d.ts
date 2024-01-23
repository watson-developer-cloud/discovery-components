import { Parser as _Parser } from 'htmlparser2';
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
export declare class SaxParser {
    parser: Parser;
    /**
     * Stack of function states. Each array item is an object of parser functions
     * to be used at that time. When pushing on to the stack, the top state (index 0)
     * is a merge of the old state and incoming state, with latter overriding.
     * The top of the stack is at index 0.
     */
    state: StateItem[];
    /**
     * Base event handlers used by this class. These are available no matter what
     * the current `state` is.
     */
    private baseHandlers;
    constructor();
    /**
     * On a parser event, check if our current state contains a handler function.
     * If so, call that function, passing the parser object as first argument,
     * followed by event arguments.
     *
     * @param fnName parser event name
     * @param args parser event arguments
     */
    private onEvent;
    parse(html: string): Promise<void>;
    pushState(newState: StateItem): void;
    popState(): void;
}
export declare class ParsingError extends Error {
    constructor(...params: any);
}
