import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PRODUCTS, CATEGORIES } from "../../data/products";

const discPct = p => Math.round((1 - p.price / p.oldPrice) * 100);

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const inputRef       = useRef(null);

  const [query,   setQuery]   = useState(searchParams.get("q") || "");
  const [results, setResults] = useState([]);

  // Auto foco al entrar
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  // Filtrar productos en tiempo real
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) { setResults([]); return; }
    const found = PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.subcat?.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tags?.some(t => t.toLowerCase().includes(q)) ||
      p.description.toLowerCase().includes(q)
    );
    setResults(found);
  }, [query]);

  const handleEnter = (e) => {
    if (e.key === "Enter" && query.trim()) {
      navigate(`/productos?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // Categorías únicas entre los resultados
  const matchingCats = [...new Set(results.map(r => r.category))]
    .map(id => CATEGORIES.find(c => c.id === id))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-[#06101e] text-white" style={{ fontFamily: "'Nunito',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        .sp-item { animation: fadeUp .2s ease both; }
      `}</style>

      {/* ── BARRA DE BÚSQUEDA FIJA ── */}
      <div className="sticky top-0 z-10 bg-[#0a1628] border-b border-white/8 px-4 py-3 flex items-center gap-3">
        {/* Botón volver */}
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/8 transition-all shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        {/* Input */}
        <div className="flex-1 flex items-center gap-2 bg-slate-800 border border-slate-700 focus-within:border-amber-500 rounded-xl px-3 py-2.5 transition-all">
          <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleEnter}
            placeholder="Buscar productos..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none min-w-0"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-slate-500 hover:text-white text-xl leading-none shrink-0">×</button>
          )}
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <div className="max-w-lg mx-auto px-4 py-4">

        {/* Estado vacío inicial */}
        {!query && (
          <div className="pt-12 text-center space-y-6">
            <div className="text-5xl">🔍</div>
            <p className="text-slate-400 text-sm">Escribe para buscar productos</p>

            {/* Categorías rápidas */}
            <div>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-3">Categorías</p>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(cat => (
                  <Link
                    key={cat.id}
                    to={`/productos?categoria=${cat.id}`}
                    className="flex items-center gap-2.5 bg-white/4 border border-white/8 hover:border-amber-400/30 rounded-xl px-3 py-3 transition-all active:scale-[.97]"
                  >
                    <span className="text-xl">{cat.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-white font-bold text-xs truncate">{cat.name}</p>
                      <p className="text-slate-600 text-[10px]">
                        {PRODUCTS.filter(p => p.category === cat.id).length} productos
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Con query pero sin resultados */}
        {query && results.length === 0 && (
          <div className="pt-12 text-center space-y-4">
            <div className="text-5xl">😕</div>
            <p className="text-white font-black text-lg">Sin resultados para "{query}"</p>
            <p className="text-slate-500 text-sm">Intenta con otro término</p>
            <Link
              to="/productos"
              className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-black px-6 py-3 rounded-2xl transition-all active:scale-[.97] text-sm"
            >
              Ver todos los productos
            </Link>
          </div>
        )}

        {/* Resultados */}
        {query && results.length > 0 && (
          <div className="space-y-4">

            {/* Contador + link "ver todos" */}
            <div className="flex items-center justify-between">
              <p className="text-slate-500 text-xs">
                <span className="text-amber-400 font-black">{results.length}</span> resultado{results.length !== 1 ? "s" : ""}
              </p>
              <Link
                to={`/productos?q=${encodeURIComponent(query.trim())}`}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold transition-colors"
              >
                Ver en catálogo →
              </Link>
            </div>

            {/* Categorías coincidentes */}
            {matchingCats.length > 0 && (
              <div>
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-2">Categorías</p>
                <div className="flex flex-wrap gap-2">
                  {matchingCats.map(cat => (
                    <Link
                      key={cat.id}
                      to={`/productos?categoria=${cat.id}`}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-gradient-to-r ${cat.color} text-white active:scale-[.97] transition-all`}
                    >
                      {cat.emoji} {cat.name}
                      <span className="bg-black/20 px-1.5 py-0.5 rounded-full text-[10px]">
                        {results.filter(p => p.category === cat.id).length}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Lista de productos — todos son <Link> normales, sin eventos touch */}
            <div>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-2">Productos</p>
              <div className="space-y-2">
                {results.slice(0, 12).map((product, i) => {
                  const cat = CATEGORIES.find(c => c.id === product.category);
                  const pct = discPct(product);
                  return (
                    <Link
                      key={product.id}
                      to={`/producto/${product.id}`}
                      className="sp-item flex items-center gap-3 bg-[#141e2e] border border-white/8 hover:border-amber-400/40 active:border-amber-400/60 rounded-2xl p-3 transition-all active:scale-[.98]"
                      style={{ animationDelay: `${i * 30}ms` }}
                    >
                      {/* Emoji */}
                      <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center text-3xl shrink-0">
                        {product.emoji}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          {cat && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r ${cat.color} text-white`}>
                              {cat.emoji} {product.subcat ?? cat.name}
                            </span>
                          )}
                          {product.isNew && (
                            <span className="text-[10px] font-bold text-sky-400">NUEVO</span>
                          )}
                        </div>
                        <p className="text-white font-bold text-sm leading-tight truncate">{product.name}</p>
                        <p className="text-slate-500 text-xs mt-0.5 truncate">{product.description}</p>
                      </div>

                      {/* Precio */}
                      <div className="text-right shrink-0">
                        <p className="text-amber-400 font-black text-base leading-tight">S/.{product.price}</p>
                        <p className="text-slate-600 text-xs line-through">S/.{product.oldPrice}</p>
                        <p className="text-rose-400 text-xs font-bold">-{pct}%</p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Ver todos en catálogo si hay más de 12 */}
              {results.length > 12 && (
                <Link
                  to={`/productos?q=${encodeURIComponent(query.trim())}`}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-amber-400/30 text-white font-bold py-3.5 rounded-2xl text-sm transition-all active:scale-[.97]"
                >
                  Ver los {results.length} resultados en catálogo →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
