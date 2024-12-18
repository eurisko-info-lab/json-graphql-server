import getFieldsFromEntities from '../../introspection/getFieldsFromEntities';
import {
    getRelatedKey,
    getRelatedType,
    getRelationshipFromKey,
    getReverseRelatedField,
} from '../../nameConverter';
import { isRelationshipField } from '../../relationships';

/**
 * Add resolvers for relationship fields
 *
 * @param entityName - The entity key in the data map, e.g., "posts"
 * @param data - The entire data map, e.g., { posts: [], users: [] }
 *
 * @returns Resolvers for relationship fields
 *
 * @example
 * Consider this data:
 *
 *     {
 *         posts: [
 *              { id: 1, title: 'Hello, world', user_id: 123 }
 *         ],
 *         users: [
 *              { id: 123, name: 'John Doe' }
 *         ]
 *         comments: [
 *              { id: 4646, post_id: 1, body: 'Nice post!' }
 *         ]
 *     }
 *
 * There are two relationship fields here, posts.user_id and comments.post_id.
 * The generated GraphQL schema for posts is:
 *
 *     type Post {
 *         id: ID!
 *         title: String
 *         user_id: ID
 *         User: User
 *         Comments: [Comment]
 *     }
 *
 * When called for the posts entity, this method generates resolvers
 * for Post.User and Post.Comments
 *
 * @example Result:
 *     {
 *         Post: {
 *             User: (post) => users.find(user => user.id == post.user_id),
 *             Comments: (post) => comments.filter(comment => comment.post_id = post.id),
 *         },
 *     }
 */
export default (entityName: string, data: Record<string, any[]>): Record<string, any> => {
    const entityFields = Object.keys(getFieldsFromEntities(data[entityName]));

    // Many-to-one resolvers
    const manyToOneResolvers = entityFields
        .filter(isRelationshipField)
        .reduce<Record<string, any>>((resolvers, fieldName) => ({
            ...resolvers,
            [getRelatedType(fieldName)]: (entity: Record<string, any>) =>
                data[getRelatedKey(fieldName)].find(
                    (relatedRecord) => relatedRecord.id == entity[fieldName]
                ),
        }), {});

    const relatedField = getReverseRelatedField(entityName); // 'posts' => 'post_id'

    const hasReverseRelationship = (entityName: string): boolean =>
        Object.keys(getFieldsFromEntities(data[entityName])).includes(relatedField);

    const entities = Object.keys(data);

    // One-to-many resolvers
    const oneToManyResolvers = entities
        .filter(hasReverseRelationship)
        .reduce<Record<string, any>>((resolvers, relatedEntityName) => ({
            ...resolvers,
            [getRelationshipFromKey(relatedEntityName)]: (entity: Record<string, any>) =>
                data[relatedEntityName].filter(
                    (record) => record[relatedField] == entity.id
                ),
        }), {});

    return {
        ...manyToOneResolvers,
        ...oneToManyResolvers,
    };
};
