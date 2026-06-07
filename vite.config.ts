import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import path, { resolve } from 'path';
import manifest from './manifest.json';
import { transform } from 'esbuild';
import fs from 'fs';

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

const minifyPostBuild = () => ({
  name: 'minify-post-build',
  closeBundle: async () => {
    const outDir = resolve(__dirname, './dist');

    // 1. Minify JSON files in _locales
    const localesDir = path.join(outDir, '_locales');
    if (fs.existsSync(localesDir)) {
      const traverseAndMinifyJson = (dir: string) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const fullPath = path.join(dir, file);
          if (fs.statSync(fullPath).isDirectory()) {
            traverseAndMinifyJson(fullPath);
          } else if (file.endsWith('.json')) {
            try {
              const content = fs.readFileSync(fullPath, 'utf-8');
              const minified = JSON.stringify(JSON.parse(content));
              fs.writeFileSync(fullPath, minified, 'utf-8');
            } catch (e) {
              console.error(`Error minifying JSON file ${fullPath}:`, e);
            }
          }
        }
      };
      traverseAndMinifyJson(localesDir);
    }

    // 2. Minify manifest.json
    const manifestPath = path.join(outDir, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      try {
        const content = fs.readFileSync(manifestPath, 'utf-8');
        const minified = JSON.stringify(JSON.parse(content));
        fs.writeFileSync(manifestPath, minified, 'utf-8');
      } catch (e) {
        console.error(`Error minifying manifest.json:`, e);
      }
    }

    // 3. Minify JS files in setup directory (Vite handles and minifies src files automatically)
    const jsDirs = [path.join(outDir, 'setup')];
    for (const dir of jsDirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          if (file.endsWith('.js')) {
            const fullPath = path.join(dir, file);
            try {
              const content = fs.readFileSync(fullPath, 'utf-8');
              const result = await transform(content, {
                loader: 'js',
                minify: true,
              });
              fs.writeFileSync(fullPath, result.code, 'utf-8');
            } catch (e) {
              console.error(`Error minifying JS file ${fullPath}:`, e);
            }
          }
        }
      }
    }

    // 4. Minify CSS files in setup directory
    const setupDir = path.join(outDir, 'setup');
    if (fs.existsSync(setupDir)) {
      const files = fs.readdirSync(setupDir);
      for (const file of files) {
        if (file.endsWith('.css')) {
          const fullPath = path.join(setupDir, file);
          try {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const result = await transform(content, {
              loader: 'css',
              minify: true,
            });
            fs.writeFileSync(fullPath, result.code, 'utf-8');
          } catch (e) {
            console.error(`Error minifying CSS file ${fullPath}:`, e);
          }
        }
      }
    }

    // 5. Minify HTML files: main index.html and setup/setup.html
    const htmlFiles = [
      path.join(outDir, 'index.html'),
      path.join(outDir, 'setup/setup.html'),
    ];
    for (const fullPath of htmlFiles) {
      if (fs.existsSync(fullPath)) {
        try {
          let content = fs.readFileSync(fullPath, 'utf-8');

          // Remove comments
          content = content.replace(/<!--[\s\S]*?-->/g, '');

          // Minify inline style tags
          const styleRegex = /(<style[^>]*>)([\s\S]*?)(<\/style>)/gi;
          const styleMatches = [...content.matchAll(styleRegex)];
          for (const match of styleMatches) {
            const [fullMatch, openTag, styleContent, closeTag] = match;
            if (styleContent.trim()) {
              const minifiedStyle = await transform(styleContent, {
                loader: 'css',
                minify: true,
              });
              content = content.replace(
                fullMatch,
                `${openTag}${minifiedStyle.code.trim()}${closeTag}`,
              );
            }
          }

          // Minify inline script tags
          const scriptRegex = /(<script[^>]*>)([\s\S]*?)(<\/script>)/gi;
          const scriptMatches = [...content.matchAll(scriptRegex)];
          for (const match of scriptMatches) {
            const [fullMatch, openTag, scriptContent, closeTag] = match;
            if (openTag.includes('src=')) continue;
            if (scriptContent.trim()) {
              const minifiedScript = await transform(scriptContent, {
                loader: 'js',
                minify: true,
              });
              content = content.replace(
                fullMatch,
                `${openTag}${minifiedScript.code.trim()}${closeTag}`,
              );
            }
          }

          // Collapse whitespace
          content = content.replace(/\s+/g, ' ');
          content = content.replace(/>\s+</g, '><');

          fs.writeFileSync(fullPath, content.trim(), 'utf-8');
        } catch (e) {
          console.error(`Error minifying HTML file ${fullPath}:`, e);
        }
      }
    }

    // 6. Remove README.md from build (root, src/, and _locales/)
    const readmePaths = [
      path.join(outDir, 'README.md'),
      path.join(outDir, 'src/README.md'),
      path.join(outDir, '_locales/README.md'),
    ];
    for (const readmePath of readmePaths) {
      if (fs.existsSync(readmePath)) {
        fs.unlinkSync(readmePath);
      }
    }
  },
});

export default defineConfig({
  plugins: [crx({ manifest }), forceScriptToBottom(), minifyPostBuild()],
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
