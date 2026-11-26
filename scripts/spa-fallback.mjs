// GitHub Pages serves 404.html for unknown paths. A copy of index.html lets
// deep links such as /pom-proof/p/<id> load the app, which then routes.
import { copyFileSync, existsSync } from 'node:fs';

if (!existsSync('dist/index.html')) {
  console.error('dist/index.html not found; run vite build first');
  process.exit(1);
}
copyFileSync('dist/index.html', 'dist/404.html');
console.log('dist/404.html written');
