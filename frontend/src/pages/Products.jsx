import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import SEOHead from '../components/SEOHead';
import { useTheme } from '../context/ThemeContext';
import { Search, SlidersHorizontal, X, Leaf } from 'lucide-react';

export default function Products() {
  const { theme } = useTheme();
  const dark = theme === 'dark' || theme === 'nature';
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [sort, setSort] = useState(searchParams.get('sort') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  // Fetch categories
  useEffect(() => {
    api.get('/categories').then(res => {
      setCategories(res.data?.data || res.data || []);
    }).catch(() => {});
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category && category !== 'All') params.set('category', category);
      if (sort) params.set('sort', sort);
      params.set('page', page);
      params.set('limit', 12);

      const { data } = await api.get(`/products?${params.toString()}`);
      const result = data?.data || data;
      setProducts(result.products || []);
      setTotal(result.total || 0);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, page]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, category, sort]);

  useEffect(() => { fetchProducts(); }, [page]);

  // Sync URL params
  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (category !== 'All') params.category = category;
    if (sort) params.sort = sort;
    if (page > 1) params.page = page;
    setSearchParams(params, { replace: true });
  }, [search, category, sort, page]);

  const clearFilters = () => {
    setSearch('');
    setCategory('All');
    setSort('');
    setPage(1);
  };

  const hasFilters = search || category !== 'All' || sort;

  const sortOptions = [
    { value: '', label: 'Default' },
    { value: 'price_low', label: 'Price: Low → High' },
    { value: 'price_high', label: 'Price: High → Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'popular', label: 'Most Popular' },
  ];

  return (
    <div className="min-h-screen px-4 py-8">
      <SEOHead page="products" />
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6 animate-fade-up">
          <h1 className="text-3xl font-display font-bold">Shop</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--pb-text-secondary)' }}>
            {loading ? 'Loading...' : `Showing ${products.length} of ${total} products`}
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8 animate-fade-up delay-100">

          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: 'var(--pb-text-secondary)' }} />
            <input
              type="text"
              placeholder="Search products, ingredients..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2"
              style={{
                backgroundColor: 'var(--pb-surface)',
                borderColor: 'var(--pb-border)',
                color: 'var(--pb-text)',
                '--tw-ring-color': 'var(--pb-accent)',
              }}
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--pb-text-secondary)' }}>
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category select */}
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="px-4 py-3 rounded-xl border text-sm outline-none cursor-pointer"
            style={{
              backgroundColor: 'var(--pb-surface)',
              borderColor: 'var(--pb-border)',
              color: 'var(--pb-text)',
            }}
          >
            <option value="All">All Categories</option>
            {categories.map(c => (
              <option key={c._id} value={c.name}>{c.name}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="px-4 py-3 rounded-xl border text-sm outline-none cursor-pointer"
            style={{
              backgroundColor: 'var(--pb-surface)',
              borderColor: 'var(--pb-border)',
              color: 'var(--pb-text)',
            }}
          >
            {sortOptions.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          {/* Clear filters */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-3 rounded-xl border text-sm font-medium flex items-center gap-1.5 transition-all"
              style={{ borderColor: 'var(--pb-border)', color: 'var(--pb-text-secondary)' }}
            >
              <X className="w-4 h-4" /> Clear
            </button>
          )}
        </div>

        {/* Active filters display */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {search && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: dark ? 'rgba(168,204,0,0.15)' : 'rgba(141,182,0,0.1)', color: 'var(--pb-accent)' }}>
                Search: "{search}"
                <button onClick={() => setSearch('')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {category !== 'All' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: dark ? 'rgba(168,204,0,0.15)' : 'rgba(141,182,0,0.1)', color: 'var(--pb-accent)' }}>
                {category}
                <button onClick={() => setCategory('All')}><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 stagger">
            {products.map(p => <ProductCard key={p._id} product={p} dark={dark} />)}
          </div>
        ) : (
          <div className="text-center py-20 animate-fade-up">
            <Leaf className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--pb-text-secondary)' }} />
            <h2 className="text-xl font-display font-bold mb-2">No products found</h2>
            <p className="text-sm" style={{ color: 'var(--pb-text-secondary)' }}>
              Try adjusting your search or filters
            </p>
            {hasFilters && (
              <button onClick={clearFilters}
                className="mt-4 btn-accent px-6 py-2 rounded-xl text-sm">
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && total > 12 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array(Math.ceil(total / 12)).fill(0).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className="w-10 h-10 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: page === i + 1 ? 'var(--pb-accent)' : 'var(--pb-surface)',
                  color: page === i + 1 ? '#fff' : 'var(--pb-text)',
                  border: `1px solid ${page === i + 1 ? 'var(--pb-accent)' : 'var(--pb-border)'}`,
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}