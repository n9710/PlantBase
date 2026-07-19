/**
 * Register Page — Uses BRAND_NAME from constants
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEOHead from '../components/SEOHead';
import { BRAND_NAME } from '../constants';
import { Leaf, Eye, EyeOff, CheckCircle, Mail, User, Lock, Store } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    shopName: '',
    location: '',
    bio: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.role === 'seller' && !formData.shopName) {
      setError('Shop name is required for sellers');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      if (formData.role === 'seller') {
        payload.sellerInfo = {
          shopName: formData.shopName,
          location: formData.location,
          bio: formData.bio,
        };
      }

      const result = await register(payload);
      setRegistered(true);
      toast.success(result.message || 'Registration successful!');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // ─── Registration Success View ───
  if (registered) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div
          className="w-full max-w-md rounded-2xl border p-8 text-center animate-scale-in"
          style={{
            backgroundColor: 'var(--pb-surface)',
            borderColor: 'var(--pb-border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}
          >
            <CheckCircle className="w-8 h-8" style={{ color: 'var(--pb-success)' }} />
          </div>
          <h2 className="text-2xl font-display font-bold mb-3">Check Your Email!</h2>
          <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--pb-text-secondary)' }}>
            We've sent a verification link to:
          </p>
          <p className="text-sm font-semibold mb-4" style={{ color: 'var(--pb-accent)' }}>
            {formData.email}
          </p>
          <p className="text-xs leading-relaxed mb-6" style={{ color: 'var(--pb-text-secondary)' }}>
            Click the link in the email to verify your account. The link expires in 24 hours.
            Check your spam folder if you don't see it.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white btn-accent"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // ─── Registration Form ───
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div
        className="w-full max-w-lg rounded-2xl border p-8 animate-scale-in"
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
          <h1 className="text-2xl font-display font-bold mb-1">Create Account</h1>
          <p className="text-sm" style={{ color: 'var(--pb-text-secondary)' }}>
            Join {BRAND_NAME} and discover natural products
          </p>
        </div>

        {error && (
          <div
            className="mb-4 p-3 rounded-lg text-sm text-center"
            style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--pb-danger)' }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector */}
          <div>
            <label className="block text-sm font-medium mb-2">I want to</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'customer', label: 'Buy Products', icon: User },
                { value: 'seller', label: 'Sell Products', icon: Store },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: value }))}
                  className="flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all"
                  style={{
                    backgroundColor: formData.role === value ? 'var(--pb-accent)' : 'var(--pb-bg)',
                    borderColor: formData.role === value ? 'var(--pb-accent)' : 'var(--pb-border)',
                    color: formData.role === value ? '#fff' : 'var(--pb-text)',
                  }}
                >
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--pb-text-secondary)' }} />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2"
                style={{
                  backgroundColor: 'var(--pb-bg)',
                  borderColor: 'var(--pb-border)',
                  color: 'var(--pb-text)',
                }}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--pb-text-secondary)' }} />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
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

          {/* Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--pb-text-secondary)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border text-sm outline-none transition focus:ring-2"
                  style={{
                    backgroundColor: 'var(--pb-bg)',
                    borderColor: 'var(--pb-border)',
                    color: 'var(--pb-text)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--pb-text-secondary)' }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2"
                style={{
                  backgroundColor: 'var(--pb-bg)',
                  borderColor: 'var(--pb-border)',
                  color: 'var(--pb-text)',
                }}
              />
            </div>
          </div>

          {/* Seller fields */}
          {formData.role === 'seller' && (
            <div className="space-y-4 pt-2 border-t animate-fade-up" style={{ borderColor: 'var(--pb-border)' }}>
              <p className="text-sm font-semibold pt-2" style={{ color: 'var(--pb-secondary)' }}>
                🏪 Seller Information
              </p>
              <div>
                <label className="block text-sm font-medium mb-1.5">Shop Name *</label>
                <input
                  type="text"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                  placeholder="Your shop name"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2"
                  style={{
                    backgroundColor: 'var(--pb-bg)',
                    borderColor: 'var(--pb-border)',
                    color: 'var(--pb-text)',
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, State"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2"
                  style={{
                    backgroundColor: 'var(--pb-bg)',
                    borderColor: 'var(--pb-border)',
                    color: 'var(--pb-text)',
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about your products"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2 resize-none"
                  style={{
                    backgroundColor: 'var(--pb-bg)',
                    borderColor: 'var(--pb-border)',
                    color: 'var(--pb-text)',
                  }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white btn-accent disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--pb-text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold hover:underline" style={{ color: 'var(--pb-accent)' }}>
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}