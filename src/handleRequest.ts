import { graphql, GraphQLSchema } from 'graphql';
import schemaBuilder from './schemaBuilder';

/**
 * Starts a GraphQL Server in your browser: intercepts every call to the specified URL
 * and returns a response from the supplied data.
 *
 * @param data - The data to be used for the GraphQL schema.
 * @returns A function to handle GraphQL requests.
 *
 * @example
 * const data = {
 *    posts: [
 *        {
 *            id: 1,
 *            title: 'Lorem Ipsum',
 *            views: 254,
 *            user_id: 123,
 *        },
 *        {
 *            id: 2,
 *            title: 'Sic Dolor amet',
 *            views: 65,
 *            user_id: 456,
 *        },
 *    ],
 *    users: [
 *        {
 *            id: 123,
 *            name: 'John Doe',
 *        },
 *        {
 *            id: 456,
 *            name: 'Jane Doe',
 *        },
 *    ],
 * };
 *
 * GraphQLClientServer(data);
 * GraphQLClientServer(data, 'http://localhost:8080/api/graphql');
 */
export default function GraphQLClientServer(data: Record<string, unknown>) {
    const schema: GraphQLSchema = schemaBuilder(data);

    return async (
        url: string,
        opts: { body?: string } = {}
    ): Promise<{
        status: number;
        headers: Record<string, string>;
        body: string;
    }> => {
        let body: string | undefined = opts.body;

        if (url.requestBody) {
            body = url.requestBody;
        }

        if (!body) {
            throw new Error('Request body is missing');
        }

        const query = JSON.parse(body);

        try {
            const result = await graphql({
                schema,
                source: query.query,
                variableValues: query.variables,
            });

            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(result),
            };
        } catch (error) {
            return {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(error),
            };
        }
    };
}
