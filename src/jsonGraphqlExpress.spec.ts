import express, { Application } from 'express';
import request, { SuperTest } from 'supertest';
import jsonGraphqlExpress from './jsonGraphqlExpress';

interface Data {
    posts: {
        id: number;
        title: string;
        views: number;
        user_id: number;
    }[];
    users: {
        id: number;
        name: string;
    }[];
    comments: {
        id: number;
        post_id: number;
        body: string;
    }[];
}

const data: Data = {
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

let agent: SuperTest;

beforeAll(() => {
    const app: Application = express();
    app.use(
        '/',
        jsonGraphqlExpress(data as unknown as Record<string, unknown>)
    );
    agent = request(app) as unknown as SuperTest;
});

const gqlAgent = (query: string, variables?: Record<string, unknown>) =>
    agent.post('/').send({
        query,
        variables,
    });

describe('integration tests', () => {
    it('returns all entities by default', async () =>
        gqlAgent('{ allPosts { id } }').expect({
            data: {
                allPosts: [{ id: '1' }, { id: '2' }, { id: '3' }],
            },
        }));

    it('filters by string using the q filter in a case-insensitive way', async () =>
        gqlAgent('{ allPosts(filter: { q: "lorem" }) { id } }').expect({
            data: {
                allPosts: [{ id: '1' }],
            },
        }));

    it('gets an entity by id', async () =>
        gqlAgent('{ Post(id: 1) { id } }').expect({
            data: {
                Post: { id: '1' },
            },
        }));

    it('gets all the entity fields', async () =>
        gqlAgent('{ Post(id: 1) { id title views user_id } }').expect({
            data: {
                Post: {
                    id: '1',
                    title: 'Lorem Ipsum',
                    views: 254,
                    user_id: '123',
                },
            },
        }));

    it('throws an error when asked for a non existent field', async () =>
        gqlAgent('{ Post(id: 1) { foo } }').expect({
            errors: [
                {
                    message: 'Cannot query field "foo" on type "Post".',
                    locations: [{ line: 1, column: 17 }],
                },
            ],
        }));

    it('gets relationship fields', async () =>
        gqlAgent('{ Post(id: 1) { User { name } Comments { body }} }').expect({
            data: {
                Post: {
                    User: { name: 'John Doe' },
                    Comments: [
                        { body: 'Consectetur adipiscing elit' },
                        { body: 'Nam molestie pellentesque dui' },
                    ],
                },
            },
        }));

    it('allows multiple mutations', async () => {
        await gqlAgent(
            'mutation{ updatePost(id:"2", title:"Foo bar", views: 200, user_id:"123") { id } }'
        );
        const res = await gqlAgent(
            'mutation{ updatePost(id:"2", title:"Foo bar", views: 200, user_id:"123") { id } }'
        );
        expect(res.body).toEqual({ data: { updatePost: { id: '2' } } });
    });
});
