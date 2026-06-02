import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import { resolve } from 'path';
import manifest from './manifest.json';

const forceScriptToBottom = () => ({
  name: 'force-script-to-bottom',
  enforce: 'post' as const,
  generateBundle(_options: any, bundle: any) {
    const htmlAsset = bundle['index.html'];
    if (htmlAsset && htmlAsset.source) {
      let htmlContent = htmlAsset.source.toString();

      const scriptRegex = /<script[^>]*src="\/assets\/index[^>]*><\/script>/g;
      const match = htmlContent.match(scriptRegex);

      if (match) {
        const targetTag = match[0];
        htmlContent = htmlContent.replace(targetTag, '');
        htmlContent = htmlContent.replace('</body>', `${targetTag}\n</body>`);

        htmlAsset.source = htmlContent;
      }
    }
  },
});

export default defineConfig({
  plugins: [crx({ manifest }), forceScriptToBottom()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    emptyOutDir: true,
    modulePreload: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
});
