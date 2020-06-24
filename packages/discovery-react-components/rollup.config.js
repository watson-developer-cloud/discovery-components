import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import { string } from 'rollup-plugin-string';
import svgr from '@svgr/rollup';
import typescript from 'rollup-plugin-typescript2';
import url from '@rollup/plugin-url';
import pkg from './package.json';

// for some reason, '**/*.worker.min.js' doesn't work
const pdfWorkerRegex = /\.worker\.min\.js$/;
// don't import pdf.worker.js from within pdf.js
const replacePdfWorker = {
  name: 'replace-pdf-worker',
  resolveId(source) {
    if (source === './pdf.worker.js') {
      return source; // this signals that rollup should not ask other plugins or check the file system to find this id
    }
    return null; // other ids should be handled as usually
  },
  load(id) {
    if (id === './pdf.worker.js') {
      return 'export default {}'; // replacement source
    }
    return null; // other ids should be handled as usually
  }
};

export default {
  input: 'src/index.tsx',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: true
    },
    {
      file: pkg.module,
      format: 'es',
      exports: 'named',
      sourcemap: true
    }
  ],
  external: Object.keys(pkg.peerDependencies).concat([
    'carbon-components-react/lib/components/ListBox'
  ]),
  plugins: [
    replacePdfWorker,
    alias({
      entries: [
        // By default, the `esm` build of `react-resize-detector` is imported, but that results
        // in a build error ("Error: 'bool' is not exported by ../../node_modules/prop-types/index.js").
        // This makes it so we import the CommonJS version, which builds just fine.
        { find: 'react-resize-detector', replacement: 'react-resize-detector/lib/index.js' }
      ]
    }),
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs({
      exclude: [pdfWorkerRegex]
    }),
    json({
      compact: true,
      namedExports: false
    }),
    url(),
    svgr({ ref: true }),
    string({
      include: [pdfWorkerRegex]
    }),
    typescript({
      rollupCommonJSResolveHack: true,
      clean: true,
      tsconfig: 'tsconfig.prod.json',
      check: false
    })
  ],
  onwarn(warning, warn) {
    // skip circular dependency warning from `react-virtualized` (known issue; doesn't cause any harm)
    if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.message.includes('react-virtualized')) {
      return;
    }

    // use default for everything else
    warn(warning);
  }
};
