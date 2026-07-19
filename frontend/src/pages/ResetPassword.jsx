/**
 * ResetPassword Page — PlantBase
 * Allows user to set a new password using a token from email.
 */
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
      toast.success('Password reset successful!');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired reset link');
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
        {success ? (
          /* ─── Success State ─── */
          <div className="text-center animate-fade-up">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}
            >
              <CheckCircle className="w-8 h-8" style={{ color: 'var(--pb-success)' }} />
            </div>
            <h2 className="text-2xl font-display font-bold mb-3">Password Reset!</h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--pb-text-secondary)' }}>
              Your password has been reset successfully. You can now log in with your new password.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white btn-accent"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          /* ─── Form State ─── */
          <>
            <div className="text-center mb-6">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'rgba(160,82,45,0.1)' }}
              >
                <Lock className="w-7 h-7" style={{ color: 'var(--pb-secondary)' }} />
              </div>
              <h2 className="text-2xl font-display font-bold mb-2">Set New Password</h2>
              <p className="text-sm" style={{ color: 'var(--pb-text-secondary)' }}>
                Choose a strong password for your account.
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
                <label className="block text-sm font-medium mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2 pr-12"
                    style={{
                      backgroundColor: 'var(--pb-bg)',
                      borderColor: 'var(--pb-border)',
                      color: 'var(--pb-text)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                    style={{ color: 'var(--pb-text-secondary)' }}
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2"
                  style={{
                    backgroundColor: 'var(--pb-bg)',
                    borderColor: 'var(--pb-border)',
                    color: 'var(--pb-text)',
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
                  'Reset Password'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
