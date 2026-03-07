import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";import { useCart } from "../../components/layouts/Navbar";
import { PRODUCTS, CATEGORIES, PROMOTIONS, TRENDS, TESTIMONIALS, GRADE_PACKS } from "../../data/products";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const discPct = p => Math.round((1 - p.price / p.oldPrice) * 100);

// ─────────────────────────────────────────────────────────────────────────────
// STARS
// ─────────────────────────────────────────────────────────────────────────────
export function Stars({ rating, size = "sm" }) {
  const sz = size === "lg" ? "w-5 h-5" : size === "md" ? "w-4 h-4" : "w-3 h-3";
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <svg key={n} className={`${sz} ${n <= Math.round(rating) ? "text-amber-400" : "text-slate-700"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT DETAIL MODAL
// ─────────────────────────────────────────────────────────────────────────────
export function ProductDetail({ product, onClose }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [qty,   setQty]   = useState(1);
  const [tab,   setTab]   = useState("info");
  const pct   = discPct(product);
  const isLow = product.stock <= 5;
  const cat   = CATEGORIES.find(c => c.id === product.category);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
  useEffect(() => {
    const fn = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const waMsg = encodeURIComponent(
    `Hola! Me interesa:\n• ${product.name} x${qty} = S/.${(product.price * qty).toFixed(2)}\n\n¿Está disponible?`
  );

  const TABS = [
    { id:"info",    label:"Características" },
    { id:"incluye", label:"Incluye" },
    { id:"grado",   label:"Para quién" },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ fontFamily:"'Nunito',sans-serif" }}>
      <style>{`
        @keyframes mdIn  { from{opacity:0;transform:translateY(30px) scale(.97)} to{opacity:1;transform:none} }
        @keyframes ovIn  { from{opacity:0} to{opacity:1} }
        @keyframes floatE{ 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .pd-ov{ animation:ovIn .2s ease; } .pd-box{ animation:mdIn .25s cubic-bezier(.34,1.56,.64,1); }
      `}</style>
      <div className="pd-ov absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}/>
      <div className="pd-box relative bg-[#0d1623] w-full sm:max-w-2xl max-h-[96vh] sm:max-h-[88vh] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-white/10 z-10">

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/8 shrink-0 bg-white/3">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-gradient-to-r ${cat?.color} text-white`}>
              {cat?.emoji} {cat?.name}
            </span>
            {product.subcat && (
              <span className="text-xs text-slate-400 truncate hidden sm:block">› {product.subcat}</span>
            )}
            <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border ${
              isLow
                ? "bg-orange-500/15 text-orange-400 border-orange-500/30"
                : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
            }`}>
              {isLow ? `⚡ ${product.stock} restantes` : "✓ En stock"}
            </span>
          </div>
          <button onClick={onClose}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 text-xl transition-all ml-2">✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col sm:flex-row">

            {/* Izq — visual */}
            <div className="sm:w-44 xl:w-52 bg-gradient-to-b from-white/5 to-transparent flex flex-col items-center justify-center gap-3 p-6 border-b sm:border-b-0 sm:border-r border-white/8 shrink-0">
              <div className="relative">
                <span className="text-8xl leading-none block" style={{ animation:"floatE 3s ease-in-out infinite" }}>{product.emoji}</span>
                <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">-{pct}%</span>
              </div>
              <span className="text-[10px] font-black bg-amber-500/15 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full">{product.badge}</span>
              <div className="text-center">
                <div className="text-3xl font-black text-amber-400">S/.{product.price}</div>
                <div className="text-slate-500 text-sm line-through">S/.{product.oldPrice}</div>
                <div className="text-emerald-400 text-xs font-bold mt-0.5">Ahorras S/.{(product.oldPrice - product.price).toFixed(2)}</div>
              </div>
              <div className="flex items-center gap-1">
                <Stars rating={product.rating} size="sm"/>
                <span className="text-slate-500 text-xs">({product.reviews})</span>
              </div>
            </div>

            {/* Der — info */}
            <div className="flex-1 p-4 sm:p-5 space-y-4 min-w-0">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white leading-tight mb-1">{product.name}</h2>
                <p className="text-slate-400 text-sm leading-relaxed">{product.description}</p>
              </div>

              {/* Tabs */}
              <div className="border-b border-white/8">
                <div className="flex -mb-px">
                  {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                      className={`px-3 py-2 text-xs font-bold transition-all whitespace-nowrap
                        ${tab===t.id ? "text-amber-400 border-b-2 border-amber-400" : "text-slate-500 hover:text-slate-300"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {tab === "info" && (
                <div className="grid grid-cols-1 gap-1.5">
                  {product.features.map(f => (
                    <div key={f.label} className="flex gap-3 bg-white/4 rounded-xl px-3 py-2 border border-white/5">
                      <span className="text-amber-400 font-black text-xs shrink-0 w-24">{f.label}</span>
                      <span className="text-slate-300 text-xs">{f.value}</span>
                    </div>
                  ))}
                </div>
              )}
              {tab === "incluye" && (
                <ul className="space-y-2">
                  {product.includes.map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-slate-300 text-sm">
                      <span className="w-5 h-5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {tab === "grado" && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {product.forGrade.map(g => (
                      <span key={g} className="bg-white/8 border border-white/12 text-slate-200 text-sm px-3 py-1.5 rounded-xl font-semibold">{g}</span>
                    ))}
                  </div>
                  {product.colors?.length > 0 && (
                    <>
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mt-3">Versiones / colores</p>
                      <div className="flex flex-wrap gap-2">
                        {product.colors.map((c, i) => (
                          <span key={i} className="bg-white/5 border border-white/10 hover:border-amber-500/50 text-slate-300 text-xs px-3 py-1.5 rounded-xl cursor-pointer transition-all">{c}</span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Cantidad */}
              <div className="flex items-center gap-3 flex-wrap pt-1">
                <span className="text-slate-400 text-sm font-semibold">Cantidad:</span>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
                  <button onClick={() => setQty(q => Math.max(1, q-1))}
                    className="w-7 h-7 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-sm transition-all">−</button>
                  <span className="font-black text-white w-5 text-center">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q+1))}
                    className="w-7 h-7 bg-amber-500 hover:bg-amber-400 text-black rounded-full font-bold text-sm transition-all">+</button>
                </div>
                <span className="text-slate-400 text-sm">Total: <span className="text-amber-400 font-black">S/.{(product.price*qty).toFixed(2)}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer acciones */}
        <div className="flex gap-3 px-4 sm:px-5 py-4 border-t border-white/8 bg-white/3 shrink-0">
          <button onClick={handleAdd}
            className={`flex-1 font-black py-3.5 rounded-2xl text-sm transition-all shadow-lg active:scale-[.98]
              ${added ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-black shadow-amber-500/25"}`}>
            {added ? "✓ Agregado" : `🛒 Agregar al carrito${qty>1?` (${qty})`:""}`}
          </button>
          <a href={`https://wa.me/51999999999?text=${waMsg}`} target="_blank" rel="noreferrer"
            className="shrink-0 flex items-center gap-2 bg-[#25d366] hover:brightness-110 text-white font-black px-5 py-3.5 rounded-2xl text-sm transition-all active:scale-[.98]">
            💬<span className="hidden sm:inline"> WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT CARD  — altura UNIFORME garantizada con grid rows
// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT CARD  — navega a /producto/:id (funciona en cualquier pantalla)
// ─────────────────────────────────────────────────────────────────────────────
export function ProductCard({ product }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);
  const pct = discPct(product);
  const cat = CATEGORIES.find(c => c.id === product.category);
  const isLow = product.stock <= 5;

  const handleAdd = e => {
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 900);
  };

  return (
    <div
      onClick={() => navigate(`/producto/${product.id}`)}
      className="group bg-[#141e2e] border border-white/8 hover:border-amber-400/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/10 flex flex-col"
      style={{ minHeight: 0 }}
    >
      {/* ── Visual — altura FIJA 130px en todo tamaño ── */}
      <div className="relative flex-shrink-0 h-[130px] bg-gradient-to-br from-white/5 via-white/[.02] to-transparent flex items-center justify-center overflow-hidden">
        <span className="text-5xl sm:text-6xl group-hover:scale-110 transition-transform duration-200 select-none">{product.emoji}</span>

        {/* Badge descuento */}
        <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
          -{pct}%
        </span>
        {/* Badge nuevo */}
        {product.isNew && (
          <span className="absolute top-2.5 left-2.5 mt-5 bg-sky-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
            NUEVO
          </span>
        )}
        {/* Badge tipo */}
        <span className="absolute top-2.5 right-2.5 bg-black/50 text-amber-400 border border-amber-500/25 text-[10px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm">
          {product.badge}
        </span>
        {/* Stock bajo */}
        {isLow && (
          <span className="absolute bottom-2 left-2.5 bg-orange-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            ⚡ {product.stock} left
          </span>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-black/60 text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-400/30 backdrop-blur-sm">
            Ver detalle →
          </span>
        </div>
      </div>

      {/* ── Body — flex-1 + grid de filas para uniformidad ── */}
      <div className="p-3 flex flex-col flex-1 gap-1.5">

        {/* Fila 1: subcategoría — SIEMPRE presente, mismo alto */}
        <span className={`self-start text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${cat?.color ?? "from-slate-500 to-slate-600"} text-white leading-tight truncate max-w-full`}>
          {cat?.emoji} {product.subcat ?? cat?.name ?? "—"}
        </span>

        {/* Fila 2: nombre — 2 líneas FIJAS (min-height garantizado) */}
        <h3
          className="font-bold text-white text-xs sm:text-sm leading-snug group-hover:text-amber-100 transition-colors"
          style={{ display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden", minHeight:"2.5rem" }}
        >
          {product.name}
        </h3>

        {/* Fila 3: estrellas — siempre igual */}
        <div className="flex items-center gap-1.5">
          <Stars rating={product.rating} size="sm"/>
          <span className="text-[10px] text-slate-500">({product.reviews})</span>
        </div>

        {/* Fila 4: precio + botón — pegado al fondo siempre */}
        <div className="mt-auto pt-1.5 flex items-center justify-between gap-2">
          <div className="min-w-0 leading-tight">
            <span className="text-amber-400 font-black text-sm sm:text-base block">S/.{product.price}</span>
            <span className="text-slate-600 text-[10px] line-through block">S/.{product.oldPrice}</span>
          </div>
          <button
            onClick={handleAdd}
            className={`shrink-0 font-bold px-2.5 py-1.5 rounded-xl text-xs transition-all active:scale-90
              ${added ? "bg-emerald-500 text-white" : "bg-amber-500 hover:bg-amber-400 text-black"}`}
          >
            {added ? "✓" : "+ Añadir"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOME PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  const location = useLocation();
  const navigate  = useNavigate();
  const [countdown,      setCountdown]      = useState({ h:5, m:48, s:22 });
  const [activeCatFilter,setActiveCatFilter] = useState("todos");

  // Scroll suave desde navbar
  useEffect(() => {
    const hash = location.state?.scrollTo;
    if (!hash) return;
    const t = setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior:"smooth" });
      window.history.replaceState({}, "");
    }, 120);
    return () => clearTimeout(t);
  }, [location.state]);

  // Countdown timer
  useEffect(() => {
    const t = setInterval(() => setCountdown(p => {
      let {h, m, s} = p;
      if (--s < 0) { s=59; if (--m < 0) { m=59; if (--h < 0) h=23; } }
      return {h, m, s};
    }), 1000);
    return () => clearInterval(t);
  }, []);

  const pad = n => String(n).padStart(2,"0");

  const goSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior:"smooth" });
  };

  const featured      = PRODUCTS.filter(p => p.isFeatured);
  const shownFeatured = activeCatFilter === "todos" ? featured : featured.filter(p => p.category === activeCatFilter);
  const newProducts   = PRODUCTS.filter(p => p.isNew).slice(0, 4);
  const catFilters    = CATEGORIES.filter(c => featured.some(p => p.category === c.id));

  return (
    <div className="min-h-screen bg-[#06101e] text-white" style={{ fontFamily:"'Nunito',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Bebas+Neue&display=swap');
        .hm-bb { font-family:'Bebas Neue',sans-serif; letter-spacing:.05em; }
        @keyframes floatCard  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes pulse-ring { 0%{box-shadow:0 0 0 0 rgba(245,158,11,.5)} 70%{box-shadow:0 0 0 12px rgba(245,158,11,0)} 100%{box-shadow:0 0 0 0 rgba(245,158,11,0)} }
        .gtext { background:linear-gradient(110deg,#fbbf24,#f97316 45%,#a78bfa); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .no-scroll-x { overflow-x:hidden; }
      `}</style>

      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-10 pb-16 sm:pt-14 sm:pb-20">
        {/* Blobs decorativos */}
        <div className="pointer-events-none absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-amber-500/8 blur-[120px]"/>
        <div className="pointer-events-none absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-violet-600/8 blur-[100px]"/>
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-cyan-600/4 blur-[80px]"/>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-center gap-10 lg:gap-14">

          {/* ── Texto izquierdo ── */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-amber-500/12 border border-amber-500/25 rounded-full px-4 py-1.5 text-amber-400 text-xs font-bold mb-5">
              🎒 REGRESO A CLASES 2025 · AYACUCHO
            </div>
            <h1 className="hm-bb text-5xl sm:text-6xl lg:text-7xl leading-[0.88] mb-5">
              <span className="gtext">TODO LO QUE</span><br/>
              <span className="text-white">NECESITAS</span><br/>
              <span className="text-amber-400">PARA EL COLE</span>
            </h1>
            <p className="text-slate-400 text-base sm:text-lg mb-7 max-w-lg mx-auto lg:mx-0">
              Útiles, limpieza, arte y tecnología. Delivery en Ayacucho en menos de 24 h.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link to="/productos"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-black font-black py-4 px-8 rounded-2xl text-base transition-all shadow-xl shadow-amber-500/25 active:scale-[.97]">
                🔥 Ver Ofertas
              </Link>
              <button
                onClick={() => goSection("categorias")}
                className="bg-white/8 hover:bg-white/14 text-white font-bold py-4 px-8 rounded-2xl text-base transition-all border border-white/10 active:scale-[.97]">
                🗂️ Categorías
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 sm:gap-6 mt-8 justify-center lg:justify-start">
              {[
                { e:"🚚", t:"Delivery <24h",  d:"En Ayacucho" },
                { e:"💯", t:"Garantía real",   d:"Devolución fácil" },
                { e:"⭐", t:"4.9 / 5.0",       d:"+500 reseñas" },
                { e:"📦", t:"+30 productos",   d:"Siempre en stock" },
              ].map(b => (
                <div key={b.t} className="flex items-center gap-2">
                  <span className="text-xl">{b.e}</span>
                  <div className="leading-tight">
                    <p className="text-white font-bold text-xs">{b.t}</p>
                    <p className="text-slate-500 text-[10px]">{b.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Panel derecho ── */}
          <div className="w-full max-w-xs sm:max-w-sm lg:max-w-[360px] flex flex-col gap-3">

            {/* Flash sale con countdown */}
            <div className="bg-gradient-to-br from-rose-700/95 to-red-900/95 rounded-3xl p-5 shadow-2xl border border-rose-500/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white text-sm font-black tracking-wide">⚡ OFERTA FLASH</span>
                <span className="bg-black/30 text-white/80 text-xs font-bold px-2.5 py-0.5 rounded-full">TERMINA EN</span>
              </div>
              <div className="flex gap-2 mb-4">
                {[{l:"HRS",v:countdown.h},{l:"MIN",v:countdown.m},{l:"SEG",v:countdown.s}].map(t => (
                  <div key={t.l} className="flex-1 text-center">
                    <div className="bg-black/40 rounded-xl py-2.5 hm-bb text-4xl text-white tabular-nums leading-none">{pad(t.v)}</div>
                    <div className="text-rose-300 text-[10px] mt-1 font-semibold tracking-widest">{t.l}</div>
                  </div>
                ))}
              </div>
              <p className="text-rose-200 text-xs text-center mb-1.5">Kit Regreso a Clases COMPLETO</p>
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="hm-bb text-4xl text-amber-300">S/.108</span>
                <span className="line-through text-rose-400 text-sm">S/.180</span>
                <span className="bg-amber-400 text-black text-xs font-black px-2 py-0.5 rounded-full">-40%</span>
              </div>
              <Link to="/productos"
                className="block w-full text-center bg-white text-rose-700 font-black py-2.5 rounded-xl text-sm hover:bg-amber-50 transition-all active:scale-[.98]">
                Aprovechar oferta →
              </Link>
            </div>

            {/* Mini categorías rápidas */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { e:"📚", t:"Útiles",   cat:"utiles" },
                { e:"🧹", t:"Limpieza", cat:"limpieza" },
                { e:"🎨", t:"Arte",     cat:"arte" },
              ].map(b => (
                <Link key={b.t} to={`/productos?categoria=${b.cat}`}
                  className="bg-white/5 border border-white/8 hover:border-amber-500/30 hover:bg-white/10 rounded-2xl p-3 text-center transition-all active:scale-[.96]">
                  <div className="text-2xl mb-1">{b.e}</div>
                  <div className="text-white font-bold text-xs">{b.t}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          DESCUENTOS ESCALONADOS
      ══════════════════════════════════════════════════════ */}
      <section className="py-10 sm:py-12 bg-gradient-to-r from-indigo-950/90 via-violet-950/90 to-indigo-950/90 border-y border-violet-700/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-7">
            <p className="hm-bb text-3xl sm:text-4xl text-white mb-1">DESCUENTOS POR VOLUMEN</p>
            <p className="text-slate-400 text-sm">Cuanto más compras, más ahorras</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              { min:"S/.50",  d:"8% OFF",  desc:"Primera compra",             color:"from-cyan-400 to-blue-500",     e:"🎁",  hi:false },
              { min:"S/.100", d:"15% OFF", desc:"El más popular 🔥",           color:"from-amber-400 to-orange-500",  e:"🔥",  hi:true  },
              { min:"S/.200", d:"25% OFF", desc:"Para colegios e instituciones",color:"from-emerald-400 to-teal-500", e:"🏫",  hi:false },
            ].map(d => (
              <div key={d.min} className={`relative rounded-2xl p-5 sm:p-6 text-center border transition-all
                ${d.hi
                  ? "bg-amber-500/10 border-amber-400/40 shadow-lg shadow-amber-500/12 sm:scale-[1.04]"
                  : "bg-white/3 border-white/8 hover:border-white/16"
                }`}>
                {d.hi && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-black text-[10px] font-black px-3 py-0.5 rounded-full whitespace-nowrap">
                    ⭐ MÁS POPULAR
                  </div>
                )}
                <div className="text-3xl mb-3">{d.e}</div>
                <div className="text-slate-500 text-xs mb-1">Compras mayores a</div>
                <div className={`hm-bb text-4xl bg-gradient-to-r ${d.color} bg-clip-text text-transparent`}>{d.min}</div>
                <div className="text-white font-black text-xl mt-0.5">{d.d}</div>
                <div className="text-slate-400 text-xs mt-1">{d.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CATEGORÍAS
      ══════════════════════════════════════════════════════ */}
      <section id="categorias" className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <p className="hm-bb text-4xl sm:text-5xl text-white mb-1">NUESTRAS CATEGORÍAS</p>
            <p className="text-slate-400 text-sm">Útiles, limpieza, arte, tecnología, lonchera y más</p>
          </div>
          {/* Grid fijo — sin scroll horizontal */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {CATEGORIES.map(cat => (
              <Link key={cat.id} to={`/productos?categoria=${cat.id}`}
                className="group bg-white/4 border border-white/8 hover:border-amber-400/40 hover:bg-white/8 rounded-2xl p-3 sm:p-4 text-center transition-all duration-200 hover:-translate-y-0.5 active:scale-[.97]">
                <div className="text-3xl sm:text-4xl mb-2 block">{cat.emoji}</div>
                <p className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-400 transition-colors leading-tight">{cat.name}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  {PRODUCTS.filter(p => p.category === cat.id).length} prods.
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          PROMOCIONES 2025
      ══════════════════════════════════════════════════════ */}
      <section id="ofertas" className="py-12 sm:py-14 bg-white/[.015]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <p className="hm-bb text-4xl sm:text-5xl text-white mb-1">🎯 PROMOCIONES 2025</p>
            <p className="text-slate-400 text-sm">Kits completos a precios especiales para esta temporada</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {PROMOTIONS.map(promo => (
              <div key={promo.id}
                className={`relative bg-gradient-to-br ${promo.color} rounded-3xl p-5 sm:p-6 overflow-hidden shadow-xl border border-white/12 flex flex-col`}>
                <div className="absolute top-4 right-4 bg-black/30 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
                  🔥 {promo.stock} disponibles
                </div>
                <div className="text-5xl mb-3">{promo.emoji}</div>
                <div className="inline-block bg-black/25 text-white text-xs font-black px-3 py-1 rounded-full mb-3 self-start">{promo.badge}</div>
                <h3 className="text-white font-black text-lg leading-tight mb-1">{promo.title}</h3>
                <p className="text-white/70 text-sm mb-4">{promo.subtitle}</p>

                {/* Items — altura uniforme usando min-height */}
                <ul className="space-y-1.5 mb-4 flex-1">
                  {promo.items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-white/90 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60 shrink-0"/>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="flex items-end justify-between gap-2 flex-wrap mt-auto">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="hm-bb text-3xl text-white">S/.{promo.promoPrice}</span>
                      <span className="line-through text-white/45 text-sm">S/.{promo.originalPrice}</span>
                    </div>
                    <p className="text-white/45 text-[10px]">Válido: {promo.validUntil}</p>
                  </div>
                  <a href={`https://wa.me/51999999999?text=${encodeURIComponent("Hola! Me interesa el " + promo.title)}`}
                    target="_blank" rel="noreferrer"
                    className="bg-white/20 hover:bg-white/35 text-white font-black px-4 py-2.5 rounded-xl text-sm transition-all active:scale-[.97]">
                    💬 Pedir
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          PRODUCTOS DESTACADOS
      ══════════════════════════════════════════════════════ */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-7">
            <div>
              <p className="hm-bb text-4xl sm:text-5xl text-white">⭐ DESTACADOS</p>
              <p className="text-slate-400 text-sm mt-1">Los favoritos de nuestros clientes</p>
            </div>
            <Link to="/productos" className="text-amber-400 hover:text-amber-300 font-bold text-sm transition-colors self-start sm:self-auto">
              Ver todos los productos →
            </Link>
          </div>

          {/* Filtros categoría — wrapping (NO scroll horizontal) */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button onClick={() => setActiveCatFilter("todos")}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all
                ${activeCatFilter==="todos" ? "bg-amber-500 text-black" : "bg-white/6 text-slate-300 hover:bg-white/10 border border-white/8"}`}>
              Todos
            </button>
            {catFilters.map(cat => (
              <button key={cat.id} onClick={() => setActiveCatFilter(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all
                  ${activeCatFilter===cat.id ? "bg-amber-500 text-black" : "bg-white/6 text-slate-300 hover:bg-white/10 border border-white/8"}`}>
                {cat.emoji} {cat.name}
              </button>
            ))}
          </div>

          {shownFeatured.length === 0 ? (
            <div className="text-center py-14 text-slate-500 text-sm">No hay destacados en esta categoría</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {shownFeatured.slice(0, 8).map(p => (
                <ProductCard key={p.id} product={p}/>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/productos"
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/30 text-white font-bold px-8 py-3.5 rounded-2xl transition-all text-sm active:scale-[.97]">
              🗂️ Ver los {PRODUCTS.length} productos
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          NUEVOS
      ══════════════════════════════════════════════════════ */}
      {newProducts.length > 0 && (
        <section className="py-10 sm:py-14 bg-white/[.015]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-7">
              <span className="bg-sky-500 text-white text-xs font-black px-3 py-1 rounded-full">NUEVO</span>
              <p className="hm-bb text-3xl sm:text-4xl text-white">RECIÉN LLEGADOS</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {newProducts.map(p => (
                <ProductCard key={p.id} product={p}/>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          PACKS POR GRADO
      ══════════════════════════════════════════════════════ */}
      <section id="packs" className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <p className="hm-bb text-4xl sm:text-5xl text-white mb-1">📋 LISTA POR GRADO</p>
            <p className="text-slate-400 text-sm">Kits completos para cada nivel educativo</p>
          </div>
          {/* Grid — NO scroll horizontal, misma altura por row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {GRADE_PACKS.map(pack => (
              <div key={pack.grade}
                className="bg-white/4 border border-white/8 hover:border-amber-400/30 rounded-2xl p-4 sm:p-5 transition-all hover:-translate-y-0.5 flex flex-col">
                <div className="text-3xl mb-2">{pack.emoji}</div>
                <span className="self-start bg-amber-500/15 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-500/25 mb-2">
                  {pack.badge}
                </span>
                <h3 className="font-black text-white text-sm mb-3 leading-tight">{pack.grade}</h3>
                <ul className="flex-1 space-y-1.5">
                  {pack.items.map(item => (
                    <li key={item} className="flex items-start gap-2 text-slate-300 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1"/>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-3 border-t border-white/8 flex items-center justify-between">
                  <div>
                    <div className="text-amber-400 font-black text-xl">S/.{pack.price}</div>
                    <div className="text-slate-600 text-[10px] line-through">S/.{pack.originalPrice}</div>
                  </div>
                  <a href={`https://wa.me/51999999999?text=${encodeURIComponent("Hola! Quiero el kit para " + pack.grade)}`}
                    target="_blank" rel="noreferrer"
                    className="bg-[#25d366] hover:brightness-110 text-white font-bold px-3 py-2 rounded-xl text-xs transition-all active:scale-[.97]">
                    💬 Pedir
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TENDENCIAS
      ══════════════════════════════════════════════════════ */}
      <section id="tendencias" className="py-12 sm:py-14 bg-white/[.015]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <p className="hm-bb text-4xl sm:text-5xl text-white mb-1">TENDENCIAS 2025</p>
            <p className="text-slate-400 text-sm">Lo más pedido esta temporada escolar</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {TRENDS.map(t => (
              <div key={t.title}
                className="bg-white/4 border border-white/8 hover:border-amber-400/25 rounded-2xl p-6 sm:p-7 transition-all hover:-translate-y-0.5">
                <div className="text-5xl mb-4">{t.emoji}</div>
                <h3 className="font-black text-white text-xl mb-2">{t.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">{t.desc}</p>
                <span className="inline-block bg-amber-500/12 text-amber-400 text-sm font-bold px-3 py-1 rounded-full border border-amber-500/22">
                  {t.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          WHATSAPP CTA
      ══════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-16 bg-gradient-to-br from-emerald-950/80 to-teal-950/80 border-y border-emerald-700/25">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="text-6xl mb-4">💬</div>
          <p className="hm-bb text-4xl sm:text-5xl text-white mb-3">PIDE POR WHATSAPP</p>
          <p className="text-emerald-300/80 text-base sm:text-lg mb-7 max-w-lg mx-auto">
            Asesoría personalizada y cotizaciones para colegios e instituciones. ¡Respuesta en minutos!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://wa.me/51999999999" target="_blank" rel="noreferrer"
              className="bg-[#25d366] hover:brightness-110 text-white font-black py-4 px-8 rounded-2xl text-base transition-all shadow-xl shadow-emerald-500/25 active:scale-[.97]">
              📱 Chatear ahora
            </a>
            <a href="https://wa.me/51999999999?text=Hola!%20Necesito%20cotización%20para%20mi%20institución"
              target="_blank" rel="noreferrer"
              className="bg-white/8 hover:bg-white/16 text-white font-bold py-4 px-8 rounded-2xl text-base transition-all border border-white/12 active:scale-[.97]">
              📋 Cotización grupal
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TESTIMONIOS
      ══════════════════════════════════════════════════════ */}
      <section id="testimonios" className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <p className="hm-bb text-4xl sm:text-5xl text-white mb-1">LO QUE DICEN</p>
            <p className="text-slate-400 text-sm">Familias y docentes de Ayacucho confían en nosotros</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TESTIMONIALS.map(t => (
              <div key={t.name}
                className="bg-white/4 border border-white/8 hover:border-amber-400/25 rounded-2xl p-5 transition-all flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-lg shrink-0">
                    {t.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white text-sm truncate">{t.name}</p>
                    <p className="text-xs text-slate-500 truncate">{t.school}</p>
                  </div>
                </div>
                <Stars rating={t.stars} size="sm"/>
                {/* Texto fijo — 4 líneas para igualar cards */}
                <p className="text-slate-300 text-sm leading-relaxed mt-3 flex-1"
                  style={{ display:"-webkit-box", WebkitLineClamp:4, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                  "{t.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          NEWSLETTER
      ══════════════════════════════════════════════════════ */}
      <section className="py-12 sm:py-14 bg-white/[.015] border-y border-white/5">
        <div className="max-w-xl mx-auto px-4 text-center">
          <div className="text-4xl mb-3">✉️</div>
          <p className="hm-bb text-3xl sm:text-4xl text-white mb-2">OFERTAS EXCLUSIVAS</p>
          <p className="text-slate-400 text-sm mb-5">Recibe primero las promos de temporada escolar</p>
          <div className="flex gap-2 flex-col sm:flex-row">
            <input type="email" placeholder="tu@correo.com"
              className="flex-1 bg-white/6 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none transition-all text-sm"/>
            <button className="bg-amber-500 hover:brightness-110 text-black font-black px-6 py-3 rounded-xl transition-all whitespace-nowrap text-sm active:scale-[.97]">
              Suscribirme 🎒
            </button>
          </div>
          <p className="text-slate-700 text-xs mt-3">Sin spam. Solo ofertas de verdad.</p>
        </div>
      </section>

      {/* FAB WhatsApp */}
      <a href="https://wa.me/51999999999" target="_blank" rel="noreferrer"
        className="fixed bottom-5 right-5 z-40 bg-[#25d366] hover:brightness-110 text-white w-[52px] h-[52px] rounded-full flex items-center justify-center text-2xl shadow-xl shadow-emerald-500/40 transition-all hover:scale-110 active:scale-95">
        💬
      </a>
    </div>
  );
}
