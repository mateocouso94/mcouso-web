// Textos de la web en español.
// Puedes cambiar cualquier frase aquí sin tocar el resto del código:
// edita el texto entre comillas, haz commit en main y en unos minutos estará en mcouso.es.
import type { PageCopy } from './types';

export const es: PageCopy = {
  nav: [
    ['#stack', 'Especialidades'],
    ['#career', 'Trayectoria'],
    ['#network', 'Homelab'],
    ['#notes', 'Proyectos'],
    ['/notas/', 'Notas'],
    ['/estado/', 'Estado'],
    ['#contact', 'Contacto'],
  ],

  // --- Portada ---
  role: 'INGENIERO DE INFRAESTRUCTURA HÍBRIDA',
  headline: 'Llevo ocho años montando y manteniendo infraestructura.',
  intro:
    'Me llamo Mateo y soy de sistemas. La mayor parte de mi carrera ha sido VMware on-premise: he montado un datacenter desde cero, desde las VLAN y la cabina hasta el vCenter y las copias, y he migrado más de 100 clientes entre plataformas. Hoy trabajo también con Linux, Azure, AWS y Proxmox, y hacia ahí quiero crecer: infraestructura híbrida, aprovechando todo lo aprendido en el CPD.',
  cv: 'DESCARGAR CURRÍCULUM',
  linkedin: 'PERFIL DE LINKEDIN',
  location: 'SANTIAGO DE COMPOSTELA · GALICIA',
  years: 'MÁS DE 8 AÑOS EN SISTEMAS',
  credential: 'VMware VCP-DCV · 2023',
  portraitAlt: 'Retrato de Mateo Couso',

  // --- Consola ---
  terminalTitle: 'consola · prueba un comando',
  terminalHint: 'Prueba un comando',
  terminalDefault: 'Escribe status para ver el estado real del homelab, o help para ver el resto.',
  terminalPlaceholder: 'status | deploy | help | whoami',
  shellReady: 'LISTA',

  // --- Cifras ---
  impactEyebrow: 'EN NÚMEROS',
  impactItems: [
    { value: '100+', label: 'clientes', detail: 'creados, administrados o migrados en cloud.gal' },
    { value: '~1.000', label: 'máquinas virtuales', detail: 'en servicio 24/7 en cloud.gal' },
    { value: '~3.000', label: 'máquinas virtuales', detail: 'en el entorno del cliente principal en DXC' },
    { value: '3', label: 'cabinas Pure Storage', detail: 'administradas, desde la instalación hasta el soporte con el fabricante' },
  ],

  // --- 01 Especialidades ---
  stackEyebrow: 'ESPECIALIDADES',
  stackTitle: 'Con qué trabajo.',
  stackIntro:
    'Donde más horas tengo es en virtualización, almacenamiento y backup. El resto lo uso a diario, pero con menos profundidad, y en cada área lo indico.',
  stackHint: 'Pulsa un área para ver el detalle.',
  detailLabel: 'ÁREA',
  detailFooterArea: 'ÁREA DE TRABAJO',
  detailFooterStatus: 'EN USO',
  capabilities: [
    {
      id: 'virtualization',
      title: 'Virtualización y datacenter',
      summary: 'VMware · ESXi · vCenter · Cloud Director',
      body: 'Es donde más experiencia tengo. He instalado, configurado, actualizado y migrado plataformas VMware, empezando por la matriz de compatibilidad y el firmware de los servidores y terminando con los clientes funcionando encima.',
      details: [
        'ESXi y vCenter 6.5, 7.x y 8.x',
        'Clústeres, HA, DRS y VDS',
        'BIOS, firmware, drivers e imágenes personalizadas de ESXi',
        'Migraciones entre vCenters y clientes en Cloud Director',
        'Parcheo, actualizaciones de versión y matrices de compatibilidad',
        'Algo de NSX-T, vRealize y Aria, sin profundizar',
      ],
      tags: ['VMware', 'vSphere', 'ESXi', 'vCenter', 'Cloud Director'],
    },
    {
      id: 'network',
      title: 'Redes de datacenter',
      summary: 'VLAN · VDS · switching · Fortinet',
      body: 'La red que hay debajo de la virtualización: separar gestión, almacenamiento, vMotion y tráfico de clientes, y que cada cliente quede aislado del resto.',
      details: [
        'VLAN de gestión, almacenamiento y vMotion',
        'Switching de datacenter y enlaces de 100 Gb',
        'Un VDS por cliente',
        'Red de gestión aislada, accesible solo por VPN',
        'Fortinet virtuales para los clientes grandes (lo he tocado, pero no es mi fuerte)',
      ],
      tags: ['VLAN', 'VDS', 'Switching', 'Fortinet', 'VPN'],
    },
    {
      id: 'storage',
      title: 'Almacenamiento',
      summary: 'Pure Storage · SAN · NVMe over RoCE · vSAN',
      body: 'He administrado tres cabinas Pure Storage: desde la instalación inicial hasta cambiar discos, revisar fallos y abrir casos con Pure. Con Dell, HP y Synology también he trabajado, aunque menos a fondo.',
      details: [
        'Instalación inicial de FlashArray con Lynxview y cambio de uso de los puertos para NVMe over RoCE',
        'Hosts, grupos, volúmenes y presentación de datastores a VMware',
        'Revisión de logs, alertas y snapshots, y comprobaciones ante sospechas de ransomware',
        'Sustitución de discos y casos con el soporte de Pure',
        'Migración de datos entre cabinas y paso de SAN a vSAN',
      ],
      tags: ['Pure Storage', 'FlashArray', 'NVMe-oF', 'RoCE', 'vSAN'],
    },
    {
      id: 'backup',
      title: 'Backup y recuperación',
      summary: 'Veeam · CDP · RPO / RTO · Restic',
      body: 'Copias, réplicas y DR con Veeam, y pruebas de recuperación de verdad: levantar las máquinas en el otro lado y comprobar que funcionan.',
      details: [
        'Veeam Backup & Replication 12.x y 13',
        'CDP, proxies y replicación entre vCenters',
        'RPO y RTO definidos por máquina',
        'Usuarios de cliente en vCenter que solo ven sus propios recursos',
        'Restic con S3 en servidores Linux',
      ],
      tags: ['Veeam', 'CDP', 'DR', 'Restic', 'S3'],
    },
    {
      id: 'cloud',
      title: 'Cloud e infraestructura híbrida',
      summary: 'Azure · AWS · Proxmox',
      body: 'Es lo que más estoy usando ahora y donde quiero seguir creciendo. Trabajo con Azure y AWS en producción y con Proxmox, y he movido cargas de Azure a VMware.',
      details: [
        'Migración de máquinas de Azure a VMware',
        'AWS y Azure en producción',
        'Azure Functions, App Services, Application Gateway y WAF',
        'Key Vault, Bastion y RBAC',
        'Despliegue y documentación de máquinas en Proxmox',
      ],
      tags: ['Azure', 'AWS', 'Proxmox', 'WAF'],
    },
    {
      id: 'systems',
      title: 'Sistemas y aplicaciones',
      summary: 'Linux · Windows · PostgreSQL · Docker · Nginx',
      body: 'El día a día: servidores Linux en producción, preproducción y desarrollo, y buscar en los logs qué está fallando, a menudo junto al equipo de desarrollo.',
      details: [
        'Linux (sobre todo Debian) y servicios con systemd',
        'Docker y Docker Compose',
        'PostgreSQL: permisos, esquemas, copias y restauraciones',
        'Java/Tomcat, Nginx, Jenkins y GitLab',
        'Integraciones HL7 y scripts en Bash y Python',
      ],
      tags: ['Linux', 'Docker', 'PostgreSQL', 'Jenkins', 'GitLab'],
    },
    {
      id: 'automation',
      title: 'Automatización y monitorización',
      summary: 'PowerShell · PowerCLI · Terraform · Prometheus · Grafana',
      body: 'Scripts para no repetir a mano lo que se puede automatizar, y monitorización para enterarme de los problemas antes que el usuario.',
      details: [
        'PowerShell y VMware PowerCLI',
        'Terraform y vRealize Orchestrator',
        'Jenkins, GitLab CI/CD y GitHub Actions',
        'Prometheus, Grafana y Uptime Kuma en el homelab',
        'Copias y despliegues automatizados con Restic y snapshots',
      ],
      tags: ['PowerShell', 'PowerCLI', 'Terraform', 'Prometheus', 'Grafana'],
    },
  ],

  // --- 02 Trayectoria ---
  careerEyebrow: 'TRAYECTORIA',
  careerTitle: 'Dónde he trabajado.',
  careerIntro:
    'En cloud.gal llevaba los proyectos enteros: desde la primera reunión con el cliente hasta las de seguimiento después del despliegue, y entre medias el diseño, el montaje, la migración y los backups. Antes, en DXC, administré clústeres VMware para el sector público. Desde 2026 estoy en Enxenio, más centrado en Linux y cloud.',
  careerCurrent: 'ACTUAL',
  careerPast: 'ANTERIOR',
  jobs: [
    {
      period: 'MAR 2026 — ACTUALIDAD',
      company: 'Enxenio',
      role: 'Ingeniero de Infraestructura y Sistemas',
      place: 'A Coruña · Híbrido',
      description:
        'Aquí mi trabajo es sobre todo de operación. Administro servidores Linux en producción, preproducción y desarrollo, despliego en AWS y también trabajo con Azure. Monto y documento máquinas en Proxmox, configuro copias con Restic y snapshots y automatizo despliegues y tareas. Reviso muchos logs: Docker, systemd, Jenkins, GitLab, PostgreSQL. En un proyecto adapté la configuración del VMware de un tercero a lo que necesitaba nuestra aplicación, haciendo de interlocutor entre el cliente y nuestros desarrolladores.',
    },
    {
      period: 'JUL 2024 — MAR 2026',
      company: 'cloud.gal',
      role: 'Responsable de Virtualización y Copias de Seguridad',
      place: 'Santiago de Compostela · Híbrido',
      description:
        'Llevaba los proyectos de principio a fin: kickoff con el cliente, toma de requisitos, revisión de su infraestructura, despliegue, acompañamiento, backups, optimización y seguimiento. Diseñé y monté el datacenter nuevo en VMware 8 y migré a él los clientes del antiguo. También hacía actualizaciones de ESXi y parcheo, migraciones entre vCenters y cabinas, de Azure a VMware y a Cloud Director, y los proyectos de Veeam y DR.',
    },
    {
      period: 'FEB 2023 — JUN 2024',
      company: 'DXC Technology',
      role: 'Administrador de Sistemas VMware',
      place: 'Santiago de Compostela · Remoto',
      description:
        'Administraba clústeres VMware para AMTEGA y CIXTEC: instalación y configuración de clústeres nuevos sobre servidores Lenovo, Dell y HP, ciclo de vida, parcheo y despliegue de máquinas. Preparaba matrices de compatibilidad, ejecutaba y adaptaba scripts de PowerShell y usaba vRealize Orchestrator y Terraform. El cliente principal tenía unos 600 servidores y 3.000 máquinas virtuales.',
    },
    {
      period: 'MAR 2021 — FEB 2023',
      company: 'Landra Sistemas',
      role: 'Técnico de Sistemas de Nivel 2 · Roche',
      place: 'Narón',
      description:
        'Soporte de nivel 2 en entornos hospitalarios con Windows y Linux. Revisaba logs, resolvía incidencias e integraba aplicaciones sanitarias por HL7. Automatizaba tareas con Python y trataba a diario con personal sanitario y fabricantes.',
    },
    {
      period: 'JUL 2020 — MAR 2021',
      company: 'Evelb Técnicas',
      role: 'Responsable de Soporte',
      place: 'Milladoiro',
      description:
        'Despliegues de aplicaciones con Git y Jenkins, control de calidad y operación de infraestructura en AWS y GCP.',
    },
    {
      period: 'AGO 2019 — JUL 2020',
      company: 'Plexus Tech',
      role: 'Coordinador de Proyectos',
      place: 'Santiago de Compostela',
      description:
        'Coordinaba equipos de 10 a 15 técnicos y servicios de soporte nacionales e internacionales: planificar intervenciones, controlar plazos y gestionar escalados.',
    },
    {
      period: 'JUL 2017 — JUN 2019',
      company: 'Fermax Electrónica',
      role: 'Responsable Técnico · Galicia',
      place: 'Galicia',
      description:
        'Responsable técnico para Galicia: atención a clientes, puestas en marcha presenciales y en remoto, diagnóstico de averías y formación.',
    },
  ],

  // --- 03 Homelab ---
  labEyebrow: 'HOMELAB',
  labTitle: 'Lo que tengo montado en casa.',
  labIntro:
    'Dos mini PC con Debian 13. Uno hace de DNS y DHCP con AdGuard Home y monitoriza todo con Prometheus, Grafana y Uptime Kuma. El otro ejecuta los contenedores, entre ellos esta web. Lo uso para probar lo que en el trabajo no puedo romper. La web sale a Internet por Cloudflare Tunnel, sin abrir puertos en el router, y se actualiza sola cada vez que subo un cambio a GitHub. El estado de los servicios se puede ver en directo en mcouso.es/estado, y todo se copia cada noche al otro mini PC y a Backblaze B2, con una restauración de prueba cada semana.',
  networkCaption: 'DIAGRAMA LÓGICO · RED DE CASA',
  networkNote: 'Diagrama simplificado. He quitado las direcciones IP y los detalles de la red remota.',
  networkLabels: {
    wan: 'INTERNET',
    gateway: 'HGU MOVISTAR',
    switch: 'SWITCH GIGABYTE',
    router: 'XIAOMI AX3600',
    host: 'HOMELAB-RED',
    app: 'HOMELAB-APPS',
    remote: 'RED REMOTA',
    link: 'LAN / ENLACE',
    wifi: 'Wi-Fi · OpenWrt',
    dhcpOff: 'DHCP CENTRALIZADO',
    macvlan: 'AdGuard Home · DNS + DHCP',
    monitoring: 'Prometheus · Grafana · exportadores · Uptime Kuma',
    portfolio: 'Docker Compose · esta web y otras apps',
    tunnel: 'VPN LAN-to-LAN',
    logical: 'TOPOLOGÍA LÓGICA',
  },

  // --- 04 Proyectos ---
  projectsEyebrow: 'PROYECTOS',
  projectsTitle: 'Cuatro proyectos, contados con detalle.',
  projectsIntro:
    'Son proyectos reales en los que he trabajado. No doy nombres de clientes ni datos internos; el resto está contado tal como fue.',
  projects: [
    {
      label: 'DISEÑO Y DESPLIEGUE · VMWARE 8',
      title: 'Un datacenter nuevo desde cero',
      body: 'Hacía falta un datacenter nuevo al que mover los clientes del antiguo, que estaba en vSphere 7. Lo diseñé y lo monté: cinco hosts Dell con AMD EPYC 9534 de 64 núcleos y 2,25 TB de RAM, switches Dell a 100 Gb y una cabina Pure Storage conectada por NVMe over RoCE. Un único clúster con su propio vCenter.',
      approachLabel: 'QUÉ HICE',
      approach:
        'Toda la parte de VMware: matriz de compatibilidad, firmware de la gestión remota, BIOS, drivers, imagen de ESXi 8, vCenter y clúster. También inicialicé la cabina, en contacto con Pure, y presenté la SAN a los hosts. Diseñé la red de cada host: dos tarjetas ConnectX-6 a 100 Gb con 200 Gb para la SAN y 100 Gb para backup y otros 100 para vMotion, cruzados en activo/pasivo entre tarjetas para no mezclar tráfico. La salida de los clientes va a 2 × 10 Gb a través de Fortinet, y todo en VLAN separadas con MTU 9000. La cabina tiene 400 Gb. La gestión y las consolas de los servidores van en su propia VLAN, a la que solo se accede por VPN. Cada cliente tiene su VDS, y los grandes, además, su propio Fortinet virtual.',
      outcomeLabel: 'MIGRACIÓN Y RESULTADO',
      outcome:
        'Migré clientes completos, casi todos con un backup completo de Veeam restaurado en una VLAN nueva y respetando su segmentación. Yo decidía qué clientes pasaban y cuándo. Algunos fueron después a Cloud Director. Con el cambio de CPU y memoria el rendimiento mejoró, y las copias y las restauraciones de ficheros se hicieron más rápidas. Las copias van a una segunda cabina Pure, y añadí un proxy de Veeam con regla de afinidad por host para repartir la carga de backups y restauraciones.',
      footer: '5 HOSTS DELL · AMD EPYC · PURE STORAGE · NVMe over RoCE',
      tags: ['ESXi 8', 'vCenter', 'Dell', 'Pure Storage', 'Veeam', 'VDS'],
    },
    {
      label: 'MIGRACIÓN · SAN → vSAN',
      title: 'De SAN a vSAN sin cambiar las redes',
      body: 'Un clúster de siete hosts con almacenamiento en una cabina Dell y versiones mezcladas: cuatro hosts en vSphere 6.5 y tres en 7.0. Había que pasarlo a vSAN con discos locales sin tocar las redes de los clientes.',
      approachLabel: 'CÓMO LO HICIMOS',
      approach:
        'Por fases. Añadimos discos locales a los hosts y empezamos con tres: los actualizamos, montamos la vSAN con ellos y empezamos a mover máquinas. El clúster de origen no estaba en el vCenter, así que las migraciones en caliente se hicieron con replicación. Cada host que quedaba libre se actualizaba y entraba en la vSAN, hasta completar el clúster nuevo en 7.0.3. Usamos las mismas redes y las mismas VLAN durante todo el proceso.',
      outcomeLabel: 'LO COMPLICADO',
      outcome:
        'Los Distributed Switches se habían creado en 6.5 y hubo que actualizarlos a 7.0.3 por el camino. Aparte de eso, las únicas paradas fueron cortas, al finalizar cada replicación.',
      footer: '7 HOSTS · POR FASES · VDS 6.5 → 7.0.3',
      tags: ['vSphere', 'SAN', 'vSAN', 'Replicación', 'VDS'],
    },
    {
      label: 'MIGRACIONES · VARIOS CPD',
      title: 'Mover clientes entre plataformas',
      body: 'No todo era montar desde cero. Buena parte del trabajo era mover cosas: clientes completos entre vCenters, datos entre dos cabinas y máquinas de Azure a VMware.',
      approachLabel: 'QUÉ HICE',
      approach:
        'Según el caso usaba Cross vCenter vMotion, replicación o un backup completo con Veeam y restauración en destino. También monté un DR entre dos datacenters distintos, con HA para las máquinas y reglas de replicación.',
      outcomeLabel: 'VOLUMEN',
      outcome:
        'En total, más de 100 clientes creados, administrados o migrados, y alrededor de 1.000 máquinas virtuales en servicio 24/7.',
      footer: 'CROSS vCENTER · ENTRE CABINAS · AZURE → VMWARE',
      tags: ['Cross vCenter', 'Veeam', 'Azure', 'VMware'],
    },
    {
      label: 'DISASTER RECOVERY · VEEAM 13',
      title: 'Un DR con Veeam probado de verdad',
      body: 'Recuperación ante desastres entre la infraestructura de un cliente y la nuestra: diez máquinas, una de ellas de unos 3 TB, con RPO y RTO definidos para cada una.',
      approachLabel: 'QUÉ HICE',
      approach:
        'Desplegué los componentes y los proxies de Veeam 13, los certificados y la configuración de las copias, el destino y la VLAN de recuperación. En la infraestructura del cliente todo funcionaba por IP, así que creé una zona DNS con sus registros y lo pasé a nombres. En nuestro vCenter el cliente tenía un usuario que solo veía su carpeta: ni hosts, ni redes, ni nada más.',
      outcomeLabel: 'LA PRUEBA',
      outcome:
        'Levantamos las máquinas en nuestro lado y cambiamos las reglas del firewall local para que apuntaran a nuestra infraestructura. Las pruebas salieron bien.',
      footer: 'VEEAM 13 · 10 VMS · RPO / RTO POR MÁQUINA',
      tags: ['Veeam CDP', 'Proxies', 'DNS', 'Permisos', 'DR'],
      href: 'https://www.linkedin.com/posts/mateo-couso-hortas-71ba63164_veeam-cdp-disasterrecovery-activity-7330625843246903297-BRAf',
    },
  ],

  // --- Notas ---
  notesEyebrow: 'NOTAS',
  notesTitle: 'Lo que voy apuntando.',
  notesIntro: 'Notas técnicas sobre cosas que he montado, roto o aprendido.',
  notesAll: 'Ver todas las notas',

  // --- 05 Formación ---
  trainingEyebrow: 'FORMACIÓN',
  trainingTitle: 'Formación e idiomas.',
  education: [
    { title: 'CFGS Administración de Sistemas Informáticos en Red', institution: 'IES San Clemente', period: '2013 — 2015' },
    { title: 'CFGS Sistemas de Telecomunicación e Informáticos', institution: 'CIFP Politécnico de Santiago', period: '2015 — 2017' },
  ],
  languages: [
    { title: 'Castellano', level: 'Nativo' },
    { title: 'Gallego', level: 'Nativo' },
    { title: 'Inglés', level: 'Intermedio · reuniones y troubleshooting con fabricantes, correos técnicos' },
  ],

  // --- 06 Contacto ---
  contactEyebrow: 'CONTACTO',
  contactTitle: '¿Hablamos?',
  contactIntro:
    'Si buscas a alguien para infraestructura VMware, migraciones o backup, o quieres comentar algo de la web o del homelab, escríbeme.',
  emailCta: 'ESCRÍBEME',
  footer: 'Hecha, desplegada y mantenida por Mateo Couso en su homelab.',
};
