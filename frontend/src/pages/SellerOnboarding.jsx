/**
 * SellerOnboarding — Multi-step seller application
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEOHead from '../components/SEOHead';
import { BRAND_NAME, PRODUCT_CATEGORIES } from '../constants';
import api from '../api';
import toast from 'react-hot-toast';
import { Store, FileText, CreditCard, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export default function SellerOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    shopName: '', shopDescription: '', categories: [],
    gstNumber: '', panNumber: '',
    bankDetails: { accountName: '', accountNumber: '', ifsc: '', bankName: '', upiId: '' },
    location: { city: '', state: '', pincode: '' },
  });

  const totalSteps = 4;

  const toggleCategory = (cat) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(cat) ? prev.categories.filter(c => c !== cat) : [...prev.categories, cat]
    }));
  };

  const submit = async () => {
    if (!form.shopName.trim()) return toast.error('Shop name is required');
    setLoading(true);
    try {
      await api.post('/seller-profile/apply', form);
      toast.success('Application submitted! We will review it shortly.');
      navigate('/profile');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit'); }
    finally { setLoading(false); }
  };

  const inputStyle = {
    backgroundColor: 'var(--pb-bg)', borderColor: 'var(--pb-border)', color: 'var(--pb-text)',
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <SEOHead title={`Become a Seller | ${BRAND_NAME}`} />
      <h1 className="text-3xl font-display font-bold mb-2">Become a {BRAND_NAME} Seller</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--pb-text-secondary)' }}>List your organic & eco-friendly products and reach thousands of customers.</p>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex-1 h-1.5 rounded-full transition-all" style={{
            backgroundColor: i < step ? 'var(--pb-accent)' : 'var(--pb-border)'
          }} />
        ))}
      </div>

      <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>

        {/* Step 1: Shop Info */}
        {step === 1 && (
          <div className="animate-fade-up">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Store className="w-5 h-5" style={{ color: 'var(--pb-accent)' }} /> Shop Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold mb-1 block">Shop Name *</label>
                <input value={form.shopName} onChange={e => setForm({ ...form, shopName: e.target.value })}
                  placeholder="e.g. Green Roots Organics" className="w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block">Shop Description</label>
                <textarea value={form.shopDescription} onChange={e => setForm({ ...form, shopDescription: e.target.value })}
                  rows={3} placeholder="Describe your shop and products..." className="w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none resize-none" style={inputStyle} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-xs font-semibold mb-1 block">City</label><input value={form.location.city} onChange={e => setForm({ ...form, location: { ...form.location, city: e.target.value } })} className="w-full px-3 py-2 rounded-lg text-sm border" style={inputStyle} /></div>
                <div><label className="text-xs font-semibold mb-1 block">State</label><input value={form.location.state} onChange={e => setForm({ ...form, location: { ...form.location, state: e.target.value } })} className="w-full px-3 py-2 rounded-lg text-sm border" style={inputStyle} /></div>
                <div><label className="text-xs font-semibold mb-1 block">Pincode</label><input value={form.location.pincode} onChange={e => setForm({ ...form, location: { ...form.location, pincode: e.target.value } })} className="w-full px-3 py-2 rounded-lg text-sm border" style={inputStyle} /></div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Categories */}
        {step === 2 && (
          <div className="animate-fade-up">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><FileText className="w-5 h-5" style={{ color: 'var(--pb-accent)' }} /> Product Categories</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--pb-text-secondary)' }}>Select the categories you plan to sell in</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRODUCT_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => toggleCategory(cat)}
                  className="px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-all"
                  style={{
                    borderColor: form.categories.includes(cat) ? 'var(--pb-accent)' : 'var(--pb-border)',
                    backgroundColor: form.categories.includes(cat) ? 'rgba(141,182,0,0.1)' : 'transparent',
                    color: form.categories.includes(cat) ? 'var(--pb-accent)' : 'var(--pb-text)',
                  }}>{cat}</button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: KYC */}
        {step === 3 && (
          <div className="animate-fade-up">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><FileText className="w-5 h-5" style={{ color: 'var(--pb-accent)' }} /> KYC Documents (Optional)</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--pb-text-secondary)' }}>GST and PAN are optional for initial application</p>
            <div className="space-y-4">
              <div><label className="text-xs font-semibold mb-1 block">GST Number (optional)</label><input value={form.gstNumber} onChange={e => setForm({ ...form, gstNumber: e.target.value })} placeholder="22AAAAA0000A1Z5" className="w-full px-4 py-2.5 rounded-xl text-sm border" style={inputStyle} /></div>
              <div><label className="text-xs font-semibold mb-1 block">PAN Number (optional)</label><input value={form.panNumber} onChange={e => setForm({ ...form, panNumber: e.target.value })} placeholder="ABCDE1234F" className="w-full px-4 py-2.5 rounded-xl text-sm border" style={inputStyle} /></div>
            </div>
          </div>
        )}

        {/* Step 4: Bank Details */}
        {step === 4 && (
          <div className="animate-fade-up">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5" style={{ color: 'var(--pb-accent)' }} /> Bank Details</h2>
            <div className="space-y-4">
              {[
                { key: 'accountName', label: 'Account Holder Name', placeholder: 'John Doe' },
                { key: 'accountNumber', label: 'Account Number', placeholder: '1234567890' },
                { key: 'ifsc', label: 'IFSC Code', placeholder: 'SBIN0001234' },
                { key: 'bankName', label: 'Bank Name', placeholder: 'State Bank of India' },
                { key: 'upiId', label: 'UPI ID (optional)', placeholder: 'shop@upi' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold mb-1 block">{f.label}</label>
                  <input value={form.bankDetails[f.key]} onChange={e => setForm({ ...form, bankDetails: { ...form.bankDetails, [f.key]: e.target.value } })}
                    placeholder={f.placeholder} className="w-full px-4 py-2.5 rounded-xl text-sm border" style={inputStyle} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border"
              style={{ borderColor: 'var(--pb-border)' }}><ArrowLeft className="w-4 h-4" /> Back</button>
          ) : <div />}

          {step < totalSteps ? (
            <button onClick={() => setStep(step + 1)} className="btn-accent px-6 py-2.5 rounded-xl text-sm flex items-center gap-2">
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={submit} disabled={loading} className="btn-accent px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 disabled:opacity-50">
              <CheckCircle className="w-4 h-4" /> {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
