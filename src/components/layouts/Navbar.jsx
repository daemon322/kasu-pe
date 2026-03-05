import { useState, useEffect, useContext, createContext, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

// ═══════════════════════════════════════════════════════════════════════════════
// CART CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════
export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };
  const removeOne  = (id) => setCart(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i).filter(i => i.qty > 0));
  const clearCart  = () => setCart([]);
  const cartCount  = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal  = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount   = cartTotal >= 200 ? 0.25 : cartTotal >= 100 ? 0.15 : cartTotal >= 50 ? 0.08 : 0;
  const finalPrice = cartTotal * (1 - discount);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeOne, clearCart, cartCount, cartTotal, discount, finalPrice }}>
      {children}
    </CartContext.Provider>
  );
}
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe estar dentro de <CartProvider>");
  return ctx;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEARCH CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════
export const SearchContext = createContext(null);

export function SearchProvider({ children, products }) {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState([]);
  const [isOpen,  setIsOpen]  = useState(false);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) { setResults([]); setIsOpen(false); return; }
    const found = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tags?.some(t => t.toLowerCase().includes(q))
    );
    setResults(found);
    setIsOpen(found.length > 0);
  }, [query, products]);

  const clear = () => { setQuery(""); setResults([]); setIsOpen(false); };

  return (
    <SearchContext.Provider value={{ query, setQuery, results, isOpen, setIsOpen, clear }}>
      {children}
    </SearchContext.Provider>
  );
}
export function useSearch() { return useContext(SearchContext); }

