import { Item, RelationItem } from 'components/CIDocument/types';
import isEqual from 'lodash/isEqual';
import { isRelationObject } from './nonContractUtils';

/**
 * Creates an id string for the given item, based on the location.begin field
 *
 * @param {*} item Item to build a string id for
 * @returns {string} Id string
 */
export function getId(item: Item): string {
  return item.location && `${item.location.begin}_${item.location.end}`;
}

/**
 * Finds an item in the given list that matches the given id
 *
 * @param {Array} list List to search within
 * @param {Array<string>>} ids Id string to find a match for in the list
 * @returns {*} matching item
 */
export function findElement(list: Item[], ids: string[]): Item | undefined {
  return list[findElementIndex(list, ids)];
}

/**
 * Finds the index of an item in the given list that matches the given id
 *
 * @param {Array} list List to search within
 * @param {Array<string>} ids Id string to find a match for in the list
 * @returns {*} index of matching item
 */
export function findElementIndex(list: Item[], ids: string[]): number {
  if (list.some(li => isRelationObject(li))) {
    return list.findIndex(item =>
      isEqual((item as RelationItem).allAttributeIds.sort(), ids.sort())
    );
  }
  return list.findIndex(item => isEqual([getId(item)].sort(), ids.sort()));
}
