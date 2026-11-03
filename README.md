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

## Cómo se despliega

```
git push (main) ──► GitHub Actions ──► ghcr.io/mateocouso94/mcouso-web:latest
                                              │
              homelab-apps: timer systemd cada 5 min (deploy/update.sh)
                                              │
                     docker compose pull + up -d (solo si la imagen cambió)
                                              │
                      nginx :3000  ◄── cloudflared ◄── Cloudflare ◄── mcouso.es
```

- La web se compila como **sitio estático** (`output: 'export'`) y la sirve **nginx**. En producción no hay Node.js.
- El servidor **descarga** la imagen: no hace falta abrir puertos ni darle a GitHub acceso a la red local.
- **Dependabot** abre cada lunes Pull Requests con las actualizaciones de dependencias.

### Instalación en el servidor (una sola vez)

```bash
sudo git clone https://github.com/mateocouso94/mcouso-web /opt/ci/portfolio
cd /opt/ci/portfolio
docker compose pull && docker compose up -d
sudo cp deploy/mcouso-web-update.{service,timer} /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now mcouso-web-update.timer
```

### Operación

```bash
systemctl list-timers mcouso-web-update.timer   # próxima comprobación
journalctl -u mcouso-web-update -n 20           # qué ha desplegado
docker compose ps                               # debe aparecer (healthy)
```

**Volver a una versión anterior:** cada imagen lleva también el hash del commit como etiqueta.
Cambia `latest` por ese hash en `compose.yaml` y ejecuta `docker compose up -d`.

**Compilar en local sin GitHub:** `docker compose build && docker compose up -d`.

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
