const rollup = require('rollup');
const typescript = require('@rollup/plugin-typescript');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const tsConfigPaths = require('rollup-plugin-tsconfig-paths');
const pkg = require('./package.json');

const outputOptions = {
    file: pkg.main,
    format: 'cjs',
    sourcemap: true
};

async function build() {
    try {
        console.time('rollup build');

        // create a bundle
        const bundle = await rollup.rollup({
            input: 'src/index.ts',
            plugins: [
                tsConfigPaths(),
                resolve(),
                commonjs(),
                typescript({ tsconfig: './tsconfig.json' })
            ]
        });

        console.log('watchFiles:', bundle.watchFiles);

        const { output } = await bundle.generate(outputOptions);

        for (const chunkOrAsset of output) {
            if (chunkOrAsset.type === 'asset') {
                console.log('Asset:', chunkOrAsset);
            } else {
                console.log('Chunk:', chunkOrAsset.modules);
            }
        }

        // write the bundle to disk
        await bundle.write(outputOptions);

        // closes the bundle
        await bundle.close();

        console.timeEnd('rollup build');
        process.exit(0)

    } catch (e) {
        console.error('rollup build failed:', e)
        process.exit(1)
    }
}

build();