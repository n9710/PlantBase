/**
 * Login Page — Uses BRAND_NAME from constants
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEOHead from '../components/SEOHead';
import { BRAND_NAME } from '../constants';
import { Leaf, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationNeeded, setVerificationNeeded] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [resending, setResending] = useState(false);

  const { login, resendVerification } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setVerificationNeeded(false);

    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);

      // Navigate based on role
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'seller') navigate('/seller');
      else navigate('/');
    } catch (err) {
      const data = err.response?.data;
      if (data?.requiresVerification) {
        setVerificationNeeded(true);
        setVerificationEmail(data.email || email);
      } else if (err.response?.status === 401) {
        toast.error(data?.message || 'Invalid email or password');
      }
      // Toast handled by api interceptor for other errors
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await resendVerification(verificationEmail);
      toast.success('Verification email sent! Check your inbox.');
    } catch (err) {
      toast.error('Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <SEOHead page="login" />
      <div
        className="w-full max-w-md rounded-2xl border p-8 animate-scale-in"
        style={{
          backgroundColor: 'var(--pb-surface)',
          borderColor: 'var(--pb-border)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="w-8 h-8" style={{ color: 'var(--pb-accent)' }} />
          </div>
          <h1 className="text-2xl font-display font-bold mb-1">Welcome Back</h1>
          <p className="text-sm" style={{ color: 'var(--pb-text-secondary)' }}>
            Log in to your {BRAND_NAME} account
          </p>
        </div>

        {/* Verification needed banner */}
        {verificationNeeded && (
          <div
            className="mb-4 p-4 rounded-xl text-sm animate-fade-up"
            style={{ backgroundColor: 'rgba(245,158,11,0.1)', border: '1px solid var(--pb-warning)' }}
          >
            <p className="font-medium mb-2" style={{ color: 'var(--pb-warning)' }}>
              📧 Email Verification Required
            </p>
            <p className="text-xs mb-3" style={{ color: 'var(--pb-text-secondary)' }}>
              Please verify your email address before logging in. Check your inbox for the verification link.
            </p>
            <button
              onClick={handleResendVerification}
              disabled={resending}
              className="text-xs font-semibold underline"
              style={{ color: 'var(--pb-accent)' }}
            >
              {resending ? 'Sending...' : 'Resend verification email'}
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--pb-text-secondary)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2"
                style={{
                  backgroundColor: 'var(--pb-bg)',
                  borderColor: 'var(--pb-border)',
                  color: 'var(--pb-text)',
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium hover:underline"
                style={{ color: 'var(--pb-accent)' }}
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--pb-text-secondary)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-12 py-3 rounded-xl border text-sm outline-none transition focus:ring-2"
                style={{
                  backgroundColor: 'var(--pb-bg)',
                  borderColor: 'var(--pb-border)',
                  color: 'var(--pb-text)',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                style={{ color: 'var(--pb-text-secondary)' }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white btn-accent disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              'Log In'
            )}
          </button>
        </form>

        {/* Register link */}
        <p className="text-center text-sm mt-6" style={{ color: 'var(--pb-text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold hover:underline" style={{ color: 'var(--pb-accent)' }}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}