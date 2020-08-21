import { readFileSync, writeFileSync } from 'fs';
import * as brotli from 'brotli';
import * as glob from 'glob';

const compress = (data: string | Buffer, mode: 0 | 1 | 2) => brotli.compress(data, {
  extension: 'br',
  skipLarger: true,
  mode,             // 0 = generic, 1 = text, 2 = font (WOFF2)s
  quality: 10,      // 0 - 11,
  lgwin: 12,        // default
  threshold: 10240
});

const compressStatic = (file: string, mode: 0 | 1 | 2) =>
  writeFileSync(`${file}.br`, compress(readFileSync(file), mode));

const compressStaticAll = (folder: string, extensions: string[], mode: 0 | 1 | 2) =>
  extensions.forEach((ext: string) => glob(`${folder}/**/*${ext}`, {}, (error, files) => {
    if (error) {
      console.error(error);
    } else {
      files.forEach(file => compressStatic(file, mode));
    }
  }));

export {
  compress,
  compressStatic,
  compressStaticAll
};
