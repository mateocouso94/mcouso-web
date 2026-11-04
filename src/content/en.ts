// Website copy in English.
// Edit any sentence here without touching the rest of the code:
// change the quoted text, commit to main, and it will be live on mcouso.es in a few minutes.
import type { PageCopy } from './types';

export const en: PageCopy = {
  nav: [
    ['#stack', 'Expertise'],
    ['#career', 'Experience'],
    ['#network', 'Homelab'],
    ['#notes', 'Projects'],
    ['/notas/', 'Notes'],
    ['/estado/', 'Status'],
    ['#contact', 'Contact'],
  ],

  // --- Hero ---
  role: 'HYBRID INFRASTRUCTURE ENGINEER',
  headline: 'Eight years building and running infrastructure.',
  intro:
    "I'm Mateo, a systems engineer. Most of my career has been on-premise VMware: I built a datacenter from scratch, from the VLANs and the storage array up to vCenter and backups, and I've migrated more than 100 customers between platforms. These days I also work with Linux, Azure, AWS and Proxmox, and that's where I want to grow: hybrid infrastructure, built on what I learned in the datacenter.",
  cv: 'DOWNLOAD CV',
  linkedin: 'LINKEDIN PROFILE',
  location: 'SANTIAGO DE COMPOSTELA · GALICIA, SPAIN',
  years: '8+ YEARS IN SYSTEMS',
  credential: 'VMware VCP-DCV · 2023',
  portraitAlt: 'Portrait of Mateo Couso',

  // --- Console ---
  terminalTitle: 'console · try a command',
  terminalHint: 'Try a command',
  terminalDefault: 'Type status for the live homelab status, or help for the rest.',
  terminalPlaceholder: 'status | deploy | help | whoami',
  shellReady: 'READY',

  // --- Numbers ---
  impactEyebrow: 'BY THE NUMBERS',
  impactItems: [
    { value: '100+', label: 'customers', detail: 'onboarded, run or migrated at cloud.gal' },
    { value: '~1,000', label: 'virtual machines', detail: 'running 24/7 at cloud.gal' },
    { value: '~3,000', label: 'virtual machines', detail: "in DXC's main customer environment" },
    { value: '3', label: 'Pure Storage arrays', detail: 'run from initial setup to vendor support cases' },
  ],

  // --- 01 Expertise ---
  stackEyebrow: 'EXPERTISE',
  stackTitle: 'What I work with.',
  stackIntro:
    "Most of my hours are in virtualization, storage and backup. I use the rest every day, but not as deeply, and I say so in each area.",
  stackHint: 'Pick an area to see the details.',
  detailLabel: 'AREA',
  detailFooterArea: 'AREA OF WORK',
  detailFooterStatus: 'IN USE',
  capabilities: [
    {
      id: 'virtualization',
      title: 'Virtualization & datacenter',
      summary: 'VMware · ESXi · vCenter · Cloud Director',
      body: "This is where most of my experience is. I've installed, configured, upgraded and migrated VMware platforms, starting with the compatibility matrix and server firmware and finishing with customers running on top.",
      details: [
        'ESXi and vCenter 6.5, 7.x and 8.x',
        'Clusters, HA, DRS and VDS',
        'BIOS, firmware, drivers and custom ESXi images',
        'Cross-vCenter migrations and customers on Cloud Director',
        'Patching, version upgrades and compatibility matrices',
        'Some NSX-T, vRealize and Aria, not in depth',
      ],
      tags: ['VMware', 'vSphere', 'ESXi', 'vCenter', 'Cloud Director'],
    },
    {
      id: 'network',
      title: 'Datacenter networking',
      summary: 'VLANs · VDS · switching · Fortinet',
      body: 'The network under the virtualization layer: keeping management, storage, vMotion and customer traffic apart, and each customer isolated from the rest.',
      details: [
        'Management, storage and vMotion VLANs',
        'Datacenter switching and 100 Gb links',
        'One VDS per customer',
        'Isolated management network, reachable only over VPN',
        "Virtual Fortinet firewalls for larger customers (I've used them, but it's not my strongest area)",
      ],
      tags: ['VLAN', 'VDS', 'Switching', 'Fortinet', 'VPN'],
    },
    {
      id: 'storage',
      title: 'Storage',
      summary: 'Pure Storage · SAN · NVMe over RoCE · vSAN',
      body: "I've run three Pure Storage arrays, from initial setup to swapping drives, reviewing failures and opening cases with Pure. I've also worked with Dell, HP and Synology, though less deeply.",
      details: [
        'FlashArray initial setup with Lynxview and port reconfiguration for NVMe over RoCE',
        'Hosts, host groups, volumes and datastore presentation to VMware',
        'Log, alert and snapshot reviews, including checks for suspected ransomware',
        'Drive replacements and support cases with Pure',
        'Data migration between arrays and moving from SAN to vSAN',
      ],
      tags: ['Pure Storage', 'FlashArray', 'NVMe-oF', 'RoCE', 'vSAN'],
    },
    {
      id: 'backup',
      title: 'Backup & recovery',
      summary: 'Veeam · CDP · RPO / RTO · Restic',
      body: 'Backups, replicas and DR with Veeam, plus real recovery tests: bringing the machines up on the other side and checking they work.',
      details: [
        'Veeam Backup & Replication 12.x and 13',
        'CDP, proxies and replication between vCenters',
        'RPO and RTO set per machine',
        'Customer users in vCenter that only see their own resources',
        'Restic with S3 on Linux servers',
      ],
      tags: ['Veeam', 'CDP', 'DR', 'Restic', 'S3'],
    },
    {
      id: 'cloud',
      title: 'Cloud & hybrid infrastructure',
      summary: 'Azure · AWS · Proxmox',
      body: "This is what I'm using most right now and where I want to keep growing. I work with Azure and AWS in production and with Proxmox, and I've moved workloads from Azure to VMware.",
      details: [
        'VM migrations from Azure to VMware',
        'AWS and Azure in production',
        'Azure Functions, App Services, Application Gateway and WAF',
        'Key Vault, Bastion and RBAC',
        'VM deployment and documentation on Proxmox',
      ],
      tags: ['Azure', 'AWS', 'Proxmox', 'WAF'],
    },
    {
      id: 'systems',
      title: 'Systems & applications',
      summary: 'Linux · Windows · PostgreSQL · Docker · Nginx',
      body: 'The day-to-day: Linux servers across production, staging and development, and digging through logs to find what is failing, often together with the developers.',
      details: [
        'Linux (mostly Debian) and services with systemd',
        'Docker and Docker Compose',
        'PostgreSQL: permissions, schemas, backups and restores',
        'Java/Tomcat, Nginx, Jenkins and GitLab',
        'HL7 integrations and Bash and Python scripts',
      ],
      tags: ['Linux', 'Docker', 'PostgreSQL', 'Jenkins', 'GitLab'],
    },
    {
      id: 'automation',
      title: 'Automation & monitoring',
      summary: 'PowerShell · PowerCLI · Terraform · Prometheus · Grafana',
      body: "Scripts so I don't repeat by hand what can be automated, and monitoring so I hear about problems before the users do.",
      details: [
        'PowerShell and VMware PowerCLI',
        'Terraform and vRealize Orchestrator',
        'Jenkins, GitLab CI/CD and GitHub Actions',
        'Prometheus, Grafana and Uptime Kuma in the homelab',
        'Automated backups and deployments with Restic and snapshots',
      ],
      tags: ['PowerShell', 'PowerCLI', 'Terraform', 'Prometheus', 'Grafana'],
    },
  ],

  // --- 02 Experience ---
  careerEyebrow: 'EXPERIENCE',
  careerTitle: "Where I've worked.",
  careerIntro:
    'At cloud.gal I owned projects from start to finish: from the first customer meeting to the follow-ups after go-live, with the design, build, migration and backups in between. Before that, at DXC, I ran VMware clusters for public-sector customers. Since 2026 I have been at Enxenio, focusing more on Linux and cloud.',
  careerCurrent: 'CURRENT',
  careerPast: 'PREVIOUS',
  jobs: [
    {
      period: 'MAR 2026 — PRESENT',
      company: 'Enxenio',
      role: 'Infrastructure & Systems Engineer',
      place: 'A Coruña · Hybrid',
      description:
        'The job here is mostly operations. I run Linux servers across production, staging and development, deploy to AWS and also work with Azure. I build and document VMs on Proxmox, set up Restic backups and snapshots, and automate deployments and routine tasks. Lots of log reading: Docker, systemd, Jenkins, GitLab, PostgreSQL. On one project I changed the configuration of a third-party VMware environment to fit what our application needed, acting as the go-between for the customer and our developers.',
    },
    {
      period: 'JUL 2024 — MAR 2026',
      company: 'cloud.gal',
      role: 'Virtualization & Backup Lead',
      place: 'Santiago de Compostela · Hybrid',
      description:
        "I ran projects from start to finish: customer kick-off, requirements, reviewing their existing setup, deployment, hand-holding, backups, tuning and follow-ups. I designed and built the new VMware 8 datacenter and migrated customers into it from the old one. I also handled ESXi upgrades and patching, migrations between vCenters and arrays, from Azure to VMware and onto Cloud Director, and the Veeam and DR projects.",
    },
    {
      period: 'FEB 2023 — JUN 2024',
      company: 'DXC Technology',
      role: 'VMware Systems Administrator',
      place: 'Santiago de Compostela · Remote',
      description:
        'I ran VMware clusters for AMTEGA and CIXTEC: installing and configuring new clusters on Lenovo, Dell and HP servers, lifecycle, patching and VM provisioning. I prepared compatibility matrices, ran and adapted PowerShell scripts, and used vRealize Orchestrator and Terraform. The main customer had about 600 servers and 3,000 virtual machines.',
    },
    {
      period: 'MAR 2021 — FEB 2023',
      company: 'Landra Sistemas',
      role: 'Level 2 Systems Technician · Roche',
      place: 'Narón',
      description:
        'Level 2 support in hospital environments on Windows and Linux. I reviewed logs, fixed incidents and integrated healthcare applications over HL7. I automated tasks with Python and worked daily with clinical staff and vendors.',
    },
    {
      period: 'JUL 2020 — MAR 2021',
      company: 'Evelb Técnicas',
      role: 'Support Lead',
      place: 'Milladoiro',
      description: 'Application deployments with Git and Jenkins, quality control and infrastructure operations on AWS and GCP.',
    },
    {
      period: 'AUG 2019 — JUL 2020',
      company: 'Plexus Tech',
      role: 'Project Coordinator',
      place: 'Santiago de Compostela',
      description:
        'I coordinated teams of 10 to 15 technicians and national and international support services: planning interventions, tracking deadlines and handling escalations.',
    },
    {
      period: 'JUL 2017 — JUN 2019',
      company: 'Fermax Electrónica',
      role: 'Technical Lead · Galicia',
      place: 'Galicia',
      description:
        'Technical lead for Galicia: customer support, on-site and remote commissioning, troubleshooting and training.',
    },
  ],

  // --- 03 Homelab ---
  labEyebrow: 'HOMELAB',
  labTitle: 'What I run at home.',
  labIntro:
    "Two mini PCs running Debian 13. One handles DNS and DHCP with AdGuard Home and monitors everything with Prometheus, Grafana and Uptime Kuma. The other runs the containers, including this website. I use it to try things I can't break at work. The site reaches the Internet through Cloudflare Tunnel, with no ports open on the router, and it redeploys itself every time I push a change to GitHub. You can see the live service status at mcouso.es/estado, and everything is backed up nightly to the other mini PC and to Backblaze B2, with a test restore every week.",
  networkCaption: 'LOGICAL DIAGRAM · HOME NETWORK',
  networkNote: "Simplified diagram. I've left out IP addresses and the details of the remote network.",
  networkLabels: {
    wan: 'INTERNET',
    gateway: 'MOVISTAR HGU',
    switch: 'GIGABYTE SWITCH',
    router: 'XIAOMI AX3600',
    host: 'HOMELAB-RED',
    app: 'HOMELAB-APPS',
    remote: 'REMOTE LAN',
    link: 'LAN / UPLINK',
    wifi: 'Wi-Fi · OpenWrt',
    dhcpOff: 'CENTRALIZED DHCP',
    macvlan: 'AdGuard Home · DNS + DHCP',
    monitoring: 'Prometheus · Grafana · exporters · Uptime Kuma',
    portfolio: 'Docker Compose · this site and other apps',
    tunnel: 'SITE-TO-SITE VPN',
    logical: 'LOGICAL TOPOLOGY',
  },

  // --- 04 Projects ---
  projectsEyebrow: 'PROJECTS',
  projectsTitle: 'Four projects, in detail.',
  projectsIntro:
    "These are real projects I worked on. I don't name customers or share internal data; everything else is told as it happened.",
  projects: [
    {
      label: 'DESIGN & BUILD · VMWARE 8',
      title: 'A new datacenter from scratch',
      body: 'We needed a new datacenter to move customers into from the old one, which ran vSphere 7. I designed and built it: five Dell hosts with 64-core AMD EPYC 9534 CPUs and 2.25 TB of RAM, Dell switches at 100 Gb and a Pure Storage array over NVMe over RoCE. A single cluster with its own vCenter.',
      approachLabel: 'WHAT I DID',
      approach:
        'All of the VMware side: compatibility matrix, remote-management firmware, BIOS, drivers, ESXi 8 image, vCenter and cluster. I also initialized the array, working with Pure, and presented the SAN to the hosts. I designed the network of each host: two 100 Gb ConnectX-6 cards giving 200 Gb for SAN plus 100 Gb for backup and 100 Gb for vMotion, crossed active/standby between cards so traffic never mixes. Customer egress runs at 2 × 10 Gb through Fortinet, all on separate VLANs with MTU 9000. The array has 400 Gb. Management and server consoles sit on their own VLAN, reachable only over VPN. Every customer has its own VDS, and the larger ones also get their own virtual Fortinet.',
      outcomeLabel: 'MIGRATION & RESULT',
      outcome:
        'I migrated whole customers, mostly with a full Veeam backup restored into a new VLAN, keeping their segmentation. I decided which customers moved and when. Some later moved on to Cloud Director. The new CPUs and memory improved performance, and backups and file restores got faster. Backups go to a second Pure array, and I added a Veeam proxy with a per-host affinity rule to spread backup and restore load.',
      footer: '5 DELL HOSTS · AMD EPYC · PURE STORAGE · NVMe over RoCE',
      tags: ['ESXi 8', 'vCenter', 'Dell', 'Pure Storage', 'Veeam', 'VDS'],
    },
    {
      label: 'MIGRATION · SAN → vSAN',
      title: 'SAN to vSAN without changing the network',
      body: 'A seven-host cluster on a Dell storage array with mixed versions: four hosts on vSphere 6.5 and three on 7.0. It had to move to vSAN on local disks without touching customer networks.',
      approachLabel: 'HOW WE DID IT',
      approach:
        "In phases. We added local disks to the hosts and started with three: we upgraded them, built vSAN on them and began moving VMs. The source cluster wasn't in vCenter, so live migrations were done with replication. Every host that freed up was upgraded and joined vSAN, until the new 7.0.3 cluster was complete. Same networks and same VLANs throughout.",
      outcomeLabel: 'THE TRICKY PART',
      outcome:
        'The Distributed Switches had been created on 6.5 and had to be upgraded to 7.0.3 along the way. Beyond that, the only downtime was short, when each replication was finalized.',
      footer: '7 HOSTS · PHASED · VDS 6.5 → 7.0.3',
      tags: ['vSphere', 'SAN', 'vSAN', 'Replication', 'VDS'],
    },
    {
      label: 'MIGRATIONS · MULTI-DATACENTER',
      title: 'Moving customers between platforms',
      body: 'Not everything was building from scratch. A big part of the job was moving things: whole customers between vCenters, data between two arrays and VMs from Azure to VMware.',
      approachLabel: 'WHAT I DID',
      approach:
        'Depending on the case I used Cross vCenter vMotion, replication or a full Veeam backup restored at the destination. I also built DR between two separate datacenters, with HA for the VMs and replication rules.',
      outcomeLabel: 'SCALE',
      outcome: 'In total, more than 100 customers onboarded, run or migrated, and around 1,000 virtual machines running 24/7.',
      footer: 'CROSS vCENTER · BETWEEN ARRAYS · AZURE → VMWARE',
      tags: ['Cross vCenter', 'Veeam', 'Azure', 'VMware'],
    },
    {
      label: 'DISASTER RECOVERY · VEEAM 13',
      title: 'Veeam DR, actually tested',
      body: 'Disaster recovery between a customer environment and ours: ten VMs, one of them about 3 TB, with RPO and RTO set for each one.',
      approachLabel: 'WHAT I DID',
      approach:
        "I deployed the Veeam 13 components and proxies, the certificates, and configured the backup jobs, the destination and the recovery VLAN. The customer's environment ran entirely on IP addresses, so I created a DNS zone with its records and moved it to names. In our vCenter the customer had a user that could only see its own folder: no hosts, no networks, nothing else.",
      outcomeLabel: 'THE TEST',
      outcome:
        'We brought the VMs up on our side and changed the local firewall rules to point to our infrastructure. The tests went well.',
      footer: 'VEEAM 13 · 10 VMS · RPO / RTO PER VM',
      tags: ['Veeam CDP', 'Proxies', 'DNS', 'Permissions', 'DR'],
      href: 'https://www.linkedin.com/posts/mateo-couso-hortas-71ba63164_veeam-cdp-disasterrecovery-activity-7330625843246903297-BRAf',
    },
  ],

  // --- Notes ---
  notesEyebrow: 'NOTES',
  notesTitle: 'Things I write down.',
  notesIntro: "Technical notes on things I've built, broken or learned. Written in Spanish.",
  notesAll: 'See all notes',

  // --- 05 Education ---
  trainingEyebrow: 'EDUCATION',
  trainingTitle: 'Education & languages.',
  education: [
    { title: 'Higher Vocational Diploma · Networked IT Systems Administration', institution: 'IES San Clemente', period: '2013 — 2015' },
    { title: 'Higher Vocational Diploma · Telecommunications and IT Systems', institution: 'CIFP Politécnico de Santiago', period: '2015 — 2017' },
  ],
  languages: [
    { title: 'Spanish', level: 'Native' },
    { title: 'Galician', level: 'Native' },
    { title: 'English', level: 'Intermediate · vendor meetings, troubleshooting calls and technical email' },
  ],

  // --- 06 Contact ---
  contactEyebrow: 'CONTACT',
  contactTitle: "Let's talk.",
  contactIntro:
    "If you need someone for VMware infrastructure, migrations or backup, or you'd like to chat about the site or the homelab, drop me a line.",
  emailCta: 'EMAIL ME',
  footer: 'Built, deployed and run by Mateo Couso on his homelab.',
};
