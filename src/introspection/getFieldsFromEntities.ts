import { GraphQLInputFieldConfigMap, GraphQLFieldConfigMap, GraphQLOutputType } from 'graphql';
import getTypeFromValues from './getTypeFromValues';
import getValuesFromEntities from './getValuesFromEntities';

/**
 * Get a list of GraphQL fields from a list of entities
 *
 * @example
 * const entities = [
 *     {
 *         "id": 1,
 *         "title": "Lorem Ipsum",
 *         "views": 254,
 *         "user_id": 123,
 *     },
 *     {
 *         "id": 2,
 *         "title": "Sic Dolor amet",
 *         "user_id": 456,
 *     },
 * ];
 * const types = getFieldsFromEntities(entities);
 * // {
 * //    id: { type: new GraphQLNonNull(GraphQLString) },
 * //    title: { type: new GraphQLNonNull(GraphQLString) },
 * //    views: { type: GraphQLInt },
 * //    user_id: { type: new GraphQLNonNull(GraphQLString) },
 * // };
 *
 * @param entities - List of entities to derive GraphQL fields from.
 * @param checkRequired - Whether to mark fields as required if all entities have the field (default: true).
 * @returns A map of GraphQL field configurations.
 */
export default function getFieldsFromEntities(
    entities: Record<string, any>[],
    checkRequired: boolean = true
): GraphQLFieldConfigMap<any, any> | GraphQLInputFieldConfigMap {
    const fieldValues = getValuesFromEntities(entities);
    const nbValues = entities.length;

    return Object.keys(fieldValues).reduce<GraphQLFieldConfigMap<any, any>>((fields, fieldName) => {
        fields[fieldName] = {
            type: getTypeFromValues(
                fieldName,
                fieldValues[fieldName],
                checkRequired
                    ? fieldValues[fieldName].length === nbValues
                    : false
            ) as GraphQLOutputType,
        };
        return fields;
    }, {});
}
