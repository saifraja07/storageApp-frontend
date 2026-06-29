import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import "../landing.css";

const sections = [
  {
    title: "1. What Is Haadi Cloud?",
    content: `Haadi Cloud is a personal cloud storage service that lets you upload, organize, and access your files from anywhere. We provide a web-based interface to manage folders and files, with subscription plans that expand your available storage. This Privacy Policy explains how we handle the information collected when you use our service.`,
  },
  {
    title: "2. Information We Collect",
    content: `When you create an account we collect your name, email address, and a hashed password (we never store plain-text passwords). If you sign in with Google, we receive your Google profile name and email from OAuth. We also collect the files you upload — including their names, sizes, MIME types, and upload dates — along with metadata about the directories you create. We automatically collect technical information such as your IP address, browser type, and how you interact with the service (page visits, clicks, errors).`,
  },
  {
    title: "3. How We Use Your Information",
    content: `We use collected information solely to operate Haadi Cloud. This includes: authenticating your identity and keeping your account secure via JWT sessions; storing and serving your uploaded files; enforcing your plan's storage quota; responding to support requests; sending important account or billing notifications; and improving our service through aggregated, anonymised usage analytics.`,
  },
  {
    title: "4. File Storage & Security",
    content: `Your files are stored using Cloudflare R2, a secure and highly available object-storage service. All data in transit is encrypted via TLS/HTTPS. Access to your files is controlled by JWT-based authentication — only authenticated requests from your session can read or modify your files. We do not read, analyse, or share the contents of your files, except as strictly required to deliver the service or as compelled by law.`,
  },
  {
    title: "5. Subscriptions & Payments",
    content: `Paid plans (Pro at ₹149/month and Premium at ₹599/month) are processed by Razorpay, our payment partner. We do not store your card number or payment credentials — Razorpay handles all payment data under their own PCI-DSS-compliant security practices. We receive transaction records, plan identifiers, and billing-cycle dates from Razorpay to manage your subscription status and storage limits.`,
  },
  {
    title: "6. Data Sharing",
    content: `We do not sell, trade, or rent your personal information to third parties. We share data only with the service providers required to operate Haadi Cloud — Cloudflare R2 for file storage, Razorpay for payments, and our hosting infrastructure. Each provider is bound by confidentiality obligations. We may also disclose information when required by Indian or applicable law, court order, or to protect the rights and safety of our users.`,
  },
  {
    title: "7. Data Retention",
    content: `Your account information, directory structure, and files are retained for as long as your account is active. If you delete a file it is removed from your drive and from our storage within 30 days. If you delete your account entirely, all your files and personal information are permanently deleted within 30 days, except where a longer retention period is required by applicable law.`,
  },
  {
    title: "8. Your Rights",
    content: `You can access, update, or delete your personal information at any time through your account settings. You may download your files directly from the dashboard at any time. To request a complete export of all data we hold, or to permanently delete your account, email us at contact@mirhaadi.in. We will respond within 30 days.`,
  },
  {
    title: "9. Cookies & Sessions",
    content: `Haadi Cloud uses an HTTP-only session cookie to keep you logged in. This cookie contains only a session identifier — no personal data is stored in the cookie itself. We do not use advertising cookies, third-party trackers, or analytics SDKs that collect personal data. Disabling cookies in your browser will prevent you from staying logged in.`,
  },
  {
    title: "10. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. When we make significant changes we will post the updated policy on this page and update the effective date below. Continued use of Haadi Cloud after changes take effect constitutes your acceptance of the revised policy. We recommend checking this page periodically.`,
  },
  {
    title: "11. Contact Us",
    content: `If you have any questions about this Privacy Policy or our data practices, please contact us at privacy@haadi.cloud. We are committed to addressing your concerns promptly and transparently.`,
  },
];

export default function PrivacyPage() {
  const { pathname } = useLocation();

  // Scroll to top on mount — fixes the "opens scrolled down" issue
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>

      {/* Nav */}
      <nav className="legal-nav">
        <Link to="/" className="legal-logo">
          <span style={{ fontSize: 20 }}>☁️</span>
          <span className="legal-logo-text">Haadi Cloud</span>
        </Link>
        <div className="legal-nav-links">
          <Link to="/login" className="legal-nav-link">Sign In</Link>
          <Link to="/register" className="legal-nav-btn">Get Started</Link>
        </div>
      </nav>

      {/* Content */}
      <div className="legal-content">
        <div className="legal-label">Legal</div>
        <h1 className="legal-title">Privacy Policy</h1>
        <p className="legal-updated">Effective date: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</p>

        <div className="legal-intro-box">
          <p className="legal-intro-text">
            Your privacy matters to us. This policy explains exactly what Haadi Cloud collects when you use our personal cloud storage service, how we use that information, and what control you have over it.
          </p>
        </div>

        {sections.map(s => (
          <div key={s.title} className="legal-section">
            <h2 className="legal-section-title">{s.title}</h2>
            <p className="legal-section-text">{s.content}</p>
          </div>
        ))}

        <div className="legal-highlight-box">
          <h3 className="legal-highlight-title">Questions about our Privacy Policy?</h3>
          <p className="legal-highlight-text">
            Reach out at{" "}
            <a href="mailto:contact@mirhaadi.in" className="legal-highlight-link">contact@mirhaadi.in</a>
            . We aim to respond within 5 business days.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="legal-footer">
        <div className="legal-footer-inner">
          <span className="legal-footer-copy">© {new Date().getFullYear()} Haadi Cloud. All rights reserved.</span>
          <div className="legal-footer-links">
            <Link to="/terms" className="legal-nav-link">Terms of Service</Link>
            <Link to="/" className="legal-nav-link">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
