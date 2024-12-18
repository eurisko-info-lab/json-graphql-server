import {
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLInputObjectType,
    GraphQLOutputType,
    GraphQLFieldConfigMap,
} from 'graphql';
import getSchemaFromData from './getSchemaFromData';

function getName(type: GraphQLOutputType | undefined): string {
    if (type instanceof GraphQLObjectType) {
        return type.name;
    }
    return "";
}

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
            title: 'Sic Dolor amet',
            views: 65,
            user_id: 456,
        },
    ],
    users: [
        {
            id: 123,
            name: 'John Doe',
        },
        {
            id: 456,
            name: 'Jane Doe',
        },
    ],
};

// @ts-ignore
const PostType = new GraphQLObjectType({
    name: 'Post',
    fields: (): GraphQLFieldConfigMap<any, any> => ({
        id: { type: new GraphQLNonNull(GraphQLID) },
        title: { type: new GraphQLNonNull(GraphQLString) },
        views: { type: new GraphQLNonNull(GraphQLInt) },
        user_id: { type: new GraphQLNonNull(GraphQLID) },
        User: { type: UserType },
    }),
});

// @ts-ignore
const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () : GraphQLFieldConfigMap<any, any> => ({
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        Posts: { type: new GraphQLList(PostType) },
    }),
});

test('creates one type per data type', () => {
    const schema: GraphQLSchema = getSchemaFromData(data);
    const typeMap = schema.getTypeMap();
    expect(typeMap['Post'].name).toEqual(PostType.name);
    expect(Object.keys((typeMap['Post'] as GraphQLObjectType).getFields())).toEqual(
        Object.keys(PostType.getFields())
    );
    expect(typeMap['User'].name).toEqual(UserType.name);
    expect(Object.keys((typeMap['User'] as GraphQLObjectType).getFields())).toEqual(
        Object.keys(UserType.getFields())
    );
});

test('creates one field per relationship', () => {
    const typeMap = getSchemaFromData(data).getTypeMap();
    expect(Object.keys((typeMap['Post'] as GraphQLObjectType).getFields())).toContain('User');
});

test('creates one field per reverse relationship', () => {
    const typeMap = getSchemaFromData(data).getTypeMap();
    expect(Object.keys((typeMap['User'] as GraphQLObjectType).getFields())).toContain('Posts');
});

test('creates three query fields per data type', () => {
    const queries = getSchemaFromData(data).getQueryType()?.getFields();
    expect(getName(queries?.['Post'].type)).toEqual(PostType.name);
    expect(queries?.['Post'].args).toEqual([
        expect.objectContaining({
            name: 'id',
            type: new GraphQLNonNull(GraphQLID),
        }),
    ]);
    expect(queries?.['allPosts'].type.toString()).toEqual('[Post]');
    expect(queries?.['allPosts'].args?.[0].name).toEqual('page');
    expect(queries?.['allPosts'].args?.[0].type).toEqual(GraphQLInt);
    expect(queries?.['allPosts'].args?.[1].name).toEqual('perPage');
    expect(queries?.['allPosts'].args?.[1].type).toEqual(GraphQLInt);
    expect(queries?.['allPosts'].args?.[2].name).toEqual('sortField');
    expect(queries?.['allPosts'].args?.[2].type).toEqual(GraphQLString);
    expect(queries?.['allPosts'].args?.[3].name).toEqual('sortOrder');
    expect(queries?.['allPosts'].args?.[3].type).toEqual(GraphQLString);
    expect(queries?.['allPosts'].args?.[4].name).toEqual('filter');
    expect(queries?.['allPosts'].args?.[4].type.toString()).toEqual('PostFilter');
    expect(queries?.['_allPostsMeta'].type.toString()).toEqual('ListMetadata');

    expect((queries?.['User'].type as GraphQLObjectType).name).toEqual(UserType.name);
    expect(queries?.['User'].args).toEqual([
        expect.objectContaining({
            name: 'id',
            type: new GraphQLNonNull(GraphQLID),
        }),
    ]);
    expect(queries?.['allUsers'].type.toString()).toEqual('[User]');
    expect(queries?.['allUsers'].args?.[0].name).toEqual('page');
    expect(queries?.['allUsers'].args?.[0].type).toEqual(GraphQLInt);
    expect(queries?.['allUsers'].args?.[1].name).toEqual('perPage');
    expect(queries?.['allUsers'].args?.[1].type).toEqual(GraphQLInt);
    expect(queries?.['allUsers'].args?.[2].name).toEqual('sortField');
    expect(queries?.['allUsers'].args?.[2].type).toEqual(GraphQLString);
    expect(queries?.['allUsers'].args?.[3].name).toEqual('sortOrder');
    expect(queries?.['allUsers'].args?.[3].type).toEqual(GraphQLString);
    expect(queries?.['allUsers'].args?.[4].name).toEqual('filter');
    expect(queries?.['allUsers'].args?.[4].type.toString()).toEqual('UserFilter');
    expect(queries?.['_allPostsMeta'].type.toString()).toEqual('ListMetadata');
});

