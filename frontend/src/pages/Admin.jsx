/**
 * Admin Dashboard — Complete rebuild with Recharts analytics
 */
import { useState, useEffect } from 'react';
import api from '../api';
import SEOHead from '../components/SEOHead';
import DashboardCard from '../components/DashboardCard';
import { SalesAreaChart, OrdersBarChart, CategoryPieChart, StatusBreakdownChart } from '../components/ChartWrapper';
import { BRAND_NAME, CURRENCY_SYMBOL } from '../constants';
import { Users, ShoppingBag, Package, DollarSign, Clock, AlertTriangle, Store, Star, CheckCircle, XCircle, Eye, Ban } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Admin() {
  const [tab, setTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [pendingSellers, setPendingSellers] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [analyticsRes, sellersRes, productsRes, ordersRes, usersRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/seller-profile/pending'),
          api.get('/products?status=pending'),
          api.get('/orders/all?limit=50'),
          api.get('/admin/users'),
        ]);
        setAnalytics(analyticsRes.data.data);
        setPendingSellers(sellersRes.data.data || []);
        setPendingProducts(productsRes.data?.data?.products || productsRes.data?.products || []);
        setAllOrders(ordersRes.data?.data || ordersRes.data || []);
        setAllUsers(usersRes.data?.data || usersRes.data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const approveSeller = async (id) => {
    try {
      await api.put(`/seller-profile/${id}/approve`);
      setPendingSellers(prev => prev.filter(s => s._id !== id));
      toast.success('Seller approved!');
    } catch { toast.error('Failed'); }
  };

  const rejectSeller = async (id) => {
    try {
      await api.put(`/seller-profile/${id}/reject`, { reason: 'Application did not meet requirements' });
      setPendingSellers(prev => prev.filter(s => s._id !== id));
      toast.success('Seller rejected');
    } catch { toast.error('Failed'); }
  };

  const approveProduct = async (id) => {
    try {
      await api.put(`/products/${id}`, { status: 'approved' });
      setPendingProducts(prev => prev.filter(p => p._id !== id));
      toast.success('Product approved');
    } catch { toast.error('Failed'); }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      setAllOrders(prev => prev.map(o => o._id === id ? { ...o, orderStatus: status } : o));
      toast.success('Status updated');
    } catch { toast.error('Failed'); }
  };

  const toggleUserStatus = async (id, isActive) => {
    try {
      await api.put(`/admin/users/${id}`, { isActive: !isActive });
      setAllUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: !isActive } : u));
      toast.success(isActive ? 'User suspended' : 'User activated');
    } catch { toast.error('Failed'); }
  };

  const cards = analytics?.cards || {};
  const charts = analytics?.charts || {};

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'orders', label: `Orders (${allOrders.length})` },
    { id: 'sellers', label: `Sellers (${pendingSellers.length})` },
    { id: 'products', label: `Products (${pendingProducts.length})` },
    { id: 'users', label: 'Users' },
  ];

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8"><div className="grid grid-cols-4 gap-4">{Array(8).fill(0).map((_, i) => <div key={i} className="shimmer h-28 rounded-2xl" />)}</div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEOHead page="admin" />
      <h1 className="text-3xl font-display font-bold mb-2">{BRAND_NAME} Admin</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--pb-text-secondary)' }}>Manage your marketplace platform</p>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto mb-6 pb-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all"
            style={{
              backgroundColor: tab === t.id ? 'var(--pb-accent)' : 'var(--pb-surface)',
              color: tab === t.id ? '#fff' : 'var(--pb-text-secondary)',
            }}>{t.label}</button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab === 'overview' && (
        <div className="space-y-6 animate-fade-up">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardCard title="Total Users" value={cards.totalUsers || 0} icon={Users} color="#3b82f6" />
            <DashboardCard title="Total Sellers" value={cards.totalSellers || 0} icon={Store} color="#8b5cf6" />
            <DashboardCard title="Total Orders" value={cards.totalOrders || 0} icon={Package} color="#f59e0b" />
            <DashboardCard title="Total Products" value={cards.totalProducts || 0} icon={ShoppingBag} color="#22c55e" />
            <DashboardCard title="Today's Revenue" value={cards.todayRevenue || 0} icon={DollarSign} prefix={CURRENCY_SYMBOL} color="#8DB600" />
            <DashboardCard title="Monthly Revenue" value={cards.monthlyRevenue || 0} icon={DollarSign} prefix={CURRENCY_SYMBOL} color="#A0522D" />
            <DashboardCard title="Pending Sellers" value={cards.pendingSellers || 0} icon={Clock} color="#f59e0b" />
            <DashboardCard title="Flagged Reviews" value={cards.flaggedReviews || 0} icon={AlertTriangle} color="#ef4444" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <SalesAreaChart data={charts.salesGrowth || []} title="Revenue — Last 30 Days" />
            <OrdersBarChart data={charts.salesGrowth || []} title="Orders — Last 30 Days" />
            <CategoryPieChart data={charts.categoryRevenue || []} title="Revenue by Category" />
            <StatusBreakdownChart data={charts.statusBreakdown || []} title="Order Status Breakdown" />
          </div>

          {/* Top Sellers */}
          {charts.topSellers?.length > 0 && (
            <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
              <h3 className="text-sm font-bold mb-4">Top Sellers</h3>
              <div className="space-y-2">
                {charts.topSellers.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: 'var(--pb-accent)' }}>{i + 1}</span>
                    <span className="flex-1 text-sm font-semibold">{s.name}</span>
                    <span className="text-sm" style={{ color: 'var(--pb-text-secondary)' }}>{s.orders} orders</span>
                    <span className="text-sm font-bold">{CURRENCY_SYMBOL}{s.revenue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ORDERS TAB */}
      {tab === 'orders' && (
        <div className="space-y-3 animate-fade-up">
          {allOrders.map(order => (
            <div key={order._id} className="rounded-xl border p-4 flex flex-wrap items-center justify-between gap-3"
              style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
              <div>
                <span className="text-xs font-mono">#{order._id.slice(-8).toUpperCase()}</span>
                <p className="text-sm font-semibold">{order.user?.name || 'Customer'} — {CURRENCY_SYMBOL}{order.totalPrice}</p>
                <p className="text-xs" style={{ color: 'var(--pb-text-secondary)' }}>{order.items?.length || 0} items · {order.paymentMethod || 'cod'} · {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: order.orderStatus === 'Delivered' ? '#22c55e' : order.orderStatus === 'Cancelled' ? '#ef4444' : '#f59e0b' }}>
                  {order.orderStatus}
                </span>
                <select value={order.orderStatus} onChange={e => updateOrderStatus(order._id, e.target.value)}
                  className="text-xs px-2 py-1 rounded-lg border" style={{ backgroundColor: 'var(--pb-bg)', borderColor: 'var(--pb-border)', color: 'var(--pb-text)' }}>
                  {['Order Placed', 'Confirmed', 'Seller Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SELLERS TAB */}
      {tab === 'sellers' && (
        <div className="space-y-4 animate-fade-up">
          {pendingSellers.length === 0 ? <p className="text-center py-8 text-sm" style={{ color: 'var(--pb-text-secondary)' }}>No pending seller applications</p> : (
            pendingSellers.map(s => (
              <div key={s._id} className="rounded-xl border p-5" style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold">{s.shopName}</h3>
                    <p className="text-sm" style={{ color: 'var(--pb-text-secondary)' }}>{s.userId?.name} · {s.userId?.email}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--pb-text-secondary)' }}>Categories: {s.categories?.join(', ') || 'N/A'}</p>
                    <p className="text-xs" style={{ color: 'var(--pb-text-secondary)' }}>GST: {s.gstNumber || 'Not provided'} · PAN: {s.panNumber || 'Not provided'}</p>
                    <p className="text-xs" style={{ color: 'var(--pb-text-secondary)' }}>Applied: {new Date(s.applicationDate).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => approveSeller(s._id)} className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold text-white" style={{ backgroundColor: '#22c55e' }}>
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button onClick={() => rejectSeller(s._id)} className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold text-white bg-red-500">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* PRODUCTS TAB */}
      {tab === 'products' && (
        <div className="space-y-3 animate-fade-up">
          {pendingProducts.length === 0 ? <p className="text-center py-8 text-sm" style={{ color: 'var(--pb-text-secondary)' }}>No pending products</p> : (
            pendingProducts.map(p => (
              <div key={p._id} className="rounded-xl border p-4 flex items-center gap-4"
                style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
                <img src={p.images?.[0] || 'https://placehold.co/60'} alt={p.name} className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-bold">{p.name}</p>
                  <p className="text-xs" style={{ color: 'var(--pb-text-secondary)' }}>{p.category} · {CURRENCY_SYMBOL}{p.price} · by {p.sellerName}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => approveProduct(p._id)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ backgroundColor: '#22c55e' }}>Approve</button>
                  <button onClick={() => { api.put(`/products/${p._id}`, { status: 'rejected' }); setPendingProducts(prev => prev.filter(x => x._id !== p._id)); }} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-red-500">Reject</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* USERS TAB */}
      {tab === 'users' && (
        <div className="space-y-2 animate-fade-up">
          {allUsers.map(u => (
            <div key={u._id} className="rounded-xl border p-4 flex items-center justify-between"
              style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
              <div>
                <p className="text-sm font-semibold">{u.name} <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ml-1" style={{ backgroundColor: 'var(--pb-accent)', color: '#fff' }}>{u.role}</span></p>
                <p className="text-xs" style={{ color: 'var(--pb-text-secondary)' }}>{u.email}</p>
              </div>
              <button onClick={() => toggleUserStatus(u._id, u.isActive)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold ${u.isActive ? 'text-red-500 border border-red-200' : 'text-green-600 border border-green-200'}`}>
                {u.isActive ? <><Ban className="w-3.5 h-3.5" /> Suspend</> : <><CheckCircle className="w-3.5 h-3.5" /> Activate</>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}