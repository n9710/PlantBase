/**
 * Wallet — Rewards, referral credits, transactions
 */
import { useState, useEffect } from 'react';
import api from '../api';
import SEOHead from '../components/SEOHead';
import { BRAND_NAME, CURRENCY_SYMBOL } from '../constants';
import { Wallet as WalletIcon, ArrowUp, ArrowDown, Gift, Copy, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WalletPage() {
  const [wallet, setWallet] = useState(null);
  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [walletRes, refRes] = await Promise.all([
          api.get('/wallet'),
          api.get('/referral/code'),
        ]);
        setWallet(walletRes.data.data);
        setReferral(refRes.data.data);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const copyCode = () => {
    if (referral?.code) {
      navigator.clipboard.writeText(referral.code);
      toast.success('Referral code copied!');
    }
  };

  const shareLink = () => {
    if (referral?.shareLink) {
      if (navigator.share) {
        navigator.share({ title: `Join ${BRAND_NAME}`, text: referral.shareText, url: referral.shareLink });
      } else {
        navigator.clipboard.writeText(referral.shareLink);
        toast.success('Share link copied!');
      }
    }
  };

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-8"><div className="shimmer h-64 rounded-2xl" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <SEOHead page="wallet" />
      <h1 className="text-3xl font-display font-bold mb-8">{BRAND_NAME} Wallet</h1>

      {/* Balance Card */}
      <div className="rounded-2xl p-8 text-center relative overflow-hidden" style={{ backgroundColor: 'var(--pb-accent)' }}>
        <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.4), transparent)' }} />
        <div className="relative">
          <WalletIcon className="w-10 h-10 mx-auto mb-3 text-white/80" />
          <p className="text-white/70 text-sm mb-1">Available Balance</p>
          <p className="text-4xl font-bold text-white">{CURRENCY_SYMBOL}{wallet?.balance || 0}</p>
          <div className="flex justify-center gap-6 mt-4 text-xs text-white/70">
            <span>Earned: {CURRENCY_SYMBOL}{wallet?.totalEarned || 0}</span>
            <span>Spent: {CURRENCY_SYMBOL}{wallet?.totalSpent || 0}</span>
          </div>
        </div>
      </div>

      {/* Referral Card */}
      <div className="mt-6 rounded-2xl border p-6" style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><Gift className="w-5 h-5" style={{ color: 'var(--pb-accent)' }} /> Refer & Earn</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--pb-text-secondary)' }}>
          Invite friends to {BRAND_NAME} and you both earn {CURRENCY_SYMBOL}{referral?.rewardPerReferral || 50}!
        </p>
        <div className="flex gap-2">
          <div className="flex-1 px-4 py-3 rounded-xl font-mono text-lg font-bold text-center" style={{ backgroundColor: 'var(--pb-bg)', color: 'var(--pb-accent)' }}>
            {referral?.code || '---'}
          </div>
          <button onClick={copyCode} className="p-3 rounded-xl border transition hover:scale-105" style={{ borderColor: 'var(--pb-border)' }}>
            <Copy className="w-5 h-5" />
          </button>
          <button onClick={shareLink} className="p-3 rounded-xl text-white transition hover:scale-105" style={{ backgroundColor: 'var(--pb-accent)' }}>
            <Share2 className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs mt-3" style={{ color: 'var(--pb-text-secondary)' }}>
          Total referrals: {referral?.referralCount || 0}
        </p>
      </div>

      {/* Transactions */}
      <div className="mt-6 rounded-2xl border p-6" style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
        <h3 className="text-sm font-bold mb-4">Transaction History</h3>
        {(!wallet?.transactions || wallet.transactions.length === 0) ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--pb-text-secondary)' }}>No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {wallet.transactions.map(t => (
              <div key={t._id} className="flex items-center gap-3 py-2 border-b" style={{ borderColor: 'var(--pb-border)' }}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                  {t.type === 'credit' ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{t.description}</p>
                  <p className="text-[10px]" style={{ color: 'var(--pb-text-secondary)' }}>
                    {new Date(t.date).toLocaleDateString('en-IN')} · {t.source}
                  </p>
                </div>
                <p className={`text-sm font-bold ${t.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                  {t.type === 'credit' ? '+' : '-'}{CURRENCY_SYMBOL}{t.amount}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
