import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Star, MapPin, Leaf } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductCard({ product, dark }) {
  const { addToCart } = useCart();

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAdd = (e) => {
    e.preventDefault();
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Link
      to={`/products/${product._id}`}
      className="group rounded-2xl border overflow-hidden card-lift flex flex-col"
      style={{
        backgroundColor: 'var(--pb-surface)',
        borderColor: 'var(--pb-border)',
      }}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-square">
        <img
          src={product.images?.[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => e.target.src = `https://placehold.co/400x400?text=${encodeURIComponent(product.name)}`}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
              -{discount}%
            </span>
          )}
          {product.isOrganic && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{ backgroundColor: 'var(--pb-accent)', color: '#fff' }}>
              <Leaf className="w-3 h-3" /> Organic
            </span>
          )}
        </div>

        {/* Quick add */}
        <button
          onClick={handleAdd}
          className="absolute bottom-3 right-3 p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 shadow-lg"
          style={{ backgroundColor: 'var(--pb-accent)', color: '#fff' }}
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category */}
        <span className="text-[10px] font-semibold uppercase tracking-wider mb-1"
          style={{ color: 'var(--pb-accent)' }}>
          {product.category}
        </span>

        <h3 className="font-semibold text-sm leading-snug line-clamp-2 mb-2"
          style={{ color: 'var(--pb-text)' }}>
          {product.name}
        </h3>

        {/* Rating & location */}
        <div className="flex items-center gap-3 text-xs mb-3" style={{ color: 'var(--pb-text-secondary)' }}>
          {product.ratings > 0 && (
            <span className="flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {product.ratings.toFixed(1)}
              <span className="opacity-60">({product.numReviews})</span>
            </span>
          )}
          {product.location && (
            <span className="flex items-center gap-0.5">
              <MapPin className="w-3 h-3" /> {product.location}
            </span>
          )}
        </div>

        {/* Seller */}
        {product.sellerName && (
          <p className="text-[11px] mb-3" style={{ color: 'var(--pb-text-secondary)' }}>
            by {product.sellerName}
          </p>
        )}

        {/* Price — pushed to bottom */}
        <div className="mt-auto flex items-center gap-2">
          <span className="text-lg font-bold" style={{ color: 'var(--pb-accent)' }}>
            ₹{product.price}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-xs line-through" style={{ color: 'var(--pb-text-secondary)' }}>
              ₹{product.originalPrice}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// Skeleton version
export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
      <div className="aspect-square shimmer" />
      <div className="p-4 space-y-3">
        <div className="shimmer h-3 w-16 rounded" />
        <div className="shimmer h-4 w-3/4 rounded" />
        <div className="shimmer h-3 w-1/2 rounded" />
        <div className="shimmer h-5 w-20 rounded" />
      </div>
    </div>
  );
}