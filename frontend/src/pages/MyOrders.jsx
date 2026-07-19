/**
 * MyOrders — Customer order history
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import SEOHead from '../components/SEOHead';
import { CURRENCY_SYMBOL, BRAND_NAME } from '../constants';
import { Package, ChevronRight, RotateCcw, Star, Truck, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const statusColors = {
  'Order Placed': '#3b82f6', 'Confirmed': '#8b5cf6', 'Seller Processing': '#f59e0b',
  'Packed': '#f59e0b', 'Shipped': '#06b6d4', 'Out for Delivery': '#a855f7',
  'Delivered': '#22c55e', 'Cancelled': '#ef4444', 'Returned': '#ef4444', 'Refunded': '#64748b',
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/orders/mine');
        setOrders(data.data || data || []);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const cancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.put(`/orders/${orderId}/cancel`);
      toast.success('Order cancelled');
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: 'Cancelled' } : o));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to cancel'); }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <SEOHead page="orders" />
        <div className="space-y-4">{Array(3).fill(0).map((_, i) => <div key={i} className="shimmer h-32 rounded-2xl" />)}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <SEOHead page="orders" />
      <h1 className="text-3xl font-display font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border" style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
          <Package className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--pb-text-secondary)' }} />
          <p className="text-lg font-bold mb-2">No orders yet</p>
          <p className="text-sm mb-6" style={{ color: 'var(--pb-text-secondary)' }}>Start shopping on {BRAND_NAME}!</p>
          <Link to="/products" className="btn-accent px-6 py-2.5 rounded-xl text-sm">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="rounded-2xl border overflow-hidden card-lift"
              style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-b" style={{ borderColor: 'var(--pb-border)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono" style={{ color: 'var(--pb-text-secondary)' }}>#{order._id.slice(-8).toUpperCase()}</span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold text-white"
                    style={{ backgroundColor: statusColors[order.orderStatus] || '#64748b' }}>
                    {order.orderStatus}
                  </span>
                </div>
                <span className="text-xs" style={{ color: 'var(--pb-text-secondary)' }}>
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              {/* Items */}
              <div className="p-5">
                <div className="flex flex-wrap gap-3 mb-4">
                  {order.items?.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <img src={item.image || 'https://placehold.co/50'} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <p className="text-sm font-semibold truncate max-w-[150px]">{item.name}</p>
                        <p className="text-xs" style={{ color: 'var(--pb-text-secondary)' }}>{item.qty} × {CURRENCY_SYMBOL}{item.price}</p>
                      </div>
                    </div>
                  ))}
                  {order.items?.length > 3 && <span className="text-xs font-semibold self-center" style={{ color: 'var(--pb-text-secondary)' }}>+{order.items.length - 3} more</span>}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-lg font-bold">{CURRENCY_SYMBOL}{order.totalPrice}</p>
                  <div className="flex gap-2">
                    {!['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned', 'Refunded'].includes(order.orderStatus) && (
                      <button onClick={() => cancelOrder(order._id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition"
                        style={{ borderColor: 'var(--pb-danger)', color: 'var(--pb-danger)' }}>
                        <XCircle className="w-3.5 h-3.5" /> Cancel
                      </button>
                    )}
                    <Link to={`/orders/${order._id}/track`}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                      style={{ backgroundColor: 'var(--pb-accent)' }}>
                      <Truck className="w-3.5 h-3.5" /> Track <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
