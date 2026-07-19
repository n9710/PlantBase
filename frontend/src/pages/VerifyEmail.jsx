/**
 * VerifyEmail Page — PlantBase
 * Auto-verifies email on mount using token from URL.
 */
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import api from '../api';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await api.get(`/auth/verify-email/${token}`);
        setMessage(data.message);
        setStatus('success');
      } catch (err) {
        setMessage(err.response?.data?.message || 'Verification failed');
        setStatus('error');
      }
    };

    if (token) verify();
  }, [token]);

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
        {status === 'loading' && (
          <div className="animate-fade-in">
            <Loader className="w-12 h-12 mx-auto mb-4 animate-spin" style={{ color: 'var(--pb-accent)' }} />
            <h2 className="text-xl font-display font-bold mb-2">Verifying Your Email...</h2>
            <p className="text-sm" style={{ color: 'var(--pb-text-secondary)' }}>Please wait a moment.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="animate-fade-up">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}
            >
              <CheckCircle className="w-8 h-8" style={{ color: 'var(--pb-success)' }} />
            </div>
            <h2 className="text-2xl font-display font-bold mb-3">Email Verified!</h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--pb-text-secondary)' }}>
              {message}
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white btn-accent"
            >
              Log In Now
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="animate-fade-up">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}
            >
              <XCircle className="w-8 h-8" style={{ color: 'var(--pb-danger)' }} />
            </div>
            <h2 className="text-2xl font-display font-bold mb-3">Verification Failed</h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--pb-text-secondary)' }}>
              {message}
            </p>
            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white btn-accent"
              >
                Go to Login
              </Link>
              <p className="text-xs" style={{ color: 'var(--pb-text-secondary)' }}>
                The link may have expired. Try logging in to request a new verification email.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
