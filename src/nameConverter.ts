import { camelize, pluralize, singularize } from 'inflection';

/**
 * A bit of vocabulary
 *
 * Consider this data:
 * {
 *     posts: [
 *          { id: 1, title: 'foo', user_id: 123 }
 *     ],
 *     users: [
 *          { id: 123, name: 'John Doe' }
 *     ]
 * }
 *
 * We'll use the following names:
 * - key: the keys in the data map, e.g. 'posts', 'users'
 * - type: for a key, the related type in the graphQL schema, e.g. 'posts' => 'Post', 'users' => 'User'
 * - field: the keys in a record, e.g. 'id', 'foo', 'user_id'
 * - relationship field: a key ending in '_id', e.g. 'user_id'
 * - related key: for a relationship field, the related key, e.g. 'user_id' => 'users'
 */

/**
 * Gets the relationship from a key.
 *
 * @param key - The key, e.g., 'users'
 * @return The camelized relationship, e.g., 'Users'
 */
export const getRelationshipFromKey = (key: string): string => camelize(key);

/**
 * Gets the type from a key.
 *
 * @param key - The key, e.g., 'users'
 * @return The singularized and camelized type, e.g., 'User'
 */
export const getTypeFromKey = (key: string): string => camelize(singularize(key));

/**
 * Gets the related key for a relationship field.
 *
 * @param fieldName - The field name, e.g., 'user_id'
 * @return The pluralized related key, e.g., 'users'
 */
export const getRelatedKey = (fieldName: string): string =>
    pluralize(fieldName.substring(0, fieldName.length - 3));

/**
 * Gets the reverse related field for a key.
 *
 * @param key - The key, e.g., 'users'
 * @return The reverse related field, e.g., 'user_id'
 */
export const getReverseRelatedField = (key: string): string => `${singularize(key)}_id`;

/**
 * Gets the related type from a relationship field.
 *
 * @param fieldName - The field name, e.g., 'user_id'
 * @return The related type, e.g., 'User'
 */
export const getRelatedType = (fieldName: string): string =>
    getTypeFromKey(fieldName.substring(0, fieldName.length - 3));
