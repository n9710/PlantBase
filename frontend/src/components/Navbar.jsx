/**
 * Navbar — Enhanced with BRAND_NAME, notifications, wishlist, search
 */
import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useWishlist } from '../context/WishlistContext';
import NotificationBell from './NotificationBell';
import { BRAND_NAME, NAV_LINKS } from '../constants';
import {
  Leaf, ShoppingCart, Sun, Moon, TreePine, Menu, X,
  User, LogOut, LayoutDashboard, UserCircle, Heart, Search, Wallet, Package
} from 'lucide-react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isLoggedIn, user, logout, isAdmin, isSeller } = useAuth();
  const { count } = useCart();
  const { count: wishCount } = useWishlist();
  const { theme, cycleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef();

  const dark = theme === 'dark';
  const nature = theme === 'nature';

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); setProfileOpen(false); navigate('/'); };
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  // Split brand name for coloring
  const brandParts = BRAND_NAME.length > 4
    ? [BRAND_NAME.slice(0, Math.ceil(BRAND_NAME.length / 2)), BRAND_NAME.slice(Math.ceil(BRAND_NAME.length / 2))]
    : [BRAND_NAME, ''];

  const ThemeIcon = () => {
    if (theme === 'dark') return <Moon className="w-5 h-5" />;
    if (theme === 'nature') return <TreePine className="w-5 h-5" />;
    return <Sun className="w-5 h-5" />;
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl border-b"
      style={{
        backgroundColor: dark ? 'rgba(26,17,10,0.92)' : nature ? 'rgba(240,247,230,0.92)' : 'rgba(253,250,244,0.92)',
        borderColor: 'var(--pb-border)',
      }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
            <Leaf className="w-6 h-6 text-[var(--pb-accent)] group-hover:rotate-12 transition-transform" />
            <span className="text-xl font-bold tracking-tight">
              <span style={{ color: 'var(--pb-accent)' }}>{brandParts[0]}</span>
              <span style={{ color: 'var(--pb-secondary)' }}>{brandParts[1]}</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <Link key={link.to} to={link.to}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  color: isActive(link.to) ? 'var(--pb-accent)' : 'var(--pb-text-secondary)',
                  backgroundColor: isActive(link.to) ? (dark ? 'rgba(168,204,0,0.1)' : nature ? 'rgba(230,168,23,0.1)' : 'rgba(141,182,0,0.08)') : 'transparent',
                }}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">

            {/* Search */}
            <div className="relative hidden sm:block">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center gap-1">
                  <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus
                    placeholder="Search products..."
                    className="w-44 px-3 py-1.5 rounded-lg text-sm border focus:outline-none"
                    style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)', color: 'var(--pb-text)' }} />
                  <button type="button" onClick={() => setSearchOpen(false)} className="p-1.5">
                    <X className="w-4 h-4" style={{ color: 'var(--pb-text-secondary)' }} />
                  </button>
                </form>
              ) : (
                <button onClick={() => setSearchOpen(true)} className="p-2 rounded-lg transition-all hover:scale-110" style={{ color: 'var(--pb-text-secondary)' }}>
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Theme */}
            <button onClick={cycleTheme} className="p-2 rounded-lg transition-all hover:scale-110 relative"
              style={{ color: 'var(--pb-text-secondary)' }} title={`Theme: ${theme}`}>
              <ThemeIcon />
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: theme === 'nature' ? '#4A7C3F' : theme === 'dark' ? '#A8CC00' : '#8DB600' }} />
            </button>

            {/* Wishlist */}
            {isLoggedIn && (
              <Link to="/wishlist" className="relative p-2 rounded-lg transition-all hover:scale-110" style={{ color: 'var(--pb-text-secondary)' }}>
                <Heart className="w-5 h-5" />
                {wishCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                    style={{ backgroundColor: 'var(--pb-danger)' }}>{wishCount > 9 ? '9+' : wishCount}</span>
                )}
              </Link>
            )}

            {/* Notifications */}
            {isLoggedIn && <NotificationBell />}

            {/* Cart */}
            <Link to="/cart" className="relative p-2 rounded-lg transition-all hover:scale-110" style={{ color: 'var(--pb-text-secondary)' }}>
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                  style={{ backgroundColor: 'var(--pb-accent)' }}>{count > 9 ? '9+' : count}</span>
              )}
            </Link>

            {/* User */}
            {isLoggedIn ? (
              <div className="relative" ref={profileRef}>
                <button onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm font-medium transition-all"
                  style={{ backgroundColor: 'var(--pb-surface)', color: 'var(--pb-text)' }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: 'var(--pb-accent)' }}>
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block max-w-[80px] truncate">{user?.name?.split(' ')[0]}</span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl border py-1 animate-slide-down"
                    style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
                    <div className="px-4 py-2.5 border-b" style={{ borderColor: 'var(--pb-border)' }}>
                      <p className="text-sm font-semibold truncate">{user?.name}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--pb-text-secondary)' }}>{user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: 'var(--pb-accent)', color: '#fff' }}>{user?.role}</span>
                    </div>

                    <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:opacity-80 transition" style={{ color: 'var(--pb-text)' }}>
                      <UserCircle className="w-4 h-4" /> My Profile
                    </Link>
                    <Link to="/orders" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:opacity-80 transition" style={{ color: 'var(--pb-text)' }}>
                      <Package className="w-4 h-4" /> My Orders
                    </Link>
                    <Link to="/wallet" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:opacity-80 transition" style={{ color: 'var(--pb-text)' }}>
                      <Wallet className="w-4 h-4" /> Wallet
                    </Link>

                    {isAdmin && (
                      <Link to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:opacity-80 transition" style={{ color: 'var(--pb-text)' }}>
                        <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    )}
                    {isSeller && !isAdmin && (
                      <Link to="/seller" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:opacity-80 transition" style={{ color: 'var(--pb-text)' }}>
                        <LayoutDashboard className="w-4 h-4" /> Seller Dashboard
                      </Link>
                    )}

                    <div className="border-t my-1" style={{ borderColor: 'var(--pb-border)' }} />
                    <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm transition" style={{ color: 'var(--pb-danger)' }}>
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{ backgroundColor: 'var(--pb-accent)', color: '#fff' }}>
                <User className="w-4 h-4" /> Login
              </Link>
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg transition" style={{ color: 'var(--pb-text-secondary)' }}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 animate-slide-down">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="mb-3">
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search products..."
                className="w-full px-4 py-2.5 rounded-lg text-sm border focus:outline-none"
                style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)', color: 'var(--pb-text)' }} />
            </form>
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map(link => (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-medium transition-all"
                  style={{
                    color: isActive(link.to) ? 'var(--pb-accent)' : 'var(--pb-text-secondary)',
                    backgroundColor: isActive(link.to) ? (dark ? 'rgba(168,204,0,0.1)' : 'rgba(141,182,0,0.08)') : 'transparent',
                  }}>{link.label}</Link>
              ))}
              {isLoggedIn && (
                <>
                  <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-lg text-sm font-medium" style={{ color: 'var(--pb-text-secondary)' }}>❤️ Wishlist</Link>
                  <Link to="/orders" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-lg text-sm font-medium" style={{ color: 'var(--pb-text-secondary)' }}>📦 My Orders</Link>
                  <Link to="/wallet" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-lg text-sm font-medium" style={{ color: 'var(--pb-text-secondary)' }}>💰 Wallet</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}