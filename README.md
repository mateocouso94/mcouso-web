# Mateo Couso — Portfolio v10

Portfolio bilingüe (ES/EN) construido con Next.js 15, React 19 y TypeScript. Experiencias profesionales revisadas para mantener una redacción íntegramente localizada en cada idioma.

## Contenido

- Perfil profesional, fotografía y descarga del CV.
- Consola interactiva con los comandos `help`, `whoami`, `stack`, `lab`, `career`, `contact` y `clear`.
- Áreas técnicas detalladas: VMware, Pure Storage, Veeam/CDP, sistemas, Azure/AWS, automatización y observabilidad.
- Trayectoria profesional, formación, certificación VCP-DCV e idiomas.
- Diagrama lógico de la home LAN: HGU Movistar, switch Gigabyte, Xiaomi AX3600/OpenWrt, dos mini PCs, AdGuard/macvlan y VPN hacia la red remota.
- Proyectos de datacenter: migraciones SAN a vSAN, migraciones de datos entre CPDs y Veeam CDP con pruebas reales de Disaster Recovery.
- Enlaces profesionales, CV descargable y contacto bilingüe en contacto@mcouso.es.
- Publicación pública de la web a través de Cloudflare.

## Despliegue con Docker Compose

La web se compila como **sitio estático** (`output: 'export'`) y se sirve con **nginx**.
En producción no hay Node.js: solo ficheros HTML/CSS/JS. El contenedor escucha en
`192.168.0.30:3000`, igual que antes, así que `cloudflared` no necesita cambios.

```bash
cd /opt/ci/portfolio
docker compose build --pull
docker compose up -d --force-recreate
docker compose ps          # debe aparecer (healthy)
docker compose logs -f portfolio
```

Las versiones de las dependencias están fijadas en `package-lock.json` (`npm ci`),
así que cada compilación instala exactamente lo mismo.

## Publicación

La web se publica a través de Cloudflare. No se incluyen tokens ni detalles de configuración del servicio.

## Personalización

- Página y contenido: `src/app/page.tsx`
- Estilos: `src/app/globals.css`
- Metadatos: `src/app/layout.tsx`
- Fotografía: `public/profile.jpg`
- Currículum: `public/CV-Mateo-Couso-Hortas-2026.pdf`

## Nota sobre el diagrama de red

El gráfico se ha reorganizado para mantener todos los nodos dentro del lienzo y mostrar la topología lógica y las direcciones privadas facilitadas para la LAN doméstica. No representa el detalle exacto de los puertos del switch ni las reglas internas de la VPN. La versión pública omite las direcciones privadas y los detalles de la red remota.
