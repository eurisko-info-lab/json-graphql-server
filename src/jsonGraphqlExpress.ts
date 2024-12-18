import { createHandler } from 'graphql-http/lib/use/express';
import { Request, Response } from 'express';
import schemaBuilder from './schemaBuilder';
import { graphiqlHandler } from './graphiqlHandler';

/**
 * An express middleware for a GraphQL endpoint serving data from the supplied JSON.
 *
 * @param data - The data to be served through the GraphQL endpoint
 * @returns An express middleware function
 *
 * @example
 * import express from 'express';
 * import jsonGraphqlExpress from 'json-graphql-server';
 *
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
 * const PORT = 3000;
 * const app = express();
 *
 * app.use('/graphql', jsonGraphqlExpress(data));
 *
 * app.listen(PORT);
 */
const jsonGraphqlExpress = (data: Record<string, unknown>) => {
    const graphqlHandler = createHandler({
        schema: schemaBuilder(data),
    });

    return (req: Request, res: Response): void => {
        if (req.is('application/json')) {
            return graphqlHandler(req, res, () => {
            });
        }

        return graphiqlHandler(req, res);
    };
};

export default jsonGraphqlExpress;
