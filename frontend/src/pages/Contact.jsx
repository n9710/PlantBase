/**
 * Contact Page
 */
import { useState } from 'react';
import SEOHead from '../components/SEOHead';
import { BRAND_NAME, BRAND_EMAIL } from '../constants';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success('Message sent successfully! We will get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 1000);
  };

  const inputStyle = {
    backgroundColor: 'var(--pb-bg)',
    borderColor: 'var(--pb-border)',
    color: 'var(--pb-text)',
  };

  return (
    <div className="min-h-screen px-4 py-12">
      <SEOHead page="contact" />
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 animate-fade-up">
          <h1 className="text-4xl font-display font-bold mb-4">Contact Us</h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--pb-text-secondary)' }}>
            Have a question about an order, want to become a seller, or just want to say hi? We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6 animate-fade-up delay-100">
            <div className="rounded-2xl border p-6 text-center" style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
              <Mail className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--pb-accent)' }} />
              <h3 className="font-bold mb-1">Email Us</h3>
              <p className="text-sm" style={{ color: 'var(--pb-text-secondary)' }}>Our team usually responds within 24 hours.</p>
              <a href={`mailto:${BRAND_EMAIL}`} className="text-sm font-semibold mt-2 inline-block hover:underline" style={{ color: 'var(--pb-text)' }}>
                {BRAND_EMAIL}
              </a>
            </div>

            <div className="rounded-2xl border p-6 text-center" style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
              <Phone className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--pb-accent)' }} />
              <h3 className="font-bold mb-1">Call Us</h3>
              <p className="text-sm" style={{ color: 'var(--pb-text-secondary)' }}>Mon-Fri from 9am to 6pm IST.</p>
              <a href="tel:+919876543210" className="text-sm font-semibold mt-2 inline-block hover:underline" style={{ color: 'var(--pb-text)' }}>
                +91 98765 43210
              </a>
            </div>

            <div className="rounded-2xl border p-6 text-center" style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
              <MapPin className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--pb-accent)' }} />
              <h3 className="font-bold mb-1">Office</h3>
              <p className="text-sm" style={{ color: 'var(--pb-text-secondary)' }}>
                {BRAND_NAME} HQ<br />
                Cyber City, Phase 2<br />
                Gurugram, Haryana 122002
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2 rounded-2xl border p-8 animate-fade-up delay-200" style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
            <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Your Name</label>
                  <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Email Address</label>
                  <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2" style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Subject</label>
                <input required type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2" style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Message</label>
                <textarea required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 resize-none" style={inputStyle} />
              </div>
              <button type="submit" disabled={loading} className="btn-accent px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50">
                {loading ? 'Sending...' : <><Send className="w-4 h-4" /> Send Message</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
