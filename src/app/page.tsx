'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';

type Lang = 'es' | 'en';
type Capability = {
  id: string;
  title: string;
  summary: string;
  body: string;
  details: string[];
  tags: string[];
};
type Job = { period: string; company: string; role: string; place: string; description: string };

type PageCopy = {
  nav: [string, string][];
  impactEyebrow: string;
  impactItems: { value: string; label: string; detail: string }[];
  role: string;
  headline: string;
  intro: string;
  cv: string;
  linkedin: string;
  location: string;
  years: string;
  credential: string;
  portraitAlt: string;
  terminalTitle: string;
  terminalHint: string;
  terminalDefault: string;
  terminalPlaceholder: string;
  shellReady: string;
  stackEyebrow: string;
  stackTitle: string;
  stackIntro: string;
  stackHint: string;
  detailLabel: string;
  careerEyebrow: string;
  careerTitle: string;
  careerIntro: string;
  careerCurrent: string;
  careerPast: string;
  detailFooterArea: string;
  detailFooterStatus: string;
  labEyebrow: string;
  labTitle: string;
  labIntro: string;
  networkCaption: string;
  networkNote: string;
  networkLabels: { wan: string; gateway: string; switch: string; router: string; host: string; app: string; remote: string; link: string; wifi: string; dhcpOff: string; macvlan: string; monitoring: string; portfolio: string; tunnel: string; logical: string };
  projectsEyebrow: string;
  projectsTitle: string;
  projectsIntro: string;
  projects: { label: string; title: string; body: string; approachLabel: string; approach: string; outcomeLabel: string; outcome: string; footer: string; tags: string[]; href?: string }[];
  trainingEyebrow: string;
  trainingTitle: string;
  education: { title: string; institution: string; period: string }[];
  languages: { title: string; level: string }[];
  contactEyebrow: string;
  contactTitle: string;
  contactIntro: string;
  emailCta: string;
  footer: string;
  capabilities: Capability[];
  jobs: Job[];
};

