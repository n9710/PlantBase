/**
 * Contact Us Page — PlantBase
 * Contact form and company information.
 */
import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Leaf, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate send (frontend-only for now)
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      toast.success('Message sent successfully!');
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-up">
      {/* Header */}
      <div className="text-center mb-12">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4"
          style={{ backgroundColor: 'rgba(141,182,0,0.1)', color: 'var(--pb-accent)' }}
        >
          <MessageSquare className="w-4 h-4" /> Get in Touch
        </div>
        <h1 className="text-4xl font-display font-bold mb-3">Contact Us</h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--pb-text-secondary)' }}>
          Have a question or feedback? We'd love to hear from you. Our team is always here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ─── Contact Info ─── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info cards */}
          {[
            {
              icon: Mail,
              title: 'Email Us',
              detail: 'support@plantbase.com',
              sub: 'We reply within 24 hours',
              color: 'var(--pb-accent)',
            },
            {
              icon: Phone,
              title: 'Call Us',
              detail: '+91 98765 43210',
              sub: 'Mon – Sat, 9 AM – 6 PM IST',
              color: 'var(--pb-secondary)',
            },
            {
              icon: MapPin,
              title: 'Visit Us',
              detail: 'PlantBase HQ',
              sub: 'Kozhikode, Kerala, India 673001',
              color: '#3b82f6',
            },
            {
              icon: Clock,
              title: 'Business Hours',
              detail: 'Mon – Saturday',
              sub: '9:00 AM – 6:00 PM IST',
              color: '#8b5cf6',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 rounded-xl border transition-all card-lift"
                style={{
                  backgroundColor: 'var(--pb-surface)',
                  borderColor: 'var(--pb-border)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${item.color}15`, color: item.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold mb-0.5">{item.title}</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--pb-text)' }}>{item.detail}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--pb-text-secondary)' }}>{item.sub}</p>
                </div>
              </div>
            );
          })}

          {/* Nature illustration */}
          <div
            className="p-6 rounded-xl text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(141,182,0,0.08), rgba(160,82,45,0.05))',
              border: '1px solid var(--pb-border)',
            }}
          >
            <Leaf className="w-10 h-10 mx-auto mb-3 animate-float" style={{ color: 'var(--pb-accent)' }} />
            <p className="text-sm font-semibold mb-1">We're eco-friendly!</p>
            <p className="text-xs" style={{ color: 'var(--pb-text-secondary)' }}>
              We believe in sustainable practices. Every purchase helps support local communities and the environment.
            </p>
          </div>
        </div>

        {/* ─── Contact Form ─── */}
        <div className="lg:col-span-3">
          <div
            className="rounded-2xl border p-6 sm:p-8"
            style={{
              backgroundColor: 'var(--pb-surface)',
              borderColor: 'var(--pb-border)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
            }}
          >
            {sent ? (
              <div className="text-center py-12 animate-fade-up">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}
                >
                  <CheckCircle className="w-8 h-8" style={{ color: 'var(--pb-success)' }} />
                </div>
                <h3 className="text-xl font-display font-bold mb-2">Message Sent!</h3>
                <p className="text-sm mb-6" style={{ color: 'var(--pb-text-secondary)' }}>
                  Thank you for reaching out. We'll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                  className="text-sm font-semibold px-6 py-2.5 rounded-xl btn-accent text-white"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-1">Send us a message</h3>
                <p className="text-sm mb-6" style={{ color: 'var(--pb-text-secondary)' }}>
                  Fill out the form and we'll get back to you as soon as possible.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Your Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2"
                        style={{
                          backgroundColor: 'var(--pb-bg)',
                          borderColor: 'var(--pb-border)',
                          color: 'var(--pb-text)',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2"
                        style={{
                          backgroundColor: 'var(--pb-bg)',
                          borderColor: 'var(--pb-border)',
                          color: 'var(--pb-text)',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      required
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                      className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2"
                      style={{
                        backgroundColor: 'var(--pb-bg)',
                        borderColor: 'var(--pb-border)',
                        color: 'var(--pb-text)',
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Message</label>
                    <textarea
                      name="message"
                      required
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us more about your question or feedback..."
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2 resize-none"
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
                    className="w-full py-3 rounded-xl text-sm font-semibold text-white btn-accent disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Send Message
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
