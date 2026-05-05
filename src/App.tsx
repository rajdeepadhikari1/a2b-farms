import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminStories from './pages/admin/AdminStories';
import AdminBlogs from './pages/admin/AdminBlogs';
import AdminInventory from './pages/admin/AdminInventory';
import AdminMessages from './pages/admin/AdminMessages';
import ProtectedRoute from './components/ProtectedRoute';
import { authService } from './services/authService';
import { ShopProvider } from './context/ShopContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { LanguageProvider } from './context/LanguageContext';
import { motion } from 'motion/react';

// WhatsApp Floating Button
// ... (omitting for brevity in thought, but tool requires exact match)
const WhatsAppButton = () => (
  <a
    href="https://wa.me/919876543210"
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-8 left-8 z-[90] p-4 bg-green-500 text-white rounded-full shadow-2xl hover:bg-green-600 transition-all hover:scale-110 active:scale-95 group"
  >
    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.445 0 .041 5.404.038 12.01c0 2.112.553 4.174 1.604 6.006L0 24l6.144-1.612a11.77 11.77 0 005.908 1.62h.008c6.605 0 12.01-5.404 12.013-12.012a11.82 11.82 0 00-3.414-8.414" />
    </svg>
    <span className="absolute left-full ml-4 bg-stone-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded hidden group-hover:block whitespace-nowrap">
      Chat with us
    </span>
  </a>
);

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ShopProvider>
          <WishlistProvider>
            <Router>
              <div className="flex flex-col min-h-screen selection:bg-green-100 selection:text-green-900">
                <Navbar />
                <CartDrawer />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-success" element={<OrderSuccess />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:id" element={<BlogDetail />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/admin" element={
                      <ProtectedRoute requireAdmin={true}>
                        <AdminLayout />
                      </ProtectedRoute>
                    }>
                      <Route index element={<AdminDashboard />} />
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="inventory" element={<AdminInventory />} />
                      <Route path="stories" element={<AdminStories />} />
                      <Route path="blogs" element={<AdminBlogs />} />
                      <Route path="messages" element={<AdminMessages />} />
                    </Route>
                  </Routes>
                </main>
                <Footer />
                <WhatsAppButton />
              </div>
            </Router>
          </WishlistProvider>
        </ShopProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