const content: Record<Lang, PageCopy> = {
  es: {
    nav: [['#stack', 'Especialidades'], ['#career', 'Trayectoria'], ['#network', 'Red doméstica'], ['#notes', 'Proyectos'], ['#contact', 'Contacto']],
    role: 'INGENIERO DE INFRAESTRUCTURA HÍBRIDA',
    headline: 'De los centros de datos locales a la infraestructura híbrida.',
    intro: 'Soy Mateo Couso Hortas, ingeniero de infraestructura híbrida con una trayectoria construida sobre entornos locales y de centros de datos. He diseñado y desplegado plataformas VMware desde la capa física —redes, VLAN, servidores y almacenamiento— hasta vCenter, clústeres, copias de seguridad y recuperación. Esa base se complementa con operación en Azure y AWS, Linux, Proxmox y automatización. Me interesa construir infraestructuras que sean mantenibles, seguras y capaces de evolucionar sin perder de vista la continuidad del servicio.',
    cv: 'DESCARGAR CURRÍCULUM', linkedin: 'PERFIL DE LINKEDIN', location: 'SANTIAGO DE COMPOSTELA · GALICIA', years: 'MÁS DE 8 AÑOS EN IT', credential: 'VMware VCP-DCV · 2023',
    portraitAlt: 'Retrato de Mateo Couso', terminalTitle: 'consola de trabajo · sesión local', terminalHint: 'Prueba un comando', terminalDefault: 'Sesión iniciada. Escribe help para ver los comandos disponibles.', terminalPlaceholder: 'help | stack | lab | career | contact', shellReady: 'SESIÓN DISPONIBLE',
    stackEyebrow: '01 / ÁREAS DE TRABAJO', stackTitle: 'La infraestructura, por capas.', stackIntro: 'Mi experiencia se concentra en plataformas de virtualización y datacenter, pero también cubre los sistemas, las aplicaciones y las herramientas necesarias para operarlas con criterio.', stackHint: 'Selecciona un área para consultar tecnologías y tareas habituales.', detailLabel: 'ÁREA SELECCIONADA',
    careerEyebrow: '02 / EXPERIENCIA PROFESIONAL', careerTitle: 'Diseño, despliegue y evolución de infraestructura en producción.', careerIntro: 'En cloud.gal asumí proyectos de principio a fin: reunión inicial con el cliente, toma de requisitos, evaluación de alternativas, diseño, despliegue, migración, optimización y seguimiento. En ese recorrido he trabajado con más de 100 clientes y entornos que superaban las 1.000 máquinas virtuales dando servicio 24/7. Mi base principal es VMware y el datacenter; hoy la complemento con operación de sistemas y servicios en la nube con Azure y AWS.',
    careerCurrent: 'ACTUAL', careerPast: 'ANTERIOR', detailFooterArea: 'ÁREA DE TRABAJO', detailFooterStatus: 'CONFIGURADA / MANTENIDA',
    labEyebrow: '03 / INFRAESTRUCTURA PERSONAL', labTitle: 'Un laboratorio pequeño, operado como infraestructura real.', labIntro: 'Dos mini PCs físicos con Debian 13 sostienen los servicios del laboratorio: DNS y DHCP, monitorización, contenedores y esta propia web. Lo utilizo para probar configuraciones, documentar cambios y mantener servicios separados por función. La publicación pública de esta web se realiza a través de Cloudflare.',
    networkCaption: 'DIAGRAMA LÓGICO · RED DOMÉSTICA', networkNote: 'Es una representación lógica y simplificada de la red. Se han omitido las direcciones privadas y los detalles de la red remota; el diagrama muestra los equipos, las conexiones y la función de cada nodo.',
    networkLabels: { wan: 'INTERNET', gateway: 'HGU MOVISTAR', switch: 'SWITCH GIGABYTE', router: 'XIAOMI AX3600', host: 'HOMELAB-RED', app: 'HOMELAB-APPS', remote: 'RED REMOTA', link: 'LAN / ENLACE', wifi: 'Wi-Fi · OpenWrt', dhcpOff: 'GESTIÓN CENTRALIZADA DE DHCP', macvlan: 'AdGuard Home · DNS + DHCP', monitoring: 'Prometheus · Grafana · exportadores · Uptime Kuma', portfolio: 'Docker Compose · portfolio y aplicaciones', tunnel: 'VPN LAN-to-LAN', logical: 'TOPOLOGÍA LÓGICA' },
    impactEyebrow: 'EXPERIENCIA A ESCALA',
    impactItems: [
      { value: '100+', label: 'clientes', detail: 'gestionados, desplegados y migrados en cloud.gal' },
      { value: '~1.000', label: 'máquinas virtuales', detail: 'en entornos de servicio continuo 24/7' },
      { value: '5', label: 'hosts Dell', detail: 'en el despliegue de un nuevo datacenter desde cero' },
      { value: '10 VMs', label: 'proyecto CDP', detail: 'con una carga individual cercana a 3 TB' }
    ],
    projectsEyebrow: '04 / CASOS DE ESTUDIO', projectsTitle: 'Proyectos de infraestructura, de extremo a extremo.', projectsIntro: 'Casos basados en trabajo real. Explican el contexto, las decisiones técnicas y la ejecución, sin publicar nombres de clientes, direccionamiento privado ni información operativa sensible.',
    projects: [
      { label: 'DISEÑO Y DESPLIEGUE · VMWARE 8', title: 'Un nuevo CPD desde cero', body: 'Diseño y puesta en marcha de una plataforma nueva para alojar y migrar clientes desde un entorno anterior basado en vSphere 7. La arquitectura se construyó alrededor de cinco hosts Dell con procesadores AMD EPYC de 64 núcleos, conmutadores Dell y almacenamiento Pure Storage mediante NVMe-oF over RoCE.', approachLabel: 'DISEÑO Y EJECUCIÓN', approach: 'Responsabilidad técnica de extremo a extremo: reuniones de inicio, recopilación de requisitos, matriz de compatibilidad, firmware de gestión remota, BIOS y controladores, imagen ESXi, despliegue de ESXi 8 y un vCenter independiente con un único clúster, inicialización de la cabina, presentación del almacenamiento y configuración de redes. La arquitectura de red combinaba conmutación de 100 Gb/s; cada host disponía de 200 Gb/s para almacenamiento y otros 200 Gb/s para vMotion, además de una salida a Internet de 10 Gb/s mediante Fortinet. La cabina Pure tenía conectividad de 400 Gb/s. La gestión y las interfaces de administración de hardware quedaban aisladas en VLAN específicas y accesibles mediante VPN. Los clientes se segmentaban mediante VDS y, en los entornos de mayor tamaño, cortafuegos virtuales Fortinet.', outcomeLabel: 'MIGRACIÓN Y RESULTADO', outcome: 'Los clientes se migraron de forma planificada desde el entorno vSphere 7, principalmente mediante copias completas con Veeam y restauración en VLAN de destino, conservando su segmentación. También gestioné su incorporación a Cloud Director. La plataforma aportó mayor capacidad de cómputo y memoria, y mejoró los tiempos de copia, restauración y recuperación. El almacenamiento de las copias de seguridad se apoyaba en una segunda cabina Pure. Se desplegaron proxies de Veeam y reglas de afinidad por host para distribuir las cargas de copia y recuperación.', footer: '5 HOSTS DELL · AMD EPYC · PURE STORAGE · NVMe-oF / RoCE', tags: ['ESXi 8', 'vCenter independiente', 'Dell', 'Pure Storage', 'Veeam', 'VDS'] },
      { label: 'MODERNIZACIÓN · SAN → vSAN', title: 'Migración de clúster por fases', body: 'Modernización de un clúster de siete hosts que partía de almacenamiento compartido Dell y versiones mixtas de vSphere 6.5 y 7.0. El objetivo era evolucionar hacia vSAN utilizando discos locales, sin cambiar el esquema de redes de los clientes.', approachLabel: 'MÉTODO DE MIGRACIÓN', approach: 'El clúster se dividió en dos grupos: cuatro hosts permanecieron inicialmente en vSphere 6.5 y tres en 7.0. Se trabajó por fases; con los tres hosts de la fase inicial preparados, se creó vSAN sobre discos locales y comenzaron las migraciones mediante replicación. A medida que se liberaban recursos, se incorporaban nuevos hosts y se evacuaban los restantes. Las redes y VLAN existentes se conservaron para evitar cambios de conectividad. Los Distributed Switches creados originalmente en 6.5 se actualizaron a 7.0.3.', outcomeLabel: 'CONTINUIDAD DEL SERVICIO', outcome: 'El clúster de origen no estaba integrado en vCenter. La replicación permitió realizar las migraciones en caliente; solo se necesitó una interrupción breve en el corte final para completar la sincronización. El trabajo avanzó progresivamente, incorporando hosts y liberando carga sin cambiar las redes ni las VLAN de los clientes.', footer: '7 HOSTS · MIGRACIÓN POR FASES · VDS 6.5 → 7.0.3', tags: ['vSphere', 'SAN', 'vSAN', 'Replicación', 'VDS'] },
      { label: 'MOVIMIENTO DE CARGAS · MULTI-CPD', title: 'Migraciones entre clientes y datacenters', body: 'Proyectos de migración integral de clientes y movimiento de datos entre infraestructuras y cabinas. El trabajo combinó migraciones entre vCenters, migraciones de almacenamiento y traslado de máquinas virtuales desde Azure hacia VMware.', approachLabel: 'PLANIFICACIÓN Y EJECUCIÓN', approach: 'Definición de alcance con el cliente, selección de cargas y ventanas, revisión de dependencias y redes, preparación de destino y ejecución. Según el escenario, se utilizaron Cross vCenter vMotion, replicación o copia de seguridad completa con Veeam y restauración en el entorno nuevo. La segmentación de red y las reglas de seguridad se conservaron o adaptaron al destino.', outcomeLabel: 'ALCANCE', outcome: 'En cloud.gal participé en la creación, administración y migración de más de 100 clientes y alrededor de 1.000 máquinas virtuales. También trabajé en migraciones de datos entre cabinas y en escenarios híbridos de Azure a VMware, priorizando continuidad de servicio y validación posterior.', footer: 'CROSS vCENTER · MIGRACIÓN DE ALMACENAMIENTO · AZURE → VMWARE', tags: ['Cross vCenter', 'Veeam', 'Azure', 'VMware', 'Almacenamiento'] },
      { label: 'CONTINUIDAD DE NEGOCIO · VEEAM 13', title: 'Veeam CDP con recuperación probada', body: 'Implantación de una solución de recuperación ante desastres entre la infraestructura de un cliente y un centro de datos de proveedor. El alcance inicial contemplaba diez máquinas virtuales, incluida una carga de aproximadamente 3 TB.', approachLabel: 'ARQUITECTURA Y SEGURIDAD', approach: 'Despliegue de componentes y servidores proxy de Veeam 13, configuración de DNS y certificados, creación de una zona DNS y sus registros para pasar de una configuración inicial basada en IP a resolución por FQDN, y definición de RPO/RTO por máquina. Se configuraron los trabajos de copia, el destino de las copias de seguridad y la VLAN de recuperación y permisos delegados en vCenter. El usuario del cliente solo podía acceder a su carpeta y recursos asignados, sin visibilidad de hosts, redes o datastores ajenos.', outcomeLabel: 'PRUEBA REAL DE DR', outcome: 'Se ejecutó una recuperación real levantando las máquinas en el entorno alternativo. Durante la validación se adaptaron reglas del firewall local para dirigir el tráfico hacia el entorno de recuperación. Las pruebas finalizaron satisfactoriamente y permitieron comprobar el procedimiento completo, no solo la replicación.', footer: 'VEEAM 13 · 10 VMS · RPO / RTO POR CARGA', tags: ['Veeam CDP', 'Proxies', 'DNS', 'RBAC', 'Recuperación ante desastres'], href: 'https://www.linkedin.com/posts/mateo-couso-hortas-71ba63164_veeam-cdp-disasterrecovery-activity-7330625843246903297-BRAf' }
    ],
    trainingEyebrow: '05 / FORMACIÓN Y OTROS DATOS', trainingTitle: 'Base técnica y formación continua.',
    education: [
      { title: 'CFGS Administración de Sistemas Informáticos en Red', institution: 'IES San Clemente', period: '2013 — 2015' },
      { title: 'CFGS Sistemas de Telecomunicación e Informáticos', institution: 'CIFP Politécnico de Santiago', period: '2015 — 2017' }
    ],
    languages: [{ title: 'Castellano', level: 'Nativo' }, { title: 'Gallego', level: 'Nativo' }, { title: 'Inglés', level: 'Intermedio · reuniones técnicas, resolución de incidencias y comunicación escrita' }],
    contactEyebrow: '06 / CONTACTO', contactTitle: '¿Hablamos de infraestructura?', contactIntro: 'Estoy abierto a conversar sobre arquitectura de sistemas, virtualización, almacenamiento, copias de seguridad y operaciones. También puedes consultar mi currículum o escribirme directamente.', emailCta: 'ESCRIBIR A MATEO', footer: 'Diseñado, desplegado y mantenido por Mateo Couso.',
    capabilities: [
      { id: 'virtualization', title: 'Virtualización y datacenter', summary: 'VMware · ESXi · vCenter · Cloud Director', body: 'Diseño, despliegue, administración y ciclo de vida de plataformas VMware. Mi trabajo abarca desde la preparación del hardware y la matriz de compatibilidad hasta la creación de clústeres, integración de almacenamiento, redes virtuales y puesta en servicio para clientes.', details: ['Despliegues de ESXi y vCenter 6.5, 7.x y 8.x', 'Creación y administración de clústeres, HA, DRS y VDS', 'Preparación de BIOS, firmware, controladores e imágenes de ESXi', 'Migraciones entre vCenters y incorporación de clientes en Cloud Director', 'Actualizaciones, parcheado y revisión de compatibilidad de hardware', 'Conocimientos puntuales de NSX-T, vRealize y Aria'], tags: ['VMware', 'vSphere', 'ESXi', 'vCenter', 'Cloud Director'] },
      { id: 'network', title: 'Redes y arquitectura de datacenter', summary: 'VLAN · VDS · conmutación · Fortinet · segmentación', body: 'Diseño y operación de redes asociadas a plataformas de virtualización y entornos con varios clientes. He trabajado en la separación de planos de gestión, almacenamiento, vMotion y tráfico de cliente, manteniendo segmentación y control de acceso.', details: ['Diseño de VLAN y redes de gestión, almacenamiento y vMotion', 'Conmutación de datacenter y enlaces de alta capacidad', 'VDS por cliente y separación lógica de redes', 'Red de gestión aislada y acceso administrativo mediante VPN', 'Integración de firewalls virtuales Fortinet en clientes de mayor tamaño'], tags: ['VLAN', 'VDS', 'Conmutación', 'Fortinet', 'VPN'] },
      { id: 'storage', title: 'Almacenamiento empresarial', summary: 'Pure Storage · SAN · NVMe-oF over RoCE · vSAN', body: 'Administración de tres cabinas Pure Storage, desde despliegue inicial e integración con VMware hasta operación, resolución de incidencias y soporte con el fabricante. También he trabajado con cabinas Dell y HP, además de entornos Synology.', details: ['Despliegue e inicialización de FlashArray, incluyendo configuración inicial con Lynxview y adaptación de puertos para NVMe-oF over RoCE', 'Creación de hosts, grupos, volúmenes y presentación de datastores a VMware', 'Revisión de registros, alertas e instantáneas; análisis de incidencias y comprobaciones ante sospechas de ransomware', 'Sustitución de discos, diagnóstico y coordinación de incidencias con el soporte de Pure Storage', 'Migración de datos entre cabinas y modernización SAN hacia vSAN'], tags: ['Pure Storage', 'FlashArray', 'NVMe-oF', 'RoCE', 'SAN'] },
      { id: 'backup', title: 'Copias de seguridad, CDP y recuperación', summary: 'Veeam · CDP · RPO / RTO · Restic · S3', body: 'Diseño y operación de copias, replicación y recuperación ante desastres. He desplegado Veeam CDP entre infraestructuras distintas, configurado RPO/RTO por máquina y ejecutado pruebas reales de recuperación en un CPD alternativo.', details: ['Veeam Backup & Replication 12.x y 13', 'CDP, proxies y replicación entre vCenters', 'Definición de RPO/RTO y planes de recuperación por carga', 'Permisos delegados en vCenter para acceso de clientes limitado a sus recursos', 'Pruebas de conmutación por error y validación de servicios; Restic con Amazon S3 en sistemas Linux'], tags: ['Veeam', 'CDP', 'Recuperación ante desastres', 'Restic', 'S3'] },
      { id: 'cloud', title: 'Infraestructura híbrida y nube', summary: 'Azure · AWS · Proxmox · migración híbrida', body: 'Operación de entornos locales y servicios en la nube, soporte de servicios gestionados y movimiento de cargas entre plataformas. La experiencia en la nube complementa una base sólida de infraestructura y virtualización.', details: ['Migración de máquinas virtuales desde Azure hacia VMware', 'Operación de AWS y Azure en producción', 'Azure Functions, App Services, Application Gateway y WAF', 'Key Vault, Bastion y control de acceso RBAC', 'Despliegue y documentación de máquinas virtuales en Proxmox'], tags: ['Azure', 'AWS', 'Proxmox', 'Nube híbrida', 'WAF'] },
      { id: 'systems', title: 'Sistemas y aplicaciones', summary: 'Linux · Windows · PostgreSQL · Docker · Nginx', body: 'Administración de sistemas y resolución de incidencias en producción, preproducción y desarrollo. Trabajo entre infraestructura y aplicación, con diagnóstico basado en registros y coordinación directa con equipos de desarrollo.', details: ['Linux y Debian; administración de servicios con systemd', 'Docker y Docker Compose; despliegues y resolución de incidencias', 'PostgreSQL: permisos, esquemas, copias de seguridad y restauraciones', 'Aplicaciones Java/Tomcat, Nginx, Jenkins y GitLab', 'Análisis de registros e integración HL7; automatización con Bash y Python'], tags: ['Linux', 'Docker', 'PostgreSQL', 'Jenkins', 'GitLab'] },
      { id: 'automation', title: 'Automatización y observabilidad', summary: 'PowerShell · PowerCLI · Terraform · Prometheus · Grafana', body: 'Automatización de tareas de operación y despliegue, uso de scripts para estandarizar procedimientos y monitorización de sistemas y servicios para facilitar el diagnóstico.', details: ['PowerShell y VMware PowerCLI', 'Terraform y VMware vRealize Orchestrator', 'Jenkins, GitLab CI/CD, Git y Docker Compose', 'Prometheus, Grafana, exportadores y Uptime Kuma en el homelab', 'Restic, instantáneas y automatización de copias y despliegues'], tags: ['PowerShell', 'PowerCLI', 'Terraform', 'Prometheus', 'Grafana'] }
    ],
    jobs: [
      { period: 'MAR 2026 — ACTUALIDAD', company: 'Enxenio', role: 'Ingeniero de Infraestructura y Sistemas', place: 'A Coruña · Híbrido', description: 'Administración de sistemas Linux en producción, preproducción y desarrollo. Operación de servicios en Azure y AWS; despliegues en AWS y gestión de máquinas virtuales en Proxmox, incluyendo configuración y documentación. Automatización de despliegues y tareas, copias de seguridad con Restic e instantáneas. Diagnóstico de aplicaciones y servicios mediante registros, Docker, systemd, Jenkins, GitLab y PostgreSQL. En un proyecto de cliente actué como interlocutor técnico entre el cliente y desarrollo, coordinando ajustes en una infraestructura VMware de un tercero para adaptarla a las necesidades de la aplicación.' },
      { period: 'JUL 2024 — MAR 2026', company: 'cloud.gal', role: 'Responsable de Virtualización y Copias de Seguridad', place: 'Santiago de Compostela · Híbrido', description: 'Responsabilidad técnica de extremo a extremo sobre proyectos de infraestructura: reuniones iniciales con clientes, toma de requisitos, análisis de la infraestructura existente, diseño de la solución, despliegue, acompañamiento, optimización y reuniones de seguimiento. Diseñé y desplegué desde cero un nuevo datacenter VMware 8 con cinco hosts Dell, conmutación de alta capacidad y almacenamiento Pure Storage NVMe-oF over RoCE. Configuré ESXi, vCenter, redes, VLAN, VDS, almacenamiento, matrices de compatibilidad, firmware, controladores, copias de seguridad y Cloud Director. Gestioné y migré más de 100 clientes y alrededor de 1.000 máquinas virtuales en servicio 24/7. Ejecuté migraciones entre datacenters y vCenters, movimientos de datos entre cabinas, migraciones de Azure a VMware, actualizaciones de ESXi, parcheado y proyectos de Veeam CDP y recuperación ante desastres.' },
      { period: 'FEB 2023 — JUN 2024', company: 'DXC Technology', role: 'Administrador de Sistemas VMware', place: 'Santiago de Compostela · Remoto', description: 'Administración y ciclo de vida de clústeres VMware para AMTEGA y CIXTEC. Instalación y configuración de nuevos clústeres, parcheado, actualizaciones, aprovisionamiento de máquinas virtuales, revisión de matrices de compatibilidad y diagnóstico de incidencias. Ejecución y adaptación de scripts PowerShell y automatizaciones con VMware vRealize Orchestrator; uso de Terraform y coordinación con equipos internacionales y fabricantes. El entorno del cliente principal tenía una escala aproximada de 600 servidores y 3.000 máquinas virtuales.' },
      { period: 'MAR 2021 — FEB 2023', company: 'Landra Sistemas', role: 'Técnico de Sistemas de Nivel 2 · Roche', place: 'Narón', description: 'Soporte de nivel 2 y administración de sistemas Windows y Linux en entornos hospitalarios. Análisis de registros, resolución de incidencias e integración de aplicaciones sanitarias mediante HL7. Automatización de procesos con Python y coordinación con personal sanitario y fabricantes para mantener la continuidad del servicio.' },
      { period: 'JUL 2020 — MAR 2021', company: 'Evelb Técnicas', role: 'Responsable de Soporte', place: 'Milladoiro', description: 'Despliegue de aplicaciones mediante Git y Jenkins, control de calidad, operación de infraestructura AWS/GCP y automatización de flujos de trabajo.' },
      { period: 'AGO 2019 — JUL 2020', company: 'Plexus Tech', role: 'Coordinador de Proyectos', place: 'Santiago de Compostela', description: 'Coordinación de equipos de entre 10 y 15 técnicos y de servicios de soporte nacionales e internacionales. Organización de intervenciones, seguimiento de plazos y gestión de escalados técnicos.' },
      { period: 'JUL 2017 — JUN 2019', company: 'Fermax Electrónica', role: 'Responsable Técnico · Galicia', place: 'Galicia', description: 'Responsabilidad técnica en Galicia: asistencia a clientes, puesta en marcha presencial y remota, diagnóstico de incidencias y formación sobre las soluciones implantadas.' }
    ]

  },
  en: {
    nav: [['#stack', 'Expertise'], ['#career', 'Experience'], ['#network', 'Home LAN'], ['#notes', 'Projects'], ['#contact', 'Contact']],
    role: 'HYBRID INFRASTRUCTURE ENGINEER', headline: 'From on-premise datacenters to hybrid infrastructure.',
    intro: 'I’m Mateo Couso Hortas, a Hybrid Infrastructure Engineer with a background built on on-premise and datacenter environments. I have designed and deployed VMware platforms from the physical layer — networks, VLANs, servers and storage — through to vCenter, clusters, backup and recovery. I now combine that foundation with hands-on operations across Azure and AWS, Linux, Proxmox and automation. My focus is on infrastructure that remains maintainable, secure and ready to evolve without compromising service continuity.',
    cv: 'DOWNLOAD CV', linkedin: 'LINKEDIN PROFILE', location: 'SANTIAGO DE COMPOSTELA · GALICIA', years: '8+ YEARS IN IT', credential: 'VMware VCP-DCV · 2023', portraitAlt: 'Portrait of Mateo Couso',
    terminalTitle: 'work console · local session', terminalHint: 'Try a command', terminalDefault: 'Session started. Type help to list available commands.', terminalPlaceholder: 'help | stack | lab | career | contact', shellReady: 'SESSION READY',
    stackEyebrow: '01 / AREAS OF WORK', stackTitle: 'Infrastructure, layer by layer.', stackIntro: 'My experience is focused on virtualization and datacenter platforms, while also covering the systems, applications and tools required to operate them reliably.', stackHint: 'Select an area to inspect the technologies and tasks involved.', detailLabel: 'SELECTED AREA',
    careerEyebrow: '02 / PROFESSIONAL EXPERIENCE', careerTitle: 'Designing, deploying and evolving production infrastructure.', careerIntro: 'At cloud.gal I owned projects end to end: customer kick-off, requirements gathering, option assessment, design, deployment, migration, optimization and follow-up. Across that work I helped build, operate and migrate environments for more than 100 customers and around 1,000 virtual machines supporting 24/7 services. My strongest foundation is VMware and on-premise datacenters, complemented by current operations across Azure, AWS and Linux systems.',
    careerCurrent: 'CURRENT', careerPast: 'PREVIOUS', detailFooterArea: 'OPERATING AREA', detailFooterStatus: 'CONFIGURED / MAINTAINED',
    labEyebrow: '03 / PERSONAL INFRASTRUCTURE', labTitle: 'A small lab operated like a real systems environment.', labIntro: 'Two physical mini PCs running Debian 13 host the lab services: DNS and DHCP, monitoring, containers and this website. I use the environment to test configurations, document changes and keep services separated by purpose. This website is published through Cloudflare.',
    networkCaption: 'LOGICAL DIAGRAM · HOME NETWORK', networkNote: 'A simplified logical view of the network. Private addresses and details of the remote network have been omitted; the diagram focuses on the devices, connections and purpose of each node.',
    networkLabels: { wan: 'INTERNET', gateway: 'MOVISTAR HGU', switch: 'GIGABYTE SWITCH', router: 'XIAOMI AX3600', host: 'HOMELAB-RED', app: 'HOMELAB-APPS', remote: 'REMOTE LAN', link: 'LAN / UPLINK', wifi: 'Wi-Fi · OpenWrt', dhcpOff: 'CENTRALIZED DHCP SERVICE', macvlan: 'AdGuard Home · DNS + DHCP', monitoring: 'Prometheus · Grafana · exportadores · Uptime Kuma', portfolio: 'Docker Compose · portfolio and apps', tunnel: 'SITE-TO-SITE VPN', logical: 'LOGICAL TOPOLOGY' },
    impactEyebrow: 'DELIVERY AT SCALE',
    impactItems: [
      { value: '100+', label: 'customers', detail: 'onboarded, operated and migrated at cloud.gal' },
      { value: '~1,000', label: 'virtual machines', detail: 'across environments delivering 24/7 services' },
      { value: '5', label: 'Dell hosts', detail: 'deployed as part of a new datacenter build' },
      { value: '10 VMs', label: 'CDP project', detail: 'including a workload close to 3 TB' }
    ],
    projectsEyebrow: '04 / SELECTED CASE STUDIES', projectsTitle: 'Infrastructure projects, end to end.', projectsIntro: 'Real project work, explained through context, technical decisions and execution. Customer names, private addressing and sensitive operational details are intentionally omitted.',
    projects: [
      { label: 'DESIGN & DEPLOYMENT · VMWARE 8', title: 'A new datacenter, built from the ground up', body: 'Design and deployment of a new platform for customer workloads migrating from a legacy vSphere 7 environment. The architecture was built around five Dell hosts with 64-core AMD EPYC processors, Dell switching and Pure Storage NVMe-oF over RoCE.', approachLabel: 'DESIGN & EXECUTION', approach: 'End-to-end technical ownership: customer kick-off, requirements gathering, compatibility matrices, remote-management and BIOS firmware, drivers, custom ESXi image, vCenter and cluster deployment, array initialization, storage presentation and network configuration. The network combined 100 Gb/s switching, 200 Gb/s per host for storage and another 200 Gb/s per host for vMotion, plus 10 Gb/s Internet egress through Fortinet. The Pure array had 400 Gb/s connectivity. Management and hardware-management interfaces were isolated in dedicated VLANs and reachable only through VPN. Customers were segmented with VDS, with virtual Fortinet firewalls for larger tenants.', outcomeLabel: 'MIGRATION & OUTCOME', outcome: 'Customers were migrated in planned waves from the previous vSphere 7 environment, mostly using full Veeam backups and restores into target VLANs while preserving segmentation. I also handled customer onboarding into Cloud Director. The new platform increased compute and memory capacity and improved backup, restore and recovery times. Backup data was stored on a second Pure array. Veeam proxies and host-affinity rules were introduced to distribute backup and recovery workloads.', footer: '5 DELL HOSTS · AMD EPYC · PURE STORAGE · NVMe-oF / RoCE', tags: ['ESXi 8', 'vCenter', 'Dell', 'Pure Storage', 'Veeam', 'VDS'] },
      { label: 'PLATFORM MODERNIZATION · SAN → vSAN', title: 'A phased SAN-to-vSAN cluster migration', body: 'Modernization of a seven-host cluster originally backed by Dell shared storage and running mixed vSphere 6.5 and 7.0 generations. The goal was to move towards vSAN using local disks, without changing customer network and VLAN layouts.', approachLabel: 'MIGRATION METHOD', approach: 'The cluster was split into two groups: four hosts initially remained on vSphere 6.5 and three on 7.0. The work was phased; once the initial three hosts were prepared, vSAN was created on local disks and workload migrations began through replication. As capacity was freed, additional hosts were introduced and the remaining workloads evacuated. Existing networks and VLANs were retained to avoid connectivity changes. Distributed Switches created on 6.5 were upgraded to 7.0.3.', outcomeLabel: 'SERVICE CONTINUITY', outcome: 'The source cluster was not managed by vCenter. Replication enabled online VM moves, with only a short interruption at final cutover to complete synchronization. Hosts were added and workloads released progressively, without changing customer networks or VLANs.', footer: '7 HOSTS · PHASED MIGRATION · VDS 6.5 → 7.0.3', tags: ['vSphere', 'SAN', 'vSAN', 'Replication', 'VDS'] },
      { label: 'WORKLOAD MOVEMENT · MULTI-DATACENTER', title: 'Customer and cross-datacenter migrations', body: 'Projects involving full customer migrations and data movement between infrastructure platforms and storage arrays. The work covered cross-vCenter moves, storage migrations and virtual-machine migrations from Azure to VMware.', approachLabel: 'PLANNING & EXECUTION', approach: 'Scope definition with the customer, workload selection and scheduling, dependency and network reviews, target preparation and migration execution. Depending on the scenario, the process used Cross vCenter vMotion, replication, or full Veeam backup and restore into the new environment. Network segmentation and security rules were preserved or adapted at the destination.', outcomeLabel: 'SCOPE', outcome: 'At cloud.gal I helped build, operate and migrate environments for more than 100 customers and around 1,000 virtual machines. I also worked on data migrations between storage arrays and hybrid Azure-to-VMware scenarios, prioritizing service continuity and post-migration validation.', footer: 'CROSS vCENTER · STORAGE MIGRATION · AZURE → VMWARE', tags: ['Cross vCenter', 'Veeam', 'Azure', 'VMware', 'Storage'] },
      { label: 'BUSINESS CONTINUITY · VEEAM 13', title: 'Veeam CDP with tested disaster recovery', body: 'Implementation of a Disaster Recovery solution between a customer environment and a service-provider datacenter. The initial scope covered ten virtual machines, including one workload of approximately 3 TB.', approachLabel: 'ARCHITECTURE & SECURITY', approach: 'Deployment of Veeam 13 components and proxies, DNS and certificate configuration, creation of a DNS zone and records to move from an IP-based setup to FQDN resolution, and per-VM RPO/RTO settings. Backup jobs, backup targets and the recovery VLAN were configured. vCenter access was delegated through a restricted customer account: the user could access only its assigned folder and resources, with no visibility of unrelated hosts, networks or datastores.', outcomeLabel: 'REAL DR TEST', outcome: 'A real recovery test was carried out by powering on the workloads in the alternate environment. Local firewall rules were adapted to direct traffic towards the recovery site and validate the service. The tests completed successfully and exercised the recovery process end to end, beyond replication health alone.', footer: 'VEEAM 13 · 10 VMS · PER-WORKLOAD RPO / RTO', tags: ['Veeam CDP', 'Proxies', 'DNS', 'RBAC', 'Disaster Recovery'], href: 'https://www.linkedin.com/posts/mateo-couso-hortas-71ba63164_veeam-cdp-disasterrecovery-activity-7330625843246903297-BRAf' }
    ],
    trainingEyebrow: '05 / EDUCATION & DETAILS', trainingTitle: 'Technical foundations and continued learning.',
    education: [
      { title: 'Advanced Vocational Diploma · Networked IT Systems Administration', institution: 'IES San Clemente', period: '2013 — 2015' },
      { title: 'Advanced Vocational Diploma · Telecommunications and IT Systems', institution: 'CIFP Politécnico de Santiago', period: '2015 — 2017' }
    ],
    languages: [{ title: 'Spanish', level: 'Native' }, { title: 'Galician', level: 'Native' }, { title: 'English', level: 'Intermediate · vendor meetings, troubleshooting and written communication' }],
    contactEyebrow: '06 / CONTACT', contactTitle: 'Let’s talk infrastructure.', contactIntro: 'I’m open to conversations about systems architecture, virtualization, storage, backup and operations. You can also review my CV or email me directly.', emailCta: 'EMAIL MATEO', footer: 'Designed, deployed and maintained by Mateo Couso.',
    capabilities: [
      { id: 'virtualization', title: 'Virtualization & datacenter', summary: 'VMware · ESXi · vCenter · Cloud Director', body: 'Design, deployment, administration and lifecycle management of VMware platforms. My work ranges from hardware preparation and compatibility checks to cluster creation, storage integration, virtual networking and customer service onboarding.', details: ['ESXi and vCenter deployments across 6.5, 7.x and 8.x', 'Cluster administration, HA, DRS and VDS', 'BIOS, firmware, driver and ESXi image preparation', 'Cross-vCenter migrations and customer onboarding to Cloud Director', 'Patching, upgrades and hardware compatibility reviews', 'Limited exposure to NSX-T, vRealize and Aria'], tags: ['VMware', 'vSphere', 'ESXi', 'vCenter', 'Cloud Director'] },
      { id: 'network', title: 'Datacenter networking & architecture', summary: 'VLANs · VDS · switching · Fortinet · segmentation', body: 'Design and operation of the networks supporting virtualization platforms and multi-tenant environments. I have worked on separating management, storage, vMotion and customer traffic while preserving segmentation and access control.', details: ['VLAN and network design for management, storage and vMotion', 'Datacenter switching and high-bandwidth uplinks', 'Per-customer VDS and logical network segmentation', 'Isolated management network with administrative access over VPN', 'Integration of virtual Fortinet firewalls for larger customers'], tags: ['VLAN', 'VDS', 'Switching', 'Fortinet', 'VPN'] },
      { id: 'storage', title: 'Enterprise storage', summary: 'Pure Storage · SAN · NVMe-oF over RoCE · vSAN', body: 'Administration of three Pure Storage arrays, from initial deployment and VMware integration to operations, troubleshooting and vendor support. I have also worked with Dell and HP arrays, as well as Synology environments.', details: ['FlashArray deployment and initialization, including initial Lynxview setup and port adaptation for NVMe-oF over RoCE', 'Host, host-group and volume configuration; VMware datastore presentation', 'Log, alert and snapshot review; incident analysis', 'Drive replacement and support-case coordination with Pure Storage', 'Data migration between arrays and SAN-to-vSAN modernization'], tags: ['Pure Storage', 'FlashArray', 'NVMe-oF', 'RoCE', 'SAN'] },
      { id: 'backup', title: 'Backup, CDP & recovery', summary: 'Veeam · CDP · RPO / RTO · Restic · S3', body: 'Design and operations across backup, replication and disaster recovery. I have deployed Veeam CDP between separate infrastructures, configured per-VM RPO/RTO and carried out real recovery tests in an alternate data center.', details: ['Veeam Backup & Replication 12.x and 13', 'CDP, proxies and replication between vCenters', 'RPO/RTO definition and recovery planning per workload', 'Delegated vCenter access scoped to customer-owned resources', 'Failover testing and service validation; Restic with Amazon S3 for Linux systems'], tags: ['Veeam', 'CDP', 'Disaster Recovery', 'Restic', 'S3'] },
      { id: 'cloud', title: 'Hybrid infrastructure & cloud', summary: 'Azure · AWS · Proxmox · hybrid migration', body: 'Operations across on-premise and public-cloud environments, managed-service support and workload movement between platforms. Cloud experience complements a strong infrastructure and virtualization background.', details: ['Virtual-machine migrations from Azure to VMware', 'Production operations across AWS and Azure', 'Azure Functions, App Services, Application Gateway and WAF', 'Key Vault, Bastion and RBAC access control', 'VM deployment and documentation on Proxmox'], tags: ['Azure', 'AWS', 'Proxmox', 'Hybrid Cloud', 'WAF'] },
      { id: 'systems', title: 'Systems & applications', summary: 'Linux · Windows · PostgreSQL · Docker · Nginx', body: 'Systems administration and troubleshooting across production, pre-production and development. I work across infrastructure and application layers, using logs for diagnosis and coordinating directly with development teams.', details: ['Linux and Debian; service administration with systemd', 'Docker and Docker Compose deployments and troubleshooting', 'PostgreSQL: permissions, schemas, backups and restores', 'Java/Tomcat applications, Nginx, Jenkins and GitLab', 'Log analysis and HL7 integration; Bash and Python scripting'], tags: ['Linux', 'Docker', 'PostgreSQL', 'Jenkins', 'GitLab'] },
      { id: 'automation', title: 'Automation & observability', summary: 'PowerShell · PowerCLI · Terraform · Prometheus · Grafana', body: 'Operational and deployment automation, scripting to standardize procedures, and monitoring of systems and services to support diagnosis and reliability.', details: ['PowerShell and VMware PowerCLI', 'Terraform and VMware vRealize Orchestrator', 'Jenkins, GitLab CI/CD, Git and Docker Compose', 'Prometheus, Grafana, exporters and Uptime Kuma in the homelab', 'Restic, snapshots and automation for backups and deployments'], tags: ['PowerShell', 'PowerCLI', 'Terraform', 'Prometheus', 'Grafana'] }
    ],
    jobs: [
      { period: 'MAR 2026 — PRESENT', company: 'Enxenio', role: 'Infrastructure & Systems Engineer', place: 'A Coruña · Hybrid', description: 'Linux systems administration across production, pre-production and development. AWS deployments and virtual-machine operations on Proxmox, including configuration and documentation. Deployment and task automation, Restic backups and snapshots. Application and service troubleshooting through logs, Docker, systemd, Jenkins, GitLab and PostgreSQL. In a customer project, I acted as the technical point of contact between the customer and the development team, coordinating changes to a third-party VMware environment to meet application requirements.' },
      { period: 'JUL 2024 — MAR 2026', company: 'cloud.gal', role: 'Virtualization & Backup Lead', place: 'Santiago de Compostela · Hybrid', description: 'End-to-end technical ownership of infrastructure projects: customer kick-off, requirements gathering, assessment of existing environments, solution design, deployment, customer onboarding, optimization and follow-up. Designed and deployed a new VMware 8 datacenter from scratch with five Dell hosts, high-capacity switching and Pure Storage NVMe-oF over RoCE. Configured ESXi, vCenter, networks, VLANs, VDS, storage, compatibility matrices, firmware, drivers, backup and Cloud Director. Built, operated and migrated environments for more than 100 customers and around 1,000 virtual machines supporting 24/7 services. Delivered cross-datacenter and cross-vCenter migrations, data moves between arrays, Azure-to-VMware migrations, ESXi upgrades, patching and Veeam CDP/Disaster Recovery projects.' },
      { period: 'FEB 2023 — JUN 2024', company: 'DXC Technology', role: 'VMware Systems Administrator', place: 'Santiago de Compostela · Remote', description: 'VMware cluster administration and lifecycle management for AMTEGA and CIXTEC. Installed and configured new clusters, patched and upgraded platforms, provisioned virtual machines, reviewed compatibility matrices and troubleshot incidents. Executed and adapted PowerShell scripts and VMware vRealize Orchestrator workflows, used Terraform and coordinated with international teams and vendors. The main customer environment was approximately 600 servers and 3,000 virtual machines in scale.' },
      { period: 'MAR 2021 — FEB 2023', company: 'Landra Sistemas', role: 'Level 2 Systems Technician · Roche', place: 'Narón', description: 'Level 2 support and Windows/Linux systems administration in healthcare environments. Log analysis, incident resolution and healthcare application integration through HL7. Python process automation and coordination with healthcare staff and vendors to maintain service continuity.' },
      { period: 'JUL 2020 — MAR 2021', company: 'Evelb Técnicas', role: 'Support Lead', place: 'Milladoiro', description: 'Application deployments with Git and Jenkins, quality control, AWS/GCP infrastructure operations and workflow automation.' },
      { period: 'AUG 2019 — JUL 2020', company: 'Plexus Tech', role: 'Project Coordinator', place: 'Santiago de Compostela', description: 'Coordination of 10–15 technicians and national and international support. Intervention planning, deadline follow-up and technical escalation management.' },
      { period: 'JUL 2017 — JUN 2019', company: 'Fermax Electrónica', role: 'Technical Lead · Galicia', place: 'Galicia', description: 'Technical responsibility across Galicia: customer support, on-site and remote commissioning, troubleshooting and training on deployed solutions.' }
    ]
  }
};

