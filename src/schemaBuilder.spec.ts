import { graphql, GraphQLError, GraphQLSchema } from 'graphql';
import schemaBuilder from './schemaBuilder';

test('plugs resolvers with schema', async () => {
    const schema: GraphQLSchema = schemaBuilder({
        posts: [{ id: 0, title: 'hello', foo: 'bar' }],
    });

    const result = await graphql({
        schema,
        source: 'query { Post(id: 0) { id title } }',
    });

    expect(result).toEqual({
        data: { Post: { id: '0', title: 'hello' } },
    });
});

const data = {
    posts: [
        {
            id: 1,
            title: 'Lorem Ipsum',
            views: 254,
            user_id: 123,
        },
        {
            id: 2,
            title: 'Ut enim ad minim veniam',
            views: 65,
            user_id: 456,
        },
        {
            id: 3,
            title: 'Sic Dolor amet',
            views: 76,
            user_id: 123,
        },
    ],
    users: [
        { id: 123, name: 'John Doe' },
        { id: 456, name: 'Jane Doe' },
    ],
    comments: [
        { id: 987, post_id: 1, body: 'Consectetur adipiscing elit' },
        { id: 995, post_id: 1, body: 'Nam molestie pellentesque dui' },
        { id: 998, post_id: 2, body: 'Sunt in culpa qui officia' },
    ],
};

const schema: GraphQLSchema = schemaBuilder(data);

test('all* route returns all entities by default', async () => {
    const result = await graphql({
        schema,
        source: '{ allPosts { id } }',
    });

    expect(result).toEqual({
        data: {
            allPosts: [{ id: '1' }, { id: '2' }, { id: '3' }],
        },
    });
});

test('all* route supports pagination', async () => {
    const result = await graphql({
        schema,
        source: '{ allPosts(page: 0, perPage: 2) { id } }',
    });

    expect(result).toEqual({
        data: {
            allPosts: [{ id: '1' }, { id: '2' }],
        },
    });
});

test('all* route supports sorting', async () => {
    const result = await graphql({
        schema,
        source: '{ allPosts(sortField: "views", sortOrder: "desc") { id } }',
    });

    expect(result).toEqual({
        data: {
            allPosts: [{ id: '1' }, { id: '3' }, { id: '2' }],
        },
    });
});

test('all* route supports filtering', async () => {
    const result = await graphql({
        schema,
        source: '{ allPosts(filter: { q: "lorem"}) { id } }',
    });

    expect(result).toEqual({
        data: {
            allPosts: [{ id: '1' }],
        },
    });
});

test('entity route returns a single entity', async () => {
    const result = await graphql({
        schema,
        source: '{ Post(id: 2) { id } }',
    });

    expect(result).toEqual({
        data: {
            Post: { id: '2' },
        },
    });
});

test('entity route gets all the entity fields', async () => {
    const result = await graphql({
        schema,
        source: '{ Post(id: 1) { id title views user_id } }',
    });

    expect(result).toEqual({
        data: {
            Post: {
                id: '1',
                title: 'Lorem Ipsum',
                user_id: '123',
                views: 254,
            },
        },
    });
});

test('entity route gets many to one relationships fields', async () => {
    const result = await graphql({
        schema,
        source: '{ Post(id: 1) { User { name } } }',
    });

    expect(result).toEqual({
        data: { Post: { User: { name: 'John Doe' } } },
    });
});

test('entity route gets one to many relationships fields', async () => {
    const result = await graphql({
        schema,
        source: '{ Post(id: 1) { Comments { body } } }',
    });

    expect(result).toEqual({
        data: {
            Post: {
                Comments: [
                    { body: 'Consectetur adipiscing elit' },
                    { body: 'Nam molestie pellentesque dui' },
                ],
            },
        },
    });
});

test('returns an error when asked for a non-existent field', async () => {
    const result = await graphql({
        schema,
        source: '{ Post(id: 1) { foo } }',
    });

    expect(result).toEqual({
        errors: [
            new GraphQLError('Cannot query field "foo" on type "Post".'),
        ],
    });
});
