
import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, Menu, X, Plane, ArrowRight, ShieldCheck, MapPin, 
  Loader2, Radio, ChevronDown, Activity, User, LogOut, Package, Trash2, 
  AlertTriangle, Mail, HelpCircle, RefreshCcw, UserPlus, ChevronRight,
  ClipboardCheck, Lock, LogIn, CreditCard, Scan, Info, CheckCircle2, XCircle
} from 'lucide-react';
import { 
  ClerkProvider, 
  SignIn, 
  SignUp, 
  UserButton, 
  UserProfile,
  useUser, 
  SignedIn, 
  SignedOut 
} from '@clerk/clerk-react';
import { PRODUCTS as STATIC_PRODUCTS, FAQ_ITEMS, POLICY_CONTENT } from './constants';
import { Product, CartItem, Size } from './types';
import { sanityClient, PRODUCTS_QUERY, isSanityConfigured } from './lib/sanity';

// --- Safe Env Access ---
const getEnv = (key: string, fallback: string) => {
  if (typeof process !== 'undefined' && process?.env?.[key]) return process.env[key];
  return fallback;
};

const CLERK_PUBLISHABLE_KEY = getEnv('VITE_CLERK_PUBLISHABLE_KEY', getEnv('CLERK_PUBLISHABLE_KEY', 'pk_test_Y2xlcmsuZmwuMzUwLmF2aWF0aW9uLmNvbSQ'));

const CLERK_HUD_THEME = {
  elements: {
    card: "bg-slate-950 border border-sky-500/30 rounded-none shadow-[0_0_30px_rgba(14,165,233,0.1)]",
    headerTitle: "text-white uppercase font-black italic tracking-tighter",
    headerSubtitle: "text-slate-500 mono text-[10px] uppercase tracking-widest",
    formFieldLabel: "text-sky-400 mono text-[10px] uppercase tracking-widest",
    formFieldInput: "bg-black/40 border-white/10 text-white rounded-none focus:border-sky-500",
    formButtonPrimary: "bg-sky-500 hover:bg-white hover:text-black rounded-none transition-all uppercase mono text-[10px] font-bold tracking-widest py-3",
    footerActionLink: "text-sky-400 hover:text-white transition-colors",
    identityPreviewText: "text-white",
    userButtonAvatarBox: "rounded-none border border-sky-500",
  }
};

type View = 'home' | 'shirts' | 'hoodies' | 'all' | 'faq' | 'returns' | 'privacy' | 'contact' | 'login' | 'register' | 'account';

const HUDCorner = ({ position, color = "border-sky-500/40" }: { position: 'tl' | 'tr' | 'bl' | 'br', color?: string }) => {
  const styles = {
    tl: "top-0 left-0 border-t-2 border-l-2",
    tr: "top-0 right-0 border-t-2 border-r-2",
    bl: "bottom-0 left-0 border-b-2 border-l-2",
    br: "bottom-0 right-0 border-b-2 border-r-2"
  };
  return <div className={`absolute w-4 h-4 ${color} ${styles[position]} pointer-events-none`} />;
};

const AuthSection = ({ setView, currentView, isMobile = false }: { setView: (v: View) => void, currentView: View, isMobile?: boolean }) => {
  // Resilience: Always show button unless confirmed signed in
  let authData = { isLoaded: false, isSignedIn: false };
  try {
    authData = useUser();
  } catch (e) {
    authData = { isLoaded: true, isSignedIn: false };
  }
  
  if (authData.isLoaded && authData.isSignedIn) {
    return (
      <div className={`flex items-center ${isMobile ? 'justify-between w-full' : 'gap-4'}`}>
        <button 
          onClick={() => setView('account')} 
          className={`${isMobile ? 'block' : 'hidden md:block'} text-[10px] mono uppercase tracking-widest font-bold ${currentView === 'account' ? 'text-sky-400' : 'text-slate-400 hover:text-white'}`}
        >
          Pilot Profile
        </button>
        <UserButton appearance={CLERK_HUD_THEME} />
      </div>
    );
  }

  // Fallback to static "Pilot Login" even if Clerk is loading or failed
  return (
    <button 
      onClick={() => setView('login')} 
      className="px-4 py-2 border border-sky-400 text-sky-400 hover:bg-sky-400 hover:text-white transition-all text-[10px] mono font-bold uppercase tracking-[0.2em] whitespace-nowrap"
    >
      Pilot Login
    </button>
  );
};

