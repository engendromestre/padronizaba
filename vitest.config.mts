import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
    test: {
        environment: 'node',
        include: ['src/**/*.test.ts', 'tests/unit/**/*.test.ts'],
        exclude: ['tests/auth/**', 'node_modules/**'],
        globals: true,
    },
    resolve: {
        alias: {
            // Resolves the @/ alias using native ESM path utilities
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
});