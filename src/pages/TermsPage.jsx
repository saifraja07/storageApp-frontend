import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import "../landing.css";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By creating an account or using Haadi Cloud in any way, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree with any part of these terms, please do not use the service. We may update these terms at any time; continued use after the effective date of changes constitutes acceptance.`,
  },
  {
    title: "2. What We Provide",
    content: `Haadi Cloud is a personal cloud storage service. We provide a web-based interface to upload, organise, and access your files. Free accounts receive 1 GB of storage. Paid plans (Pro — 100 GB at ₹149/month; Premium — 500 GB at ₹599/month, with annual options) provide expanded storage and priority features. Features are described on the Subscription page and may be updated over time.`,
  },
  {
    title: "3. Account Registration",
    content: `To use Haadi Cloud you must create an account using accurate, current, and complete information — your name, email address, and a password, or via Google OAuth. You are responsible for all activity that occurs under your account. Keep your credentials confidential and notify us immediately at support@haadi.cloud if you suspect unauthorised access.`,
  },
  {
    title: "4. Acceptable Use",
    content: `You may use Haadi Cloud only for lawful personal file storage. You must not upload, store, or distribute content that is illegal, harmful, defamatory, or infringes intellectual property rights. You must not attempt to gain unauthorised access to any part of the service, reverse-engineer our systems, or use automated scripts to abuse the platform. Violations may result in immediate account suspension.`,
  },
  {
    title: "5. Your Files & Content",
    content: `You retain full ownership of all files you upload. By uploading, you grant Haadi Cloud a limited, non-exclusive licence to store and serve those files solely for the purpose of providing the service to you. We do not claim ownership over your content, do not analyse it for advertising, and will not share it with third parties except as described in our Privacy Policy.`,
  },
  {
    title: "6. Storage Limits & Quotas",
    content: `Your account is subject to the storage quota of your active plan. Uploads that would exceed your quota will be rejected with an error. If your storage use exceeds your quota (for example, after a plan downgrade), you will not be able to upload new files until usage falls below the limit — existing files will remain accessible. We reserve the right to suspend accounts that consistently attempt to circumvent storage limits.`,
  },
  {
    title: "7. Subscriptions & Billing",
    content: `Paid subscriptions are processed by Razorpay and auto-renew at the end of each billing cycle. You can cancel at any time from the Subscription page. Cancellation takes effect at the end of the current billing period; you retain premium access until then. No refunds are issued for unused portions of a billing period. In the event of a failed payment, Razorpay may retry the charge; prolonged payment failure may result in plan downgrade to Free.`,
  },
  {
    title: "8. Service Availability",
    content: `We strive to keep Haadi Cloud highly available but do not guarantee 100% uptime. The service may be temporarily unavailable due to scheduled maintenance, infrastructure updates, or events beyond our control (including third-party outages). We will make reasonable efforts to notify users of planned downtime. We are not liable for loss or damage resulting from service unavailability.`,
  },
  {
    title: "9. Data Deletion & Termination",
    content: `You may delete individual files, directories, or your entire account at any time through the settings. Deleted files are permanently removed from our storage within 30 days. We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or remain inactive for extended periods. We will attempt to notify you before taking action where possible.`,
  },
  {
    title: "10. Limitation of Liability",
    content: `To the maximum extent permitted by applicable law, Haadi Cloud is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the service — including data loss. Our total liability for any claim shall not exceed the total fees paid by you to Haadi Cloud in the three months preceding the claim.`,
  },
  {
    title: "11. Intellectual Property",
    content: `The Haadi Cloud name, logo, interface design, and all original code and content on the platform are owned by or licensed to Haadi Cloud. You may not reproduce, distribute, or create derivative works based on our proprietary materials without explicit written permission. Your own uploaded files are, of course, entirely your property.`,
  },
  {
    title: "12. Governing Law",
    content: `These Terms of Service shall be governed by and construed in accordance with the laws of India. Any dispute arising from these terms or your use of Haadi Cloud shall first be attempted to be resolved amicably. If unresolved within 30 days, disputes shall be subject to the exclusive jurisdiction of the courts in India.`,
  },
];

export default function TermsPage() {
  const { pathname } = useLocation();

  // Scroll to top on mount — fixes the "opens scrolled down" issue
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div
      style={{
        background: "var(--bg)",
        color: "var(--text)",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Nav */}
      <nav className="legal-nav">
        <Link to="/" className="legal-logo">
          <span style={{ fontSize: 20 }}>☁️</span>
          <span className="legal-logo-text">Haadi Cloud</span>
        </Link>
        <div className="legal-nav-links">
          <Link to="/login" className="legal-nav-link">
            Sign In
          </Link>
          <Link to="/register" className="legal-nav-btn">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="legal-content">
        <div className="legal-label">Legal</div>
        <h1 className="legal-title">Terms of Service</h1>
        <p className="legal-updated">
          Effective date:{" "}
          {new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>

        <div className="legal-intro-box">
          <p className="legal-intro-text">
            Please read these Terms of Service carefully. They govern your use
            of Haadi Cloud's personal cloud storage service — including
            uploading and organising files, managing subscriptions, and
            accessing files across devices.
          </p>
        </div>

        {sections.map((s) => (
          <div key={s.title} className="legal-section">
            <h2 className="legal-section-title">{s.title}</h2>
            <p className="legal-section-text">{s.content}</p>
          </div>
        ))}

        <div className="legal-highlight-box">
          <h3 className="legal-highlight-title">Questions about our Terms?</h3>
          <p className="legal-highlight-text">
            Contact us at{" "}
            <a
              href="mailto:contact@mirhaadi.in"
              className="legal-highlight-link"
            >
              contact@mirhaadi.in
            </a>
            . We aim to respond within 5 business days.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="legal-footer">
        <div className="legal-footer-inner">
          <span className="legal-footer-copy">
            © {new Date().getFullYear()} Haadi Cloud. All rights reserved.
          </span>
          <div className="legal-footer-links">
            <Link to="/privacy" className="legal-nav-link">
              Privacy Policy
            </Link>
            <Link to="/" className="legal-nav-link">
              Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
