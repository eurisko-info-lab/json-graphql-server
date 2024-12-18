import { GraphQLObjectType, GraphQLFieldConfigMap } from 'graphql';
import { singularize, camelize } from 'inflection';

import getFieldsFromEntities from './getFieldsFromEntities';
import { getTypeFromKey } from '../nameConverter';

/**
 * Get a list of GraphQLObjectType from data
 *
 * @example
 * const data = {
 *    "posts": [
 *        { "id": 1, "title": "Lorem Ipsum", "views": 254, "user_id": 123 },
 *        { "id": 2, "title": "Sic Dolor amet", "views": 65, "user_id": 456 },
 *    ],
 *    "users": [
 *        { "id": 123, "name": "John Doe" },
 *        { "id": 456, "name": "Jane Doe" },
 *    ],
 * };
 * const types = getTypesFromData(data);
 * // [
 * //     new GraphQLObjectType({
 * //         name: "Post",
 * //         fields: {
 * //             id: { type: graphql.GraphQLString },
 * //             title: { type: graphql.GraphQLString },
 * //             views: { type: graphql.GraphQLInt },
 * //             user_id: { type: graphql.GraphQLString },
 * //         }
 * //     }),
 * //     new GraphQLObjectType({
 * //         name: "User",
 * //         fields: {
 * //             id: { type: graphql.GraphQLString },
 * //             name: { type: graphql.GraphQLString },
 * //         }
 * //     }),
 * // ]
 */
export default function getTypesFromData(data: Record<string, any[]>): GraphQLObjectType[] {
    return Object.keys(data)
        .map((typeName) => ({
            name: camelize(singularize(typeName)),
            fields: getFieldsFromEntities(data[typeName]) as GraphQLFieldConfigMap<any, any>,
        }))
        .map((typeObject) => new GraphQLObjectType(typeObject));
}

/**
 * Get a list of type names from data keys
 *
 * @param data - The data object containing entities
 * @returns An array of type names derived from the keys of the data
 */
export function getTypeNamesFromData(data: Record<string, any[]>): string[] {
    return Object.keys(data).map(getTypeFromKey);
}
