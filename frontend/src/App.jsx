/**
 * App.jsx — VanaRoots Root Component
 * All routes, context providers, and global components
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import { WishlistProvider } from './context/WishlistContext';
import { NotificationProvider } from './context/NotificationContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIChatbot from './components/AIChatbot';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import SellerDashboard from './pages/SellerDashboard';
import MyOrders from './pages/MyOrders';
import OrderTracking from './pages/OrderTracking';
import Wishlist from './pages/Wishlist';
import WalletPage from './pages/Wallet';
import SellerOnboarding from './pages/SellerOnboarding';
import { BlogList, BlogPost } from './pages/Blog';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';

// Optional - imported with fallback
let ForgotPassword, ResetPassword, VerifyEmail;
try { ForgotPassword = require('./pages/ForgotPassword').default; } catch { ForgotPassword = () => <div className="p-8 text-center">Forgot Password page</div>; }
try { ResetPassword = require('./pages/ResetPassword').default; } catch { ResetPassword = () => <div className="p-8 text-center">Reset Password page</div>; }
try { VerifyEmail = require('./pages/VerifyEmail').default; } catch { VerifyEmail = () => <div className="p-8 text-center">Email Verification page</div>; }

// Route guards
function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="shimmer w-16 h-16 rounded-full" /></div>;
  return isLoggedIn ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="shimmer w-16 h-16 rounded-full" /></div>;
  return isAdmin ? children : <Navigate to="/" />;
}

function SellerRoute({ children }) {
  const { isSeller, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="shimmer w-16 h-16 rounded-full" /></div>;
  return isSeller ? children : <Navigate to="/" />;
}

function AppContent() {
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--pb-bg)', color: 'var(--pb-text)' }}>
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* Protected */}
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="/orders/:id/track" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
          <Route path="/seller/apply" element={<ProtectedRoute><SellerOnboarding /></ProtectedRoute>} />

          {/* Seller */}
          <Route path="/seller" element={<SellerRoute><SellerDashboard /></SellerRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />

          {/* 404 */}
          <Route path="*" element={
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="text-center">
                <p className="text-6xl mb-4">🌿</p>
                <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
                <p className="text-sm mb-6" style={{ color: 'var(--pb-text-secondary)' }}>The page you're looking for doesn't exist.</p>
                <a href="/" className="btn-accent px-6 py-2.5 rounded-xl text-sm">Go Home</a>
              </div>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
      <AIChatbot />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <CartProvider>
              <WishlistProvider>
                <NotificationProvider>
                  <AppContent />
                  <Toaster position="top-right" toastOptions={{
                    duration: 3000,
                    style: {
                      background: 'var(--pb-surface)',
                      color: 'var(--pb-text)',
                      border: '1px solid var(--pb-border)',
                      borderRadius: '12px',
                      fontSize: '14px',
                    },
                  }} />
                </NotificationProvider>
              </WishlistProvider>
            </CartProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}