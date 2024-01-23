export interface MsDocument extends Document {
    msElementsFromPoint(x: number, y: number): HTMLElement[];
}
export declare function elementFromPoint(x: number, y: number, className: string): Element | undefined;
export declare function elementFromPointMs(x: number, y: number, className: string): Element | undefined;
export declare function elementFromPointFallback(x: number, y: number, className: string, stopElem: EventTarget | null): HTMLElement | null;
declare const exportFn: typeof elementFromPoint | typeof elementFromPointFallback;
export default exportFn;
