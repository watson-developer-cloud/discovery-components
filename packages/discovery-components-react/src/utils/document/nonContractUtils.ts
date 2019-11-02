/**
 * Checks if model is eithr invoices or purchaseOrder
 *
 * @param {string} modelId modelId takes the id of model
 * @returns {boolean} true if modelId is invoice or purchase_orders
 */
export const isNonContract = (modelId: string): boolean =>
  modelId === 'invoices' || modelId === 'purchase_orders';

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
