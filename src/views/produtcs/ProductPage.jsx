import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCart } from "../../components/layouts/Navbar";
import { PRODUCTS, CATEGORIES } from "../../data/products";
import { Stars } from "../home/Home";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const discPct = (p) => Math.round((1 - p.price / p.oldPrice) * 100);

const IcoWA = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// ─── Selector de cantidad (usado en desktop col-B y barra mobile) ─────────────
function QtySelector({ qty, setQty, stock }) {
  return (
    <div className="flex items-center rounded-xl overflow-hidden border border-white/10 bg-white/4 shrink-0">
      <button
        onClick={() => setQty((q) => Math.max(1, q - 1))}
        className="w-9 h-9 flex items-center justify-center text-slate-300 hover:bg-white/10 hover:text-white font-black transition-all active:scale-90 text-lg"
      >−</button>
      <span className="w-9 h-9 flex items-center justify-center font-black text-white text-sm tabular-nums border-x border-white/10">
        {qty}
      </span>
      <button
        onClick={() => setQty((q) => Math.min(stock, q + 1))}
        className="w-9 h-9 flex items-center justify-center text-slate-300 hover:bg-amber-500 hover:text-black font-black transition-all active:scale-90 text-lg"
      >+</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ProductPage() {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const { addToCart } = useCart();

  const product = PRODUCTS.find((p) => String(p.id) === String(id));

  const [qty,    setQty]    = useState(1);
  const [tab,    setTab]    = useState("info");
  const [added,  setAdded]  = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setQty(1); setTab("info"); setAdded(false); setImgErr(false); setReveal(false);
    const t = setTimeout(() => setReveal(true), 40);
    return () => clearTimeout(t);
  }, [id]);

  // ── 404 ────────────────────────────────────────────────────────────────────
  if (!product) return (
    <div className="min-h-screen bg-[#06101e] flex flex-col items-center justify-center gap-5 text-white px-4"
      style={{ fontFamily: "'Nunito',sans-serif" }}>
      <span className="text-7xl">🔍</span>
      <h1 className="text-2xl font-black">Producto no encontrado</h1>
      <p className="text-slate-500 text-sm text-center max-w-xs">
        Este producto no existe o fue retirado del catálogo.
      </p>
      <Link to="/productos"
        className="bg-amber-500 hover:bg-amber-400 text-black font-black px-8 py-3 rounded-2xl text-sm transition-all active:scale-[.97]">
        Ver catálogo →
      </Link>
    </div>
  );

  const cat    = CATEGORIES.find((c) => c.id === product.category);
  const disc   = discPct(product);
  const isLow  = product.stock <= 5;
  const saving = (product.oldPrice - product.price).toFixed(2);
  const total  = (product.price * qty).toFixed(2);
  const hasImg = product.image && !imgErr;

  const related = PRODUCTS
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const waMsg = encodeURIComponent(
    `Hola! Me interesa:\n• ${product.name} x${qty} = S/.${total}\n\n¿Está disponible?`
  );

  const TABS = [
    { id: "info",    label: "Características" },
    { id: "incluye", label: "Incluye"         },
    { id: "grado",   label: "Para quién"      },
  ];

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#06101e] text-white" style={{ fontFamily: "'Nunito',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Bebas+Neue&display=swap');
        .bb { font-family:'Bebas Neue',sans-serif; letter-spacing:.04em; }

        .rv { opacity:0; transform:translateY(16px); transition:opacity .4s ease, transform .4s ease; }
        .rv.on { opacity:1; transform:none; }
        .rv-d1 { transition-delay:.08s; }
        .rv-d2 { transition-delay:.16s; }

        .img-wrap img { transition:transform .5s ease; }
        .img-wrap:hover img { transform:scale(1.04); }

        @keyframes tabIn { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:none} }
        .tab-in { animation:tabIn .2s ease both; }

        @keyframes glowPulse {
          0%,100% { box-shadow:0 0 0 0 rgba(245,158,11,.45); }
          60%     { box-shadow:0 0 0 8px rgba(245,158,11,0); }
        }
        .cta-glow { animation:glowPulse 2.4s ease-in-out infinite; }

        @keyframes floatE { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .float-e { animation:floatE 3.6s ease-in-out infinite; }

        .rc { transition:transform .22s ease, box-shadow .22s ease; }
        .rc:hover { transform:translateY(-4px);
                    box-shadow:0 16px 40px rgba(0,0,0,.4), 0 0 0 1px rgba(245,158,11,.15); }
      `}</style>

      {/* ── BREADCRUMB ── */}
      <div className="border-b border-white/[.06]">
        <div className="w-full mx-auto px-5 sm:px-8 h-10 flex items-center gap-1.5 text-[11px] text-slate-600 overflow-x-auto whitespace-nowrap">
          <Link to="/"          className="hover:text-amber-400 transition-colors shrink-0">Inicio</Link>
          <span className="shrink-0">›</span>
          <Link to="/productos" className="hover:text-amber-400 transition-colors shrink-0">Productos</Link>
          {cat && <>
            <span className="shrink-0">›</span>
            <Link to={`/productos?categoria=${cat.id}`} className="hover:text-amber-400 transition-colors shrink-0">
              {cat.name}
            </Link>
          </>}
          <span className="shrink-0">›</span>
          <span className="text-slate-400 shrink-0">{product.name}</span>
        </div>
      </div>

      {/* ── MAIN ── */}
      {/* pb-[88px] en mobile para que la barra fija no tape el contenido */}
      <div className="w-full mx-auto px-5 sm:px-8 pt-8 pb-[112px] sm:pt-10 lg:pb-16">
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-14 items-start">

          {/* ════════════════════════════════
              COL A — Imagen (sticky desktop)
          ════════════════════════════════ */}
          <div className={`rv ${reveal ? "on" : ""} w-full lg:w-[420px] xl:w-[460px] shrink-0 lg:sticky lg:top-20`}>

            {/* Imagen principal */}
            <div className="img-wrap relative rounded-3xl overflow-hidden aspect-square"
              style={{ background: "linear-gradient(135deg,#0e1c2e,#091421)", border: "1px solid rgba(255,255,255,.07)" }}>

              {/* glow de categoría */}
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${cat?.color ?? ""} opacity-[.06]`}/>

              {/* badges top-left */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                <span className="bg-rose-600 text-white text-xs font-black px-2.5 py-[3px] rounded-full shadow-md">
                  −{disc}%
                </span>
                {product.isNew && (
                  <span className="text-xs font-black px-2.5 py-[3px] rounded-full text-white shadow-md"
                    style={{ background: "linear-gradient(135deg,#0ea5e9,#818cf8)" }}>
                    NUEVO
                  </span>
                )}
                {product.isFeatured && (
                  <span className="text-xs font-black px-2.5 py-[3px] rounded-full text-amber-300 shadow-md"
                    style={{ background: "rgba(245,158,11,.15)", border: "1px solid rgba(245,158,11,.3)" }}>
                    ⭐ TOP
                  </span>
                )}
              </div>

              {/* badge top-right */}
              <div className="absolute top-4 right-4 z-10">
                <span className={`text-xs font-bold px-2.5 py-[3px] rounded-full bg-gradient-to-r ${cat?.color ?? "from-slate-500 to-slate-600"} text-white shadow-md`}>
                  {cat?.emoji} {product.badge}
                </span>
              </div>

              {/* imagen o emoji */}
              {hasImg ? (
                <img src={product.image} alt={product.name}
                  onError={() => setImgErr(true)}
                  className="w-full h-full object-cover"/>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-[7rem] sm:text-[8rem] leading-none select-none float-e">
                    {product.emoji}
                  </span>
                </div>
              )}

              {/* ahorro bottom-right */}
              <div className="absolute bottom-4 right-4 z-10">
                <span className="text-xs font-black text-emerald-300 px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(16,185,129,.15)", border: "1px solid rgba(16,185,129,.25)", backdropFilter: "blur(8px)" }}>
                  Ahorras S/.{saving}
                </span>
              </div>
            </div>

            {/* Stock */}
            <div className={`mt-3 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold
              ${isLow
                ? "bg-orange-500/8 border border-orange-500/20 text-orange-400"
                : "bg-emerald-500/8 border border-emerald-500/20 text-emerald-400"}`}>
              {isLow
                ? <>⚡ Solo {product.stock} unidades</>
                : <>✓ En stock · Entrega &lt;24h</>}
            </div>
          </div>

          {/* ════════════════════════════════
              COL B — Info + acciones
          ════════════════════════════════ */}
          <div className={`rv rv-d1 ${reveal ? "on" : ""} flex-1 min-w-0 flex flex-col gap-6`}>

            {/* 1 · Categoría + nombre + rating + descripción */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {cat && (
                  <Link to={`/productos?categoria=${cat.id}`}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-gradient-to-r ${cat.color} text-white hover:brightness-110 transition-all`}>
                    {cat.emoji} {cat.name}
                  </Link>
                )}
                {product.subcat && (
                  <span className="text-xs text-slate-400 font-medium px-3 py-1.5 rounded-full"
                    style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.09)" }}>
                    {product.subcat}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-2.5 flex-wrap">
                <Stars rating={product.rating} size="md" />
                <span className="text-amber-400 font-black">{product.rating}</span>
                <span className="text-slate-600 text-sm">({product.reviews} reseñas)</span>
                {isLow && <span className="text-orange-400 text-xs font-bold">⚡ ¡Últimas unidades!</span>}
              </div>

              <p className="text-slate-400 text-[15px] leading-relaxed">{product.description}</p>
            </div>

            {/* 2 · Precio */}
            <div className="py-4 px-5 rounded-2xl"
              style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)" }}>
              <div className="bb text-5xl text-amber-400 leading-none">S/.{product.price}</div>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-slate-500 line-through text-sm">S/.{product.oldPrice}</span>
                <span className="text-xs font-black text-rose-400 bg-rose-500/10 px-2 py-[2px] rounded-full">
                  −{disc}%
                </span>
                <span className="text-xs font-bold text-emerald-400">Ahorras S/.{saving}</span>
              </div>
            </div>

            {/* 3 · Cantidad + botones — desktop únicamente (mobile usa barra fija) */}
            <div className="hidden lg:flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <span className="text-slate-400 text-sm font-semibold">Cantidad</span>
                <QtySelector qty={qty} setQty={setQty} stock={product.stock} />
                {qty > 1 && (
                  <span className="text-sm text-slate-500">
                    Total <span className="text-amber-400 font-black">S/.{total}</span>
                  </span>
                )}
              </div>
              <div className="flex w-full space-x-10">
                <button onClick={handleAdd}
                className={`w-full py-4 rounded-2xl font-black text-base transition-all active:scale-[.98]
                  ${added
                    ? "bg-emerald-500 text-white"
                    : "bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:brightness-110 cta-glow"
                  }`}>
                {added ? "✓ Agregado al carrito" : `🛒 Agregar al carrito${qty > 1 ? ` · S/.${total}` : ""}`}
              </button>

              <a href={`https://wa.me/51999999999?text=${waMsg}`} target="_blank" rel="noreferrer"
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-black text-base text-white transition-all active:scale-[.98] hover:brightness-110"
                style={{ background: "#1da851" }}>
                <IcoWA /> Pedir por WhatsApp
              </a>
              </div>
            </div>

            {/* ── divisor ── */}
            <div className="h-px bg-white/[.06]" />

            {/* 4 · Tabs */}
            <div className="space-y-4">
              <div className="flex gap-1.5 flex-wrap">
                {TABS.map((t) => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all
                      ${tab === t.id
                        ? "bg-amber-500/12 text-amber-400 border border-amber-500/25"
                        : "text-slate-500 hover:text-white hover:bg-white/5"}`}>
                    {t.label}
                  </button>
                ))}
              </div>

              <div key={tab} className="tab-in">
                {tab === "info" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.features.map((f) => (
                      <div key={f.label} className="flex gap-3 px-4 py-3 rounded-xl hover:bg-white/4 transition-colors"
                        style={{ border: "1px solid rgba(255,255,255,.06)" }}>
                        <span className="text-amber-500 text-xs font-black uppercase tracking-wide shrink-0 w-[80px] leading-relaxed pt-px">
                          {f.label}
                        </span>
                        <span className="text-slate-300 text-sm leading-relaxed">{f.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {tab === "incluye" && (
                  <ul className="space-y-2.5">
                    {product.includes.map((item, i) => (
                      <li key={i} className="flex items-center gap-3 group">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors"
                          style={{ background: "rgba(52,211,153,.08)", border: "1px solid rgba(52,211,153,.2)" }}>
                          ✓
                        </span>
                        <span className="text-slate-300 text-sm group-hover:text-white transition-colors">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {tab === "grado" && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-2.5">
                        Nivel educativo recomendado
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {product.forGrade.map((g) => (
                          <span key={g} className="text-sm text-slate-200 font-semibold px-3.5 py-1.5 rounded-xl transition-colors"
                            style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)" }}>
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                    {product.colors?.length > 0 && (
                      <div>
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-2.5">
                          Versiones disponibles
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {product.colors.map((c, i) => (
                            <span key={i} className="text-xs text-slate-400 hover:text-amber-300 font-medium px-3.5 py-1.5 rounded-xl cursor-pointer transition-all"
                              style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}>
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

            {/* ── divisor ── */}
            <div className="h-px bg-white/[.06]" />

            {/* 5 · Trust badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { e: "🚚", t: "Delivery <24h",    d: "En Ayacucho"   },
                { e: "🔒", t: "Pago seguro",       d: "Varios métodos"},
                { e: "↩️",  t: "Devolución fácil", d: "7 días"        },
                { e: "💬", t: "Soporte 24/7",      d: "Por WhatsApp"  },
              ].map((b) => (
                <div key={b.t} className="flex flex-col items-center text-center gap-1 px-2 py-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)" }}>
                  <span className="text-xl">{b.e}</span>
                  <span className="text-white font-bold text-[11px] leading-tight">{b.t}</span>
                  <span className="text-slate-600 text-[10px] leading-tight">{b.d}</span>
                </div>
              ))}
            </div>

            {/* 6 · Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <Link key={tag} to={`/productos?q=${encodeURIComponent(tag)}`}
                    className="text-[11px] text-slate-600 hover:text-amber-400 font-semibold px-2.5 py-1 rounded-lg transition-all"
                    style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)" }}>
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* 7 · Navegación */}
            <div className="flex items-center gap-3 flex-wrap text-sm">
              <button onClick={() => navigate(-1)}
                className="text-slate-500 hover:text-amber-400 font-bold transition-colors">
                ← Volver
              </button>
              <span className="text-white/10">·</span>
              <Link to="/productos" className="text-slate-500 hover:text-amber-400 font-bold transition-colors">
                Ver catálogo
              </Link>
              {cat && <>
                <span className="text-white/10">·</span>
                <Link to={`/productos?categoria=${cat.id}`}
                  className="text-slate-500 hover:text-amber-400 font-bold transition-colors">
                  {cat.emoji} {cat.name}
                </Link>
              </>}
            </div>
          </div>
        </div>

        {/* ── Productos relacionados ── */}
        {related.length > 0 && (
          <section className={`rv rv-d2 ${reveal ? "on" : ""} mt-16 pt-10 border-t border-white/[.06]`}>
            <div className="flex items-center justify-between mb-7">
              <div>
                <h2 className="bb text-2xl sm:text-3xl text-white">TAMBIÉN TE PUEDE INTERESAR</h2>
                <p className="text-slate-600 text-sm mt-0.5">{cat?.emoji} Más de {cat?.name}</p>
              </div>
              <Link to={`/productos?categoria=${product.category}`}
                className="text-amber-400 hover:text-amber-300 text-sm font-bold transition-colors shrink-0">
                Ver todos →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {related.map((p) => <RelatedCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>

      {/* ════════════════════════════════════════════════════
          BARRA FIJA MOBILE
      ════════════════════════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
        style={{ background: "rgba(6,16,30,.98)", backdropFilter: "blur(24px)", borderTop: "1px solid rgba(255,255,255,.08)" }}>

        {/* Precios */}
        <div className="flex items-center justify-between px-4 pt-2.5 pb-1.5">
          {/* Unitario */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-[10px] text-slate-600 font-semibold uppercase tracking-wide">c/u</span>
            <span className="bb text-[1.45rem] text-amber-400 leading-none">S/.{product.price}</span>
            <span className="text-slate-600 text-xs line-through">S/.{product.oldPrice}</span>
            <span className="text-rose-400 text-[10px] font-black bg-rose-500/10 px-1.5 py-[1px] rounded-full">−{disc}%</span>
          </div>
          {/* Total (solo si qty > 1) */}
          {qty > 1 ? (
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block leading-none mb-[2px]">Total · {qty} und.</span>
              <span className="bb text-[1.45rem] text-white leading-none">S/.{total}</span>
            </div>
          ) : (
            <span className="text-[10px] text-slate-600">Selecciona cantidad →</span>
          )}
        </div>

        {/* Controles */}
        <div className="flex items-center gap-2 px-4 pb-3">
          {/* Selector qty */}
          <QtySelector qty={qty} setQty={setQty} stock={product.stock} />

          {/* Botón carrito */}
          <button onClick={handleAdd}
            className={`flex-1 h-11 rounded-xl font-black text-sm transition-all active:scale-[.97]
              ${added
                ? "bg-emerald-500 text-white"
                : "bg-gradient-to-r from-amber-500 to-orange-500 text-black"
              }`}>
            {added ? "✓ Agregado" : "🛒 Agregar"}
          </button>

          {/* WhatsApp */}
          <a href={`https://wa.me/51999999999?text=${waMsg}`} target="_blank" rel="noreferrer"
            className="w-11 h-11 flex items-center justify-center rounded-xl text-white shrink-0 transition-all active:scale-90"
            style={{ background: "#1da851" }}>
            <IcoWA />
          </a>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RELATED CARD
// ─────────────────────────────────────────────────────────────────────────────
function RelatedCard({ product }) {
  const navigate      = useNavigate();
  const { addToCart } = useCart();
  const [added,  setAdded]  = useState(false);
  const [imgErr, setImgErr] = useState(false);

  const cat    = CATEGORIES.find((c) => c.id === product.category);
  const disc   = discPct(product);
  const hasImg = product.image && !imgErr;

  return (
    <div onClick={() => navigate(`/producto/${product.id}`)}
      className="rc group cursor-pointer rounded-2xl overflow-hidden flex flex-col"
      style={{ background: "#0e1c2e", border: "1px solid rgba(255,255,255,.07)" }}>

      {/* imagen / emoji */}
      <div className="relative aspect-square overflow-hidden shrink-0"
        style={{ background: "rgba(255,255,255,.03)" }}>
        {hasImg ? (
          <img src={product.image} alt={product.name}
            onError={() => setImgErr(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl sm:text-5xl select-none group-hover:scale-110 transition-transform duration-300">
              {product.emoji}
            </span>
          </div>
        )}
        <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-black px-1.5 py-[2px] rounded-full">
          −{disc}%
        </span>
        {product.isNew && (
          <span className="absolute top-7 left-2 text-white text-[10px] font-black px-1.5 py-[2px] rounded-full"
            style={{ background: "linear-gradient(135deg,#0ea5e9,#818cf8)" }}>
            NEW
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>
      </div>

      {/* info */}
      <div className="p-3 flex flex-col flex-1 gap-1.5">
        <span className={`self-start text-[10px] font-bold px-2 py-[2px] rounded-full bg-gradient-to-r ${cat?.color ?? "from-slate-500 to-slate-600"} text-white`}>
          {cat?.emoji} {product.subcat ?? cat?.name}
        </span>
        <h3 className="font-bold text-white text-xs sm:text-[13px] leading-snug group-hover:text-amber-100 transition-colors"
          style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "2.4rem" }}>
          {product.name}
        </h3>
        <Stars rating={product.rating} size="sm" />
        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <div>
            <div className="text-amber-400 font-black text-sm">S/.{product.price}</div>
            <div className="text-slate-600 text-[10px] line-through">S/.{product.oldPrice}</div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
              setAdded(true);
              setTimeout(() => setAdded(false), 1000);
            }}
            className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all active:scale-90
              ${added ? "bg-emerald-500 text-white" : "bg-amber-500 hover:bg-amber-400 text-black"}`}>
            {added ? "✓" : "+ Añadir"}
          </button>
        </div>
      </div>
    </div>
  );
}
