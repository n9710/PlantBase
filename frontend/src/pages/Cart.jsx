/**
 * Cart Page — Shopping Cart Summary
 */
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SEOHead from '../components/SEOHead';
import { BRAND_NAME, FREE_SHIPPING_THRESHOLD, DEFAULT_SHIPPING_COST, CURRENCY_SYMBOL } from '../constants';
import { ShoppingCart, Trash2, Minus, Plus, Leaf, Lock, ArrowRight, ArrowLeft } from 'lucide-react';

export default function Cart() {
  const { cart, removeFromCart, updateQty, clearCart, total, count } = useCart();
  const { isLoggedIn } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const dark = theme === 'dark' || theme === 'nature';
  const shipping = total >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_COST;
  const grandTotal = total + shipping;

  const handleProceed = () => {
    if (!isLoggedIn) {
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  if (!count) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <SEOHead page="cart" />
      <div className="text-center animate-fade-up">
        <ShoppingCart className="w-20 h-20 mx-auto mb-6" style={{ color: 'var(--pb-text-secondary)' }} />
        <h2 className="text-3xl font-display font-bold mb-3">Your cart is empty</h2>
        <p className="mb-8" style={{ color: 'var(--pb-text-secondary)' }}>Add some plant-based goodness to get started</p>
        <Link to="/products" className="btn-accent px-8 py-3 rounded-xl inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Shop Now
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-10">
      <SEOHead page="cart" />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-display font-bold mb-8 animate-fade-up">
          Your Cart
          <span className="ml-3 text-base font-normal" style={{ color: 'var(--pb-text-secondary)' }}>({count} items)</span>
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4 animate-fade-up delay-100">
            {cart.map(item => (
              <div key={item._id}
                className="flex gap-4 p-5 rounded-2xl border"
                style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
                <Link to={`/products/${item._id}`}>
                  <img src={item.images?.[0]} alt={item.name}
                    className="w-24 h-24 object-cover rounded-xl flex-shrink-0 hover:scale-105 transition-transform"
                    onError={e => e.target.src = `https://placehold.co/200x200?text=${encodeURIComponent(item.name)}`} />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item._id}`}>
                    <h3 className="font-bold hover:opacity-80 transition truncate">{item.name}</h3>
                  </Link>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--pb-text-secondary)' }}>Sold by {item.sellerName || BRAND_NAME}</p>
                  <p className="font-bold mt-1" style={{ color: 'var(--pb-accent)' }}>{CURRENCY_SYMBOL}{item.price} each</p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border rounded-lg" style={{ borderColor: 'var(--pb-border)' }}>
                      <button onClick={() => updateQty(item._id, item.qty - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:opacity-70 transition">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold">{item.qty}</span>
                      <button onClick={() => updateQty(item._id, item.qty + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:opacity-70 transition">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(item._id)}
                      className="text-xs flex items-center gap-1 transition" style={{ color: 'var(--pb-danger)' }}>
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
                <div className="text-right flex flex-col justify-between">
                  <p className="font-black text-lg" style={{ color: 'var(--pb-accent)' }}>
                    {CURRENCY_SYMBOL}{(item.price * item.qty).toFixed(0)}
                  </p>
                </div>
              </div>
            ))}
            <button onClick={clearCart}
              className="text-sm flex items-center gap-1 transition mt-4" style={{ color: 'var(--pb-text-secondary)' }}>
              <Trash2 className="w-3 h-3" /> Clear cart
            </button>
          </div>

          {/* Sidebar */}
          <div className="space-y-5 animate-fade-up delay-200">
            {/* Summary */}
            <div className="rounded-2xl border p-6 sticky top-24"
              style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
              <h2 className="font-display font-bold text-lg mb-4">Order Summary</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--pb-text-secondary)' }}>Items Subtotal</span>
                  <span className="font-medium">{CURRENCY_SYMBOL}{total}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--pb-text-secondary)' }}>Shipping Estimate</span>
                  <span style={{ color: shipping === 0 ? 'var(--pb-success)' : undefined }}>
                    {shipping === 0 ? 'FREE' : `${CURRENCY_SYMBOL}${shipping}`}
                  </span>
                </div>
                
                <div className="border-t pt-4 mt-4 flex justify-between items-center" style={{ borderColor: 'var(--pb-border)' }}>
                  <span className="font-bold">Total</span>
                  <span className="font-black text-2xl" style={{ color: 'var(--pb-accent)' }}>{CURRENCY_SYMBOL}{grandTotal.toFixed(0)}</span>
                </div>
              </div>
              
              {total < FREE_SHIPPING_THRESHOLD && (
                <div className="mt-4 p-3 rounded-xl text-xs text-center border"
                  style={{ backgroundColor: dark ? 'rgba(245,158,11,0.1)' : 'rgba(245,158,11,0.08)', color: 'var(--pb-warning)', borderColor: 'transparent' }}>
                  <Leaf className="w-3 h-3 inline mr-1" /> Add {CURRENCY_SYMBOL}{(FREE_SHIPPING_THRESHOLD - total).toFixed(0)} more for FREE shipping
                </div>
              )}

              <button onClick={handleProceed}
                className="w-full mt-6 btn-accent py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition hover:scale-[1.02]">
                {isLoggedIn ? (
                  <>Proceed to Checkout <ArrowRight className="w-4 h-4" /></>
                ) : (
                  <><Lock className="w-4 h-4" /> Login to Checkout</>
                )}
              </button>
              
              <p className="text-center text-[10px] mt-4" style={{ color: 'var(--pb-text-secondary)' }}>
                You can apply coupons and use your Wallet balance during checkout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}