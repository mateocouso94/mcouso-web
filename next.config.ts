import type { NextConfig } from 'next';

// Exportación estática: la web no tiene backend, así que se genera HTML/CSS/JS
// en /out y lo sirve nginx. Sin Node.js en producción.
const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
