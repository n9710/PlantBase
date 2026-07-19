import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <ShieldAlert className="w-16 h-16 mb-4" style={{ color: 'var(--pb-danger)' }} />
      <h2 className="text-2xl font-display font-bold mb-2">Access Denied</h2>
      <p style={{ color: 'var(--pb-text-secondary)' }}>You need admin privileges to view this page.</p>
    </div>
  );
  return children;
}

export function SellerRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (!['seller', 'admin'].includes(user.role)) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <ShieldAlert className="w-16 h-16 mb-4" style={{ color: 'var(--pb-danger)' }} />
      <h2 className="text-2xl font-display font-bold mb-2">Access Denied</h2>
      <p style={{ color: 'var(--pb-text-secondary)' }}>You need seller privileges to view this page.</p>
    </div>
  );
  return children;
}