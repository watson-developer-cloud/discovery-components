import path from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import pkg from './package.json';

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
    dts()
  ],
  build: {
    sourcemap: true,
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
