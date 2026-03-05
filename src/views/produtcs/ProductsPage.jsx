import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useCart } from "../../components/layouts/Navbar";
import { PRODUCTS, CATEGORIES, SORT_OPTIONS } from "../../data/products";
import { ProductCard, ProductDetail, Stars } from "../home/Home";

const discOf = p => Math.round((1 - p.price / p.oldPrice) * 100);

// ─────────────────────────────────────────────────────────────────────────────
// PRICE SLIDER
// ─────────────────────────────────────────────────────────────────────────────
function PriceSlider({ min, max, value, onChange }) {
  const pct0 = ((value[0] - min) / (max - min)) * 100;
  const pct1 = ((value[1] - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold">
        <span className="text-slate-400">S/.{value[0]}</span>
        <span className="text-amber-400">S/.{value[1]}</span>
      </div>
      <div className="relative h-1.5 bg-white/10 rounded-full mx-1">
        <div className="absolute h-1.5 bg-amber-500 rounded-full" style={{ left:`${pct0}%`, right:`${100-pct1}%` }}/>
        <input type="range" min={min} max={max} value={value[0]}
          onChange={e => +e.target.value < value[1] && onChange([+e.target.value, value[1]])}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"/>
        <input type="range" min={min} max={max} value={value[1]}
          onChange={e => +e.target.value > value[0] && onChange([value[0], +e.target.value])}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER PANEL — sin overflow/scroll interno en la lista de categorías
// ─────────────────────────────────────────────────────────────────────────────
function FilterPanel({ state, handlers, counts, onApply }) {
  const { query, activeCategory, activeSubcat, priceRange, onlyDiscount, onlyStock, minRating } = state;
  const { setQuery, handleCategory, handleSubcat, setPriceRange, setOnlyDiscount, setOnlyStock, setMinRating, resetFilters } = handlers;
  const { totalActive, filteredCount } = counts;
  const currentCat = CATEGORIES.find(c => c.id === activeCategory);

  return (
    <div className="space-y-5" style={{ fontFamily:"'Nunito',sans-serif" }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-white font-black tracking-widest text-sm uppercase">Filtros</span>
        {totalActive > 0 && (
          <button onClick={resetFilters} className="flex items-center gap-1 text-rose-400 hover:text-rose-300 text-xs font-bold transition-colors">
            ✕ Limpiar ({totalActive})
          </button>
        )}
      </div>

      {/* Buscar */}
      <div>
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-2">Buscar en catálogo</p>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 focus-within:border-amber-500 rounded-xl px-3 py-2.5 transition-all">
          <svg className="w-3.5 h-3.5 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="ej: cuaderno, gel..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none min-w-0"/>
          {query && (
            <button onClick={() => setQuery("")} className="text-slate-600 hover:text-white text-lg leading-none">×</button>
          )}
        </div>
      </div>

      {/* Categorías — SIN scroll interno, lista completa visible */}
      <div>
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-2">Categoría</p>
        <div className="space-y-0.5">
          <button onClick={() => handleCategory("todos")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all
              ${activeCategory==="todos" ? "bg-amber-500 text-black" : "text-slate-300 hover:bg-white/8"}`}>
            <span>🗂️ Todos</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeCategory==="todos" ? "bg-black/20" : "bg-white/8 text-slate-500"}`}>
              {PRODUCTS.length}
            </span>
          </button>
          {CATEGORIES.map(cat => {
            const n  = PRODUCTS.filter(p => p.category === cat.id).length;
            const on = activeCategory === cat.id;
            return (
              <button key={cat.id} onClick={() => handleCategory(cat.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all
                  ${on ? "bg-amber-500 text-black" : "text-slate-300 hover:bg-white/8"}`}>
                <span>{cat.emoji} {cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${on ? "bg-black/20" : "bg-white/8 text-slate-500"}`}>{n}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subcategorías — aparece SOLO cuando hay una categoría seleccionada */}
      {currentCat && activeCategory !== "todos" && (
        <div>
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-2">Subcategoría</p>
          <div className="space-y-0.5">
            <button onClick={() => handleSubcat(null)}
              className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-all
                ${!activeSubcat ? "text-amber-400 bg-amber-500/10" : "text-slate-500 hover:bg-white/6 hover:text-slate-300"}`}>
              Todas
            </button>
            {currentCat.subcategories.map(sub => {
              const n = PRODUCTS.filter(p => p.category === activeCategory && p.subcat === sub).length;
              if (!n) return null;
              return (
                <button key={sub} onClick={() => handleSubcat(sub === activeSubcat ? null : sub)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all
                    ${activeSubcat===sub ? "text-amber-400 bg-amber-500/10" : "text-slate-500 hover:bg-white/6 hover:text-slate-300"}`}>
                  <span>— {sub}</span>
                  <span className="text-slate-700">{n}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Precio */}
      <div>
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-2">Rango de precio</p>
        <PriceSlider min={0} max={300} value={priceRange} onChange={setPriceRange}/>
      </div>

      {/* Rating mínimo */}
      <div>
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-2">Valoración mínima</p>
        <div className="grid grid-cols-4 gap-1">
          {[0, 4, 4.5, 5].map(r => (
            <button key={r} onClick={() => setMinRating(r === minRating ? 0 : r)}
              className={`py-1.5 rounded-xl text-[11px] font-bold transition-all
                ${minRating===r ? "bg-amber-500 text-black" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>
              {r===0 ? "Todos" : `${r}★`}
            </button>
          ))}
        </div>
      </div>

      {/* Filtros rápidos */}
      <div className="space-y-2.5">
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Filtros rápidos</p>
        {[
          { label:"Con +20% descuento", val:onlyDiscount, set:setOnlyDiscount, e:"🏷️" },
          { label:"Solo en stock",       val:onlyStock,   set:setOnlyStock,   e:"📦" },
        ].map(f => (
          <label key={f.label} className="flex items-center gap-2.5 cursor-pointer group">
            <div onClick={() => f.set(!f.val)}
              className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all shrink-0
                ${f.val ? "bg-amber-500 border-amber-500" : "border-white/15 group-hover:border-amber-500/40"}`}>
              {f.val && <span className="text-black text-[10px] font-black leading-none">✓</span>}
            </div>
            <span className="text-slate-400 text-xs font-semibold">{f.e} {f.label}</span>
          </label>
        ))}
      </div>

      {/* Contador de resultados */}
      <div className="bg-white/4 rounded-xl px-3 py-2.5 border border-white/8 text-center">
        <span className="text-amber-400 font-black">{filteredCount}</span>
        <span className="text-slate-500 text-xs"> producto{filteredCount!==1?"s":""} encontrado{filteredCount!==1?"s":""}</span>
      </div>

      {/* Botón "Ver resultados" — SOLO se muestra en el drawer mobile */}
      {onApply && (
        <button onClick={onApply}
          className="w-full bg-amber-500 hover:brightness-110 text-black font-black py-3 rounded-xl text-sm transition-all active:scale-[.97]">
          Ver {filteredCount} resultado{filteredCount!==1?"s":""}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PILL  (filtro activo)
// ─────────────────────────────────────────────────────────────────────────────
const PC = {
  amber:  "bg-amber-500/15 border-amber-500/30 text-amber-400",
  orange: "bg-orange-500/15 border-orange-500/30 text-orange-400",
  blue:   "bg-sky-500/15 border-sky-500/30 text-sky-400",
  green:  "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
  red:    "bg-rose-500/15 border-rose-500/30 text-rose-400",
  purple: "bg-violet-500/15 border-violet-500/30 text-violet-400",
  yellow: "bg-yellow-500/15 border-yellow-500/30 text-yellow-400",
};
function Pill({ label, onRemove, color="amber" }) {
  return (
    <span className={`flex items-center gap-1.5 border text-xs font-bold px-2.5 py-1 rounded-full ${PC[color]}`}>
      {label}
      <button onClick={onRemove} className="hover:text-white transition-colors leading-none">✕</button>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT LIST ITEM — altura uniforme con min-height y estructura fija
// ─────────────────────────────────────────────────────────────────────────────
function ProductListItem({ product, onOpenDetail }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const pct = discOf(product);
  const cat = CATEGORIES.find(c => c.id === product.category);
  const isLow = product.stock <= 5;

  const handleAdd = e => {
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 900);
  };

  return (
    <div onClick={() => onOpenDetail(product)}
      className="group flex items-center gap-3 sm:gap-4 bg-[#141e2e] border border-white/8 hover:border-amber-400/35 rounded-2xl p-3 sm:p-4 transition-all hover:shadow-lg hover:shadow-amber-500/6 cursor-pointer min-h-[88px]">

      {/* Emoji — cuadro fijo */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/5 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shrink-0 group-hover:scale-105 transition-transform">
        {product.emoji}
      </div>

      {/* Texto — siempre la misma estructura */}
      <div className="flex-1 min-w-0 space-y-0.5">
        {/* Subcategoría — SIEMPRE presente */}
        <div className="flex items-center gap-2 flex-wrap">
          {cat && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${cat.color} text-white`}>
              {cat.emoji} {product.subcat ?? cat.name}
            </span>
          )}
          {isLow && (
            <span className="text-[10px] text-orange-400 font-bold">⚡ {product.stock} left</span>
          )}
          {product.isNew && (
            <span className="text-[10px] text-sky-400 font-bold">NUEVO</span>
          )}
        </div>

        {/* Nombre — 1 línea fija */}
        <h3 className="font-bold text-white text-sm sm:text-base leading-tight group-hover:text-amber-100 transition-colors"
          style={{ display:"-webkit-box", WebkitLineClamp:1, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
          {product.name}
        </h3>

        {/* Descripción — 1 línea, solo en sm+ */}
        <p className="text-slate-500 text-xs hidden sm:block leading-snug"
          style={{ display:"-webkit-box", WebkitLineClamp:1, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
          {product.description}
        </p>

        {/* Estrellas */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <Stars rating={product.rating} size="sm"/>
          <span className="text-xs text-slate-600">({product.reviews})</span>
        </div>
      </div>

      {/* Precio + botón — columna fija a la derecha */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        <div className="text-right">
          <div className="text-amber-400 font-black text-base sm:text-lg leading-tight">S/.{product.price}</div>
          <div className="text-slate-600 text-xs line-through">S/.{product.oldPrice}</div>
          <div className="text-emerald-400 text-xs font-bold">-{pct}%</div>
        </div>
        <button onClick={handleAdd}
          className={`font-bold px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm transition-all active:scale-[.96] whitespace-nowrap
            ${added ? "bg-emerald-500 text-white" : "bg-amber-500 hover:brightness-110 text-black"}`}>
          {added ? "✓ Listo" : "+ Carrito"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTS PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query,          setQuery]          = useState(searchParams.get("q")         || "");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("categoria") || "todos");
  const [activeSubcat,   setActiveSubcat]   = useState(null);
  const [sortBy,         setSortBy]         = useState("relevance");
  const [priceRange,     setPriceRange]     = useState([0, 300]);
  const [onlyDiscount,   setOnlyDiscount]   = useState(false);
  const [onlyStock,      setOnlyStock]      = useState(false);
  const [minRating,      setMinRating]      = useState(0);
  const [drawerOpen,     setDrawerOpen]     = useState(false);
  const [viewMode,       setViewMode]       = useState("grid");
  const [selectedProduct,setSelectedProduct]= useState(null);

  // Sync parámetros URL → estado
  useEffect(() => {
    const cat = searchParams.get("categoria");
    const q   = searchParams.get("q");
    if (cat !== null) { setActiveCategory(cat || "todos"); setActiveSubcat(null); }
    if (q   !== null) setQuery(q);
  }, [searchParams]);

  const handleCategory = useCallback(cat => {
    setActiveCategory(cat);
    setActiveSubcat(null);
    setSearchParams(cat !== "todos" ? { categoria: cat } : {});
  }, [setSearchParams]);

  const handleSubcat  = useCallback(sub => setActiveSubcat(sub), []);
  const openDetail    = useCallback(p   => setSelectedProduct(p), []);

  const resetFilters = useCallback(() => {
    setQuery(""); setActiveCategory("todos"); setActiveSubcat(null);
    setSortBy("relevance"); setPriceRange([0,300]);
    setOnlyDiscount(false); setOnlyStock(false); setMinRating(0);
    setSearchParams({});
  }, [setSearchParams]);

  // Lock body scroll cuando el drawer está abierto
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  // ── Filtrado + ordenado ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...PRODUCTS];
    if (activeCategory !== "todos") list = list.filter(p => p.category === activeCategory);
    if (activeSubcat)               list = list.filter(p => p.subcat   === activeSubcat);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subcat?.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q)) ||
        p.description.toLowerCase().includes(q)
      );
    }
    list = list.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (onlyDiscount) list = list.filter(p => discOf(p) >= 20);
    if (onlyStock)    list = list.filter(p => p.stock > 3);
    if (minRating>0)  list = list.filter(p => p.rating >= minRating);

    switch (sortBy) {
      case "price-asc":  list.sort((a,b) => a.price - b.price); break;
      case "price-desc": list.sort((a,b) => b.price - a.price); break;
      case "rating":     list.sort((a,b) => b.rating - a.rating); break;
      case "discount":   list.sort((a,b) => discOf(b) - discOf(a)); break;
      case "newest":     list.sort((a,b) => (b.isNew?1:0) - (a.isNew?1:0)); break;
      default: break;
    }
    return list;
  }, [query, activeCategory, activeSubcat, sortBy, priceRange, onlyDiscount, onlyStock, minRating]);

  const totalActive = [
    activeCategory !== "todos",
    !!activeSubcat,
    query.trim() !== "",
    priceRange[0]>0 || priceRange[1]<300,
    onlyDiscount, onlyStock, minRating>0,
  ].filter(Boolean).length;

  const currentCat = CATEGORIES.find(c => c.id === activeCategory);

  const fState    = { query, activeCategory, activeSubcat, priceRange, onlyDiscount, onlyStock, minRating };
  const fHandlers = { setQuery, handleCategory, handleSubcat, setPriceRange, setOnlyDiscount, setOnlyStock, setMinRating, resetFilters };
  const fCounts   = { totalActive, filteredCount: filtered.length };

  return (
    <div className="min-h-screen bg-[#06101e] text-white" style={{ fontFamily:"'Nunito',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Bebas+Neue&display=swap');
        .pp-bb { font-family:'Bebas Neue',sans-serif; letter-spacing:.05em; }
        @keyframes slideLeft { from{transform:translateX(-100%)} to{transform:translateX(0)} }
        .pp-drawer { animation:slideLeft .22s ease; }
      `}</style>

      {/* Modal detalle */}
      {selectedProduct && (
        <ProductDetail product={selectedProduct} onClose={() => setSelectedProduct(null)}/>
      )}

      {/* ── DRAWER FILTROS MOBILE ─────────────────────────── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] flex lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDrawerOpen(false)}/>
          <div className="pp-drawer relative bg-[#0d1623] w-[290px] h-full flex flex-col border-r border-white/8 shadow-2xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/8 shrink-0">
              <span className="pp-bb text-lg text-white tracking-widest">FILTROS</span>
              <button onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 text-xl transition-all">✕</button>
            </div>
            {/* Drawer body — scroll solo cuando el contenido excede la pantalla */}
            <div className="flex-1 overflow-y-auto p-4">
              <FilterPanel state={fState} handlers={fHandlers} counts={fCounts} onApply={() => setDrawerOpen(false)}/>
            </div>
          </div>
        </div>
      )}

      {/* ── PAGE HEADER ──────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#0d1623] to-[#06101e] border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-3 flex-wrap">
            <Link to="/" className="hover:text-amber-400 transition-colors">🏠 Inicio</Link>
            <span>›</span>
            <span className="text-slate-400 font-semibold">Productos</span>
            {currentCat && activeCategory !== "todos" && (
              <><span>›</span><span className="text-amber-400 font-bold">{currentCat.emoji} {currentCat.name}</span></>
            )}
            {activeSubcat && (
              <><span>›</span><span className="text-slate-400">{activeSubcat}</span></>
            )}
          </div>

          {/* Título */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="pp-bb text-4xl sm:text-5xl lg:text-6xl text-white leading-none">
                {activeCategory === "todos"
                  ? <><span className="text-amber-400">TODOS</span> LOS PRODUCTOS</>
                  : <>{currentCat?.emoji} {currentCat?.name?.toUpperCase()}</>
                }
              </h1>
              {activeSubcat && (
                <p className="text-slate-400 text-sm mt-1">
                  Subcategoría: <span className="text-amber-400 font-bold">{activeSubcat}</span>
                </p>
              )}
              <p className="text-slate-400 text-sm mt-1.5">
                <span className="text-amber-400 font-bold">{filtered.length}</span> producto{filtered.length!==1?"s":""} encontrado{filtered.length!==1?"s":""}
                {totalActive > 0 && (
                  <span className="text-slate-600"> · {totalActive} filtro{totalActive>1?"s":""} activo{totalActive>1?"s":""}</span>
                )}
              </p>
            </div>

            {/* Controles de ordenamiento + vista */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Btn filtros — mobile */}
              <button onClick={() => setDrawerOpen(true)}
                className="lg:hidden flex items-center gap-2 bg-white/6 hover:bg-white/10 border border-white/10 px-3 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-[.97]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M6 9h12M9 14h6"/>
                </svg>
                Filtros
                {totalActive > 0 && (
                  <span className="bg-amber-500 text-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black">{totalActive}</span>
                )}
              </button>

              {/* Sort */}
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="bg-white/6 border border-white/10 focus:border-amber-500 text-white text-sm px-3 py-2.5 rounded-xl outline-none cursor-pointer transition-all">
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value} className="bg-[#1e293b]">{o.label}</option>
                ))}
              </select>

              {/* View mode (solo sm+) */}
              <div className="hidden sm:flex bg-white/6 border border-white/10 rounded-xl overflow-hidden">
                <button onClick={() => setViewMode("grid")}
                  className={`px-3 py-2.5 transition-all ${viewMode==="grid" ? "bg-amber-500 text-black" : "text-slate-400 hover:text-white"}`}
                  title="Vista grid">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 8a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zm6-8a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2zm0 8a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z"/>
                  </svg>
                </button>
                <button onClick={() => setViewMode("list")}
                  className={`px-3 py-2.5 transition-all ${viewMode==="list" ? "bg-amber-500 text-black" : "text-slate-400 hover:text-white"}`}
                  title="Vista lista">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Pills filtros activos */}
          {totalActive > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {activeCategory!=="todos"              && <Pill label={`${currentCat?.emoji} ${currentCat?.name}`}         onRemove={() => handleCategory("todos")}   color="amber"/>}
              {activeSubcat                          && <Pill label={activeSubcat}                                        onRemove={() => handleSubcat(null)}         color="orange"/>}
              {query                                 && <Pill label={`"${query}"`}                                        onRemove={() => setQuery("")}               color="blue"/>}
              {(priceRange[0]>0||priceRange[1]<300) && <Pill label={`S/.${priceRange[0]}–S/.${priceRange[1]}`}           onRemove={() => setPriceRange([0,300])}     color="green"/>}
              {onlyDiscount                          && <Pill label="+20% dto"                                            onRemove={() => setOnlyDiscount(false)}     color="red"/>}
              {onlyStock                             && <Pill label="En stock"                                            onRemove={() => setOnlyStock(false)}        color="purple"/>}
              {minRating>0                           && <Pill label={`${minRating}★+`}                                   onRemove={() => setMinRating(0)}            color="yellow"/>}
              <button onClick={resetFilters}
                className="text-slate-600 hover:text-rose-400 text-xs font-bold underline transition-colors">
                Limpiar todo
              </button>
            </div>
          )}

          {/* Chips de subcategorías — SOLO cuando hay categoría activa */}
          {currentCat && activeCategory !== "todos" && (
            <div className="flex flex-wrap gap-2 mt-4">
              <button onClick={() => handleSubcat(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all
                  ${!activeSubcat ? "bg-amber-500 text-black" : "bg-white/6 text-slate-300 hover:bg-white/10 border border-white/8"}`}>
                Todos
              </button>
              {currentCat.subcategories.map(sub => {
                const n = PRODUCTS.filter(p => p.category === activeCategory && p.subcat === sub).length;
                if (!n) return null;
                return (
                  <button key={sub} onClick={() => handleSubcat(sub === activeSubcat ? null : sub)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all
                      ${activeSubcat===sub ? "bg-amber-500 text-black" : "bg-white/6 text-slate-300 hover:bg-white/10 border border-white/8"}`}>
                    {sub}
                    <span className={`text-[10px] ${activeSubcat===sub ? "text-black/60" : "text-slate-600"}`}>{n}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── LAYOUT PRINCIPAL ─────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex gap-6 lg:gap-8">

          {/* Sidebar desktop — sin scroll propio (el page scroll lo maneja) */}
          <aside className="hidden lg:block w-56 xl:w-64 shrink-0">
            <div className="sticky top-[72px]">
              <div className="bg-white/[.03] border border-white/8 rounded-2xl p-4 xl:p-5">
                <FilterPanel state={fState} handlers={fHandlers} counts={fCounts}/>
              </div>
            </div>
          </aside>

          {/* Main — grid o lista */}
          <main className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-black text-white mb-2">Sin resultados</h3>
                <p className="text-slate-500 text-sm mb-6 max-w-xs">
                  No hay productos con estos filtros. Prueba con otros términos.
                </p>
                <button onClick={resetFilters}
                  className="bg-amber-500 hover:brightness-110 text-black font-black px-8 py-3 rounded-2xl transition-all active:scale-[.97]">
                  🗂️ Ver todos los productos
                </button>
              </div>
            ) : viewMode === "list" ? (
              <div className="space-y-3">
                {filtered.map(p => (
                  <ProductListItem key={p.id} product={p} onOpenDetail={openDetail}/>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {filtered.map(p => (
                  <ProductCard key={p.id} product={p} onOpenDetail={openDetail}/>
                ))}
              </div>
            )}

            {filtered.length > 0 && (
              <p className="text-center text-slate-700 text-xs mt-8">
                Mostrando {filtered.length} de {PRODUCTS.length} productos
              </p>
            )}
          </main>
        </div>
      </div>

      {/* ── OTRAS CATEGORÍAS ─────────────────────────────── */}
      {activeCategory !== "todos" && (
        <section className="border-t border-white/8 py-10 sm:py-12 bg-white/[.015]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <p className="pp-bb text-2xl sm:text-3xl text-white mb-5 tracking-wide">OTRAS CATEGORÍAS</p>
            <div className="flex flex-wrap gap-3">
              {CATEGORIES.filter(c => c.id !== activeCategory).map(cat => (
                <button key={cat.id} onClick={() => handleCategory(cat.id)}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/8 border border-white/8 hover:border-amber-400/30 text-slate-300 hover:text-amber-400 font-bold px-4 py-2.5 rounded-2xl text-sm transition-all active:scale-[.97]">
                  {cat.emoji} {cat.name}
                  <span className="text-slate-700 text-xs">({PRODUCTS.filter(p => p.category===cat.id).length})</span>
                </button>
              ))}
              <button onClick={() => handleCategory("todos")}
                className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 hover:border-amber-500/50 text-amber-400 font-bold px-4 py-2.5 rounded-2xl text-sm transition-all active:scale-[.97]">
                🗂️ Ver todos
              </button>
            </div>
          </div>
        </section>
      )}

      {/* FAB WhatsApp */}
      <a href="https://wa.me/51999999999" target="_blank" rel="noreferrer"
        className="fixed bottom-5 right-5 z-40 bg-[#25d366] hover:brightness-110 text-white w-[52px] h-[52px] rounded-full flex items-center justify-center text-2xl shadow-xl shadow-emerald-500/40 transition-all hover:scale-110 active:scale-95">
        💬
      </a>
    </div>
  );
}
