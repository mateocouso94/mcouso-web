// Next.js export usa un único layout raíz con <html lang="es">.
// Tras la build, las páginas de /en/ pasan a declarar lang="en" (Google y lectores de pantalla).
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
});

let n = 0;
for (const file of walk('out/en')) {
  const html = readFileSync(file, 'utf8');
  if (!html.includes('<html lang="es">')) throw new Error(`Sin <html lang="es"> en ${file}`);
  writeFileSync(file, html.replace('<html lang="es">', '<html lang="en">'));
  n++;
}
console.log(`lang="en" aplicado a ${n} página(s) de /en/`);
