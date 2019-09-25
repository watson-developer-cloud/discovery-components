import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import external from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import resolve from 'rollup-plugin-node-resolve';
import url from 'rollup-plugin-url';
import { string } from 'rollup-plugin-string';
import svgr from '@svgr/rollup';
import pkg from './package.json';

// for some reason, '**/*.worker.min.js' doesn't work
const pdfWorkerRegex = /\.worker\.min\.js$/;

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
  plugins: [
    external(),
    resolve(),
    commonjs({
      exclude: [pdfWorkerRegex]
    }),
    postcss({
      modules: true
    }),
    url(),
    svgr(),
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
