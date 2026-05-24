import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

// custom plugin to force script tags to the bottom of the body
const forceScriptToBottom = () => ({
  name: 'force-script-to-bottom',
  enforce: 'post' as const,
  generateBundle(_options: any, bundle: any) {
    const htmlAsset = bundle['index.html'];
    if (htmlAsset && htmlAsset.source) {
      let htmlContent = htmlAsset.source.toString();

      // regex to match the entry script tag injected by vite/crxjs
      const scriptRegex = /<script[^>]*src="\/assets\/index[^>]*><\/script>/g;
      const match = htmlContent.match(scriptRegex);

      if (match) {
        const targetTag = match[0];
        // remove the tag from its original position in the head
        htmlContent = htmlContent.replace(targetTag, '');
        // inject the tag right before the closing body tag
        htmlContent = htmlContent.replace('</body>', `${targetTag}\n</body>`);

        // update the final bundle source code
        htmlAsset.source = htmlContent;
      }
    }
  },
});

export default defineConfig({
  plugins: [crx({ manifest }), forceScriptToBottom()],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    emptyOutDir: true,
  },
});
