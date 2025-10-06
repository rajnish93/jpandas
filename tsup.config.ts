import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm', 'cjs', 'iife'],
	dts: true,
	sourcemap: true,
	clean: true,
	minify: false,
	globalName: 'TsPandasLite',
	target: 'es2020',
});