// ═══════════════════════════════════════════════════════════════════════════════
// HIGHLIGHT
// ═══════════════════════════════════════════════════════════════════════════════
function Highlight({ text, query }) {
  if (!query) return <span>{text}</span>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i} className="bg-amber-400 text-black px-0.5 rounded font-black not-italic">{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEARCH BOX  (usado en navbar desktop y menú drawer móvil)
// ═══════════════════════════════════════════════════════════════════════════════
export function SearchBox({ onClose, autoFocus = false }) {
  const { query, setQuery, results, isOpen, setIsOpen, clear } = useSearch();
  const navigate     = useNavigate();
  const containerRef = useRef(null);
  const inputRef     = useRef(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (autoFocus) setTimeout(() => inputRef.current?.focus(), 50);
  }, [autoFocus]);

  useEffect(() => {
    const fn = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const go = (url) => { clear(); onClose?.(); navigate(url); };

  const handleSelect = (product) => go(`/productos?q=${encodeURIComponent(product.name)}`);
  const handleViewAll = () => { if (query.trim()) go(`/productos?q=${encodeURIComponent(query.trim())}`); };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input */}
      <div className={`flex items-center gap-2 bg-slate-800 border rounded-xl px-3 py-2.5 transition-all duration-200
        ${focused ? "border-amber-500 shadow-md shadow-amber-500/20" : "border-slate-700 hover:border-slate-600"}`}>
        <svg className={`w-4 h-4 flex-shrink-0 transition-colors ${focused ? "text-amber-400" : "text-slate-500"}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => { setFocused(true); if (results.length > 0) setIsOpen(true); }}
          onBlur={() => setFocused(false)}
          onKeyDown={e => e.key === "Enter" && handleViewAll()}
          placeholder="Buscar productos..."
          className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none min-w-0"
        />
        {query
          ? <button onClick={clear} className="text-slate-500 hover:text-white transition-colors text-xl leading-none flex-shrink-0">×</button>
          : <kbd className="hidden sm:block text-slate-600 text-[10px] border border-slate-700 px-1.5 py-0.5 rounded font-mono flex-shrink-0">Enter</kbd>
        }
      </div>

      {/* Dropdown */}
      {isOpen && query && (
        <div className="absolute top-full mt-2 left-0 right-0 min-w-[300px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/70 overflow-hidden z-[100]"
          style={{ animation: "dropIn .15s ease" }}>

          {results.length > 0 ? (
            <>
              {/* Productos */}
              <div className="p-2">
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest px-2 py-1.5">Productos</p>
                {results.slice(0, 4).map(product => (
                  <button key={product.id} onClick={() => handleSelect(product)}
                    className="w-full flex items-center gap-3 px-2 py-2.5 hover:bg-slate-800 rounded-xl transition-colors text-left group">
                    <span className="text-xl w-7 text-center flex-shrink-0">{product.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate leading-tight">
                        <Highlight text={product.name} query={query} />
                      </p>
                      <p className="text-xs text-slate-500">{product.category}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-amber-400 font-black text-sm">S/.{product.price}</p>
                      <p className="text-green-400 text-xs">-{Math.round((1 - product.price / product.oldPrice) * 100)}%</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Categorías coincidentes */}
              {[...new Set(results.map(r => r.category))].filter(cat =>
                cat.toLowerCase().includes(query.toLowerCase())
              ).length > 0 && (
                <div className="px-2 pb-2 border-t border-slate-800 pt-2">
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest px-2 py-1">Categoría</p>
                  {[...new Set(results.map(r => r.category))]
                    .filter(cat => cat.toLowerCase().includes(query.toLowerCase()))
                    .slice(0, 2)
                    .map(cat => (
                      <button key={cat}
                        onClick={() => go(`/productos?categoria=${encodeURIComponent(cat)}`)}
                        className="w-full flex items-center gap-3 px-2 py-2 hover:bg-slate-800 rounded-xl transition-colors text-left">
                        <span className="text-base w-7 text-center">📦</span>
                        <span className="text-sm font-bold text-slate-300">
                          Ver: <span className="text-amber-400">{cat}</span>
                          <span className="text-slate-500 font-normal ml-1">
                            ({results.filter(r => r.category === cat).length} productos)
                          </span>
                        </span>
                      </button>
                    ))}
                </div>
              )}

              {/* Ver todos */}
              <button onClick={handleViewAll}
                className="w-full flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-800/50 hover:bg-slate-800 transition-colors">
                <span className="text-sm text-slate-300">
                  Ver todos para <span className="text-amber-400 font-bold">"{query}"</span>
                </span>
                <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-1 rounded-full font-bold">
                  {results.length} →
                </span>
              </button>
            </>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-2xl mb-1">🔍</p>
              <p className="text-sm font-bold text-white">Sin resultados para "{query}"</p>
              <button onClick={() => go("/productos")}
                className="mt-2 text-xs text-amber-400 hover:text-amber-300 font-bold underline transition-colors">
                Ver todos los productos →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CART DRAWER
// ═══════════════════════════════════════════════════════════════════════════════
function CartDrawer({ open, onClose }) {
  const { cart, addToCart, removeOne, clearCart, cartCount, cartTotal, discount, finalPrice } = useCart();

  const toNext   = cartTotal < 50 ? 50 - cartTotal : cartTotal < 100 ? 100 - cartTotal : cartTotal < 200 ? 200 - cartTotal : 0;
  const nextPct  = cartTotal < 50 ? 8 : cartTotal < 100 ? 15 : 25;
  const progress = toNext > 0 ? Math.min(100, (cartTotal / (cartTotal + toNext)) * 100) : 100;
  const waMsg    = encodeURIComponent(
    "Hola! Quiero comprar:\n" +
    cart.map(i => `• ${i.name} x${i.qty} = S/.${(i.price * i.qty).toFixed(2)}`).join("\n") +
    `\n\nTotal: S/.${finalPrice.toFixed(2)}` +
    (discount > 0 ? ` (con ${(discount*100).toFixed(0)}% dto)` : "")
  );

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else      document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 w-full max-w-[360px] h-full flex flex-col shadow-2xl border-l border-slate-800"
        style={{ animation: "slideFromRight .25s ease", fontFamily: "'Nunito',sans-serif" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <h2 className="font-black text-white text-lg">Carrito</h2>
            {cartCount > 0 && (
              <span className="bg-amber-500 text-black text-xs font-black w-6 h-6 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <button onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-xl">✕</button>
        </div>

        {/* Barra de progreso descuento */}
        {toNext > 0 && (
          <div className="mx-4 mt-3 bg-slate-800 rounded-xl p-3 text-xs border border-slate-700 flex-shrink-0">
            <div className="flex justify-between text-slate-300 mb-2 font-semibold">
              <span>Agrega <span className="text-amber-400 font-black">S/.{toNext.toFixed(2)}</span> más</span>
              <span className="text-green-400 font-black">{nextPct}% OFF</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5">
              <div className="bg-gradient-to-r from-amber-500 to-orange-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center pb-10">
              <div className="text-7xl mb-4 opacity-40">🛒</div>
              <p className="font-black text-white text-lg">Tu carrito está vacío</p>
              <p className="text-slate-500 text-sm mt-1">Agrega productos para comenzar</p>
            </div>
          ) : cart.map(item => (
            <div key={item.id} className="flex items-center gap-3 bg-slate-800 rounded-2xl p-3 border border-slate-700/50">
              <span className="text-3xl flex-shrink-0">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-white truncate leading-tight">{item.name}</p>
                <p className="text-amber-400 font-black text-sm">S/.{(item.price * item.qty).toFixed(2)}</p>
                <p className="text-slate-500 text-xs">S/.{item.price} c/u</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button onClick={() => removeOne(item.id)}
                  className="w-7 h-7 bg-slate-700 hover:bg-red-500/30 text-white rounded-full text-sm font-black transition-all active:scale-90">−</button>
                <span className="font-black text-white w-5 text-center text-sm">{item.qty}</span>
                <button onClick={() => addToCart(item)}
                  className="w-7 h-7 bg-amber-500 hover:bg-amber-400 text-black rounded-full text-sm font-black transition-all active:scale-90">+</button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-slate-800 space-y-3 flex-shrink-0 bg-slate-900">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="text-white font-semibold">S/.{cartTotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-400 font-bold">
                  <span>🎉 Descuento ({(discount * 100).toFixed(0)}%)</span>
                  <span>−S/.{(cartTotal * discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-base pt-2 border-t border-slate-800">
                <span className="text-white">Total</span>
                <span className="text-amber-400 text-xl">S/.{finalPrice.toFixed(2)}</span>
              </div>
            </div>
            <a href={`https://wa.me/51999999999?text=${waMsg}`} target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-400 active:bg-green-600 text-white font-black py-4 rounded-xl transition-all text-sm shadow-lg shadow-green-500/20">
              💬 Finalizar por WhatsApp
            </a>
            <button onClick={() => { if (window.confirm("¿Vaciar el carrito?")) clearCart(); }}
              className="w-full text-slate-600 hover:text-red-400 text-xs py-1 transition-colors font-semibold">
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NAV LINKS data
// ═══════════════════════════════════════════════════════════════════════════════
const NAV_LINKS = [
  { label: "Ofertas",    hash: "ofertas",     emoji: "🔥" },
  { label: "Categorías", hash: "categorias",  emoji: "📦" },
  { label: "Tendencias", hash: "tendencias",  emoji: "✨" },
  { label: "Opiniones",  hash: "testimonios", emoji: "⭐" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MOBILE MENU DRAWER  (panel lateral izquierdo)
// ═══════════════════════════════════════════════════════════════════════════════
function MobileDrawer({ open, onClose, isHome, activeLink, onNavClick }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else      document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex" style={{ fontFamily: "'Nunito',sans-serif" }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel lateral */}
      <div className="relative bg-slate-900 w-[280px] h-full flex flex-col shadow-2xl border-r border-slate-800 overflow-y-auto"
        style={{ animation: "slideFromLeft .25s ease" }}>

        {/* Header del drawer */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 flex-shrink-0">
          <Link to="/" onClick={onClose} className="flex items-center gap-2">
            <span className="text-2xl">✏️</span>
            <span className="font-black text-xl text-amber-400" style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing: "0.1em" }}>
              ESCOLARTE
            </span>
          </Link>
          <button onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-xl">✕</button>
        </div>

        {/* Buscador dentro del drawer */}
        <div className="px-4 py-3 border-b border-slate-800 flex-shrink-0">
          <SearchBox onClose={onClose} autoFocus />
        </div>

        {/* Links de navegación */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest px-3 mb-2">Navegación</p>

          {NAV_LINKS.map(link => {
            const isActive = isHome && activeLink === link.hash;
            return (
              <a key={link.hash}
                href={`${isHome ? "" : "/"}#${link.hash}`}
                onClick={(e) => { onNavClick(e, link.hash); onClose(); }}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all active:scale-[.98]
                  ${isActive
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>
                <span className="text-lg w-6 text-center">{link.emoji}</span>
                {link.label}
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />}
              </a>
            );
          })}

          <div className="pt-2 border-t border-slate-800 mt-2">
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest px-3 mb-2 mt-3">Tienda</p>
            <Link to="/productos" onClick={onClose}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all active:scale-[.98]
                ${!isHome
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>
              <span className="text-lg w-6 text-center">🗂️</span>
              Todos los productos
            </Link>
          </div>
        </nav>

        {/* Footer del drawer */}
        <div className="px-4 py-4 border-t border-slate-800 space-y-3 flex-shrink-0">
          <a href="https://wa.me/51999999999" target="_blank" rel="noreferrer" onClick={onClose}
            className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-black py-3.5 rounded-xl text-sm transition-all">
            💬 Pedir por WhatsApp
          </a>
          <p className="text-center text-slate-600 text-xs">📍 Ayacucho, Perú · Envíos a todo el país</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NAVBAR principal
// ═══════════════════════════════════════════════════════════════════════════════
export function Navbar() {
  const { cartCount }   = useCart();
  const location        = useLocation();
  const navigate        = useNavigate();
  const isHome          = location.pathname === "/";

  const [scrolled,    setScrolled]    = useState(false);
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [cartOpen,    setCartOpen]    = useState(false);
  const [activeLink,  setActiveLink]  = useState("");
  const [prevCount,   setPrevCount]   = useState(0);
  const [cartBounce,  setCartBounce]  = useState(false);
  // Buscador expandible en mobile (icono lupa en la barra)
  const [searchOpen,  setSearchOpen]  = useState(false);
  const { clear } = useSearch();

  // Scroll
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Cerrar drawer en resize a desktop
  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 1104) { setDrawerOpen(false); setSearchOpen(false); } };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // IntersectionObserver solo cuando estamos en Home
  useEffect(() => {
    if (!isHome) { setActiveLink(""); return; }
    const sections = NAV_LINKS.map(l => document.querySelector(`#${l.hash}`)).filter(Boolean);
    if (!sections.length) return;
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveLink(e.target.id); }),
      { threshold: 0.3, rootMargin: "-60px 0px -40% 0px" }
    );
    sections.forEach(s => obs.observe(s));
    return () => obs.disconnect();
  }, [isHome, location.pathname]);

  // Badge bounce en carrito
  useEffect(() => {
    if (cartCount > prevCount) { setCartBounce(true); setTimeout(() => setCartBounce(false), 400); }
    setPrevCount(cartCount);
  }, [cartCount]);

  // Cerrar search mobile al hacer búsqueda
  const handleNavClick = (e, hash) => {
    e.preventDefault();
    if (isHome) {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/", { state: { scrollTo: hash } });
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&family=Bebas+Neue&display=swap');
        .nb-font  { font-family:'Nunito',sans-serif; }
        .nb-bebas { font-family:'Bebas Neue',sans-serif; }
        @keyframes slideFromLeft  { from{transform:translateX(-100%)} to{transform:translateX(0)} }
        @keyframes slideFromRight { from{transform:translateX(100%)}  to{transform:translateX(0)} }
        @keyframes dropIn         { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes badgeBounce    { 0%,100%{transform:scale(1)} 40%{transform:scale(1.5)} 70%{transform:scale(.85)} }
        @keyframes cartGlow       { 0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,0)} 50%{box-shadow:0 0 0 8px rgba(245,158,11,.25)} }
        @keyframes searchSlide    { from{opacity:0;transform:scaleY(.95)} to{opacity:1;transform:scaleY(1)} }
        .nb-badge    { animation: badgeBounce .4s ease; }
        .nb-glow     { animation: cartGlow 2.5s ease-in-out infinite; }
        .nb-search   { animation: searchSlide .2s ease; transform-origin: top; }
      `}</style>

      {/* ── ANNOUNCEMENT BAR ─────────────────────────────────── */}
      <div className="nb-font bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-black py-1.5 px-4 overflow-hidden">
        {/* Mobile: texto corto */}
        <p className="block sm:hidden text-center text-xs font-bold truncate">
          🎒 15% OFF en pedidos &gt; S/.100 · Envío gratis Ayacucho
        </p>
        {/* Desktop: texto completo con separadores */}
        <div className="hidden sm:flex items-center justify-center gap-4 text-xs font-bold">
          <span>🎒 ¡REGRESO A CLASES!</span>
          <span className="opacity-50">·</span>
          <span>15% OFF en pedidos &gt; S/.100</span>
          <span className="opacity-50">·</span>
          <span>🚀 Envío gratis a Ayacucho</span>
        </div>
      </div>

      {/* ── NAV BAR ──────────────────────────────────────────── */}
      <nav className={`nb-font sticky top-0 z-50 transition-all duration-300
        ${scrolled
          ? "bg-slate-900/95 backdrop-blur-xl shadow-lg shadow-black/30 border-b border-slate-800"
          : "bg-slate-900 border-b border-slate-800/60"}`}>

        {/* ──── FILA PRINCIPAL ──────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-3 sm:px-5 flex items-center h-14 sm:h-16 gap-2 sm:gap-3">

          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menú"
            className="lg:hidden flex flex-col justify-center items-center w-10 h-10 rounded-xl hover:bg-slate-800 active:bg-slate-700 transition-all flex-shrink-0 gap-[5px]"
          >
            <span className="block w-5 h-[2px] bg-white rounded-full" />
            <span className="block w-5 h-[2px] bg-white rounded-full" />
            <span className="block w-5 h-[2px] bg-white rounded-full" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 flex-shrink-0 group">
            <span className="text-xl sm:text-2xl group-hover:rotate-12 transition-transform duration-300 inline-block">✏️</span>
            <div className="leading-none">
              <div className="nb-bebas text-lg sm:text-2xl text-amber-400 tracking-widest group-hover:text-amber-300 transition-colors leading-none">
                ESCOLARTE
              </div>
              <div className="hidden sm:block text-slate-500 text-[10px] font-semibold leading-none mt-0.5">
                Útiles Escolares Premium
              </div>
            </div>
          </Link>

          {/* Links desktop */}
          <div className="hidden lg:flex items-center gap-0.5 ml-2">
            {NAV_LINKS.map(link => {
              const isActive = isHome && activeLink === link.hash;
              return (
                <a key={link.hash}
                  href={`${isHome ? "" : "/"}#${link.hash}`}
                  onClick={(e) => handleNavClick(e, link.hash)}
                  className={`relative flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap
                    ${isActive ? "text-amber-400 bg-amber-500/10" : "text-slate-300 hover:text-white hover:bg-slate-800"}`}>
                  <span className="text-sm">{link.emoji}</span>
                  <span>{link.label}</span>
                  {isActive && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400" />}
                </a>
              );
            })}
            <Link to="/productos"
              className={`relative flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap
                ${!isHome ? "text-amber-400 bg-amber-500/10" : "text-slate-300 hover:text-white hover:bg-slate-800"}`}>
              <span className="text-sm">🗂️</span>
              <span>Productos</span>
              {!isHome && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400" />}
            </Link>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Buscador desktop */}
          <div className="hidden md:block w-62 lg:w-72">
            <SearchBox />
          </div>

          {/* Lupa mobile (abre barra de búsqueda expandida) */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Buscar"
            className={`md:hidden w-10 h-10 flex items-center justify-center rounded-xl transition-all flex-shrink-0
              ${searchOpen ? "bg-amber-500/20 text-amber-400" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
            {searchOpen
              ? <span className="text-lg font-black">×</span>
              : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
            }
          </button>

          {/* Carrito */}
          <button
            onClick={() => setCartOpen(true)}
            aria-label="Carrito"
            className={`relative flex items-center gap-1.5 font-bold px-3 py-2 rounded-xl text-sm transition-all duration-200 flex-shrink-0
              ${cartCount > 0 ? "bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black nb-glow" : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <span className="hidden sm:inline font-black">Carrito</span>
            {cartCount > 0 && (
              <span key={cartCount}
                className={`absolute -top-2 -right-2 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-black leading-none
                  ${cartBounce ? "nb-badge" : ""}`}>
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>
        </div>

        {/* ──── BARRA DE BÚSQUEDA MOBILE (expandible) ───────── */}
        {searchOpen && (
          <div className="nb-search md:hidden border-t border-slate-800 bg-slate-900 px-3 py-3">
            <SearchBox onClose={() => setSearchOpen(false)} autoFocus />
          </div>
        )}
      </nav>

      {/* ── DRAWERS ──────────────────────────────────────────── */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isHome={isHome}
        activeLink={activeLink}
        onNavClick={handleNavClick}
      />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
