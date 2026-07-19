import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import SEOHead from '../components/SEOHead';
import { useTheme } from '../context/ThemeContext';
import { ShoppingCart, Star, MapPin, ArrowLeft, Leaf, Shield, Truck, Minus, Plus } from 'lucide-react';

export default function ProductDetail() {
  const { theme } = useTheme();
  const dark = theme === 'dark' || theme === 'nature';
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isLoggedIn, user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data?.data || data);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < qty; i++) addToCart(product);
    toast.success(`${product.name} × ${qty} added to cart`);
  };

  const handleReview = async () => {
    if (!reviewForm.comment.trim()) return toast.error('Please add a comment');
    setSubmitting(true);
    try {
      await api.post(`/products/${id}/review`, reviewForm);
      toast.success('Review submitted!');
      // Refresh product
      const { data } = await api.get(`/products/${id}`);
      setProduct(data?.data || data);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-up">
          <Leaf className="w-12 h-12 mx-auto mb-3 animate-pulse" style={{ color: 'var(--pb-accent)' }} />
          <p style={{ color: 'var(--pb-text-secondary)' }}>Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center animate-fade-up">
          <Leaf className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--pb-text-secondary)' }} />
          <h2 className="text-2xl font-display font-bold mb-2">Product not found</h2>
          <Link to="/products" className="btn-accent px-6 py-2 rounded-xl text-sm inline-flex items-center gap-2 mt-4">
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen px-4 py-8">
      <SEOHead title={product?.name} description={product?.description} />
      <div className="max-w-6xl mx-auto">

        {/* Back */}
        <Link to="/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 transition-all hover:gap-2.5"
          style={{ color: 'var(--pb-accent)' }}>
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>

        <div className="grid lg:grid-cols-2 gap-10 animate-fade-up">

          {/* Image */}
          <div className="relative rounded-2xl overflow-hidden border"
            style={{ borderColor: 'var(--pb-border)' }}>
            <img
              src={product.images?.[0]}
              alt={product.name}
              className="w-full aspect-square object-cover"
              onError={e => e.target.src = `https://placehold.co/600x600?text=${encodeURIComponent(product.name)}`}
            />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {discount > 0 && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-500 text-white">
                  -{discount}% OFF
                </span>
              )}
              {product.isOrganic && (
                <span className="text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"
                  style={{ backgroundColor: 'var(--pb-accent)', color: '#fff' }}>
                  <Leaf className="w-3 h-3" /> Organic
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--pb-accent)' }}>
              {product.category}
            </span>

            <h1 className="text-3xl font-display font-bold mt-2 mb-3">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              {product.ratings > 0 && (
                <span className="flex items-center gap-1 text-sm font-medium">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {product.ratings.toFixed(1)}
                  <span style={{ color: 'var(--pb-text-secondary)' }}>({product.numReviews} reviews)</span>
                </span>
              )}
              {product.location && (
                <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--pb-text-secondary)' }}>
                  <MapPin className="w-4 h-4" /> {product.location}
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold" style={{ color: 'var(--pb-accent)' }}>₹{product.price}</span>
              {product.originalPrice > product.price && (
                <span className="text-lg line-through" style={{ color: 'var(--pb-text-secondary)' }}>
                  ₹{product.originalPrice}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--pb-text-secondary)' }}>
              {product.description}
            </p>

            {/* Seller */}
            {product.sellerName && (
              <div className="rounded-xl border p-4 mb-6"
                style={{ borderColor: 'var(--pb-border)', backgroundColor: 'var(--pb-surface)' }}>
                <p className="text-xs uppercase font-semibold mb-1" style={{ color: 'var(--pb-text-secondary)' }}>Sold by</p>
                <p className="font-semibold">{product.sellerName}</p>
              </div>
            )}

            {/* Stock */}
            <p className="text-sm mb-4" style={{ color: product.stock > 10 ? 'var(--pb-success)' : 'var(--pb-warning)' }}>
              {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
            </p>

            {/* Qty + Add to cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border rounded-xl"
                style={{ borderColor: 'var(--pb-border)' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center transition hover:opacity-70">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-sm">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  className="w-10 h-10 flex items-center justify-center transition hover:opacity-70">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 btn-accent py-3 rounded-xl flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </button>
            </div>

            {/* Trust signals */}
            <div className="flex gap-4 text-xs" style={{ color: 'var(--pb-text-secondary)' }}>
              <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> Verified Seller</span>
              <span className="flex items-center gap-1"><Truck className="w-4 h-4" /> Free Ship ₹499+</span>
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {product.tags.map(tag => (
                  <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: dark ? 'rgba(168,204,0,0.1)' : 'rgba(141,182,0,0.08)',
                      color: 'var(--pb-accent)'
                    }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── REVIEWS ─── */}
        <div className="mt-16 max-w-3xl">
          <h2 className="text-2xl font-display font-bold mb-6">Reviews ({product.numReviews})</h2>

          {/* Write a review */}
          {isLoggedIn && (
            <div className="rounded-2xl border p-6 mb-8"
              style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
              <h3 className="font-semibold mb-3">Write a Review</h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm" style={{ color: 'var(--pb-text-secondary)' }}>Rating:</span>
                {[1, 2, 3, 4, 5].map(r => (
                  <button key={r} onClick={() => setReviewForm(f => ({ ...f, rating: r }))}>
                    <Star className={`w-5 h-5 ${r <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : ''}`}
                      style={{ color: r > reviewForm.rating ? 'var(--pb-border)' : undefined }} />
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Share your experience..."
                value={reviewForm.comment}
                onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                className="w-full border rounded-xl px-4 py-3 text-sm h-24 resize-none outline-none"
                style={{
                  backgroundColor: 'var(--pb-bg)',
                  borderColor: 'var(--pb-border)',
                  color: 'var(--pb-text)',
                }}
              />
              <button onClick={handleReview} disabled={submitting}
                className="btn-accent px-6 py-2 rounded-xl text-sm mt-3 disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          )}

          {/* Review list */}
          {product.reviews?.length > 0 ? (
            <div className="space-y-4">
              {product.reviews.map((r, i) => (
                <div key={i} className="rounded-xl border p-4"
                  style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: 'var(--pb-accent)' }}>
                      {r.name[0]}
                    </div>
                    <span className="font-semibold text-sm">{r.name}</span>
                    <span className="flex items-center gap-0.5 text-xs">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {r.rating}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--pb-text-secondary)' }}>{r.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--pb-text-secondary)' }}>
              No reviews yet. Be the first to review this product!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}