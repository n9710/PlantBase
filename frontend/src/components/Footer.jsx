/**
 * Footer — Enhanced with BRAND_NAME from constants
 */
import { Link } from 'react-router-dom';
import { Leaf, Heart } from 'lucide-react';
import { BRAND_NAME, BRAND_EMAIL, BRAND_COPYRIGHT, BRAND_TAGLINE } from '../constants';

export default function Footer() {
  // Split brand name for coloring
  const brandParts = BRAND_NAME.length > 4
    ? [BRAND_NAME.slice(0, Math.ceil(BRAND_NAME.length / 2)), BRAND_NAME.slice(Math.ceil(BRAND_NAME.length / 2))]
    : [BRAND_NAME, ''];

  return (
    <footer className="border-t mt-auto" style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3 group">
              <Leaf className="w-5 h-5 text-[var(--pb-accent)] group-hover:rotate-12 transition-transform" />
              <span className="text-lg font-bold tracking-tight">
                <span style={{ color: 'var(--pb-accent)' }}>{brandParts[0]}</span>
                <span style={{ color: 'var(--pb-secondary)' }}>{brandParts[1]}</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--pb-text-secondary)' }}>
              {BRAND_TAGLINE}. Discover handcrafted plant-based products from local communities across India.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/products', label: 'Shop' },
                { to: '/blog', label: 'Blog' },
                { to: '/cart', label: 'Cart' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm hover:underline transition" style={{ color: 'var(--pb-text-secondary)' }}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2">
              {[
                { to: '/seller/apply', label: 'Become a Seller' },
                { to: '/contact', label: 'Contact Us' },
                { to: '/privacy', label: 'Privacy Policy' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm hover:underline transition" style={{ color: 'var(--pb-text-secondary)' }}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Support</h4>
            <p className="text-sm mb-1" style={{ color: 'var(--pb-text-secondary)' }}>📧 {BRAND_EMAIL}</p>
            <p className="text-sm mb-1" style={{ color: 'var(--pb-text-secondary)' }}>📞 +91 98765 43210</p>
            <p className="text-sm" style={{ color: 'var(--pb-text-secondary)' }}>Mon–Sat, 9 AM – 6 PM IST</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderColor: 'var(--pb-border)' }}>
          <p className="text-xs" style={{ color: 'var(--pb-text-secondary)' }}>{BRAND_COPYRIGHT}</p>
          <p className="text-xs flex items-center gap-1" style={{ color: 'var(--pb-text-secondary)' }}>
            Made with <Heart className="w-3 h-3" style={{ color: 'var(--pb-danger)' }} /> for the planet
          </p>
        </div>
      </div>
    </footer>
  );
}
