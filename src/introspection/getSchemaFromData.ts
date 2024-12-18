import {
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLInputObjectType,
    GraphQLSchema,
    GraphQLString,
    parse,
    extendSchema,
    GraphQLFieldConfigMap,
    GraphQLInputFieldConfigMap, GraphQLField, GraphQLInputType,
} from 'graphql';
import { pluralize, camelize } from 'inflection';

import getTypesFromData from './getTypesFromData';
import getFilterTypesFromData from './getFilterTypesFromData';
import { isRelationshipField } from '../relationships';
import { getRelatedType } from '../nameConverter';

type DataRecord = Record<string, any[]>;

export default (data: DataRecord): GraphQLSchema => {
    const types = getTypesFromData(data);
    const typesByName = types.reduce<Record<string, GraphQLObjectType>>((acc, type) => {
        acc[type.name] = type;
        return acc;
    }, {});

    const filterTypesByName = getFilterTypesFromData(data);

    const listMetadataType = new GraphQLObjectType({
        name: 'ListMetadata',
        fields: {
            count: { type: GraphQLInt },
        },
    });

    const queryType = new GraphQLObjectType({
        name: 'Query',
        fields: types.reduce<GraphQLFieldConfigMap<any, any>>((fields, type) => {
            fields[type.name] = {
                type: typesByName[type.name],
                args: {
                    id: { type: new GraphQLNonNull(GraphQLID) },
                },
            };
            fields[`all${camelize(pluralize(type.name))}`] = {
                type: new GraphQLList(typesByName[type.name]),
                args: {
                    page: { type: GraphQLInt },
                    perPage: { type: GraphQLInt },
                    sortField: { type: GraphQLString },
                    sortOrder: { type: GraphQLString },
                    filter: { type: filterTypesByName[type.name] },
                },
            };
            fields[`_all${camelize(pluralize(type.name))}Meta`] = {
                type: listMetadataType,
                args: {
                    page: { type: GraphQLInt },
                    perPage: { type: GraphQLInt },
                    filter: { type: filterTypesByName[type.name] },
                },
            };
            return fields;
        }, {}),
    });


    const mutationType = new GraphQLObjectType({
        name: 'Mutation',
        fields: types.reduce<GraphQLFieldConfigMap<any, any>>((fields, type) => {
            const typeFields = typesByName[type.name].getFields();

            // Map nullable fields for updates
            const nullableTypeFields: GraphQLInputFieldConfigMap = Object.keys(typeFields).reduce(
                (acc, fieldName) => {
                    acc[fieldName] = {
                        type:
                            (fieldName !== 'id' && typeFields[fieldName].type instanceof GraphQLNonNull
                                ? typeFields[fieldName].type.ofType // Remove NonNull for inputs
                                : typeFields[fieldName].type) as GraphQLInputType,
                    };
                    return acc;
                },
                {} as GraphQLInputFieldConfigMap
            );

            // Map create fields for new entity creation
            const { id, ...otherFields } = typeFields;
            const createFields: GraphQLInputFieldConfigMap = Object.keys(otherFields).reduce(
                (acc, fieldName) => {
                    acc[fieldName] = {
                        type: (otherFields[fieldName].type instanceof GraphQLNonNull
                            ? otherFields[fieldName].type // Preserve NonNull
                            : new GraphQLNonNull(otherFields[fieldName].type)) as GraphQLInputType,
                    };
                    return acc;
                },
                {} as GraphQLInputFieldConfigMap
            );

            // Input type for createMany mutation
            const createManyInputType = new GraphQLInputObjectType({
                name: `${type.name}Input`,
                fields: createFields,
            });

            // Define mutations
            fields[`create${type.name}`] = {
                type: typesByName[type.name], // Output type
                args: createFields, // Input fields
            };

            fields[`createMany${type.name}`] = {
                type: new GraphQLList(typesByName[type.name]), // Output type
                args: {
                    data: {
                        type: new GraphQLList(createManyInputType), // Input type
                    },
                },
            };

            fields[`update${type.name}`] = {
                type: typesByName[type.name], // Output type
                args: nullableTypeFields, // Input fields
            };

            fields[`remove${type.name}`] = {
                type: typesByName[type.name], // Output type
                args: {
                    id: { type: new GraphQLNonNull(GraphQLID) }, // Input field
                },
            };

            return fields;
        }, {}),
    });

    const schema = new GraphQLSchema({
        query: queryType,
        mutation: mutationType,
    });

    /**
     * extend schema to add relationship fields
     *
     * @example
     * If the `post` key contains a 'user_id' field, then
     * add one-to-many and many-to-one type extensions:
     *     extend type Post { User: User }
     *     extend type User { Posts: [Post] }
     */
    const schemaExtension = Object.values(typesByName).reduce((ext, type) => {
        Object.keys(type.getFields())
            .filter(isRelationshipField)
            .forEach((fieldName) => {
                const relType = getRelatedType(fieldName);
                const rel = pluralize(type.toString());
                ext += `
extend type ${type} { ${relType}: ${relType} }
extend type ${relType} { ${rel}: [${type}] }`;
            });
        return ext;
    }, '');

    return schemaExtension
        ? extendSchema(schema, parse(schemaExtension))
        : schema;
};
