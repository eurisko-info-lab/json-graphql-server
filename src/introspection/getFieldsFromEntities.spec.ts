import { GraphQLString, GraphQLID, GraphQLNonNull, GraphQLFieldConfigMap } from 'graphql';
import getFieldsFromEntities from './getFieldsFromEntities';

test('does infer field types', () => {
    const result = getFieldsFromEntities([
        { id: 1, foo: 'foo1' },
        { id: 2, foo: 'foo2', bar: 'bar1' },
        { id: 3, bar: 'bar2' },
    ]);

    expect(result).toEqual({
        id: { type: new GraphQLNonNull(GraphQLID) },
        foo: { type: GraphQLString },
        bar: { type: GraphQLString },
    });
});
