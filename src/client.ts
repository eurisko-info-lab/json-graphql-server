import GraphQLClientServer from './graphQLClientServer';
import schemaBuilder from './schemaBuilder';

declare global {
    interface Window {
        JsonGraphqlServer?: typeof GraphQLClientServer;
        jsonSchemaBuilder?: typeof schemaBuilder;
    }
}

if (typeof window !== 'undefined') {
    window.JsonGraphqlServer = GraphQLClientServer;
    window.jsonSchemaBuilder = schemaBuilder;
}

export default GraphQLClientServer;
