import { pluralize } from 'inflection';
import { GraphQLJSON } from 'graphql-type-json';

import all from './Query/all';
import meta from './Query/meta';
import single from './Query/single';
import create from './Mutation/create';
import { createMany } from './Mutation/createMany';
import update from './Mutation/update';
import { remove } from './Mutation/remove';
import entityResolver from './Entity';
import { getTypeFromKey } from '../nameConverter';
import DateType, { GraphQLDate } from '../introspection/DateType';
import hasType from '../introspection/hasType';

type DataRecord = Record<string, any>;
type ResolverMap = Record<string, any>;

const getQueryResolvers = (entityName: string, data: any): ResolverMap => ({
    [`all${pluralize(entityName)}`]: all(data),
    [`_all${pluralize(entityName)}Meta`]: meta(data),
    [entityName]: single(data),
});

const getMutationResolvers = (entityName: string, data: any): ResolverMap => ({
    [`create${entityName}`]: create(data),
    [`createMany${entityName}`]: createMany(data),
    [`update${entityName}`]: update(data),
    [`remove${entityName}`]: remove(data),
});

export default (data: DataRecord): ResolverMap => {
    const queryResolvers = Object.keys(data).reduce<ResolverMap>(
        (resolvers, key) => ({
            ...resolvers,
            ...getQueryResolvers(getTypeFromKey(key), data[key]),
        }),
        {}
    );

    const mutationResolvers = Object.keys(data).reduce<ResolverMap>(
        (resolvers, key) => ({
            ...resolvers,
            ...getMutationResolvers(getTypeFromKey(key), data[key]),
        }),
        {}
    );

    const entityResolvers = Object.keys(data).reduce<ResolverMap>(
        (resolvers, key) => ({
            ...resolvers,
            [getTypeFromKey(key)]: entityResolver(key, data),
        }),
        {}
    );

    const additionalResolvers = {
        ...(hasType(GraphQLDate, data) ? { Date: DateType } : {}),
        ...(hasType('JSON', data) ? { JSON: GraphQLJSON } : {}),
    };

    return {
        Query: queryResolvers,
        Mutation: mutationResolvers,
        ...entityResolvers,
        ...additionalResolvers,
    };
};
