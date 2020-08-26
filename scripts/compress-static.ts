import { join } from 'path';
import { compressStaticAll } from '../compression';

const distFolder = join(process.cwd(), 'dist/scholars-angular/browser');

compressStaticAll(distFolder, ['js', 'json', 'css', 'svg', 'html'], 1);
compressStaticAll(distFolder, ['woff2'], 2);
