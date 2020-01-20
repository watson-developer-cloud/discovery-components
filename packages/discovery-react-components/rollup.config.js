import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import url from '@rollup/plugin-url';
import { string } from 'rollup-plugin-string';
import svgr from '@svgr/rollup';
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
      tsconfig: 'tsconfig.prod.json'
    })
  ]
};
