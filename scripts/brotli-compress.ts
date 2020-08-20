import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { compress } from 'brotli';

const brotliSettings = {
  extension: 'br',
  skipLarger: true,
  mode: 1, // 0 = generic, 1 = text, 2 = font (WOFF2)
  quality: 10, // 0 - 11,
  lgwin: 12, // default
  threshold: 10240
};

[
  'dist/scholars-angular/browser',
  'dist/scholars-angular/browser/assets',
  'dist/scholars-angular/browser/assets/i18n',
  'dist/scholars-angular/browser/assets/scripts'
].forEach((path: string) => {
  readdirSync(path).forEach((file) => {
    if (file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.css') || file.endsWith('.html')) {
      const result = compress(readFileSync(`${path}/${file}`), brotliSettings);
      writeFileSync(`${path}/${file}.br`, result);
    }
  });
});
