/**
 * OrderTracking — Live tracking page
 */
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import OrderTracker from '../components/OrderTracker';
import SEOHead from '../components/SEOHead';
import { CURRENCY_SYMBOL } from '../constants';
import { ArrowLeft } from 'lucide-react';

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/orders/${id}/track`);
        setOrder(data.data || data);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-8"><div className="shimmer h-64 rounded-2xl" /></div>;
  if (!order) return <div className="max-w-3xl mx-auto px-4 py-20 text-center"><p className="font-bold">Order not found</p></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <SEOHead title={`Order #${order._id.slice(-6)} — Tracking`} />
      <Link to="/orders" className="flex items-center gap-2 text-sm font-medium mb-6 hover:gap-3 transition-all" style={{ color: 'var(--pb-accent)' }}>
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold">Order #{order._id.slice(-6).toUpperCase()}</h1>
        <span className="text-sm font-medium" style={{ color: 'var(--pb-text-secondary)' }}>
          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
      </div>

      {/* Tracker */}
      <OrderTracker
        currentStatus={order.orderStatus}
        statusHistory={order.statusHistory}
        estimatedDelivery={order.estimatedDelivery}
        trackingNumber={order.trackingNumber}
        courierPartner={order.courierPartner}
      />

      {/* Order Details */}
      <div className="mt-6 rounded-2xl border p-5" style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
        <h3 className="text-sm font-bold mb-4">Order Items</h3>
        <div className="space-y-3">
          {order.items?.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <img src={item.image || 'https://placehold.co/60'} alt={item.name} className="w-14 h-14 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs" style={{ color: 'var(--pb-text-secondary)' }}>Qty: {item.qty} × {CURRENCY_SYMBOL}{item.price}</p>
              </div>
              <p className="text-sm font-bold">{CURRENCY_SYMBOL}{item.qty * item.price}</p>
            </div>
          ))}
        </div>
        <div className="border-t mt-4 pt-4 space-y-1 text-sm" style={{ borderColor: 'var(--pb-border)' }}>
          <div className="flex justify-between"><span style={{ color: 'var(--pb-text-secondary)' }}>Subtotal</span><span>{CURRENCY_SYMBOL}{order.itemsPrice}</span></div>
          <div className="flex justify-between"><span style={{ color: 'var(--pb-text-secondary)' }}>Shipping</span><span>{order.shippingPrice === 0 ? 'FREE' : `${CURRENCY_SYMBOL}${order.shippingPrice}`}</span></div>
          {order.couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Coupon</span><span>-{CURRENCY_SYMBOL}{order.couponDiscount}</span></div>}
          <div className="flex justify-between text-lg font-bold pt-2 border-t" style={{ borderColor: 'var(--pb-border)' }}>
            <span>Total</span><span>{CURRENCY_SYMBOL}{order.totalPrice}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="mt-4 rounded-2xl border p-5" style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
        <h3 className="text-sm font-bold mb-2">Shipping Address</h3>
        <p className="text-sm" style={{ color: 'var(--pb-text-secondary)' }}>
          {order.shippingAddress?.fullName}<br />
          {order.shippingAddress?.address}<br />
          {[order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.pincode].filter(Boolean).join(', ')}<br />
          📞 {order.shippingAddress?.phone}
        </p>
      </div>
    </div>
  );
}
