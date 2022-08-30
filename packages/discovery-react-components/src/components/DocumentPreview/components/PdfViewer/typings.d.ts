declare module 'pdfjs-dist/build/pdf.worker.min.js';

//
// Declare modules and their types that is referred from PDF text layer rendering.
// Unused properties are commented out
//
declare module 'pdfjs-dist/lib/web/ui_utils' {
  export class EventBus {
    on(eventName: string, listener: any): void;
    off(eventName: string, listener: any): void;
    dispatch(eventName: string, args?: any): void;
  }
  // export function getGlobalEventBus(): EventBus;
}

declare module 'pdfjs-dist/lib/web/text_layer_builder' {
  import { EventBus } from 'pdfjs-dist/lib/web/ui_utils';
  import { PageViewport } from 'pdfjs-dist/types/display/display_utils';
  import { TextContent } from 'pdfjs-dist/types/display/api';

  export class TextLayerBuilder {
    constructor(options: TextLayerBuilder.Options);

    textLayerDiv: HTMLElement;
    eventBus: EventBus;
    textContent: TextContent | null;
    // textContentItemsStr: any[];
    renderingDone: boolean;
    // pageIdx: number;
    pageNumber: number;
    // matches: any[];
    // viewport: PageViewport;
    textDivs: HTMLElement[];
    // findController: any;
    textLayerRenderTask: TextLayerRenderTask;
    // enhanceTextSelection: any;

    render(timeout?: number): void;
    cancel(): void;
    // setTextContentStream(readableStream: any): void;
    setTextContent(textContent: TextContent): void;
  }
  export const DefaultTextLayerFactory;

  declare namespace TextLayerBuilder {
    export interface Options {
      textLayerDiv: HTMLElement;
      eventBus: EventBus;
      pageIndex: number;
      viewport: PageViewport;
      // findController?: any;
      // enhanceTextSelection?: any;
    }
  }
}
