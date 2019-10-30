import { Item } from '../types';

/**
 * Creates an id string for the given item, based on the location.begin field
 *
 * @param {*} item Item to build a string id for
 * @returns {string} Id string
 */
export const getId = (item: Item): string =>
  item.location && `${item.location.begin}_${item.location.end}`;

/**
 * Finds an item in the given list that matches the given id
 *
 * @param {Array} list List to search within
 * @param {string} id Id string to find a match for in the list
 * @returns {*} matching item
 */
export const findElement = (list: Item[], id: string): Item | undefined =>
  list.find(item => getId(item) === id);

/**
 * Finds the index of an item in the given list that matches the given id
 *
 * @param {Array} list List to search within
 * @param {string|Array} id Id string to find a match for in the list
 * @returns {*} index of matching item
 */

export const findElementIndex = (list: Item[], id: string): number => {
  return list.findIndex(item => getId(item) === id);
};
