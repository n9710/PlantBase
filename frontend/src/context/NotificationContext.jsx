/**
 * NotificationContext — Real-time notifications
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import api from '../api';

const NotificationContext = createContext();
export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isLoggedIn } = useAuth();
  const { socket } = useSocket();

  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn) { setNotifications([]); setUnreadCount(0); return; }
    try {
      const { data } = await api.get('/notifications?limit=20');
      setNotifications(data.data || []);
      setUnreadCount(data.unreadCount || 0);
    } catch { /* silent */ }
  }, [isLoggedIn]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // Listen for real-time notifications
  useEffect(() => {
    if (!socket) return;
    const handler = (notification) => {
      setNotifications(prev => [notification, ...prev].slice(0, 20));
      setUnreadCount(prev => prev + 1);
    };
    socket.on('notification:new', handler);
    return () => socket.off('notification:new', handler);
  }, [socket]);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* silent */ }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, refresh: fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}
