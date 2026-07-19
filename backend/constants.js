/**
 * ═══════════════════════════════════════════════════════════════
 *  BRAND CONSTANTS — Single Source of Truth
 *  Change BRAND_NAME here and the ENTIRE platform updates.
 * ═══════════════════════════════════════════════════════════════
 */

const BRAND_NAME = "VanaRoots";

// ── Derived constants (all auto-generated from BRAND_NAME) ──
const BRAND_SLUG = BRAND_NAME.toLowerCase().replace(/\s+/g, '-');
const BRAND_DOMAIN = `${BRAND_SLUG}.com`;
const BRAND_EMAIL = `support@${BRAND_DOMAIN}`;
const BRAND_NOREPLY_EMAIL = `noreply@${BRAND_DOMAIN}`;
const BRAND_TAGLINE = "Nature's Best, Delivered to You";
const BRAND_DESCRIPTION = `${BRAND_NAME} is a marketplace for plant-based, organic, and eco-friendly products from local sellers across India.`;
const BRAND_COPYRIGHT = `© ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.`;

// ── Commission & Business ──
const DEFAULT_COMMISSION_RATE = 10; // percentage
const FREE_SHIPPING_THRESHOLD = 499; // INR
const DEFAULT_SHIPPING_COST = 49; // INR
const REFERRAL_REWARD_AMOUNT = 50; // INR wallet credit
const MIN_PAYOUT_AMOUNT = 500; // INR

// ── Subscription Plans ──
const SELLER_PLANS = {
  free: { name: 'Free', price: 0, maxProducts: 10, commission: 15, features: ['Basic dashboard', '10 product listings'] },
  starter: { name: 'Starter', price: 499, maxProducts: 50, commission: 10, features: ['50 products', 'Analytics', 'Priority support'] },
  pro: { name: 'Pro', price: 1499, maxProducts: 500, commission: 7, features: ['500 products', 'Advanced analytics', 'Featured listings', 'Priority support'] },
  enterprise: { name: 'Enterprise', price: 4999, maxProducts: Infinity, commission: 5, features: ['Unlimited products', 'Custom branding', 'API access', 'Dedicated manager'] },
};

// ── Order Statuses ──
const ORDER_STATUSES = [
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
const PRODUCT_CATEGORIES = [
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

// ── Courier Partners (Phase 2 logistics) ──
const COURIER_PARTNERS = [
  { id: 'shiprocket', name: 'Shiprocket', tracking_url: 'https://shiprocket.co/tracking/' },
  { id: 'delhivery', name: 'Delhivery', tracking_url: 'https://www.delhivery.com/track/package/' },
  { id: 'bluedart', name: 'Blue Dart', tracking_url: 'https://www.bluedart.com/tracking/' },
  { id: 'dtdc', name: 'DTDC', tracking_url: 'https://www.dtdc.in/tracking/' },
  { id: 'manual', name: 'Self Shipping', tracking_url: '' },
];

module.exports = {
  BRAND_NAME,
  BRAND_SLUG,
  BRAND_DOMAIN,
  BRAND_EMAIL,
  BRAND_NOREPLY_EMAIL,
  BRAND_TAGLINE,
  BRAND_DESCRIPTION,
  BRAND_COPYRIGHT,
  DEFAULT_COMMISSION_RATE,
  FREE_SHIPPING_THRESHOLD,
  DEFAULT_SHIPPING_COST,
  REFERRAL_REWARD_AMOUNT,
  MIN_PAYOUT_AMOUNT,
  SELLER_PLANS,
  ORDER_STATUSES,
  PRODUCT_CATEGORIES,
  COURIER_PARTNERS,
};
