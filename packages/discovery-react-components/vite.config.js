import path from 'path';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react-swc';
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
    svgr({ svgrOptions: { icon: true } })
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.tsx'),
      name: '@ibm-watson/discovery-react-components',
      // the proper extensions will be added
      fileName: 'discovery-react-components'
    },
    rollupOptions: {
      // externalize deps that shouldn't be bundled into the library
      external: Object.keys(pkg.peerDependencies)
    }
  }
});
