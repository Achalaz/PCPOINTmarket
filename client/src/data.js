// Image paths (from public folder)
export const IMAGES = {
  hero: '/hero_ghost_1787633688868.jpg',
  laptop: '/laptop_1787633700695.jpg',
  gpu: '/gpu_1787633713974.jpg',
  monitor: '/monitor_1787633728962.jpg',
  pc: '/pc_1787633742711.jpg',
  blueprint: '/blueprint_1787633759905.jpg',
};

export const CATEGORIES = [
  { name: 'LAPTOPS', count: '12 Models', img: IMAGES.laptop },
  { name: 'GPUs & POWER', count: '48 Components', img: IMAGES.gpu },
  { name: 'DISPLAYS', count: '15 Monitors', img: IMAGES.monitor },
  { name: 'PERIPHERALS', count: '30 Products', img: IMAGES.pc },
];

export const PRODUCTS = [
  {
    badge: 'ELITE SPEC',
    img: IMAGES.laptop,
    cat: 'GAMING LAPTOP',
    name: 'CRIMSON Vindicator 17 Pro',
    specs: 'i9-14900HX // RTX 4080 // 32GB RAM',
    price: '$2,499.00',
  },
  {
    badge: 'GOD MODE',
    img: IMAGES.gpu,
    cat: 'GRAPHICS CARD',
    name: 'ASUS ROG Strix GeForce RTX...',
    specs: '24GB GDDR6X // DLSS 3.0',
    price: '$1,999.00',
  },
  {
    badge: 'ZERO DELAY',
    img: IMAGES.monitor,
    cat: 'DISPLAY MONITOR',
    name: 'Predator 34-Inch Ultrawide...',
    specs: '240Hz // 0.03ms Response // OLED',
    price: '$849.00',
  },
  {
    badge: 'ULTRA TIER',
    img: IMAGES.pc,
    cat: 'PRE-BUILT PC',
    name: 'CRIMSON Core Custom Liquid...',
    specs: 'Dual loop // custom chassis // RTX 4090',
    price: '$3,899.00',
  },
];

export const NAV_LINKS = [
  { label: 'Laptops', href: '#' },
  { label: 'PC Component', href: '#' },
  { label: 'Monitors & Display', href: '#' },
  { label: 'Product', href: '#' },
  { label: 'Software', href: '#' },
  { label: 'Build PC', href: '#', highlight: true },
];
