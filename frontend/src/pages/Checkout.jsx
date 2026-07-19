/**
 * Checkout — Payment page with Razorpay + COD
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import SEOHead from '../components/SEOHead';
import { BRAND_NAME, FREE_SHIPPING_THRESHOLD, DEFAULT_SHIPPING_COST, CURRENCY_SYMBOL } from '../constants';
import api from '../api';
import toast from 'react-hot-toast';
import { CreditCard, Truck, Tag, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function Checkout() {
  const { cart: items, total, clearCart: clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // eslint-disable-next-line
  const [address, setAddress] = useState({
    fullName: user?.name || '', address: user?.address?.street || '',
    city: user?.address?.city || '', state: user?.address?.state || '',
    pincode: user?.address?.pincode || '', phone: user?.phone || ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [loading, setLoading] = useState(false);

  const shipping = total >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_COST;
  const finalTotal = total + shipping - couponDiscount;

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const { data } = await api.post('/coupons/validate', { code: couponCode, orderAmount: total });
      setCouponDiscount(data.data.discount);
      setCouponApplied(data.data.code);
      toast.success(`Coupon applied! You save ${CURRENCY_SYMBOL}${data.data.discount}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
      setCouponDiscount(0);
      setCouponApplied('');
    }
  };

  const placeOrder = async () => {
    if (!address.fullName || !address.address || !address.phone) {
      return toast.error('Please fill all required fields');
    }
    if (items.length === 0) return toast.error('Cart is empty');

    setLoading(true);
    try {
      const orderData = {
        items: items.map(i => ({ product: i._id, qty: i.qty })),
        shippingAddress: address,
        paymentMethod,
        couponCode: couponApplied,
        customerNote,
      };

      const { data } = await api.post('/orders', orderData);

      if (paymentMethod === 'razorpay' && data.data?._id) {
        // Create Razorpay payment
        try {
          const payRes = await api.post('/payments/create-order', { amount: finalTotal, orderId: data.data._id });
          if (payRes.data.testMode) {
            // Test mode — auto verify
            await api.post('/payments/verify', { orderId: data.data._id });
            toast.success('Order placed! (Test payment)');
          } else {
            // Real Razorpay
            const options = {
              key: payRes.data.key,
              amount: payRes.data.data.amount,
              currency: 'INR',
              name: BRAND_NAME,
              description: `Order #${data.data._id.slice(-6)}`,
              order_id: payRes.data.data.id,
              handler: async (response) => {
                await api.post('/payments/verify', { ...response, orderId: data.data._id });
                toast.success('Payment successful!');
                clear();
                navigate(`/orders/${data.data._id}/track`);
              },
              prefill: { name: address.fullName, contact: address.phone },
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
            setLoading(false);
            return;
          }
        } catch { toast.error('Payment failed, order placed as COD'); }
      } else {
        toast.success('Order placed successfully!');
      }

      clear();
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setLoading(false); }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <SEOHead page="checkout" />
        <p className="text-lg font-bold mb-4">Your cart is empty</p>
        <button onClick={() => navigate('/products')} className="btn-accent px-6 py-2.5 rounded-xl text-sm">Browse Products</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <SEOHead page="checkout" />
      <button onClick={() => navigate('/cart')} className="flex items-center gap-2 text-sm font-medium mb-6 hover:gap-3 transition-all" style={{ color: 'var(--pb-accent)' }}>
        <ArrowLeft className="w-4 h-4" /> Back to Cart
      </button>

      <h1 className="text-3xl font-display font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left — Address + Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Truck className="w-5 h-5" style={{ color: 'var(--pb-accent)' }} /> Shipping Address</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { key: 'fullName', label: 'Full Name *', span: 2 },
                { key: 'address', label: 'Address *', span: 2 },
                { key: 'city', label: 'City' },
                { key: 'state', label: 'State' },
                { key: 'pincode', label: 'Pincode' },
                { key: 'phone', label: 'Phone *' },
              ].map(f => (
                <div key={f.key} className={f.span === 2 ? 'sm:col-span-2' : ''}>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--pb-text-secondary)' }}>{f.label}</label>
                  <input value={address[f.key]} onChange={e => setAddress({ ...address, [f.key]: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2"
                    style={{ backgroundColor: 'var(--pb-bg)', borderColor: 'var(--pb-border)', color: 'var(--pb-text)' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5" style={{ color: 'var(--pb-accent)' }} /> Payment Method</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive', icon: '💵' },
                { id: 'razorpay', label: 'Online Payment', desc: 'UPI, Cards, Net Banking', icon: '💳' },
              ].map(m => (
                <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                  className="flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left"
                  style={{
                    borderColor: paymentMethod === m.id ? 'var(--pb-accent)' : 'var(--pb-border)',
                    backgroundColor: paymentMethod === m.id ? 'rgba(141,182,0,0.05)' : 'transparent',
                  }}>
                  <span className="text-2xl">{m.icon}</span>
                  <div>
                    <p className="text-sm font-bold">{m.label}</p>
                    <p className="text-xs" style={{ color: 'var(--pb-text-secondary)' }}>{m.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
            <label className="text-sm font-bold mb-2 block">Order Note (optional)</label>
            <textarea value={customerNote} onChange={e => setCustomerNote(e.target.value)} rows={2} placeholder="Any special instructions..."
              className="w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none resize-none"
              style={{ backgroundColor: 'var(--pb-bg)', borderColor: 'var(--pb-border)', color: 'var(--pb-text)' }} />
          </div>
        </div>

        {/* Right — Summary */}
        <div className="space-y-4">
          <div className="rounded-2xl border p-6 sticky top-20" style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {items.map(item => (
                <div key={item._id} className="flex items-center gap-3">
                  <img src={item.images?.[0] || 'https://placehold.co/60'} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{item.name}</p>
                    <p className="text-xs" style={{ color: 'var(--pb-text-secondary)' }}>Qty: {item.qty} × {CURRENCY_SYMBOL}{item.price}</p>
                  </div>
                  <p className="text-sm font-bold">{CURRENCY_SYMBOL}{item.price * item.qty}</p>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="flex gap-2 mb-4">
              <input value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="Coupon code"
                className="flex-1 px-3 py-2 rounded-lg text-sm border focus:outline-none"
                style={{ backgroundColor: 'var(--pb-bg)', borderColor: 'var(--pb-border)', color: 'var(--pb-text)' }} />
              <button onClick={validateCoupon} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: 'var(--pb-accent)' }}>
                <Tag className="w-4 h-4" />
              </button>
            </div>
            {couponApplied && (
              <p className="text-xs font-semibold mb-3" style={{ color: 'var(--pb-success)' }}>✅ Coupon "{couponApplied}" applied — Save {CURRENCY_SYMBOL}{couponDiscount}</p>
            )}

            <div className="space-y-2 text-sm border-t pt-4" style={{ borderColor: 'var(--pb-border)' }}>
              <div className="flex justify-between"><span style={{ color: 'var(--pb-text-secondary)' }}>Subtotal</span><span>{CURRENCY_SYMBOL}{total}</span></div>
              <div className="flex justify-between"><span style={{ color: 'var(--pb-text-secondary)' }}>Shipping</span><span>{shipping === 0 ? 'FREE' : `${CURRENCY_SYMBOL}${shipping}`}</span></div>
              {couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Coupon Discount</span><span>-{CURRENCY_SYMBOL}{couponDiscount}</span></div>}
              <div className="flex justify-between text-lg font-bold pt-2 border-t" style={{ borderColor: 'var(--pb-border)' }}>
                <span>Total</span><span>{CURRENCY_SYMBOL}{finalTotal}</span>
              </div>
            </div>

            <button onClick={placeOrder} disabled={loading}
              className="w-full mt-6 btn-accent py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? 'Processing...' : (
                <><ShieldCheck className="w-4 h-4" /> {paymentMethod === 'cod' ? 'Place Order (COD)' : `Pay ${CURRENCY_SYMBOL}${finalTotal}`}</>
              )}
            </button>

            <p className="text-[10px] text-center mt-3" style={{ color: 'var(--pb-text-secondary)' }}>
              🔒 Secure checkout powered by {BRAND_NAME}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
