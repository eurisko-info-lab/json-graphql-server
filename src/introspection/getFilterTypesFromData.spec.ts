import { GraphQLInputObjectType } from 'graphql';
import getFilterTypesFromData from './getFilterTypesFromData';

const data = {
    posts: [
        {
            id: 1,
            title: 'Lorem Ipsum',
            views: 254,
            user_id: 123,
            published: true,
        },
        {
            id: 2,
            title: 'Sic Dolor amet',
            views: 65,
            user_id: 456,
            published: true,
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

test('creates one filter type per entity', () => {
    const filterTypes: Record<string, GraphQLInputObjectType> = getFilterTypesFromData(data);
    expect(Object.values(filterTypes).map((type) => type.name)).toEqual([
        'PostFilter',
        'UserFilter',
    ]);
});

test('creates one filter field per entity field', () => {
    const filterTypes: Record<string, GraphQLInputObjectType> = getFilterTypesFromData(data);
    const PostFilterFields = filterTypes['Post'].getFields();
    expect(PostFilterFields['id'].type.toString()).toEqual('ID');
    expect(PostFilterFields['title'].type.toString()).toEqual('String');
    expect(PostFilterFields['views'].type.toString()).toEqual('Int');
    expect(PostFilterFields['user_id'].type.toString()).toEqual('ID');
    const UserFilterFields = filterTypes['User'].getFields();
    expect(UserFilterFields['id'].type.toString()).toEqual('ID');
    expect(UserFilterFields['name'].type.toString()).toEqual('String');
});

test('creates one q field per entity field', () => {
    const filterTypes: Record<string, GraphQLInputObjectType> = getFilterTypesFromData(data);
    const PostFilterFields = filterTypes['Post'].getFields();
    expect(PostFilterFields['q'].type.toString()).toEqual('String');
    const UserFilterFields = filterTypes['User'].getFields();
    expect(UserFilterFields['q'].type.toString()).toEqual('String');
});

test('creates 4 fields for number field for range filters', () => {
    const filterTypes: Record<string, GraphQLInputObjectType> = getFilterTypesFromData(data);
    const PostFilterFields = filterTypes['Post'].getFields();
    expect(PostFilterFields['views_lt'].type.toString()).toEqual('Int');
    expect(PostFilterFields['views_lte'].type.toString()).toEqual('Int');
    expect(PostFilterFields['views_gt'].type.toString()).toEqual('Int');
    expect(PostFilterFields['views_gte'].type.toString()).toEqual('Int');
});

test('does not create comparison fields for fields that do not support it', () => {
    const filterTypes: Record<string, GraphQLInputObjectType> = getFilterTypesFromData(data);
    const PostFilterFields = filterTypes['Post'].getFields();
    expect(PostFilterFields['published_lte']).toBeUndefined();
});
