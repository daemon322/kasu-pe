import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/layouts/ScrollTop";

// Vistas
import Home from "./views/home/Home";

// Layout
import {
  Navbar,
  CartProvider,
  SearchProvider,
} from "./components/layouts/Navbar";
import { Footer } from "./components/layouts/Footer";

// Datos centralizados
import { PRODUCTS } from "./data/products";
import ProductsPage from "./views/produtcs/Productspage";

export default function App() {
  return (
    <SearchProvider products={PRODUCTS}>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/productos" element={<ProductsPage />} />
          </Routes>
          <Footer />
        </Router>
      </CartProvider>
    </SearchProvider>
  );
}
