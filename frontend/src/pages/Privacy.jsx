/**
 * Privacy Policy Page
 */
import SEOHead from '../components/SEOHead';
import { BRAND_NAME, BRAND_EMAIL } from '../constants';

export default function Privacy() {
  const lastUpdated = "April 18, 2026";

  return (
    <div className="min-h-screen px-4 py-12">
      <SEOHead page="privacy" />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 animate-fade-up">
          <h1 className="text-4xl font-display font-bold mb-4">Privacy Policy</h1>
          <p className="text-sm" style={{ color: 'var(--pb-text-secondary)' }}>Last updated: {lastUpdated}</p>
        </div>

        <div className="rounded-2xl border p-8 md:p-12 prose-content animate-fade-up delay-100" 
          style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
          
          <h2 className="text-2xl font-bold mt-0">1. Introduction</h2>
          <p>
            Welcome to {BRAND_NAME}. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) 
            and tell you about your privacy rights and how the law protects you.
          </p>

          <h2 className="text-xl font-bold mt-8">2. Data We Collect</h2>
          <p>
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
          </p>
          <ul className="list-disc pl-6 space-y-2 my-4">
            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data:</strong> includes billing address, delivery address, email address and telephone numbers.</li>
            <li><strong>Financial Data:</strong> includes payment card details (processed securely via our payment providers).</li>
            <li><strong>Transaction Data:</strong> includes details about payments to and from you and other details of products you have purchased from us.</li>
            <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
          </ul>

          <h2 className="text-xl font-bold mt-8">3. How We Use Your Data</h2>
          <p>
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </p>
          <ul className="list-disc pl-6 space-y-2 my-4">
            <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., processing your order).</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal or regulatory obligation.</li>
          </ul>

          <h2 className="text-xl font-bold mt-8">4. Seller Data</h2>
          <p>
            If you sign up as a seller on {BRAND_NAME}, we collect additional business information including PAN, GST details, 
            business address, and banking information for the purpose of identity verification, compliance, and processing your payouts.
          </p>

          <h2 className="text-xl font-bold mt-8">5. Cookies</h2>
          <p>
            You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. 
            If you disable or refuse cookies, please note that some parts of this website may become inaccessible or not function properly.
          </p>

          <h2 className="text-xl font-bold mt-8">6. Contact Us</h2>
          <p>
            If you have any questions about this privacy policy or our privacy practices, please contact us at:
          </p>
          <p className="font-semibold mt-2">
            Email: <a href={`mailto:${BRAND_EMAIL}`} style={{ color: 'var(--pb-accent)' }}>{BRAND_EMAIL}</a>
          </p>
        </div>
      </div>
    </div>
  );
}
