/**
 * ForgotPassword Page — PlantBase
 * Allows user to request a password reset link via email.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div
        className="w-full max-w-md rounded-2xl border p-8 animate-scale-in"
        style={{
          backgroundColor: 'var(--pb-surface)',
          borderColor: 'var(--pb-border)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        }}
      >
        {/* Back link */}
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm mb-6 hover:underline transition"
          style={{ color: 'var(--pb-text-secondary)' }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        {sent ? (
          /* ─── Success State ─── */
          <div className="text-center animate-fade-up">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}
            >
              <CheckCircle className="w-8 h-8" style={{ color: 'var(--pb-success)' }} />
            </div>
            <h2 className="text-2xl font-display font-bold mb-3">Check Your Email</h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--pb-text-secondary)' }}>
              If an account exists with <strong>{email}</strong>, we've sent a password reset link.
              Please check your inbox and spam folder.
            </p>
            <p className="text-xs" style={{ color: 'var(--pb-text-secondary)' }}>
              Didn't receive it?{' '}
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="underline font-medium"
                style={{ color: 'var(--pb-accent)' }}
              >
                Try again
              </button>
            </p>
          </div>
        ) : (
          /* ─── Form State ─── */
          <>
            <div className="text-center mb-6">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'rgba(141,182,0,0.1)' }}
              >
                <Mail className="w-7 h-7" style={{ color: 'var(--pb-accent)' }} />
              </div>
              <h2 className="text-2xl font-display font-bold mb-2">Forgot Password?</h2>
              <p className="text-sm" style={{ color: 'var(--pb-text-secondary)' }}>
                Enter your email and we'll send you a reset link.
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
              <div>
                <label className="block text-sm font-medium mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2"
                  style={{
                    backgroundColor: 'var(--pb-bg)',
                    borderColor: 'var(--pb-border)',
                    color: 'var(--pb-text)',
                    '--tw-ring-color': 'var(--pb-accent)',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 btn-accent disabled:opacity-50"
              >
                {loading ? (
                  <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send Reset Link
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