export default function Home() {
  const [lang, setLang] = useState<Lang>('es');
  const [selected, setSelected] = useState('virtualization');
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState('Sesión iniciada. Escribe help para ver los comandos disponibles.');
  const t = content[lang];
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const active = useMemo(() => t.capabilities.find((item) => item.id === selected) ?? t.capabilities[0], [t, selected]);

  function executeCommand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cmd = command.trim().toLowerCase();
    const isSpanish = lang === 'es';
    const responses: Record<string, string> = {
      help: isSpanish ? 'Comandos: whoami · stack · lab · career · contact · clear' : 'Commands: whoami · stack · lab · career · contact · clear',
      whoami: isSpanish ? 'Mateo Couso Hortas — Ingeniero de Infraestructura Híbrida' : 'Mateo Couso Hortas — Hybrid Infrastructure Engineer',
      stack: 'VMware · SAN / vSAN · Pure Storage · Veeam CDP · Disaster Recovery · Azure · AWS · Terraform',
      lab: 'homelab-red / AdGuard / homelab-apps / OpenWrt',
      career: 'Fermax → Plexus → Evelb → Landra → DXC → cloud.gal → Enxenio',
      contact: 'contacto@mcouso.es'
    };
    if (cmd === 'clear') setOutput('');
    else setOutput(responses[cmd] ?? (isSpanish ? `bash: ${cmd || '∅'}: comando no encontrado. Prueba help.` : `bash: ${cmd || '∅'}: command not found. Try help.`));
    setCommand('');
  }

  return (
    <main id="top" className="site">
      <header className="topbar">
        <a className="brand" href="#top" aria-label={lang === 'es' ? 'Mateo Couso, inicio' : 'Mateo Couso, home'}><span className="brand-mark"><img src="/brand-mark.svg" alt="" /></span><span className="brand-name">MATEO COUSO<br /><small>{lang === 'es' ? 'INFRAESTRUCTURA / SISTEMAS' : 'INFRASTRUCTURE / SYSTEMS'}</small></span></a>
        <nav aria-label={lang === 'es' ? 'Navegación principal' : 'Main navigation'}>{t.nav.map(([href, label]) => <a key={href} href={href}>{label}</a>)}</nav>
        <button className="language" onClick={() => { const next = lang === 'es' ? 'en' : 'es'; setLang(next); setOutput(next === 'es' ? 'Sesión iniciada. Escribe help para ver los comandos disponibles.' : 'Session started. Type help to list available commands.'); }} aria-label={lang === 'es' ? 'Cambiar idioma' : 'Change language'}>{lang === 'es' ? 'EN' : 'ES'} <span>↗</span></button>
      </header>

      <div className="page-wrap">
        <section className="hero" id="home">
          <div className="hero-copy">
            <div className="folio"><span>{lang === 'es' ? 'PERFIL TÉCNICO' : 'TECHNICAL PROFILE'}</span><span>MC / 2026</span></div>
            <p className="role"><i />{t.role}</p>
            <h1>{t.headline}</h1>
            <p className="intro">{t.intro}</p>
            <div className="hero-actions"><a className="button-primary" href="/CV-Mateo-Couso-Hortas-2026.pdf" download>{t.cv} <span>↓</span></a><a className="link-arrow" href="https://es.linkedin.com/in/mateo-couso-hortas-71ba63164" target="_blank" rel="noreferrer">{t.linkedin} ↗</a></div>
            <div className="hero-facts"><span>{t.location}</span><span>{t.years}</span><span>{t.credential}</span></div>
          </div>
          <aside className="portrait-panel">
            <div className="portrait-frame"><img src="/profile.jpg" alt={t.portraitAlt} /><span className="portrait-index">01 / 06</span></div>
            <div className="portrait-caption"><span>{lang === 'es' ? 'MIGRACIONES · VMWARE · DISASTER RECOVERY' : 'MIGRATIONS · VMWARE · DISASTER RECOVERY'}</span><b>{lang === 'es' ? 'De la arquitectura de datacenter a las pruebas reales de recuperación.' : 'From datacenter architecture to real recovery testing.'}</b></div>
            <div className="side-stamp">{lang === 'es' ? <>INGENIERO<br />INFRAESTRUCTURA</> : <>INFRASTRUCTURE<br />ENGINEER</>}<br /><strong>GALICIA</strong></div>
          </aside>
        </section>

        <section className="console-strip" aria-label={lang === 'es' ? 'Terminal interactiva' : 'Interactive terminal'}>
          <div className="console-heading"><span className="console-light" /><span>{t.terminalTitle}</span><small>TTY / 01</small></div>
          <div className="console-content"><p className="console-intro">{t.terminalHint} <span>whoami · help · stack · lab</span></p><form className="console-form" onSubmit={executeCommand}><label htmlFor="command">mateo@infra:~$</label><input id="command" value={command} onChange={(event) => setCommand(event.target.value)} placeholder={t.terminalPlaceholder} autoComplete="off" /><button type="submit" aria-label={lang === 'es' ? 'Ejecutar comando' : 'Run command'}>↵</button></form><div className="console-output" aria-live="polite">{output || <span className="empty-output">&nbsp;</span>}</div></div>
          <div className="console-status"><span>{t.shellReady}</span><span>TCP/IP · LINUX · VMWARE</span></div>
        </section>

        <section className="impact-strip" aria-label={t.impactEyebrow}>
          <div className="impact-heading">{t.impactEyebrow}</div>
          <div className="impact-grid">{t.impactItems.map((item) => <article className="impact-item" key={item.label}><strong>{item.value}</strong><b>{item.label}</b><span>{item.detail}</span></article>)}</div>
        </section>

        <section className="section expertise" id="stack">
          <div className="section-heading"><span className="section-number">{t.stackEyebrow}</span><h2>{t.stackTitle}</h2><p>{t.stackIntro}</p></div>
          <div className="expertise-grid">
            <div className="expertise-list">{t.capabilities.map((item, index) => <button key={item.id} className={`expertise-row ${selected === item.id ? 'is-active' : ''}`} onClick={() => setSelected(item.id)} aria-pressed={selected === item.id}><span className="exp-num">{String(index + 1).padStart(2, '0')}</span><span className="exp-text"><b>{item.title}</b><small>{item.summary}</small></span><span className="exp-mark">{selected === item.id ? '●' : '↗'}</span></button>)}</div>
            <article className="expertise-detail"><div className="detail-meta"><span>{t.detailLabel}</span><span>/{active.id}.conf</span></div><div className="detail-rule" /><p className="detail-kicker">{active.summary}</p><h3>{active.title}</h3><p className="detail-body">{active.body}</p><ul>{active.details.map((detail) => <li key={detail}>{detail}</li>)}</ul><div className="detail-tags">{active.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="detail-footer"><span>{t.detailFooterArea}</span><b>{t.detailFooterStatus}</b></div></article>
          </div>
          <p className="section-footnote">{t.stackHint}</p>
        </section>

        <section className="section career" id="career">
          <div className="section-heading career-heading"><span className="section-number">{t.careerEyebrow}</span><h2>{t.careerTitle}</h2><p>{t.careerIntro}</p></div>
          <div className="career-ledger">{t.jobs.map((job, index) => <article className="career-row" key={job.company}><div className="career-index"><span>{String(index + 1).padStart(2, '0')}</span><small>{job.period}</small></div><div className="career-content"><div className="career-company">{job.company}<span>{job.place}</span></div><h3>{job.role}</h3><p>{job.description}</p></div><div className="career-branch">{index === 0 ? t.careerCurrent : t.careerPast}</div></article>)}</div>
        </section>

        <section className="section home-lan" id="network">
          <div className="section-heading"><span className="section-number">{t.labEyebrow}</span><h2>{t.labTitle}</h2><p>{t.labIntro}</p></div>
          <div className="network-panel">
            <div className="network-topline"><span>{t.networkCaption}</span><span className="network-live"><i /> {t.networkLabels.logical}</span></div>
            <div className="network-scroll">
              <svg className="network-svg" viewBox="0 0 1360 590" role="img" aria-label={lang === 'es' ? 'Diagrama de red doméstica: Internet, HGU Movistar, switch Gigabyte, Xiaomi OpenWrt, homelab-red, AdGuard, homelab-apps y red remota por VPN.' : 'Home network diagram: Internet, Movistar HGU, Gigabyte switch, Xiaomi OpenWrt, homelab-red, AdGuard, homelab-apps and remote VPN network.'}>
                <defs>
                  <pattern id="gridDots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#b6b0a2" opacity=".55" /></pattern>
                  <marker id="arrowLine" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="none" stroke="#bd573e" strokeWidth="1.2" /></marker>
                </defs>
                <rect x="0" y="0" width="1360" height="590" fill="url(#gridDots)" />
                <path className="net-line" d="M195 310 H245" /><path className="net-line" d="M465 310 H550" />
                <path className="net-line secondary" d="M780 310 H840 V140 H880" /><path className="net-line secondary" d="M840 310 H880" /><path className="net-line secondary" d="M840 310 V495 H880" />
                <path className="net-vpn" d="M1100 140 H1120" markerEnd="url(#arrowLine)" />
                <text className="net-label" x="210" y="293">WAN</text><text className="net-label" x="493" y="293">{t.networkLabels.link}</text>
                <path className="node-shell" d="M35 270 h160 v80 h-160 z" /><text className="node-eyebrow" x="54" y="296">UPLINK</text><text className="node-title" x="54" y="326">{t.networkLabels.wan}</text>
                <path className="node-shell" d="M245 245 h220 v130 h-220 z" /><path className="node-accent" d="M245 245 h220 v7 h-220 z" /><text className="node-eyebrow" x="266" y="279">GATEWAY / ROUTER</text><text className="node-title" x="266" y="310">{t.networkLabels.gateway}</text><text className="node-small" x="266" y="344">{t.networkLabels.dhcpOff}</text>
                <path className="node-shell dark" d="M550 245 h230 v130 h-230 z" /><path className="node-accent blue" d="M550 245 h230 v7 h-230 z" /><text className="node-eyebrow light" x="571" y="279">{lang === 'es' ? 'CONMUTACIÓN' : 'SWITCHING'}</text><text className="node-title light" x="571" y="310">{t.networkLabels.switch}</text><text className="node-small light" x="571" y="344">{lang === 'es' ? 'DISTRIBUCIÓN LAN · 5 PUERTOS' : 'LAN DISTRIBUTION · 5 PORTS'}</text>
                <path className="node-shell" d="M880 80 h220 v120 h-220 z" /><path className="node-accent blue" d="M880 80 h220 v7 h-220 z" /><text className="node-eyebrow" x="901" y="112">ROUTER / WIRELESS</text><text className="node-title" x="901" y="141">{t.networkLabels.router}</text><text className="node-small" x="901" y="164">{t.networkLabels.wifi}</text>
                <path className="node-shell" d="M1120 80 h195 v120 h-195 z" /><path className="node-accent red" d="M1120 80 h195 v7 h-195 z" /><text className="node-eyebrow" x="1138" y="112">{t.networkLabels.tunnel}</text><text className="node-title compact" x="1138" y="141">{t.networkLabels.remote}</text><text className="node-small" x="1138" y="166">{lang === 'es' ? 'RED PRIVADA REMOTA' : 'PRIVATE REMOTE NETWORK'}</text>
                <path className="node-shell" d="M880 235 h435 v170 h-435 z" /><path className="node-accent" d="M880 235 h435 v7 h-435 z" /><text className="node-eyebrow" x="901" y="269">LENOVO THINKCENTRE M715q TINY</text><text className="node-title" x="901" y="300">{t.networkLabels.host}</text><text className="node-small" x="901" y="324">{lang === 'es' ? 'DEBIAN 13 · DNS / DHCP / MONITORIZACIÓN' : 'DEBIAN 13 · DNS / DHCP / MONITORING'}</text><rect className="service-chip" x="901" y="340" width="390" height="25" /><text className="service-chip-text" x="912" y="357">{t.networkLabels.macvlan}</text><text className="node-small" x="901" y="386">{t.networkLabels.monitoring}</text>
                <path className="node-shell" d="M880 440 h435 v115 h-435 z" /><path className="node-accent blue" d="M880 440 h435 v7 h-435 z" /><text className="node-eyebrow" x="901" y="474">HP PRODESK 400 G6 MINI</text><text className="node-title" x="901" y="504">{t.networkLabels.app}</text><text className="node-small" x="901" y="527">DEBIAN 13 · DOCKER HOST</text><text className="node-small" x="901" y="545">{t.networkLabels.portfolio}</text>
                <circle className="junction" cx="840" cy="310" r="5" />
              </svg>
            </div>
            <div className="network-legend"><span><i className="legend-solid" /> {lang === 'es' ? 'Conexión LAN' : 'LAN connection'}</span><span><i className="legend-dash" /> {t.networkLabels.tunnel}</span><span><i className="legend-ip" /> {lang === 'es' ? 'Servicio / nodo' : 'Service / node'}</span><span className="network-domain">{lang === 'es' ? 'RED INTERNA · DIRECCIONAMIENTO OMITIDO' : 'PRIVATE NETWORK · ADDRESSING OMITTED'}</span></div>
          </div>
          <p className="network-note">{t.networkNote}</p>
          <div className="lab-details">
            <article>
              <span>{lang === 'es' ? 'NODO / 01' : 'NODE / 01'}</span>
              <h3>homelab-red</h3>
              <p>ThinkCentre M715q Tiny · Debian 13</p>
              <small>{lang === 'es' ? 'AdGuard Home para DNS y DHCP; Prometheus 3.8.0, Grafana 12.3.0, Node Exporter 1.10.2, Blackbox Exporter 0.27.0 y Uptime Kuma para monitorización.' : 'AdGuard Home for DNS and DHCP; Prometheus 3.8.0, Grafana 12.3.0, Node Exporter 1.10.2, Blackbox Exporter 0.27.0 and Uptime Kuma for monitoring.'}</small>
            </article>
            <article>
              <span>{lang === 'es' ? 'NODO / 02' : 'NODE / 02'}</span>
              <h3>homelab-apps</h3>
              <p>HP ProDesk 400 G6 Mini · Debian 13</p>
              <small>{lang === 'es' ? 'Docker Compose para el portfolio y aplicaciones propias. Servicios de aplicación separados del nodo dedicado a DNS y monitorización.' : 'Docker Compose for the portfolio and personal applications. Application services are separated from the node dedicated to DNS and monitoring.'}</small>
            </article>
            <article>
              <span>{lang === 'es' ? 'RED / 03' : 'NETWORK / 03'}</span>
              <h3>{lang === 'es' ? 'Servicios de red' : 'Network services'}</h3>
              <p>Movistar HGU · Xiaomi AX3600 / OpenWrt · {lang === 'es' ? 'switch Gigabyte' : 'Gigabyte switch'}</p>
              <small>{lang === 'es' ? 'LAN principal con DHCP centralizado en el homelab y VPN LAN-to-LAN hacia una red remota. Direccionamiento y datos de acceso omitidos en la versión pública.' : 'Main LAN with DHCP centralized on the homelab and a LAN-to-LAN VPN to a remote network. Addressing and access details are omitted from this public version.'}</small>
            </article>
          </div>
        </section>

        <section className="section field-notes" id="notes">
          <div className="section-heading"><span className="section-number">{t.projectsEyebrow}</span><h2>{t.projectsTitle}</h2><p>{t.projectsIntro}</p></div>
          <div className="notes-grid">{t.projects.map((project, index) => {
            const cardContent = <><div className="note-top"><span>{project.label}</span><b>0{index + 1}</b></div><h3>{project.title}</h3><p className="note-summary">{project.body}</p><div className="note-subsection"><b>{project.approachLabel}</b><p>{project.approach}</p></div><div className="note-subsection outcome"><b>{project.outcomeLabel}</b><p>{project.outcome}</p></div><div className="note-tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="note-bottom">{project.footer}{project.href ? <span> ↗</span> : null}</div></>;
            return project.href
              ? <a key={project.label} className={`note ${index === 0 ? 'note-featured' : ''}`} href={project.href} target="_blank" rel="noreferrer">{cardContent}</a>
              : <article key={project.label} className={`note ${index === 0 ? 'note-featured' : ''}`}>{cardContent}</article>;
          })}</div>
        </section>

        <section className="section education" id="education">
          <div className="section-heading"><span className="section-number">{t.trainingEyebrow}</span><h2>{t.trainingTitle}</h2></div>
          <div className="education-grid"><div className="education-main"><div className="certification"><span className="cert-seal">VCP</span><div><small>VMware Certified Professional</small><h3>Data Center Virtualization</h3><b>VCP-DCV · 2023</b></div></div>{t.education.map((item) => <article className="study-row" key={item.title}><div><h3>{item.title}</h3><p>{item.institution}</p></div><span>{item.period}</span></article>)}</div><aside className="language-panel"><span>{lang === 'es' ? 'IDIOMAS' : 'LANGUAGES'}</span>{t.languages.map((item) => <div className="language-row" key={item.title}><b>{item.title}</b><small>{item.level}</small></div>)}<div className="language-foot">{lang === 'es' ? 'CASTELLANO · GALLEGO · INGLÉS' : 'SPANISH · GALICIAN · ENGLISH'}</div></aside></div>
        </section>

        <section className="contact-section" id="contact"><div className="contact-index">{t.contactEyebrow}</div><div className="contact-main"><h2>{t.contactTitle}</h2><p>{t.contactIntro}</p><div className="contact-actions"><a className="button-primary" href="mailto:contacto@mcouso.es">{t.emailCta} <span>↗</span></a><a href="https://es.linkedin.com/in/mateo-couso-hortas-71ba63164" target="_blank" rel="noreferrer">LINKEDIN ↗</a><a href="/CV-Mateo-Couso-Hortas-2026.pdf" download>PDF / CV ↓</a></div><div className="contact-email">contacto@mcouso.es</div></div><div className="contact-stamp">MATEO<br />COUSO<br /><b>2026</b></div></section>
      </div>
      <footer className="footer"><span>© {new Date().getFullYear()} MATEO COUSO HORTAS</span><span>{t.footer}</span><a href="#top">{lang === 'es' ? 'VOLVER ARRIBA ↑' : 'BACK TO TOP ↑'}</a></footer>
    </main>
  );
}

