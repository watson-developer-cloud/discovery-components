/**
 * Checks if document type is either invoice or purchase order.
 *
 * @param {string} enrichmentName enrichmentName is the type of document
 * @returns {boolean} true if enrichmentName is either Invoice or Purchase order
 */
export declare const isInvoiceOrPurchaseOrder: (enrichmentName: string) => boolean;
/**
 * Checks if object is of type RelationObject
 *
 * @param {*} object object
 * @returns {boolean} true if object has attributes within it
 */
export declare const isRelationObject: (object: any) => boolean;
/**
 * Checks if array has an object of relation
 *
 * @param {Array} items items is an array.
 * @returns {boolean} true if array has a relation object
 */
export declare const hasRelation: (items: any[]) => boolean;
