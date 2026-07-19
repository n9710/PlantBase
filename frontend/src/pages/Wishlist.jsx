/**
 * Wishlist — Saved products
 */
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import SEOHead from '../components/SEOHead';
import { BRAND_NAME, CURRENCY_SYMBOL } from '../constants';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const { items, toggle, loading } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success('Added to cart!');
  };

  const handleRemove = async (productId) => {
    await toggle(productId);
    toast.success('Removed from wishlist');
  };

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8"><div className="shimmer h-64 rounded-2xl" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <SEOHead page="wishlist" />
      <h1 className="text-3xl font-display font-bold mb-2">My Wishlist</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--pb-text-secondary)' }}>{items.length} item{items.length !== 1 ? 's' : ''} saved</p>

      {items.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border" style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
          <Heart className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--pb-text-secondary)' }} />
          <p className="text-lg font-bold mb-2">Your wishlist is empty</p>
          <p className="text-sm mb-6" style={{ color: 'var(--pb-text-secondary)' }}>Save products you love on {BRAND_NAME}</p>
          <Link to="/products" className="btn-accent px-6 py-2.5 rounded-xl text-sm">Browse Products</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {items.map(({ product: p }) => p && (
            <div key={p._id} className="rounded-2xl border overflow-hidden card-lift" style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
              <Link to={`/products/${p._id}`}>
                <img src={p.images?.[0] || 'https://placehold.co/300x200'} alt={p.name} className="w-full h-44 object-cover" />
              </Link>
              <div className="p-4">
                <Link to={`/products/${p._id}`}>
                  <h3 className="text-sm font-bold truncate hover:underline">{p.name}</h3>
                </Link>
                <p className="text-xs mt-1" style={{ color: 'var(--pb-text-secondary)' }}>{p.category}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg font-bold">{CURRENCY_SYMBOL}{p.price}</span>
                  {p.originalPrice && p.originalPrice > p.price && (
                    <span className="text-xs line-through" style={{ color: 'var(--pb-text-secondary)' }}>{CURRENCY_SYMBOL}{p.originalPrice}</span>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => handleAddToCart(p)} className="flex-1 btn-accent py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1">
                    <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                  </button>
                  <button onClick={() => handleRemove(p._id)} className="p-2 rounded-lg border transition hover:scale-105"
                    style={{ borderColor: 'var(--pb-border)', color: 'var(--pb-danger)' }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
