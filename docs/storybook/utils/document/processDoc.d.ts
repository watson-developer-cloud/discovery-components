import { QueryResultWithOptionalMetadata, Location } from 'components/DocumentPreview/types';
interface Options {
    sections?: boolean;
    tables?: boolean;
    bbox?: boolean;
    bboxInnerText?: boolean;
    itemMap?: boolean;
}
export interface ProcessedDoc {
    title: string;
    styles: string;
    sections?: any[];
    tables?: Table[];
    bboxes?: ProcessedBbox[];
    itemMap?: {
        byItem: any;
        bySection: any;
    };
    metadata?: any[];
    attributes?: any[];
    relations?: any[];
}
export interface ProcessedBbox {
    left: number;
    right: number;
    top: number;
    bottom: number;
    page: number;
    className: string;
    location: Location;
    innerTextSource?: string;
    innerTextLocation?: Location;
}
export interface Table {
    location: Location;
    bboxes: ProcessedBbox[];
}
/**
 * Convert document data into structure that is more palatable for use by
 * CIDocument
 *
 * @param {Object} queryData Discovery document data
 * @param {Object} options
 * @param {Boolean} options.sections return array of HTML sections
 * @param {Boolean} options.tables return array of tables' bboxes
 * @param {Boolean} options.bbox return array of bboxes, with classname
 * @param {Boolean} options.itemMap return item mapping into 'sections'
 * @throws {ParsingError}
 */
export declare function processDoc(queryData: QueryResultWithOptionalMetadata, options?: Options): Promise<ProcessedDoc>;
export {};
