import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import { string } from 'rollup-plugin-string';
import svgr from '@svgr/rollup';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import url from '@rollup/plugin-url';
import pkg from './package.json';

const INPUT = 'src/index.tsx';

function onwarn(warning, warn) {
  // skip circular dependency warning from `react-virtualized` (known issue; doesn't cause any harm)
  if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.message.includes('react-virtualized')) {
    return;
  }

  // use default for everything else
  warn(warning);
}

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

const COMMON_PLUGINS = [
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
];

export default [
  /*** ES MODULE ***/
  {
    input: INPUT,
    output: [
      {
        file: pkg.module,
        format: 'es',
        exports: 'named',
        sourcemap: true
      },
      {
        file: pkg.module.replace(/\.js$/, '.min.js'),
        format: 'es',
        exports: 'named',
        sourcemap: true,
        plugins: [terser()]
      }
    ],
    external: Object.keys(pkg.peerDependencies).concat([
      'carbon-components-react/es/components/ListBox'
    ]),
    plugins: COMMON_PLUGINS,
    onwarn
  },
  /*** COMMONJS MODULE ***/
  {
    input: INPUT,
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        exports: 'named',
        sourcemap: true,
        interop: 'auto'
      }
    ],
    external: Object.keys(pkg.peerDependencies).concat([
      'carbon-components-react/lib/components/ListBox'
    ]),
    plugins: [
      COMMON_PLUGINS[0],
      // Replace the ES module with the CJS version, when building CJS library.
      // Otherwise, we'll get errors when this CJS version is used by Jest.
      alias({
        entries: {
          'carbon-components-react/es/components/ListBox':
            'carbon-components-react/lib/components/ListBox'
        }
      }),
      ...COMMON_PLUGINS.slice(1)
    ],
    onwarn
  }
];
