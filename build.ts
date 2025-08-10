import Bun from 'bun';

const timetaken = 'complete build';

// Starts the timer, the label value is timetaken
console.time(timetaken);

// Build the main bundle
Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: './dist',
    format: 'esm',
    minify: true,
    sourcemap: 'external',
    target: 'browser',
    // Optimizations for smallest bundle size
    splitting: false,
    // External dependencies
    external: ['react', 'react-dom', 'zod', '@form-instant/react-input-mapping'],
    // Define environment
    define: {
        'process.env.NODE_ENV': '"production"',
    },
})
    .then(() => {
        console.log('✅ Main bundle built successfully');
        console.log('📦 Bundle optimized for minimum size');

        // Generate TypeScript declarations using the specific config
        return Bun.spawn(['bun', 'x', 'tsc', '--project', 'tsconfig.declaration.json']);
    })
    .then((result) => {
        // Check if the process completed successfully
        if (result.exitCode === 0 || result.exitCode === null) {
            console.log('✅ TypeScript declarations generated');
        } else {
            console.error('❌ TypeScript declarations generation failed');
            console.error('Exit code:', result.exitCode);
        }
    })
    .catch((err) => {
        console.error('❌ Build failed:', err);
        process.exit(1);
    })
    .finally(() => {
        console.timeEnd(timetaken);
    });
