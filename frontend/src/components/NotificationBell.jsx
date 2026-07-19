/**
 * NotificationBell — Dropdown with real-time notifications
 */
import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck } from 'lucide-react';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const ref = useRef();

  // Close on click outside
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClick = (n) => {
    if (!n.read) markRead(n._id);
    if (n.data?.link) navigate(n.data.link);
    setOpen(false);
  };

  const getIcon = (type) => {
    const icons = {
      order_placed: '🛒', order_update: '📦', order_delivered: '✅', order_cancelled: '❌',
      seller_approved: '🎉', seller_rejected: '😔', product_approved: '✅', product_rejected: '❌',
      review_received: '⭐', low_stock: '⚠️', referral_reward: '🎁', coupon: '🎫', system: '🔔',
    };
    return icons[type] || '🔔';
  };

  const timeAgo = (date) => {
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-lg transition-all hover:scale-110" style={{ color: 'var(--pb-text-secondary)' }}>
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white animate-pulse"
            style={{ backgroundColor: 'var(--pb-danger)' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl shadow-2xl border animate-slide-down z-50"
          style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--pb-border)' }}>
            <h3 className="text-sm font-bold">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--pb-accent)' }}>
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--pb-text-secondary)' }} />
              <p className="text-sm" style={{ color: 'var(--pb-text-secondary)' }}>No notifications yet</p>
            </div>
          ) : (
            notifications.map(n => (
              <button key={n._id} onClick={() => handleClick(n)}
                className="w-full text-left px-4 py-3 border-b transition-all hover:opacity-80 flex gap-3"
                style={{
                  borderColor: 'var(--pb-border)',
                  backgroundColor: n.read ? 'transparent' : 'rgba(141,182,0,0.05)',
                }}>
                <span className="text-lg flex-shrink-0 mt-0.5">{getIcon(n.type)}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{n.title}</p>
                  <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--pb-text-secondary)' }}>{n.message}</p>
                  <p className="text-[10px] mt-1 font-medium" style={{ color: 'var(--pb-text-secondary)' }}>{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ backgroundColor: 'var(--pb-accent)' }} />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
