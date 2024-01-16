import { exec as _exec } from 'node:child_process';
import path from 'node:path';
import util from 'node:util';
import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import pkg from './package.json';

const exec = util.promisify(_exec);

// vite plugin to generate `.d.ts` type files
const dts: Plugin = {
  name: 'dts-generator',
  buildEnd: async (error?: Error) => {
    if (!error) {
      try {
        const { stdout, stderr } = await exec(
          'yarn tsc --declaration --emitDeclarationOnly --noEmit false'
        );
        console.log(stdout);
        console.error(stderr);
      } catch (err) {
        console.log(err.stdout);
        console.error(err.stderr);
        throw err;
      }
    }
  }
};

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src')
    }
  },
  plugins: [
    tsconfigPaths(),
    react(),
    // svgr options: https://react-svgr.com/docs/options/
    svgr({ svgrOptions: { icon: true } }),
    dts
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.tsx'),
      name: pkg.name,
      // the proper extensions will be added
      fileName: 'discovery-react-components'
    },
    rollupOptions: {
      // externalize deps that shouldn't be bundled into the library
      external: Object.keys(pkg.peerDependencies),
      output: {
        // provide global variables to use in the UMD build for externalized deps
        globals: {
          react: 'React'
        }
      }
    }
  }
});
