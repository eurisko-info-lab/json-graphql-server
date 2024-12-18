import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            // Entry point for the library
            entry: resolve(__dirname, 'src/client.ts'),
            name: 'JsonGraphqlServer',
            formats: ['umd'],
            fileName: 'json-graphql-server',
        },
        sourcemap: true,
        minify: process.env.NODE_ENV === 'production',
        emptyOutDir: false,
    },
    resolve: {
        // Ensure proper resolution for TypeScript files
        extensions: ['.ts', '.js', '.json'],
    },
    esbuild: {
        // Enable TypeScript support for the build process
        loader: 'ts',
        include: /src\/.*\.[tj]s$/,
        exclude: /node_modules/,
    },
});
