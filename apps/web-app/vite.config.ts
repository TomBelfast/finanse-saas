import * as path from 'path';
// import { sentryVitePlugin } from '@sentry/vite-plugin'; // TEMPORARY: Disabled due to installation issues
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import pluginRewriteAll from 'vite-plugin-rewrite-all';
import svgr from 'vite-plugin-svgr';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      '@clerk/clerk-react',
      '**/*.scss',
    ],
    // Exclude problematic @ant-design/charts dependencies
    exclude: ['@icons/material', '@ant-design/charts'],
    // Force deduplication of React
    force: true,
  },
  server: {
    port: 3005,
    host: '0.0.0.0',
    strictPort: false,
  },
  logLevel: 'info',
  clearScreen: false,
  build: {
    sourcemap: true,
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  plugins: [
    svgr(),
    react(),
    pluginRewriteAll(),
    // Bundle analyzer - generates stats.html in dist folder after build
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // 'sunburst' | 'treemap' | 'network'
    }),
  ],
  define: {
    'import.meta.env.APP_VERSION': JSON.stringify(process.env.npm_package_version),
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
      '@akademiasaas/shared': path.resolve(__dirname, '../../packages/shared/lib'),
    },
  },
});
