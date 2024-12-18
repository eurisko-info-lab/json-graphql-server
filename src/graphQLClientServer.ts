import mock, { proxy } from 'xhr-mock';
import handleRequestFactory from './handleRequest';

interface GraphQLServerOptions {
    data: Record<string, unknown>;
    url: string;
}

interface GraphQLServer {
    start(): void;
    stop(): void;
    getHandler(): (url: string, options: { body?: string }) => Promise<{
        status: number;
        headers: Record<string, string>;
        body: string;
    }>;
}

/**
 * Starts a GraphQL Server in your browser: intercepts every call to the specified URL
 * and returns a response from the supplied data.
 *
 * @param options - Options containing `data` for the GraphQL schema and the `url` to intercept.
 * @returns An object to control the server: start, stop, and getHandler.
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
 * const server = GraphQLClientServer({ data, url: 'http://localhost:3000/graphql' });
 * server.start();
 */
export default function GraphQLClientServer({
                                                data,
                                                url,
                                            }: GraphQLServerOptions): GraphQLServer {
    const handleRequest = handleRequestFactory(data);

    return {
        start(): void {
            // Intercept all XMLHttpRequest
            mock.setup();

            // Only handle POST requests to the specified URL
            mock.post(
                url,
                (req, res) =>
                    new Promise((resolve) => {
                        handleRequest(url, {
                            body: req.body(),
                        }).then((response) => {
                            res.status(response.status);
                            res.headers(response.headers);
                            res.body(response.body);

                            resolve(res);
                        });
                    })
            );

            // Ensure all other requests are handled by the default XMLHttpRequest
            mock.use(proxy);
        },

        stop(): void {
            mock.teardown();
        },

        getHandler(): (url: string, options: { body?: string }) => Promise<{
            status: number;
            headers: Record<string, string>;
            body: string;
        }> {
            return handleRequest;
        },
    };
}
