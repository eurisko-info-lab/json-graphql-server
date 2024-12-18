import { printSchema, GraphQLSchema, GraphQLObjectType, GraphQLFieldConfigMap } from 'graphql';

/**
 * Return a schema string with a Main type using the fields
 *
 * @param fields - An object defining GraphQL fields for the Main type
 * @returns A string representation of the schema
 *
 * @example
 * printSchemaForFields({
 *     id: { type: graphql.GraphQLString },
 *     title: { type: graphql.GraphQLString },
 *     views: { type: graphql.GraphQLInt },
 *     user_id: { type: graphql.GraphQLString },
 * });
 * // type Main {
 * //   id: String
 * //   title: String
 * //   views: String
 * //   user_id: String
 * // }
 * //
 * // type Query {
 * //   foo: Main
 * // }
 */
export const printSchemaForFields = (fields: GraphQLFieldConfigMap<any, any>): string => {
    const mainType = new GraphQLObjectType({
        name: 'Main',
        fields,
    });

    const queryType = new GraphQLObjectType({
        name: 'Query',
        fields: {
            foo: { type: mainType },
        },
    });

    const schema = new GraphQLSchema({ query: queryType });
    return printSchema(schema);
};

/**
 * Return a schema string for a set of types
 *
 * @param types - An array of GraphQLObjectType to include in the schema
 * @returns A string representation of the schema
 */
export const printSchemaForTypes = (types: GraphQLObjectType[]): string => {
    const typesSchema = types.reduce<Record<string, GraphQLObjectType>>((schema, type) => {
        schema[type.name] = type;
        return schema;
    }, {});

    const queryType = new GraphQLObjectType({
        name: 'Query',
        fields: types.reduce<GraphQLFieldConfigMap<any, any>>((fields, type) => {
            fields[type.name] = { type };
            return fields;
        }, {}),
    });

    const schema = new GraphQLSchema({ ...typesSchema, query: queryType });
    return printSchema(schema);
};