const Header: React.FC<{ 
  cartCount: number; 
  onCartOpen: () => void; 
  currentView: View; 
  setView: (v: View) => void; 
}> = ({ cartCount, onCartOpen, currentView, setView }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigate = (v: View) => {
    setView(v);
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-black/90 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 md:h-24 flex items-center justify-between">
        <button onClick={() => navigate('home')} className="flex flex-col group relative shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl md:text-2xl font-black italic tracking-tighter text-white">FL350</span>
            <Plane className={`w-5 h-5 text-sky-400 transition-all duration-700 ${currentView === 'home' ? '-rotate-45 scale-110' : 'rotate-0'}`} />
          </div>
          <span className="text-[10px] font-bold text-sky-400 tracking-[0.1em] uppercase hidden xs:block">Pilot Gear Hub</span>
        </button>

        <nav className="hidden md:flex items-center gap-10">
          <button onClick={() => navigate('home')} className={`text-[11px] mono uppercase tracking-[0.2em] transition-all pb-1 ${currentView === 'home' ? 'text-sky-400 font-bold border-b-2 border-sky-400' : 'text-slate-400 hover:text-white'}`}>Flight Deck</button>
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`flex items-center gap-2 text-[11px] mono uppercase tracking-[0.2em] transition-all pb-1 italic font-black ${['all', 'shirts', 'hoodies'].includes(currentView) ? 'text-sky-400 border-b-2 border-sky-400' : 'text-slate-400 hover:text-white'}`}>
              HANGAR <ChevronDown className="w-3 h-3" />
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-4 w-56 bg-slate-950 border border-white/10 shadow-2xl py-3 backdrop-blur-xl">
                {[{ label: 'Full Manifest', val: 'all' }, { label: 'Flight Shirts', val: 'shirts' }, { label: 'Altitude Hoodies', val: 'hoodies' }].map((item) => (
                  <button key={item.val} onClick={() => navigate(item.val as View)} className="w-full text-left px-6 py-3 text-[10px] mono uppercase tracking-widest text-slate-400 hover:text-white hover:bg-sky-500/10">{item.label}</button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => navigate('faq')} className={`text-[11px] mono uppercase tracking-[0.2em] transition-all pb-1 ${currentView === 'faq' ? 'text-sky-400 font-bold border-b-2 border-sky-400' : 'text-slate-400 hover:text-white'}`}>Checklist</button>
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-sky-400 hover:text-white transition-colors border border-sky-400/20"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="flex items-center border-2 border-dashed border-sky-400/30 p-2 md:p-3 gap-2 md:gap-4 lg:gap-6 min-w-max">
            <div className="hidden sm:block">
              <AuthSection setView={navigate} currentView={currentView} />
            </div>
            <div className="hidden sm:block h-6 w-px bg-white/10" />
            <button onClick={onCartOpen} className="relative group p-2">
              <ShoppingCart className="w-6 h-6 text-white group-hover:text-sky-400 transition-colors" />
              {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-sky-500 text-white text-[10px] font-bold min-w-[16px] h-[16px] flex items-center justify-center rounded-full">{cartCount}</span>}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-black/95 backdrop-blur-2xl border-b-2 border-dashed border-sky-400/30 py-8 px-6 z-[90] animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col gap-8">
            <div className="space-y-4">
              <span className="text-[9px] mono text-slate-500 uppercase tracking-[0.4em] block">Primary Vectors</span>
              <button onClick={() => navigate('home')} className={`w-full text-left py-4 px-6 border border-white/5 text-sm mono uppercase tracking-widest ${currentView === 'home' ? 'bg-sky-500/10 text-sky-400 border-sky-400/30' : 'text-white'}`}>Flight Deck</button>
              <button onClick={() => navigate('faq')} className={`w-full text-left py-4 px-6 border border-white/5 text-sm mono uppercase tracking-widest ${currentView === 'faq' ? 'bg-sky-500/10 text-sky-400 border-sky-400/30' : 'text-white'}`}>Checklist</button>
            </div>
            <div className="space-y-4">
              <span className="text-[9px] mono text-slate-500 uppercase tracking-[0.4em] block">Sector Access</span>
              <div className="grid grid-cols-1 gap-2">
                {[{ label: 'Full Manifest', val: 'all' }, { label: 'Flight Shirts', val: 'shirts' }, { label: 'Altitude Hoodies', val: 'hoodies' }].map((item) => (
                  <button key={item.val} onClick={() => navigate(item.val as View)} className={`text-left py-4 px-6 border border-white/5 text-[11px] mono uppercase tracking-widest ${currentView === item.val ? 'bg-sky-500/10 text-sky-400 border-sky-400/30' : 'text-slate-400'}`}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-6 border-t border-white/10">
              <AuthSection setView={navigate} currentView={currentView} isMobile={true} />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

// --- Product Modal ---
const ProductDetail: React.FC<{ product: Product; isOpen: boolean; onClose: () => void; onAdd: (p: Product, s: Size) => void }> = ({ product, isOpen, onClose, onAdd }) => {
  const [selectedSize, setSelectedSize] = useState<Size>('M');
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-[#0a0a0a] border border-white/10 flex flex-col md:flex-row max-h-[90vh] overflow-y-auto custom-scrollbar">
        <HUDCorner position="tl" color="border-sky-500" />
        <HUDCorner position="br" color="border-sky-500" />
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white z-10"><X className="w-8 h-8" /></button>
        <div className="md:w-1/2 aspect-[4/5] relative">
          <img src={product.image} className="w-full h-full object-cover grayscale brightness-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          <div className="absolute bottom-10 left-10">
            <Scan className="text-sky-500 w-12 h-12 mb-4 animate-pulse" />
            <h4 className="mono text-sky-500 text-[10px] uppercase tracking-[0.8em]">Object Identified</h4>
          </div>
        </div>
        <div className="md:w-1/2 p-10 md:p-16 flex flex-col gap-10">
          <div>
            <span className="mono text-sky-400 text-[10px] uppercase tracking-[0.5em] mb-4 block">{product.category} // FL350</span>
            <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase mb-6">{product.name}</h2>
            <p className="text-slate-400 mono text-sm leading-relaxed max-w-md">{product.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h5 className="mono text-[10px] text-slate-500 uppercase tracking-widest mb-4">Specifications</h5>
              <ul className="space-y-2">
                {product.specs.map(s => <li key={s} className="text-white mono text-[11px] flex items-center gap-2"><div className="w-1 h-1 bg-sky-500" /> {s}</li>)}
              </ul>
            </div>
            <div>
              <h5 className="mono text-[10px] text-slate-500 uppercase tracking-widest mb-4">Features</h5>
              <ul className="space-y-2">
                {product.features.map(f => <li key={f} className="text-white mono text-[11px] flex items-center gap-2"><div className="w-1 h-1 bg-white/20" /> {f}</li>)}
              </ul>
            </div>
          </div>
          <div>
            <h5 className="mono text-[10px] text-slate-500 uppercase tracking-widest mb-4">Select Scale</h5>
            <div className="flex gap-2">
              {(['S', 'M', 'L', 'XL', 'XXL'] as Size[]).map(s => (
                <button key={s} onClick={() => setSelectedSize(s)} className={`w-12 h-12 flex items-center justify-center border transition-all mono text-xs ${selectedSize === s ? 'bg-sky-500 border-sky-500 text-black font-bold' : 'border-white/10 text-slate-500 hover:border-white/40'}`}>{s}</button>
              ))}
            </div>
          </div>
          <button onClick={() => { onAdd(product, selectedSize); onClose(); }} className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.4em] text-xs hover:bg-sky-500 hover:text-white transition-all flex items-center justify-center gap-4">
            <Package className="w-4 h-4" /> Initialize Hangar Storage // ${product.price}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Views ---
const HomeView: React.FC<{ onExplore: () => void }> = ({ onExplore }) => (
  <section className="relative min-h-screen pt-40 pb-20 flex flex-col items-center justify-center blueprint-grid overflow-hidden">
    <div className="container mx-auto px-4 z-20 flex flex-col items-center gap-12 text-center max-w-7xl">
      
      {/* HUD Header Status */}
      <div className="inline-flex items-center gap-4 md:gap-10 px-6 md:px-12 py-4 md:py-6 border border-sky-500/20 bg-sky-500/5 text-sky-400 text-[9px] md:text-[11px] mono uppercase tracking-[0.3em] md:tracking-[0.8em] backdrop-blur-sm">
        <Radio className="w-3 h-3 md:w-4 md:h-4 animate-pulse" /> HUD STATUS: NOMINAL | SECTOR: FL350
      </div>

      {/* Hero Dashed HUD Box */}
      <div className="border-2 border-dashed border-sky-500/20 p-8 md:p-24 flex flex-col items-center gap-6 md:gap-12 w-full max-w-5xl relative">
        <HUDCorner position="tl" color="border-sky-500/30" />
        <HUDCorner position="br" color="border-sky-500/30" />
        
        <div className="flex flex-col items-center select-none w-full overflow-visible">
          {/* Negative margin offset matches tracking precisely for mathematical centering */}
          <h1 className="text-[12vw] md:text-[8rem] font-black text-white tracking-[0.6em] md:tracking-[1.2em] uppercase leading-none -mr-[0.6em] md:-mr-[1.2em] transition-all duration-500 whitespace-nowrap">
            CRUISE
          </h1>
          <h1 className="text-[12vw] md:text-[8rem] font-black text-sky-400 tracking-[0.6em] md:tracking-[1.2em] uppercase leading-none -mr-[0.6em] md:-mr-[1.2em] transition-all duration-500 whitespace-nowrap">
            ABOVE
          </h1>
        </div>
        
        <div className="w-3 h-3 md:w-5 md:h-5 bg-sky-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(14,165,233,0.6)]" />
      </div>

      <div className="flex flex-col items-center gap-10">
        <p className="max-w-xl text-slate-500 mono text-[9px] md:text-[11px] uppercase tracking-[0.2em] md:tracking-[0.5em] leading-relaxed">
          AVIATION TECHNICAL APPAREL FOR HIGH-ALTITUDE PURSUIT.
        </p>
        <button onClick={onExplore} className="group relative h-20 px-12 md:px-16 bg-black border border-white/10 hover:border-sky-500/50 hover:bg-sky-500/5 transition-all flex items-center justify-center gap-6">
          <span className="mono text-[9px] md:text-[11px] uppercase tracking-[0.6em] font-bold text-white">Initialize Fleet Explore</span>
          <ArrowRight className="w-5 h-5 text-sky-500 transition-transform group-hover:translate-x-2" />
          <HUDCorner position="tl" />
          <HUDCorner position="br" />
        </button>
      </div>
    </div>
    
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] border border-sky-500/5 rounded-full pointer-events-none animate-ping duration-[8000ms]" />
  </section>
);

const InventoryView: React.FC<{ title: string; products: Product[]; onAdd: (p: Product, s: Size) => void; onView: (p: Product) => void }> = ({ title, products, onAdd, onView }) => (
  <section className="pt-48 pb-40 container mx-auto px-4 md:px-12">
    <div className="mb-20">
      <div className="flex items-center gap-3 mb-4"><Package className="text-sky-500 w-4 h-4" /><span className="mono text-[10px] text-sky-500 uppercase tracking-[0.8em]">Manifest Alpha</span></div>
      <h2 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-none">{title}</h2>
    </div>
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
      {products.map(p => (
        <div key={p.id} className="group bg-slate-900/40 border border-white/5 p-2 transition-all hover:border-sky-500/30">
          <div className="aspect-[4/5] bg-black overflow-hidden relative cursor-pointer" onClick={() => onView(p)}>
            <img src={p.image} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
            <div className="absolute inset-0 bg-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-4 left-4 p-2 bg-black/80 backdrop-blur-sm border border-white/10 opacity-0 group-hover:opacity-100 transition-all">
              <Info className="w-4 h-4 text-sky-400" />
            </div>
            <button onClick={(e) => { e.stopPropagation(); onAdd(p, 'M'); }} className="absolute bottom-4 left-4 right-4 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest translate-y-12 group-hover:translate-y-0 transition-transform duration-500">Fast Manifest</button>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-white uppercase italic text-lg tracking-tight leading-none">{p.name}</h3>
              <span className="text-sky-400 mono font-bold">${p.price}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

// --- Root Component ---
function AppContent() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [products, setProducts] = useState<Product[]>(STATIC_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    async function fetchProducts() {
      if (!isSanityConfigured) { setProducts(STATIC_PRODUCTS); setLoading(false); return; }
      try {
        const data = await sanityClient.fetch(PRODUCTS_QUERY);
        if (data && data.length > 0) setProducts(data);
      } catch (err) { setProducts(STATIC_PRODUCTS); } finally { setLoading(false); }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success')) {
      setCart([]);
      alert("MISSION ACCOMPLISHED: Cargo clearance granted.");
    }
    if (params.get('canceled')) {
      alert("MISSION ABORTED: Transaction cancelled.");
    }
  }, []);

  const addToCart = (product: Product, size: Size) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.size === size);
      if (existing) return prev.map(item => item.id === product.id && item.size === size ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1, size }];
    });
    setIsCartOpen(true);
  };

  const handleCheckout = async () => {
    if (!isSignedIn) { setCurrentView('login'); setIsCartOpen(false); return; }
    setCheckoutLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, userId: user.id }),
      });
      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      alert("CHECKOUT ERROR: Communication with Stripe Terminal lost.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] selection:bg-sky-500/30 custom-scrollbar overflow-x-hidden">
      <Header cartCount={cart.reduce((s, i) => s + i.quantity, 0)} onCartOpen={() => setIsCartOpen(true)} currentView={currentView} setView={setCurrentView} />
      
      <main>
        {loading ? (
          <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-8">
            <Loader2 className="w-12 h-12 text-sky-400 animate-spin" />
            <span className="mono text-[10px] text-sky-400 uppercase tracking-widest">Downlink...</span>
          </div>
        ) : (
          <>
            {currentView === 'home' && <HomeView onExplore={() => setCurrentView('all')} />}
            {['all', 'shirts', 'hoodies'].includes(currentView) && (
              <InventoryView 
                title={currentView === 'all' ? "Full Manifest" : currentView === 'shirts' ? "Technical Tees" : "Altitude Hoodies"} 
                products={currentView === 'all' ? products : products.filter(p => p.category === (currentView === 'shirts' ? 'T-Shirt' : 'Hoodie'))} 
                onAdd={addToCart} 
                onView={setSelectedProduct}
              />
            )}
            {currentView === 'account' && (
              <section className="pt-48 pb-40 container mx-auto px-4 md:px-12 min-h-screen">
                <div className="max-w-5xl mx-auto">
                  <div className="mb-16"><Activity className="text-sky-500 w-5 h-5 mb-4" /><h2 className="text-5xl font-black text-white italic uppercase">Pilot Profile</h2></div>
                  <div className="bg-slate-950 border border-sky-500/20 p-4 md:p-10 relative">
                    <HUDCorner position="tl" /><HUDCorner position="br" />
                    <UserProfile routing="hash" appearance={CLERK_HUD_THEME} />
                  </div>
                </div>
              </section>
            )}
            {currentView === 'login' && (
              <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center bg-black px-4 relative">
                <button onClick={() => setCurrentView('home')} className="absolute top-28 right-8 z-10 p-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-none"><X className="w-6 h-6" /></button>
                <div className="max-w-md w-full relative p-8 border-2 border-dashed border-sky-500/20">
                  <HUDCorner position="tl" />
                  <div className="mb-8 text-center">
                    <Radio className="w-6 h-6 text-sky-400 mx-auto mb-4 animate-pulse" />
                    <h3 className="text-white font-black italic uppercase tracking-widest">Security Handshake</h3>
                    <p className="text-slate-500 mono text-[9px] uppercase tracking-widest mt-2">Connecting to FL350 Auth Hub...</p>
                  </div>
                  <div className="min-h-[400px] flex items-center justify-center">
                    <SignIn routing="hash" appearance={CLERK_HUD_THEME} />
                  </div>
                </div>
              </div>
            )}
            {currentView === 'faq' && (
              <div className="pt-48 container mx-auto px-4 max-w-4xl space-y-8 pb-40">
                <h2 className="text-5xl font-black text-white italic uppercase mb-12">Checklist</h2>
                {FAQ_ITEMS.map((item, i) => (
                  <div key={i} className="p-8 bg-slate-900/50 border border-white/5 relative">
                    <HUDCorner position="br" /><h4 className="text-white font-bold uppercase mb-4 flex items-center gap-3"><ShieldCheck className="w-4 h-4 text-sky-400" />{item.q}</h4>
                    <p className="text-slate-400 text-sm mono leading-loose pl-7">{item.a}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <ProductDetail product={selectedProduct!} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={addToCart} />

      <div className={`fixed inset-0 bg-black/80 backdrop-blur-md z-[200] transition-opacity ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsCartOpen(false)} />
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-black z-[201] transition-transform duration-500 border-l border-white/5 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col p-10">
          <div className="flex justify-between items-center mb-12 border-b border-white/5 pb-6">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Cargo Manifest</h2>
            <button onClick={() => setIsCartOpen(false)}><X className="w-6 h-6 text-slate-500" /></button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-2">
            {cart.length === 0 ? <div className="h-full flex flex-col items-center justify-center opacity-50"><Package className="w-12 h-12 mb-4" /><span className="mono text-[10px] uppercase">Manifest Empty</span></div> : (
              cart.map(item => (
                <div key={`${item.id}-${item.size}`} className="flex gap-4 p-4 bg-white/5 border border-white/5 group">
                  <div className="w-16 h-20 bg-slate-900 shrink-0"><img src={item.image} className="w-full h-full object-cover opacity-60" /></div>
                  <div className="flex-1">
                    <h4 className="text-[10px] font-bold text-white uppercase italic">{item.name}</h4>
                    <span className="text-[8px] mono text-slate-500 block mt-1">SCALE: {item.size} | QTY: {item.quantity}</span>
                    <div className="flex justify-between items-end mt-4">
                      <span className="text-sky-400 mono text-sm font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                      <button onClick={() => setCart(c => c.filter(i => !(i.id === item.id && i.size === item.size)))} className="text-[8px] mono text-red-500 uppercase hover:text-white transition-colors">Eject</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="pt-10 border-t border-white/5 mt-6">
            <div className="flex justify-between items-center mb-8">
              <span className="mono text-[10px] text-slate-500 uppercase">Subtotal Flight Cost</span>
              <span className="text-xl font-bold text-white mono">${cart.reduce((s, i) => s + (i.price * i.quantity), 0).toFixed(2)}</span>
            </div>
            <button 
              disabled={cart.length === 0 || checkoutLoading} 
              onClick={handleCheckout}
              className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.4em] text-[10px] hover:bg-sky-500 hover:text-white transition-all disabled:opacity-20 flex items-center justify-center gap-4"
            >
              {checkoutLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
              {isSignedIn ? 'Request Clearance' : 'Login to Authorize'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <AppContent />
    </ClerkProvider>
  );
}
