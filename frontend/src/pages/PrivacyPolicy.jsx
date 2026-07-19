/**
 * Privacy Policy Page — PlantBase
 * Standard privacy policy for an e-commerce marketplace.
 */
import { Shield, Eye, Cookie, Users, Database, Mail, ChevronRight } from 'lucide-react';

const SECTIONS = [
  { id: 'collection', title: 'Information We Collect', icon: Database },
  { id: 'usage', title: 'How We Use Your Data', icon: Eye },
  { id: 'cookies', title: 'Cookies & Tracking', icon: Cookie },
  { id: 'sharing', title: 'Data Sharing', icon: Users },
  { id: 'rights', title: 'Your Rights', icon: Shield },
  { id: 'contact', title: 'Contact Us', icon: Mail },
];

export default function PrivacyPolicy() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-up">
      {/* Header */}
      <div className="text-center mb-10">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4"
          style={{ backgroundColor: 'rgba(141,182,0,0.1)', color: 'var(--pb-accent)' }}
        >
          <Shield className="w-4 h-4" /> Your Privacy Matters
        </div>
        <h1 className="text-4xl font-display font-bold mb-3">Privacy Policy</h1>
        <p className="text-sm" style={{ color: 'var(--pb-text-secondary)' }}>
          Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Table of Contents — sidebar */}
        <div className="lg:col-span-1">
          <div
            className="rounded-xl border p-4 sticky top-20"
            style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--pb-text-secondary)' }}>
              Contents
            </p>
            <nav className="space-y-1">
              {SECTIONS.map(s => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className="w-full flex items-center gap-2 text-left text-sm py-2 px-2 rounded-lg hover:opacity-80 transition"
                    style={{ color: 'var(--pb-text-secondary)' }}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{s.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Intro */}
          <div
            className="rounded-xl border p-6"
            style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}
          >
            <p className="text-sm leading-relaxed" style={{ color: 'var(--pb-text-secondary)' }}>
              At PlantBase, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our 
              marketplace platform. Please read this policy carefully. By using our services, you consent to the practices 
              described in this policy.
            </p>
          </div>

          {/* Section 1: Information We Collect */}
          <section id="collection">
            <SectionHeader icon={Database} title="1. Information We Collect" />
            <div className="prose-content">
              <p>We collect information that you provide directly to us, including:</p>
              <ul>
                <li><strong>Account Information:</strong> Name, email address, phone number, and password when you create an account.</li>
                <li><strong>Profile Information:</strong> Shipping address, billing address, and preferences you set in your profile.</li>
                <li><strong>Transaction Data:</strong> Order history, payment information (processed securely through our payment partners), and delivery details.</li>
                <li><strong>Communications:</strong> Messages you send us through our contact form or customer support channels.</li>
                <li><strong>Seller Information:</strong> For sellers, we additionally collect shop name, business location, bio, and product listings.</li>
              </ul>
              <p>We also automatically collect certain information when you use our platform:</p>
              <ul>
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>IP address and approximate location</li>
                <li>Pages viewed and actions taken on our site</li>
                <li>Referring website or source</li>
              </ul>
            </div>
          </section>

          {/* Section 2: How We Use Your Data */}
          <section id="usage">
            <SectionHeader icon={Eye} title="2. How We Use Your Data" />
            <div className="prose-content">
              <p>We use the information we collect for the following purposes:</p>
              <ul>
                <li><strong>Order Fulfillment:</strong> Processing, shipping, and delivering your orders.</li>
                <li><strong>Account Management:</strong> Creating and maintaining your account, verifying your identity.</li>
                <li><strong>Communication:</strong> Sending order updates, shipping notifications, and responding to inquiries.</li>
                <li><strong>Improvement:</strong> Analyzing usage patterns to improve our platform and user experience.</li>
                <li><strong>Security:</strong> Detecting and preventing fraud, abuse, and unauthorized access.</li>
                <li><strong>Legal Compliance:</strong> Meeting our legal and regulatory obligations.</li>
              </ul>
              <p>We do <strong>not</strong> sell your personal information to third parties for marketing purposes.</p>
            </div>
          </section>

          {/* Section 3: Cookies */}
          <section id="cookies">
            <SectionHeader icon={Cookie} title="3. Cookies & Tracking" />
            <div className="prose-content">
              <p>We use cookies and similar technologies to enhance your experience:</p>
              <ul>
                <li><strong>Essential Cookies:</strong> Required for the website to function (authentication, cart data, theme preference).</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website.</li>
                <li><strong>Preference Cookies:</strong> Remember your settings (theme, language, region).</li>
              </ul>
              <p>
                You can control cookies through your browser settings. Please note that disabling essential cookies may affect 
                the functionality of our platform.
              </p>
            </div>
          </section>

          {/* Section 4: Data Sharing */}
          <section id="sharing">
            <SectionHeader icon={Users} title="4. Data Sharing & Third Parties" />
            <div className="prose-content">
              <p>We may share your information with:</p>
              <ul>
                <li><strong>Sellers:</strong> When you place an order, the seller receives your shipping details and order information to fulfill the order.</li>
                <li><strong>Payment Processors:</strong> Secure third-party payment services that handle your transactions.</li>
                <li><strong>Delivery Partners:</strong> Shipping companies that deliver your orders.</li>
                <li><strong>Service Providers:</strong> Companies assisting us with email, hosting, and analytics.</li>
                <li><strong>Legal Authorities:</strong> When required by law or to protect our legal rights.</li>
              </ul>
              <p>All third-party partners are contractually obligated to protect your data and use it only for the specified purposes.</p>
            </div>
          </section>

          {/* Section 5: Your Rights */}
          <section id="rights">
            <SectionHeader icon={Shield} title="5. Your Rights" />
            <div className="prose-content">
              <p>You have the following rights regarding your personal data:</p>
              <ul>
                <li><strong>Access:</strong> Request a copy of your personal data we hold.</li>
                <li><strong>Correction:</strong> Update or correct inaccurate personal data via your profile page.</li>
                <li><strong>Deletion:</strong> Request deletion of your account and associated data.</li>
                <li><strong>Portability:</strong> Receive your data in a commonly used format.</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time.</li>
                <li><strong>Complaint:</strong> File a complaint with a data protection authority.</li>
              </ul>
              <p>To exercise any of these rights, please contact us at <strong>privacy@plantbase.com</strong>.</p>
            </div>
          </section>

          {/* Section 6: Contact */}
          <section id="contact">
            <SectionHeader icon={Mail} title="6. Contact Us" />
            <div className="prose-content">
              <p>If you have any questions about this Privacy Policy, please contact us:</p>
              <div
                className="mt-4 p-4 rounded-xl"
                style={{ backgroundColor: 'var(--pb-bg)', border: '1px solid var(--pb-border)' }}
              >
                <p className="text-sm"><strong>PlantBase Privacy Team</strong></p>
                <p className="text-sm mt-1" style={{ color: 'var(--pb-text-secondary)' }}>
                  📧 privacy@plantbase.com
                </p>
                <p className="text-sm" style={{ color: 'var(--pb-text-secondary)' }}>
                  📞 +91 98765 43210
                </p>
                <p className="text-sm" style={{ color: 'var(--pb-text-secondary)' }}>
                  📍 Kozhikode, Kerala, India 673001
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ─── Section Header Component ───
function SectionHeader({ icon: Icon, title }) {
  return (
    <h2
      className="text-xl font-display font-bold mb-4 flex items-center gap-3 pb-3 border-b"
      style={{ borderColor: 'var(--pb-border)' }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: 'rgba(141,182,0,0.1)', color: 'var(--pb-accent)' }}
      >
        <Icon className="w-4 h-4" />
      </div>
      {title}
    </h2>
  );
}
