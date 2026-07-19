/**
 * Home — Premium landing page with BRAND_NAME
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import SEOHead from '../components/SEOHead';
import { BRAND_NAME, BRAND_TAGLINE, TRUST_BADGES } from '../constants';
import { Leaf, ArrowRight, Shield, Truck, Heart, Sparkles, Star, Lock, RotateCcw, Users, TrendingUp } from 'lucide-react';

const iconMap = { Shield, Truck, Heart, Leaf, Lock, RotateCcw };

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products?featured=true&limit=8'),
          api.get('/categories'),
        ]);
        setFeatured(prodRes.data?.data?.products || prodRes.data?.products || []);
        setCategories(catRes.data?.data || catRes.data || []);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const brandParts = BRAND_NAME.length > 4
    ? [BRAND_NAME.slice(0, Math.ceil(BRAND_NAME.length / 2)), BRAND_NAME.slice(Math.ceil(BRAND_NAME.length / 2))]
    : [BRAND_NAME, ''];

  return (
    <div className="min-h-screen">
      <SEOHead page="home" />

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden px-4 py-20 sm:py-28">
        {/* Animated gradient bg */}
        <div className="absolute inset-0 opacity-30" style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(141,182,0,0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(160,82,45,0.1) 0%, transparent 50%)'
        }} />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 relative">
          <div className="flex-1 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{ backgroundColor: 'rgba(141,182,0,0.12)', color: 'var(--pb-accent)' }}>
              <Sparkles className="w-3.5 h-3.5" /> 100% Plant-Based · Certified Organic
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6">
              {BRAND_TAGLINE.split(',')[0]},
              <br />
              <span style={{ color: 'var(--pb-accent)' }}>{BRAND_TAGLINE.split(',')[1] || 'Delivered to You'}</span>
            </h1>

            <p className="text-lg max-w-lg mb-8" style={{ color: 'var(--pb-text-secondary)' }}>
              Discover handcrafted plant-based products from local communities across India. Premium organic hair care, skin care, herbal supplements and more — all on {BRAND_NAME}.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to="/products" className="btn-accent px-8 py-3.5 rounded-xl flex items-center gap-2 text-sm">
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/seller/apply" className="px-8 py-3.5 rounded-xl text-sm font-semibold border transition-all hover:scale-[1.02]"
                style={{ borderColor: 'var(--pb-border)', color: 'var(--pb-text)' }}>
                Become a Seller
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-6 mt-10 text-xs font-medium" style={{ color: 'var(--pb-text-secondary)' }}>
              {TRUST_BADGES.slice(0, 3).map(badge => {
                const Icon = iconMap[badge.icon] || Leaf;
                return (
                  <span key={badge.label} className="flex items-center gap-1.5">
                    <Icon className="w-4 h-4" style={{ color: 'var(--pb-accent)' }} /> {badge.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Hero visual */}
          <div className="flex-1 max-w-md animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl opacity-20 blur-3xl" style={{ backgroundColor: 'var(--pb-accent)' }} />
              <div className="relative grid grid-cols-2 gap-3">
                {['🧴 Hair Oil', '🌿 Skin Care', '💄 Lip Care', '💊 Supplements'].map((name, i) => (
                  <div key={name} className="rounded-2xl overflow-hidden aspect-square border flex items-center justify-center card-lift"
                    style={{ borderColor: 'var(--pb-border)', backgroundColor: 'var(--pb-surface)' }}>
                    <div className="text-center p-4">
                      <span className="text-3xl">{name.split(' ')[0]}</span>
                      <p className="text-xs font-semibold mt-2">{name.split(' ').slice(1).join(' ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="px-4 py-8">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
          {[
            { value: '500+', label: 'Products', icon: <Leaf className="w-5 h-5" /> },
            { value: '50+', label: 'Verified Sellers', icon: <Users className="w-5 h-5" /> },
            { value: '10K+', label: 'Happy Customers', icon: <Heart className="w-5 h-5" /> },
            { value: '4.8★', label: 'Average Rating', icon: <Star className="w-5 h-5" /> },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border p-5 text-center card-lift"
              style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
              <div className="mx-auto w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: 'rgba(141,182,0,0.1)', color: 'var(--pb-accent)' }}>
                {s.icon}
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--pb-text-secondary)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section id="categories" className="px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-display font-bold">Shop by Category</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--pb-text-secondary)' }}>Find exactly what you're looking for</p>
            </div>
            <Link to="/products" className="text-sm font-semibold flex items-center gap-1 transition-all hover:gap-2" style={{ color: 'var(--pb-accent)' }}>
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 stagger">
            {categories.map(cat => (
              <Link key={cat._id} to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="rounded-2xl p-5 text-center border transition-all hover:scale-[1.03] group card-lift"
                style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
                <Leaf className="w-8 h-8 mx-auto mb-2 group-hover:rotate-12 transition-transform" style={{ color: 'var(--pb-accent)' }} />
                <p className="text-sm font-semibold">{cat.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED PRODUCTS ─── */}
      <section className="px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-display font-bold">Featured Products</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--pb-text-secondary)' }}>Handpicked by our community</p>
            </div>
            <Link to="/products" className="text-sm font-semibold flex items-center gap-1 transition-all hover:gap-2" style={{ color: 'var(--pb-accent)' }}>
              See All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 stagger">
            {loading ? Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />) : featured.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
          {!loading && featured.length === 0 && (
            <div className="text-center py-16">
              <Leaf className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--pb-text-secondary)' }} />
              <p className="font-bold text-lg">No featured products yet</p>
              <p className="text-sm mt-1" style={{ color: 'var(--pb-text-secondary)' }}>Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── WHY BRAND ─── */}
      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold mb-10">Why {BRAND_NAME}?</h2>
          <div className="grid sm:grid-cols-3 gap-6 stagger">
            {[
              { icon: <Leaf className="w-8 h-8" />, title: 'Certified Organic', desc: 'Every product is verified organic and free from harmful chemicals.' },
              { icon: <Shield className="w-8 h-8" />, title: 'Seller Verified', desc: 'All sellers are vetted and approved before listing products.' },
              { icon: <Heart className="w-8 h-8" />, title: 'Community First', desc: 'Supporting local communities and traditional craft across India.' },
            ].map(f => (
              <div key={f.title} className="rounded-2xl border p-6 card-lift" style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
                <div className="mx-auto w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'rgba(141,182,0,0.1)', color: 'var(--pb-accent)' }}>{f.icon}</div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm" style={{ color: 'var(--pb-text-secondary)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="px-4 py-16">
        <div className="max-w-4xl mx-auto rounded-3xl p-10 text-center relative overflow-hidden"
          style={{ backgroundColor: 'var(--pb-accent)' }}>
          <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.3), transparent 60%)' }} />
          <div className="relative">
            <h2 className="text-3xl font-display font-bold text-white mb-4">Start Selling on {BRAND_NAME}</h2>
            <p className="text-white/80 max-w-lg mx-auto mb-6">Join our community of 50+ verified sellers. List your organic products and reach thousands of conscious consumers.</p>
            <Link to="/seller/apply" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-sm font-bold transition-all hover:scale-105"
              style={{ color: 'var(--pb-accent)' }}>
              <TrendingUp className="w-4 h-4" /> Apply Now — It's Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}