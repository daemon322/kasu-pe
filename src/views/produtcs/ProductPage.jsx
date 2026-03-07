import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCart } from "../../components/layouts/Navbar";
import { PRODUCTS, CATEGORIES } from "../../data/products";
import { Stars } from "../home/Home";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const discPct = p => Math.round((1 - p.price / p.oldPrice) * 100);

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ProductPage() {
  const { id }         = useParams();
  const navigate       = useNavigate();
  const { addToCart }  = useCart();

  const product = PRODUCTS.find(p => String(p.id) === String(id));

  const [qty,   setQty]   = useState(1);
  const [tab,   setTab]   = useState("info");
  const [added, setAdded] = useState(false);

  // Scroll al tope al entrar
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [id]);

  // Producto no encontrado
  if (!product) {
    return (
      <div className="min-h-screen bg-[#06101e] flex flex-col items-center justify-center gap-4 text-white px-4"
        style={{ fontFamily:"'Nunito',sans-serif" }}>
        <div className="text-6xl">🔍</div>
        <h1 className="text-2xl font-black">Producto no encontrado</h1>
        <p className="text-slate-400 text-sm">El producto que buscas no existe o fue eliminado.</p>
        <Link to="/productos"
          className="bg-amber-500 hover:bg-amber-400 text-black font-black px-8 py-3 rounded-2xl transition-all active:scale-[.97]">
          Ver todos los productos
        </Link>
      </div>
    );
  }

  const cat   = CATEGORIES.find(c => c.id === product.category);
  const pct   = discPct(product);
  const isLow = product.stock <= 5;

  // Productos relacionados (misma categoría, distinto id)
  const related = PRODUCTS
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  const waMsg = encodeURIComponent(
    `Hola! Me interesa:\n• ${product.name} x${qty} = S/.${(product.price * qty).toFixed(2)}\n\n¿Está disponible?`
  );

  const TABS = [
    { id:"info",    label:"Características" },
    { id:"incluye", label:"¿Qué incluye?"   },
    { id:"grado",   label:"Para quién"      },
  ];

  return (
    <div className="min-h-screen bg-[#06101e] text-white" style={{ fontFamily:"'Nunito',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Bebas+Neue&display=swap');
        .pg-bb { font-family:'Bebas Neue',sans-serif; letter-spacing:.05em; }
        @keyframes floatEmoji { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        .pg-fadein { animation: fadeUp .35s ease both; }
      `}</style>

      {/* ── BREADCRUMB ─────────────────────────────────────── */}
      <div className="bg-[#0d1623] border-b border-white/8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-1.5 text-xs text-slate-600 flex-wrap">
          <Link to="/" className="hover:text-amber-400 transition-colors">🏠 Inicio</Link>
          <span>›</span>
          <Link to="/productos" className="hover:text-amber-400 transition-colors">Productos</Link>
          {cat && (
            <>
              <span>›</span>
              <Link to={`/productos?categoria=${cat.id}`} className="hover:text-amber-400 transition-colors">
                {cat.emoji} {cat.name}
              </Link>
            </>
          )}
          {product.subcat && (
            <>
              <span>›</span>
              <span className="text-slate-400">{product.subcat}</span>
            </>
          )}
          <span>›</span>
          <span className="text-white font-semibold truncate max-w-[160px] sm:max-w-none">{product.name}</span>
        </div>
      </div>

      {/* ── CONTENIDO PRINCIPAL ────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pg-fadein">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">

          {/* ════ COLUMNA IZQUIERDA — Visual ════ */}
          <div className="lg:w-80 xl:w-96 shrink-0">

            {/* Hero visual del producto */}
            <div className="relative bg-gradient-to-br from-white/6 via-white/3 to-transparent border border-white/8 rounded-3xl p-8 sm:p-10 flex flex-col items-center gap-5 overflow-hidden">
              {/* Glow detrás */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/6 to-transparent rounded-3xl"/>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                <span className="bg-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-full">-{pct}%</span>
                {product.isNew && (
                  <span className="bg-sky-500 text-white text-xs font-black px-2.5 py-1 rounded-full">NUEVO</span>
                )}
              </div>
              <div className="absolute top-4 right-4">
                <span className="bg-black/50 text-amber-400 border border-amber-500/30 text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
                  {product.badge}
                </span>
              </div>

              {/* Emoji flotante */}
              <span className="text-[7rem] sm:text-[8rem] leading-none select-none"
                style={{ animation:"floatEmoji 3s ease-in-out infinite" }}>
                {product.emoji}
              </span>

              {/* Precio */}
              <div className="text-center">
                <div className="pg-bb text-5xl sm:text-6xl text-amber-400">{`S/.${product.price}`}</div>
                <div className="flex items-center justify-center gap-3 mt-1">
                  <span className="text-slate-500 line-through text-base">S/.{product.oldPrice}</span>
                  <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-xs font-black px-2.5 py-0.5 rounded-full">
                    Ahorras S/.{(product.oldPrice - product.price).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <Stars rating={product.rating} size="md"/>
                <span className="text-amber-400 font-black">{product.rating}</span>
                <span className="text-slate-500 text-sm">({product.reviews} reseñas)</span>
              </div>

              {/* Stock */}
              <div className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full border
                ${isLow
                  ? "bg-orange-500/12 text-orange-400 border-orange-500/25"
                  : "bg-emerald-500/12 text-emerald-400 border-emerald-500/25"
                }`}>
                <span>{isLow ? "⚡" : "✓"}</span>
                <span>{isLow ? `Solo ${product.stock} unidades` : "Disponible · Entrega <24h"}</span>
              </div>
            </div>

            {/* Cantidad + acciones — pegado debajo en desktop, flotante abajo en mobile */}
            <div className="hidden lg:flex flex-col gap-3 mt-4">
              <QuantityAndActions
                qty={qty} setQty={setQty} stock={product.stock}
                added={added} onAdd={handleAdd} waMsg={waMsg}
                price={product.price}
              />
            </div>
          </div>

          {/* ════ COLUMNA DERECHA — Info ════ */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">

            {/* Categoría + nombre */}
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-3">
                {cat && (
                  <Link to={`/productos?categoria=${cat.id}`}
                    className={`text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${cat.color} text-white hover:brightness-110 transition-all`}>
                    {cat.emoji} {cat.name}
                  </Link>
                )}
                {product.subcat && (
                  <span className="text-xs text-slate-500 font-semibold bg-white/5 px-3 py-1 rounded-full border border-white/8">
                    {product.subcat}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                {product.name}
              </h1>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed mt-3">
                {product.description}
              </p>
            </div>

            {/* Tabs */}
            <div className="border border-white/8 rounded-2xl overflow-hidden">
              {/* Tab headers */}
              <div className="flex border-b border-white/8 bg-white/3">
                {TABS.map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`flex-1 px-2 sm:px-4 py-3 text-xs sm:text-sm font-bold transition-all
                      ${tab===t.id
                        ? "text-amber-400 border-b-2 border-amber-400 bg-amber-500/5"
                        : "text-slate-500 hover:text-slate-300 hover:bg-white/3"
                      }`}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab body */}
              <div className="p-4 sm:p-5">
                {tab === "info" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.features.map(f => (
                      <div key={f.label}
                        className="flex gap-3 bg-white/4 rounded-xl px-3 py-2.5 border border-white/5">
                        <span className="text-amber-400 font-black text-xs shrink-0 w-[88px] leading-snug">{f.label}</span>
                        <span className="text-slate-300 text-xs leading-snug">{f.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {tab === "incluye" && (
                  <ul className="space-y-2.5">
                    {product.includes.map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-200 text-sm">
                        <span className="w-6 h-6 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 rounded-full flex items-center justify-center text-[11px] font-black shrink-0">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {tab === "grado" && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-slate-600 font-bold uppercase tracking-widest mb-2">Nivel educativo</p>
                      <div className="flex flex-wrap gap-2">
                        {product.forGrade.map(g => (
                          <span key={g}
                            className="bg-white/6 border border-white/10 text-slate-200 text-sm px-3 py-1.5 rounded-xl font-semibold">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                    {product.colors?.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-600 font-bold uppercase tracking-widest mb-2">Versiones / colores</p>
                        <div className="flex flex-wrap gap-2">
                          {product.colors.map((c, i) => (
                            <span key={i}
                              className="bg-white/5 border border-white/10 hover:border-amber-500/40 text-slate-300 text-xs px-3 py-1.5 rounded-xl cursor-pointer transition-all">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Cantidad + acciones — solo en mobile (en desktop está en la col izquierda) */}
            <div className="lg:hidden">
              <QuantityAndActions
                qty={qty} setQty={setQty} stock={product.stock}
                added={added} onAdd={handleAdd} waMsg={waMsg}
                price={product.price}
              />
            </div>

            {/* Volver al catálogo */}
            <div className="flex items-center gap-3 pt-2">
              <button onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-400 hover:text-amber-400 text-sm font-bold transition-colors">
                ← Volver
              </button>
              <span className="text-white/10">|</span>
              <Link to="/productos"
                className="flex items-center gap-2 text-slate-400 hover:text-amber-400 text-sm font-bold transition-colors">
                Ver todos los productos
              </Link>
              {cat && (
                <>
                  <span className="text-white/10">|</span>
                  <Link to={`/productos?categoria=${cat.id}`}
                    className="flex items-center gap-2 text-slate-400 hover:text-amber-400 text-sm font-bold transition-colors">
                    {cat.emoji} Más de {cat.name}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── PRODUCTOS RELACIONADOS ──────────────────────── */}
        {related.length > 0 && (
          <section className="mt-12 sm:mt-16 pt-8 border-t border-white/8">
            <div className="flex items-end justify-between gap-3 mb-6">
              <div>
                <p className="pg-bb text-2xl sm:text-3xl text-white">TAMBIÉN TE PUEDE INTERESAR</p>
                <p className="text-slate-500 text-sm mt-0.5">
                  {cat?.emoji} Más productos de {cat?.name}
                </p>
              </div>
              <Link to={`/productos?categoria=${product.category}`}
                className="text-amber-400 hover:text-amber-300 text-sm font-bold transition-colors whitespace-nowrap">
                Ver todos →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {related.map(p => (
                <RelatedCard key={p.id} product={p}/>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── BARRA INFERIOR FIJA MOBILE (sticky CTA) ─────── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-[#0d1623]/95 backdrop-blur-md border-t border-white/10 px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-white font-black text-base leading-tight">S/.{product.price}</p>
          <p className="text-slate-500 text-xs line-through">S/.{product.oldPrice}</p>
        </div>
        <a href={`https://wa.me/51999999999?text=${waMsg}`} target="_blank" rel="noreferrer"
          className="shrink-0 bg-[#25d366] hover:brightness-110 text-white font-black px-4 py-2.5 rounded-xl text-sm transition-all active:scale-[.97]">
          💬 Pedir
        </a>
        <button onClick={handleAdd}
          className={`shrink-0 font-black px-5 py-2.5 rounded-xl text-sm transition-all active:scale-[.97]
            ${added
              ? "bg-emerald-500 text-white"
              : "bg-amber-500 hover:bg-amber-400 text-black"
            }`}>
          {added ? "✓ Agregado" : "🛒 Añadir"}
        </button>
      </div>

      {/* Espacio para la barra fija mobile */}
      <div className="h-20 lg:hidden"/>

      {/* FAB WhatsApp — desktop */}
      <a href="https://wa.me/51999999999" target="_blank" rel="noreferrer"
        className="hidden lg:flex fixed bottom-5 right-5 z-40 bg-[#25d366] hover:brightness-110 text-white w-[52px] h-[52px] rounded-full items-center justify-center text-2xl shadow-xl shadow-emerald-500/40 transition-all hover:scale-110 active:scale-95">
        💬
      </a>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// QUANTITY + ACTIONS  (reutilizado en desktop col-left y mobile inline)
// ─────────────────────────────────────────────────────────────────────────────
function QuantityAndActions({ qty, setQty, stock, added, onAdd, waMsg, price }) {
  return (
    <div className="bg-white/3 border border-white/8 rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Selector cantidad */}
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-sm font-semibold">Cantidad</span>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
          <button onClick={() => setQty(q => Math.max(1, q-1))}
            className="w-7 h-7 bg-white/10 hover:bg-white/20 text-white rounded-full font-black text-base transition-all active:scale-90 flex items-center justify-center">
            −
          </button>
          <span className="font-black text-white text-base w-6 text-center tabular-nums">{qty}</span>
          <button onClick={() => setQty(q => Math.min(stock, q+1))}
            className="w-7 h-7 bg-amber-500 hover:bg-amber-400 text-black rounded-full font-black text-base transition-all active:scale-90 flex items-center justify-center">
            +
          </button>
        </div>
      </div>

      {/* Total */}
      {qty > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Total ({qty} unidades)</span>
          <span className="text-amber-400 font-black text-lg">S/.{(price * qty).toFixed(2)}</span>
        </div>
      )}

      {/* Botones */}
      <button onClick={onAdd}
        className={`w-full font-black py-3.5 rounded-2xl text-sm transition-all active:scale-[.98] shadow-lg
          ${added
            ? "bg-emerald-500 text-white shadow-emerald-500/20"
            : "bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-black shadow-amber-500/25"
          }`}>
        {added ? "✓ Agregado al carrito" : `🛒 Agregar al carrito${qty>1 ? ` (${qty})` : ""}`}
      </button>

      <a href={`https://wa.me/51999999999?text=${waMsg}`} target="_blank" rel="noreferrer"
        className="w-full flex items-center justify-center gap-2 bg-[#25d366] hover:brightness-110 text-white font-black py-3.5 rounded-2xl text-sm transition-all active:scale-[.98]">
        💬 Pedir por WhatsApp
      </a>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RELATED CARD  (card simplificada para productos relacionados)
// ─────────────────────────────────────────────────────────────────────────────
function RelatedCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const cat = CATEGORIES.find(c => c.id === product.category);
  const pct = discPct(product);

  const handleAdd = e => {
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 900);
  };

  return (
    <div onClick={() => navigate(`/producto/${product.id}`)}
      className="group bg-[#141e2e] border border-white/8 hover:border-amber-400/40 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/8 flex flex-col">

      {/* Visual */}
      <div className="relative h-[110px] bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center shrink-0">
        <span className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform select-none">{product.emoji}</span>
        <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">-{pct}%</span>
        {product.isNew && (
          <span className="absolute top-8 left-2 bg-sky-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">NUEVO</span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 gap-1.5">
        <span className={`self-start text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${cat?.color ?? "from-slate-500 to-slate-600"} text-white leading-tight`}>
          {cat?.emoji} {product.subcat ?? cat?.name}
        </span>
        <h3 className="font-bold text-white text-xs sm:text-sm leading-snug group-hover:text-amber-100 transition-colors"
          style={{ display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden", minHeight:"2.4rem" }}>
          {product.name}
        </h3>
        <div className="flex items-center gap-1">
          <Stars rating={product.rating} size="sm"/>
          <span className="text-[10px] text-slate-600">({product.reviews})</span>
        </div>
        <div className="mt-auto pt-1.5 flex items-center justify-between gap-2">
          <div className="leading-tight">
            <span className="text-amber-400 font-black text-sm sm:text-base block">S/.{product.price}</span>
            <span className="text-slate-600 text-[10px] line-through block">S/.{product.oldPrice}</span>
          </div>
          <button onClick={handleAdd}
            className={`shrink-0 font-bold px-2.5 py-1.5 rounded-xl text-xs transition-all active:scale-90
              ${added ? "bg-emerald-500 text-white" : "bg-amber-500 hover:bg-amber-400 text-black"}`}>
            {added ? "✓" : "+ Añadir"}
          </button>
        </div>
      </div>
    </div>
  );
}
