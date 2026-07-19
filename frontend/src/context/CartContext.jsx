import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const { user, loading } = useAuth();
  const cartKey = user ? `pb_cart_${user._id}` : 'pb_cart_guest';

  const [cart, setCart] = useState([]);
  const [activeCartKey, setActiveCartKey] = useState('');

  // Load cart on mount or user change
  useEffect(() => {
    if (loading) return; // Wait until Auth context finishes checking user status

    const guestCart = JSON.parse(localStorage.getItem('pb_cart_guest')) || [];
    let savedCart = JSON.parse(localStorage.getItem(cartKey)) || [];

    // Transfer guest cart to user cart upon login
    if (user && guestCart.length > 0) {
      const mergedMap = new Map(savedCart.map(i => [i._id, i]));
      guestCart.forEach(item => {
        if (mergedMap.has(item._id)) {
          mergedMap.get(item._id).qty += item.qty;
        } else {
          mergedMap.set(item._id, item);
        }
      });
      savedCart = Array.from(mergedMap.values());
      localStorage.setItem(cartKey, JSON.stringify(savedCart)); // Save merged directly
      localStorage.removeItem('pb_cart_guest'); // Clean up guest cart
    }

    setCart(savedCart);
    setActiveCartKey(cartKey); // Mark that we successfully loaded this key's data
  }, [user, loading, cartKey]);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    // Only save if the cart we currently hold belongs to the active cart key!
    // This prevents race-conditions where an old empty cart overwrites a new logged-in user's cart on switch.
    if (activeCartKey === cartKey && activeCartKey !== '') {
      localStorage.setItem(cartKey, JSON.stringify(cart));
    }
  }, [cart, activeCartKey, cartKey]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i._id === product._id);
      if (existing) return prev.map(i => i._id === product._id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i._id !== id));
  const updateQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id);
    setCart(prev => prev.map(i => i._id === id ? { ...i, qty } : i));
  };
  const clearCart = () => setCart([]);
  
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}