test('creates three mutation fields per data type', () => {
    const mutations = getSchemaFromData(data).getMutationType()?.getFields();
    expect(getName(mutations?.['createPost'].type)).toEqual(PostType.name);
    expect(mutations?.['createPost'].args).toEqual([
        expect.objectContaining({
            name: 'title',
            type: new GraphQLNonNull(GraphQLString),
        }),
        expect.objectContaining({
            name: 'views',
            type: new GraphQLNonNull(GraphQLInt),
        }),
        expect.objectContaining({
            name: 'user_id',
            type: new GraphQLNonNull(GraphQLID),
        }),
    ]);
    expect((mutations?.['updatePost'].type as GraphQLObjectType).name).toEqual(PostType.name);
    expect(mutations?.['updatePost'].args).toEqual([
        expect.objectContaining({
            name: 'id',
            type: new GraphQLNonNull(GraphQLID),
        }),
        expect.objectContaining({
            name: 'title',
            type: GraphQLString,
        }),
        expect.objectContaining({
            name: 'views',
            type: GraphQLInt,
        }),
        expect.objectContaining({
            name: 'user_id',
            type: GraphQLID,
         }),
    ]);
    expect((mutations?.['removePost'].type as GraphQLObjectType).name).toEqual(PostType.name);
    expect(mutations?.['removePost'].args).toEqual([
        expect.objectContaining({
            name: 'id',
            type: new GraphQLNonNull(GraphQLID),
        }),
    ]);
    expect((mutations?.['createUser'].type as GraphQLObjectType).name).toEqual(UserType.name);
    expect(mutations?.['createUser'].args).toEqual([
        expect.objectContaining({
            name: 'name',
            type: new GraphQLNonNull(GraphQLString),
        }),
    ]);
    expect((mutations?.['updateUser'].type as GraphQLObjectType).name).toEqual(UserType.name);
    expect(mutations?.['updateUser'].args).toEqual([
        expect.objectContaining({
            name: 'id',
            type: new GraphQLNonNull(GraphQLID),
        }),
        expect.objectContaining({
            name: 'name',
            type: GraphQLString,
        }),
    ]);
    expect((mutations?.['removeUser'].type as GraphQLObjectType).name).toEqual(UserType.name);
    expect(mutations?.['removeUser'].args).toEqual([
        expect.objectContaining({
            name: 'id',
            type: new GraphQLNonNull(GraphQLID),
        }),
    ]);
});

test('creates the mutation *Input type for createMany', () => {
    const mutations = getSchemaFromData(data).getMutationType()?.getFields();
    const createManyPostInputType = mutations?.['createManyPost'].args?.[0].type as GraphQLList<GraphQLInputObjectType>;
    expect(createManyPostInputType.toString()).toEqual('[PostInput]');
    expect(createManyPostInputType.ofType.getFields()).toEqual({
        title: expect.objectContaining({
            type: new GraphQLNonNull(GraphQLString),
            name: 'title',
        }),
        views: expect.objectContaining({
            type: new GraphQLNonNull(GraphQLInt),
            name: 'views',
        }),
        user_id: expect.objectContaining({
            type: new GraphQLNonNull(GraphQLID),
            name: 'user_id',
        }),
    });
});

test('pluralizes and capitalizes correctly', () => {
    const data = {
        feet: [
            { id: 1, size: 42 },
            { id: 2, size: 39 },
        ],
        categories: [{ id: 1, name: 'foo' }],
    };
    const queries = getSchemaFromData(data).getQueryType()?.getFields();
    expect(queries).toHaveProperty('Foot');
    expect(queries).toHaveProperty('Category');
    expect(queries).toHaveProperty('allFeet');
    expect(queries).toHaveProperty('allCategories');
    const types = getSchemaFromData(data).getTypeMap();
    expect(types).toHaveProperty('Foot');
    expect(types).toHaveProperty('Category');
});
