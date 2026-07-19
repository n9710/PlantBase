/**
 * ═══════════════════════════════════════════════════════════════
 *  BRAND CONSTANTS — Frontend Single Source of Truth
 *  Change BRAND_NAME here and the ENTIRE UI updates everywhere:
 *  Navbar, Footer, Meta titles, Login/Register, Dashboards, etc.
 * ═══════════════════════════════════════════════════════════════
 */
export const BRAND_NAME = "PlantBase";
// ── Derived constants ──
export const BRAND_SLUG = BRAND_NAME.toLowerCase().replace(/\s+/g, '-');
export const BRAND_DOMAIN = `${BRAND_SLUG}.com`;
export const BRAND_EMAIL = `support@${BRAND_DOMAIN}`;
export const BRAND_TAGLINE = "Nature's Best, Delivered to You";
export const BRAND_DESCRIPTION = `${BRAND_NAME} is a marketplace for plant-based, organic, and eco-friendly products from local sellers across India.`;
export const BRAND_COPYRIGHT = `© ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.`;

// ── Page Titles (dynamic) ──
export const getPageTitle = (page) => page ? `${page} | ${BRAND_NAME}` : BRAND_NAME;
export const getMetaDescription = (page) => {
  const descriptions = {
    home: `${BRAND_NAME} — Shop plant-based, organic, and eco-friendly products from verified local sellers across India.`,
    products: `Browse organic & eco-friendly products on ${BRAND_NAME}. Herbal soaps, natural skincare, bamboo products & more.`,
    cart: `Your shopping cart — ${BRAND_NAME}`,
    login: `Sign in to ${BRAND_NAME} — Access your orders, wishlist, and eco-friendly marketplace.`,
    register: `Join ${BRAND_NAME} — Create your account and start shopping organic products.`,
    seller: `${BRAND_NAME} Seller Dashboard — Manage products, orders, and analytics.`,
    admin: `${BRAND_NAME} Admin Panel — Platform management and analytics.`,
    blog: `${BRAND_NAME} Blog — Sustainable living tips, eco-friendly lifestyle, and product guides.`,
    wishlist: `Your Wishlist — ${BRAND_NAME}`,
    orders: `Your Orders — ${BRAND_NAME}`,
    wallet: `${BRAND_NAME} Wallet — Rewards and referral credits.`,
    contact: `Contact ${BRAND_NAME} — We're here to help.`,
    privacy: `Privacy Policy — ${BRAND_NAME}`,
    checkout: `Checkout — ${BRAND_NAME}`,
  };
  return descriptions[page] || BRAND_DESCRIPTION;
};

// ── Business Constants ──
export const FREE_SHIPPING_THRESHOLD = 499;
export const DEFAULT_SHIPPING_COST = 49;
export const CURRENCY_SYMBOL = '₹';
export const CURRENCY_CODE = 'INR';

// ── Order Statuses ──
export const ORDER_STATUSES = [
  'Order Placed',
  'Confirmed',
  'Seller Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
  'Return Requested',
  'Returned',
  'Refunded'
];

// ── Product Categories ──
export const PRODUCT_CATEGORIES = [
  'Herbal Soaps',
  'Organic Fertilizer',
  'Bamboo Products',
  'Natural Skincare',
  'Ayurvedic Wellness',
  'Eco Cleaning',
  'Handmade Crafts',
  'Hair Care',
  'Lip Care',
  'Supplements',
  'Essential Oils',
  'Home Decor',
  'Kitchen Essentials',
  'Baby Care',
  'Pet Care'
];

// ── Seller Plans ──
export const SELLER_PLANS = {
  free: { name: 'Free', price: 0, maxProducts: 10, commission: 15, features: ['Basic dashboard', '10 product listings'] },
  starter: { name: 'Starter', price: 499, maxProducts: 50, commission: 10, features: ['50 products', 'Analytics', 'Priority support'] },
  pro: { name: 'Pro', price: 1499, maxProducts: 500, commission: 7, features: ['500 products', 'Advanced analytics', 'Featured listings', 'Priority support'] },
  enterprise: { name: 'Enterprise', price: 4999, maxProducts: Infinity, commission: 5, features: ['Unlimited products', 'Custom branding', 'API access', 'Dedicated manager'] },
};

// ── Trust Badges ──
export const TRUST_BADGES = [
  { icon: 'Shield', label: 'Verified Sellers' },
  { icon: 'Truck', label: `Free Shipping ₹${FREE_SHIPPING_THRESHOLD}+` },
  { icon: 'Heart', label: 'Supporting Communities' },
  { icon: 'Leaf', label: '100% Organic' },
  { icon: 'Lock', label: 'Secure Payments' },
  { icon: 'RotateCcw', label: 'Easy Returns' },
];

// ── Nav Links ──
export const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Shop' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
];
