import React from "react";

export const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">✏️</span>
              <span className="bebas text-xl text-amber-400">ESCOLARTE</span>
            </div>
            <p className="text-slate-400 text-sm">
              Tu tienda de útiles escolares de confianza en Ayacucho y todo el
              Perú.
            </p>
          </div>
          {[
            {
              title: "Productos",
              links: ["Cuadernos", "Arte & Color", "Mochilas", "Geometría"],
            },
            {
              title: "Empresa",
              links: [
                "Sobre nosotros",
                "Política de envío",
                "Devoluciones",
                "Contacto",
              ],
            },
            {
              title: "Ayuda",
              links: [
                "WhatsApp",
                "Preguntas frecuentes",
                "Seguimiento de pedido",
                "Instituciones",
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-bold text-white mb-3">{col.title}</h4>
              <div className="space-y-2">
                {col.links.map((l) => (
                  <div
                    key={l}
                    className="text-slate-400 hover:text-amber-400 cursor-pointer text-sm transition-colors"
                  >
                    {l}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <span>© 2025 EscolArte. Todos los derechos reservados.</span>
          <div className="flex gap-4">
            <span>💳 Yape</span>
            <span>💳 Plin</span>
            <span>💳 Transferencia</span>
            <span>💳 Contra entrega</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
