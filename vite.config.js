import { resolve } from 'path';
import { defineConfig } from 'vite';
import pkg from './package.json';

export default defineConfig({
    build: {
        lib: {
            // Entry point of your library
            entry: resolve(__dirname, 'src/client.ts'),
            name: 'JsonGraphqlServer',
            formats: ['es', 'cjs'],
        },
        sourcemap: true,
        minify: process.env.NODE_ENV === 'production',
        rollupOptions: {
            // Ensure external dependencies from package.json are not bundled
            external: Object.keys(pkg.dependencies || {}),
        },
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
