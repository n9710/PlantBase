/**
 * Profile Page — PlantBase
 * User dashboard with tabs: Personal Info, Order History, Track Orders.
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import {
  User, Package, Truck, MapPin, Phone, Mail, Lock, Save,
  ChevronDown, ChevronUp, Clock, CheckCircle, XCircle,
  AlertCircle, Eye, EyeOff, RefreshCw, ShoppingBag
} from 'lucide-react';

// ─── Order Status Definitions ───
const STATUS_FLOW = ['Order Placed', 'Admin Confirmed', 'Seller Processing', 'Out for Delivery', 'Delivered'];
const STATUS_COLORS = {
  'Order Placed': '#f59e0b',
  'Admin Confirmed': '#3b82f6',
  'Seller Processing': '#8b5cf6',
  'Out for Delivery': '#f97316',
  'Delivered': '#22c55e',
  'Cancelled': '#ef4444',
};
const STATUS_ICONS = {
  'Order Placed': ShoppingBag,
  'Admin Confirmed': CheckCircle,
  'Seller Processing': Package,
  'Out for Delivery': Truck,
  'Delivered': CheckCircle,
  'Cancelled': XCircle,
};

// ─── Status Stepper Component ───
function OrderStepper({ currentStatus }) {
  if (currentStatus === 'Cancelled') {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
        <XCircle className="w-5 h-5" style={{ color: 'var(--pb-danger)' }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--pb-danger)' }}>Order Cancelled</span>
      </div>
    );
  }

  const currentIdx = STATUS_FLOW.indexOf(currentStatus);

  return (
    <div className="w-full overflow-x-auto">
      <div className="status-stepper min-w-[400px]">
        {STATUS_FLOW.map((status, idx) => {
          const isCompleted = idx < currentIdx;
          const isActive = idx === currentIdx;
          const Icon = STATUS_ICONS[status] || AlertCircle;

          return (
            <div
              key={status}
              className={`status-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
            >
              <div className="step-dot">
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span className="step-label">{status}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Order Card Component ───
function OrderCard({ order, expanded, onToggle }) {
  const statusColor = STATUS_COLORS[order.orderStatus] || 'var(--pb-text-secondary)';
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div
      className="rounded-xl border overflow-hidden transition-all"
      style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}
    >
      {/* Order header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:opacity-90 transition"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-mono" style={{ color: 'var(--pb-text-secondary)' }}>
              #{order._id?.slice(-8).toUpperCase()}
            </span>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
            >
              {order.orderStatus}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-1.5 text-xs" style={{ color: 'var(--pb-text-secondary)' }}>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{date}</span>
            <span className="font-semibold" style={{ color: 'var(--pb-text)' }}>₹{order.totalPrice?.toFixed(2)}</span>
            <span>{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 flex-shrink-0" />}
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t px-4 pb-4 animate-slide-down" style={{ borderColor: 'var(--pb-border)' }}>
          {/* Stepper */}
          <div className="py-4">
            <OrderStepper currentStatus={order.orderStatus} />
          </div>

          {/* Items */}
          <div className="space-y-2 mb-4">
            {order.items?.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-2 rounded-lg"
                style={{ backgroundColor: 'var(--pb-bg)' }}
              >
                {item.image && (
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs" style={{ color: 'var(--pb-text-secondary)' }}>
                    Qty: {item.qty} × ₹{item.price?.toFixed(2)}
                  </p>
                </div>
                <span className="text-sm font-semibold">₹{(item.qty * item.price)?.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Shipping address */}
          {order.shippingAddress && (
            <div className="p-3 rounded-lg text-xs" style={{ backgroundColor: 'var(--pb-bg)' }}>
              <p className="font-semibold mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Shipping Address
              </p>
              <p style={{ color: 'var(--pb-text-secondary)' }}>
                {order.shippingAddress.fullName}, {order.shippingAddress.address}
                {order.shippingAddress.city && `, ${order.shippingAddress.city}`}
                {order.shippingAddress.state && `, ${order.shippingAddress.state}`}
                {order.shippingAddress.pincode && ` - ${order.shippingAddress.pincode}`}
              </p>
            </div>
          )}

          {/* Status history */}
          {order.statusHistory?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--pb-text-secondary)' }}>Status History</p>
              <div className="space-y-1.5">
                {order.statusHistory.map((entry, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    <div
                      className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: STATUS_COLORS[entry.status] || 'var(--pb-border)' }}
                    />
                    <div>
                      <span className="font-medium">{entry.status}</span>
                      <span className="mx-1" style={{ color: 'var(--pb-text-secondary)' }}>·</span>
                      <span style={{ color: 'var(--pb-text-secondary)' }}>
                        {new Date(entry.updatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                      {entry.note && (
                        <p className="mt-0.5" style={{ color: 'var(--pb-text-secondary)' }}>{entry.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price summary */}
          <div className="mt-4 pt-3 border-t text-xs space-y-1" style={{ borderColor: 'var(--pb-border)' }}>
            <div className="flex justify-between">
              <span style={{ color: 'var(--pb-text-secondary)' }}>Items</span>
              <span>₹{order.itemsPrice?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--pb-text-secondary)' }}>Shipping</span>
              <span>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice?.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-bold text-sm pt-1">
              <span>Total</span>
              <span>₹{order.totalPrice?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Profile Component ───
export default function Profile() {
  const { user, isLoggedIn, loading: authLoading, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('info');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '', phone: '',
    street: '', city: '', state: '', pincode: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isLoggedIn) navigate('/login');
  }, [authLoading, isLoggedIn, navigate]);

  // Populate profile form from user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        pincode: user.address?.pincode || '',
      });
    }
  }, [user]);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const { data } = await api.get('/orders/mine');
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && (activeTab === 'orders' || activeTab === 'tracking')) {
      fetchOrders();
    }
  }, [activeTab, isLoggedIn, fetchOrders]);

  // Polling for active orders (every 30s)
  useEffect(() => {
    if (activeTab !== 'tracking') return;
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [activeTab, fetchOrders]);

  // Save profile info
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        address: {
          street: profileForm.street,
          city: profileForm.city,
          state: profileForm.state,
          pincode: profileForm.pincode,
        },
      });
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSavingPassword(true);
    try {
      await updateProfile({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  if (authLoading) return null;

  const activeOrders = orders.filter(o => !['Delivered', 'Cancelled'].includes(o.orderStatus));
  const pastOrders = orders.filter(o => ['Delivered', 'Cancelled'].includes(o.orderStatus));

  const tabs = [
    { id: 'info', label: 'Personal Info', icon: User },
    { id: 'orders', label: 'Order History', icon: Package },
    { id: 'tracking', label: 'Track Orders', icon: Truck, badge: activeOrders.length },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-up">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">My Profile</h1>
        <p className="text-sm" style={{ color: 'var(--pb-text-secondary)' }}>
          Manage your account, view orders, and track deliveries.
        </p>
      </div>

      {/* User info summary */}
      <div
        className="flex items-center gap-4 p-4 rounded-xl border mb-6"
        style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
          style={{ backgroundColor: 'var(--pb-accent)' }}
        >
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="min-w-0">
          <p className="text-lg font-semibold truncate">{user?.name}</p>
          <p className="text-sm truncate" style={{ color: 'var(--pb-text-secondary)' }}>{user?.email}</p>
        </div>
        <span
          className="ml-auto text-xs font-semibold uppercase px-3 py-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: 'var(--pb-accent)', color: '#fff' }}
        >
          {user?.role}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all"
              style={{
                backgroundColor: activeTab === tab.id ? 'var(--pb-accent)' : 'var(--pb-surface)',
                color: activeTab === tab.id ? '#fff' : 'var(--pb-text-secondary)',
                borderColor: 'var(--pb-border)',
              }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.badge > 0 && (
                <span
                  className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{
                    backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.3)' : 'var(--pb-accent)',
                    color: '#fff',
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── TAB: Personal Info ─── */}
      {activeTab === 'info' && (
        <div className="space-y-6 animate-fade-up">
          {/* Profile form */}
          <form onSubmit={handleSaveProfile}>
            <div
              className="rounded-xl border p-6"
              style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" style={{ color: 'var(--pb-accent)' }} /> Personal Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2"
                    style={{ backgroundColor: 'var(--pb-bg)', borderColor: 'var(--pb-border)', color: 'var(--pb-text)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border text-sm opacity-60 cursor-not-allowed"
                      style={{ backgroundColor: 'var(--pb-bg)', borderColor: 'var(--pb-border)', color: 'var(--pb-text)' }}
                    />
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--pb-text-secondary)' }} />
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2"
                      style={{ backgroundColor: 'var(--pb-bg)', borderColor: 'var(--pb-border)', color: 'var(--pb-text)' }}
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <h4 className="text-sm font-semibold mt-6 mb-3 flex items-center gap-2" style={{ color: 'var(--pb-text-secondary)' }}>
                <MapPin className="w-4 h-4" /> Address
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={profileForm.street}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, street: e.target.value }))}
                    placeholder="Street address"
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2"
                    style={{ backgroundColor: 'var(--pb-bg)', borderColor: 'var(--pb-border)', color: 'var(--pb-text)' }}
                  />
                </div>
                <input
                  type="text"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="City"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2"
                  style={{ backgroundColor: 'var(--pb-bg)', borderColor: 'var(--pb-border)', color: 'var(--pb-text)' }}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={profileForm.state}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="State"
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2"
                    style={{ backgroundColor: 'var(--pb-bg)', borderColor: 'var(--pb-border)', color: 'var(--pb-text)' }}
                  />
                  <input
                    type="text"
                    value={profileForm.pincode}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, pincode: e.target.value }))}
                    placeholder="Pincode"
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2"
                    style={{ backgroundColor: 'var(--pb-bg)', borderColor: 'var(--pb-border)', color: 'var(--pb-text)' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-6 px-6 py-2.5 rounded-xl text-sm font-semibold text-white btn-accent disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          </form>

          {/* Change password */}
          <form onSubmit={handleChangePassword}>
            <div
              className="rounded-xl border p-6"
              style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5" style={{ color: 'var(--pb-secondary)' }} /> Change Password
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Current Password</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    required
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2"
                    style={{ backgroundColor: 'var(--pb-bg)', borderColor: 'var(--pb-border)', color: 'var(--pb-text)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">New Password</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    required
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2"
                    style={{ backgroundColor: 'var(--pb-bg)', borderColor: 'var(--pb-border)', color: 'var(--pb-text)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Confirm New</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2"
                    style={{ backgroundColor: 'var(--pb-bg)', borderColor: 'var(--pb-border)', color: 'var(--pb-text)' }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="text-xs flex items-center gap-1"
                  style={{ color: 'var(--pb-text-secondary)' }}
                >
                  {showPasswords ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {showPasswords ? 'Hide' : 'Show'} passwords
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--pb-secondary)' }}
                >
                  {savingPassword ? (
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  Change Password
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ─── TAB: Order History ─── */}
      {activeTab === 'orders' && (
        <div className="animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">All Orders ({orders.length})</h3>
            <button
              onClick={fetchOrders}
              disabled={ordersLoading}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition"
              style={{ color: 'var(--pb-accent)', backgroundColor: 'rgba(141,182,0,0.08)' }}
            >
              <RefreshCw className={`w-3 h-3 ${ordersLoading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          {ordersLoading && orders.length === 0 ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-20 shimmer rounded-xl" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-semibold mb-1">No orders yet</p>
              <p className="text-sm" style={{ color: 'var(--pb-text-secondary)' }}>
                Start shopping to see your orders here!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <OrderCard
                  key={order._id}
                  order={order}
                  expanded={expandedOrder === order._id}
                  onToggle={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: Track Orders ─── */}
      {activeTab === 'tracking' && (
        <div className="animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Active Orders ({activeOrders.length})
              <span className="text-xs font-normal ml-2" style={{ color: 'var(--pb-text-secondary)' }}>
                Auto-refreshes every 30s
              </span>
            </h3>
            <button
              onClick={fetchOrders}
              disabled={ordersLoading}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition"
              style={{ color: 'var(--pb-accent)', backgroundColor: 'rgba(141,182,0,0.08)' }}
            >
              <RefreshCw className={`w-3 h-3 ${ordersLoading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          {ordersLoading && activeOrders.length === 0 ? (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="h-24 shimmer rounded-xl" />)}
            </div>
          ) : activeOrders.length === 0 ? (
            <div className="text-center py-16">
              <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-semibold mb-1">No active orders</p>
              <p className="text-sm" style={{ color: 'var(--pb-text-secondary)' }}>
                All your orders have been delivered or there are no pending orders.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeOrders.map(order => (
                <OrderCard
                  key={order._id}
                  order={order}
                  expanded={expandedOrder === order._id}
                  onToggle={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                />
              ))}
            </div>
          )}

          {/* Past orders summary */}
          {pastOrders.length > 0 && (
            <div className="mt-8">
              <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--pb-text-secondary)' }}>
                Completed Orders ({pastOrders.length})
              </h4>
              <div className="space-y-2">
                {pastOrders.slice(0, 5).map(order => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between p-3 rounded-lg text-sm"
                    style={{ backgroundColor: 'var(--pb-surface)', border: '1px solid var(--pb-border)' }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono" style={{ color: 'var(--pb-text-secondary)' }}>
                        #{order._id?.slice(-8).toUpperCase()}
                      </span>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${STATUS_COLORS[order.orderStatus]}20`,
                          color: STATUS_COLORS[order.orderStatus],
                        }}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                    <span className="font-semibold">₹{order.totalPrice?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
