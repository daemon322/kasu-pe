import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./views/home/Home";
import ProductsPage from "./views/produtcs/ProductsPage";
import ProductPage from "./views/produtcs/ProductPage";
import { CartProvider, Navbar, SearchProvider } from "./components/layouts/Navbar";
import { PRODUCTS } from "./data/products";
import ScrollToTop from "./components/layouts/ScrollTop";
import { Footer } from "./components/layouts/Footer";
import SearchPage from "./views/search/SearchPage";

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
            <Route path="/producto/:id" element={<ProductPage />} />
            <Route path="/buscar" element={<SearchPage />} />
          </Routes>
          <Footer />
        </Router>
      </CartProvider>
    </SearchProvider>
  );
}
