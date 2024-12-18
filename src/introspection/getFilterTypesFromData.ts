import {
    GraphQLBoolean,
    GraphQLInputObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLFloat,
    GraphQLList,
    GraphQLID,
    GraphQLInputFieldConfigMap, GraphQLInputType,
} from 'graphql';
import getFieldsFromEntities from './getFieldsFromEntities';
import getValuesFromEntities from './getValuesFromEntities';
import getTypeFromValues from './getTypeFromValues';
import { getTypeFromKey } from '../nameConverter';
import { GraphQLDate } from './DateType';
import { GraphQLScalarType } from 'graphql/index';

type EntityData = Record<string, any[]>;

const getRangeFiltersFromEntities = (entities: Record<string, any>[]): GraphQLInputFieldConfigMap => {
    const fieldValues = getValuesFromEntities(entities);

    return Object.keys(fieldValues).reduce<GraphQLInputFieldConfigMap>((fields, fieldName) => {
        const fieldType : GraphQLInputType = getTypeFromValues(fieldName, fieldValues[fieldName], false) as GraphQLInputType;

        if (
            fieldType === GraphQLInt ||
            fieldType === GraphQLFloat ||
            fieldType === GraphQLString ||
            fieldType instanceof GraphQLScalarType && fieldType.name === GraphQLDate
        ) {
            fields[`${fieldName}_lt`] = { type: fieldType };
            fields[`${fieldName}_lte`] = { type: fieldType };
            fields[`${fieldName}_gt`] = { type: fieldType };
            fields[`${fieldName}_gte`] = { type: fieldType };
        }

        if (fieldType !== GraphQLBoolean && !(fieldType instanceof GraphQLList)) {
            fields[`${fieldName}_neq`] = { type: fieldType};
        }

        return fields;
    }, {});
};

/**
 * Get a list of GraphQLInputObjectType for filtering data
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
 * const types = getFilterTypesFromData(data);
 */
export default (data: EntityData): Record<string, GraphQLInputObjectType> =>
    Object.keys(data).reduce<Record<string, GraphQLInputObjectType>>((types, key) => {
        types[getTypeFromKey(key)] = new GraphQLInputObjectType({
            name: `${getTypeFromKey(key)}Filter`,
            fields: {
                q: { type: GraphQLString },
                ids: { type: new GraphQLList(GraphQLID) },
                ...getFieldsFromEntities(data[key], false),
                ...getRangeFiltersFromEntities(data[key]),
            },
        });

        return types;
    }, {});
