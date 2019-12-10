/**
 * Checks if document type is either invoice or purchase order.
 *
 * @param {string} enrichmentName enrichmentName is the type of document
 * @returns {boolean} true if enrichmentName is either Invoice or Purchase order
 */

import { ENRICHMENTS } from 'components/CIDocument/utils/enrichmentUtils';

export const isInvoiceOrPurchaseOrder = (enrichmentName: string): boolean =>
  enrichmentName === ENRICHMENTS.INVOICE || enrichmentName === ENRICHMENTS.PURCHASE_ORDER;

/**
 * Checks if object is of type RelationObject
 *
 * @param {*} object object
 * @returns {boolean} true if object has attributes within it
 */
export const isRelationObject = (object: any): boolean => object.allAttributeIds;

/**
 * Checks if array has an object of relation
 *
 * @param {Array} items items is an array.
 * @returns {boolean} true if array has a relation object
 */
export const hasRelation = (items: any[]): boolean => items.some(isRelationObject);
