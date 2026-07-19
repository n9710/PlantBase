/**
 * WishlistContext — Wishlist state management
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../api';

const WishlistContext = createContext();
export const useWishlist = () => useContext(WishlistContext);

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ids, setIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const { isLoggedIn } = useAuth();

  const fetchWishlist = useCallback(async () => {
    if (!isLoggedIn) { setItems([]); setIds(new Set()); return; }
    try {
      setLoading(true);
      const { data } = await api.get('/wishlist');
      const products = data.data || [];
      setItems(products);
      setIds(new Set(products.map(p => p.product?._id || p.product)));
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [isLoggedIn]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const toggle = async (productId) => {
    if (!isLoggedIn) return;
    try {
      const { data } = await api.post(`/wishlist/toggle/${productId}`);
      if (data.added) {
        setIds(prev => new Set([...prev, productId]));
      } else {
        setIds(prev => { const n = new Set(prev); n.delete(productId); return n; });
      }
      fetchWishlist();
      return data;
    } catch (err) { throw err; }
  };

  const isInWishlist = (productId) => ids.has(productId);

  return (
    <WishlistContext.Provider value={{ items, ids, toggle, isInWishlist, loading, count: ids.size, refresh: fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}
