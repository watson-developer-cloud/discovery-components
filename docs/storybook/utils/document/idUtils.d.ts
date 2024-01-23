import { Item } from 'components/CIDocument/types';
/**
 * Creates an id string for the given item, based on the location.begin field
 *
 * @param {*} item Item to build a string id for
 * @returns {string} Id string
 */
export declare function getId(item: Item): string;
/**
 * Finds an item in the given list that matches the given id
 *
 * @param {Array} list List to search within
 * @param {Array<string>>} ids Id string to find a match for in the list
 * @returns {*} matching item
 */
export declare function findElement(list: Item[], ids: string[]): Item | undefined;
/**
 * Finds the index of an item in the given list that matches the given id
 *
 * @param {Array} list List to search within
 * @param {Array<string>} ids Id string to find a match for in the list
 * @returns {*} index of matching item
 */
export declare function findElementIndex(list: Item[], ids: string[]): number;
