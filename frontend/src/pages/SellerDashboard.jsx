/**
 * SellerDashboard — Enhanced with Recharts analytics
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import SEOHead from '../components/SEOHead';
import DashboardCard from '../components/DashboardCard';
import { SalesAreaChart, OrdersBarChart } from '../components/ChartWrapper';
import { BRAND_NAME, CURRENCY_SYMBOL, PRODUCT_CATEGORIES } from '../constants';
import { Package, DollarSign, ShoppingBag, AlertTriangle, TrendingUp, Plus, Edit, Trash2, CheckCircle, XCircle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SellerDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', originalPrice: '', category: PRODUCT_CATEGORIES[0], stock: '10', images: ['https://placehold.co/400x300?text=Product'], tags: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const [analyticsRes, productsRes, ordersRes] = await Promise.all([
          api.get('/analytics/seller'),
          api.get('/products/seller'),
          api.get('/orders/seller'),
        ]);
        setAnalytics(analyticsRes.data.data);
        setProducts(productsRes.data?.data?.products || productsRes.data?.products || productsRes.data?.data || []);
        setOrders(ordersRes.data?.data || ordersRes.data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSaveProduct = async () => {
    try {
      const body = {
        ...productForm,
        price: Number(productForm.price),
        originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
        stock: Number(productForm.stock),
        images: productForm.images.filter(Boolean),
        tags: productForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      if (editProduct) {
        await api.put(`/products/${editProduct._id}`, body);
        toast.success('Product updated');
      } else {
        await api.post('/products', body);
        toast.success('Product submitted for review');
      }

      // Reload
      const res = await api.get('/products/seller');
      setProducts(res.data?.data?.products || res.data?.products || res.data?.data || []);
      setShowAddProduct(false);
      setEditProduct(null);
      setProductForm({ name: '', description: '', price: '', originalPrice: '', category: PRODUCT_CATEGORIES[0], stock: '10', images: ['https://placehold.co/400x300?text=Product'], tags: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success('Product deleted');
    } catch { toast.error('Failed'); }
  };

  const updateOrder = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      setOrders(prev => prev.map(o => o._id === id ? { ...o, orderStatus: status } : o));
      toast.success('Order updated');
    } catch { toast.error('Failed'); }
  };

  const cards = analytics?.cards || {};
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'products', label: `Products (${products.length})` },
    { id: 'orders', label: `Orders (${orders.length})` },
  ];

  const inputStyle = { backgroundColor: 'var(--pb-bg)', borderColor: 'var(--pb-border)', color: 'var(--pb-text)' };

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8"><div className="grid grid-cols-3 gap-4">{Array(6).fill(0).map((_, i) => <div key={i} className="shimmer h-28 rounded-2xl" />)}</div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEOHead page="seller" />
      <h1 className="text-3xl font-display font-bold mb-1">Seller Dashboard</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--pb-text-secondary)' }}>Welcome, {user?.name} · {BRAND_NAME} Seller Hub</p>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto mb-6">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all"
            style={{ backgroundColor: tab === t.id ? 'var(--pb-accent)' : 'var(--pb-surface)', color: tab === t.id ? '#fff' : 'var(--pb-text-secondary)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div className="space-y-6 animate-fade-up">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <DashboardCard title="Today's Orders" value={cards.todayOrders || 0} icon={Package} color="#3b82f6" />
            <DashboardCard title="Pending Orders" value={cards.pendingOrders || 0} icon={Package} color="#f59e0b" />
            <DashboardCard title="Total Revenue" value={cards.totalRevenue || 0} icon={DollarSign} prefix={CURRENCY_SYMBOL} color="#22c55e" />
            <DashboardCard title="Today's Revenue" value={cards.todayRevenue || 0} icon={TrendingUp} prefix={CURRENCY_SYMBOL} color="#8DB600" />
            <DashboardCard title="Total Products" value={cards.totalProducts || 0} icon={ShoppingBag} color="#8b5cf6" />
            <DashboardCard title="Low Stock" value={cards.lowStockCount || 0} icon={AlertTriangle} color="#ef4444" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <SalesAreaChart data={analytics?.salesChart || []} title="Revenue — Last 7 Days" />
            <OrdersBarChart data={analytics?.salesChart || []} title="Orders — Last 7 Days" />
          </div>

          {/* Low Stock Alerts */}
          {analytics?.lowStock?.length > 0 && (
            <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500" /> Low Stock Alerts</h3>
              {analytics.lowStock.map(p => (
                <div key={p._id} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--pb-border)' }}>
                  <span className="text-sm">{p.name}</span>
                  <span className="text-sm font-bold text-red-500">{p.stock} left</span>
                </div>
              ))}
            </div>
          )}

          {/* Top Products */}
          {analytics?.topProducts?.length > 0 && (
            <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
              <h3 className="text-sm font-bold mb-3">Top Products</h3>
              {analytics.topProducts.map((p, i) => (
                <div key={p._id} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--pb-border)' }}>
                  <span className="text-sm font-semibold">#{i + 1} {p.name}</span>
                  <div className="flex gap-4 text-xs" style={{ color: 'var(--pb-text-secondary)' }}>
                    <span>{p.salesCount} sales</span>
                    <span>{p.views} views</span>
                    <span>★ {p.ratings}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PRODUCTS */}
      {tab === 'products' && (
        <div className="animate-fade-up">
          <button onClick={() => { setShowAddProduct(true); setEditProduct(null); setProductForm({ name: '', description: '', price: '', originalPrice: '', category: PRODUCT_CATEGORIES[0], stock: '10', images: ['https://placehold.co/400x300?text=Product'], tags: '' }); }}
            className="btn-accent px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 mb-6"><Plus className="w-4 h-4" /> Add Product</button>

          {showAddProduct && (
            <div className="rounded-2xl border p-6 mb-6 animate-scale-in" style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
              <h3 className="font-bold mb-4">{editProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2"><label className="text-xs font-semibold mb-1 block">Name</label><input value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm border" style={inputStyle} /></div>
                <div className="sm:col-span-2"><label className="text-xs font-semibold mb-1 block">Description</label><textarea value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl text-sm border resize-none" style={inputStyle} /></div>
                <div><label className="text-xs font-semibold mb-1 block">Price ({CURRENCY_SYMBOL})</label><input type="number" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm border" style={inputStyle} /></div>
                <div><label className="text-xs font-semibold mb-1 block">Original Price (optional)</label><input type="number" value={productForm.originalPrice} onChange={e => setProductForm({ ...productForm, originalPrice: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm border" style={inputStyle} /></div>
                <div><label className="text-xs font-semibold mb-1 block">Category</label><select value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm border" style={inputStyle}>{PRODUCT_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
                <div><label className="text-xs font-semibold mb-1 block">Stock</label><input type="number" value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm border" style={inputStyle} /></div>
                <div className="sm:col-span-2"><label className="text-xs font-semibold mb-1 block">Image URL</label><input value={productForm.images[0]} onChange={e => setProductForm({ ...productForm, images: [e.target.value] })} className="w-full px-4 py-2.5 rounded-xl text-sm border" style={inputStyle} /></div>
                <div className="sm:col-span-2"><label className="text-xs font-semibold mb-1 block">Tags (comma separated)</label><input value={productForm.tags} onChange={e => setProductForm({ ...productForm, tags: e.target.value })} placeholder="organic, herbal, natural" className="w-full px-4 py-2.5 rounded-xl text-sm border" style={inputStyle} /></div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleSaveProduct} className="btn-accent px-6 py-2.5 rounded-xl text-sm">{editProduct ? 'Update' : 'Submit for Review'}</button>
                <button onClick={() => { setShowAddProduct(false); setEditProduct(null); }} className="px-6 py-2.5 rounded-xl text-sm border" style={{ borderColor: 'var(--pb-border)' }}>Cancel</button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {products.map(p => (
              <div key={p._id} className="rounded-xl border p-4 flex items-center gap-4" style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
                <img src={p.images?.[0] || 'https://placehold.co/60'} alt={p.name} className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{p.name}</p>
                  <p className="text-xs" style={{ color: 'var(--pb-text-secondary)' }}>{p.category} · {CURRENCY_SYMBOL}{p.price} · Stock: {p.stock}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.status === 'approved' ? 'bg-green-100 text-green-700' : p.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span>
                <button onClick={() => { setEditProduct(p); setProductForm({ name: p.name, description: p.description || '', price: p.price, originalPrice: p.originalPrice || '', category: p.category, stock: p.stock, images: p.images || [''], tags: (p.tags || []).join(', ') }); setShowAddProduct(true); }} className="p-2 rounded-lg hover:scale-110 transition" style={{ color: 'var(--pb-text-secondary)' }}><Edit className="w-4 h-4" /></button>
                <button onClick={() => deleteProduct(p._id)} className="p-2 rounded-lg hover:scale-110 transition" style={{ color: 'var(--pb-danger)' }}><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ORDERS */}
      {tab === 'orders' && (
        <div className="space-y-3 animate-fade-up">
          {orders.length === 0 ? <p className="text-center py-8 text-sm" style={{ color: 'var(--pb-text-secondary)' }}>No orders yet</p> : (
            orders.map(o => (
              <div key={o._id} className="rounded-xl border p-4" style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-mono">#{o._id.slice(-8).toUpperCase()}</span>
                    <p className="text-sm font-semibold">{o.user?.name} · {CURRENCY_SYMBOL}{o.totalPrice}</p>
                    <p className="text-xs" style={{ color: 'var(--pb-text-secondary)' }}>{o.items?.length} items · {new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={o.orderStatus} onChange={e => updateOrder(o._id, e.target.value)}
                      className="text-xs px-2 py-1.5 rounded-lg border" style={inputStyle}>
                      {['Order Placed', 'Seller Processing', 'Packed', 'Shipped', 'Out for Delivery'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}