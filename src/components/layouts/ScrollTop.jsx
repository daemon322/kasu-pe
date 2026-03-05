// components/ScrollToTop.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Desplazar al inicio de la página
    window.scrollTo(0, 0);
    
    // Opcional: También desplazar al elemento con id "top"
    // document.getElementById('top')?.scrollIntoView();
  }, [pathname]); // Se ejecuta cada vez que cambia la ruta

  return null; // Este componente no renderiza nada
};

export default ScrollToTop;