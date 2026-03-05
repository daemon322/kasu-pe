import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// Datos centralizados
import Home from "./views/home/Home";
import ScrollToTop from "./components/layouts/ScrollTop";
import ProductsPag from "./views/produtcs/ProductsPag";
import { PRODUCTS } from "./data/products";
import { CartProvider, Navbar, SearchProvider } from "./components/layouts/Navbar";
import { Footer } from "./components/layouts/Footer";


export default function App() {
  return (
    <SearchProvider products={PRODUCTS}>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/productos" element={<ProductsPag />} />
          </Routes>
          <Footer />
        </Router>
      </CartProvider>
    </SearchProvider>
  );
}
