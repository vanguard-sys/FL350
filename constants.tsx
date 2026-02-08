
import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 'fl350-stealth-hoodie',
    name: 'CLEARED FL350 HOODIE',
    category: 'Hoodie',
    price: 85.00,
    description: 'Ultra-soft heavyweight fleece with technical mission markers. Featuring CLB -> CRZ transition specs.',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800',
    specs: ['CRZ ALT: 35,000 FT', 'SPD: MACH 0.78', 'MODE: LNAV/VNAV'],
    features: ['Double-lined hood', 'Internal cockpit pocket', 'Reflective hem']
  },
  {
    id: 'v-speeds-tee',
    name: 'V-SPEEDS TECH TEE',
    category: 'T-Shirt',
    price: 45.00,
    description: 'V1, VR, V2 essentials. The fundamental parameters of every takeoff, printed on premium combed cotton.',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800',
    specs: ['V1: GO/NO-GO', 'VR: ROTATE', 'V2: SAFETY'],
    features: ['100% organic cotton', 'Reinforced neck tape', 'Drop-shoulder fit']
  },
  {
    id: 'mach-cruise-hoodie',
    name: 'MACH 0.82 CRUISE HOODIE',
    category: 'Hoodie',
    price: 95.00,
    description: 'Engineered for high-speed transit. Minimalist front with high-altitude aerodynamics on the rear.',
    image: 'https://images.unsplash.com/photo-1530008051216-7517932c028c?auto=format&fit=crop&q=80&w=800',
    specs: ['MNO: 0.82', 'MMO: 0.85', 'TAT: -45C'],
    features: ['Wind-resistant weave', 'Thumbhole cuffs', 'GPS coordinates on sleeve']
  },
  {
    id: 'altitude-tee',
    name: 'ALTITUDE OVER ATTITUDE',
    category: 'T-Shirt',
    price: 45.00,
    description: 'Minimalist bone-white tee featuring the core pilot mantra. Designed for the long haul.',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800',
    specs: ['MATERIAL: 240GSM', 'FIT: RELAXED', 'ORIGIN: FL350'],
    features: ['High-density print', 'Breathable weave', 'Flight-ready']
  }
];

export const FAQ_ITEMS = [
  {
    q: "How fast is delivery (Dispatch)?",
    a: "Standard cargo dispatch takes 3-5 flight days. Express 'Afterburner' shipping is available for next-day arrival at your terminal."
  },
  {
    q: "Do you ship to international airspace?",
    a: "Yes. FL350 delivers to most global hubs. Customs and duties are calculated at the final approach (checkout)."
  },
  {
    q: "What is the 'Pilot Fit'?",
    a: "Our gear is designed with a slightly oversized, technical fit. If you prefer a tight 'G-Force' fit, we recommend sizing down."
  }
];

export const POLICY_CONTENT = {
  returns: "Cargo may be returned within 30 days of landing if the security tags remain unbroken. Any items showing signs of 'flight wear' (stains, washing) will be denied reclamation clearance.",
  privacy: "Your mission data is encrypted using AES-256 standards. We do not sell pilot telemetry to third-party advertisers. Your location data is used strictly for cargo delivery optimization."
};
