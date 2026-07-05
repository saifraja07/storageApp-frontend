import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUser } from "../context/UserContext";
import "../landing.css";

// Import the dashboard screenshot (user must place it at src/assets/dashboard-preview.png)
// We use a relative URL so Vite bundles it. If the image doesn't exist yet it
// gracefully falls back to the plain dark background colour.
import dashboardPreview from "../assets/dashboard-preview.png";

const features = [
  {
    icon: "📁",
    title: "Folder Organization",
    desc: "Organize files into folders and nested directories to keep everything tidy.",
  },
  {
    icon: "☁️",
    title: "Secure Storage",
    desc: "Files are stored safely in the cloud and accessible only by you.",
  },
  {
    icon: "⚡",
    title: "Fast Uploads",
    desc: "Upload multiple files simultaneously with real-time progress tracking.",
  },
  {
    icon: "📥",
    title: "Easy Downloads",
    desc: "Download any file instantly, anytime you need it.",
  },
  {
    icon: "📊",
    title: "Storage Tracking",
    desc: "Always know how much storage you've used at a glance.",
  },
  {
    icon: "📱",
    title: "Mobile Friendly",
    desc: "Fully responsive — works great on phones, tablets, and desktops.",
  },
];

const plans = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "/month",
    storage: "500 MB",
    color: "#6B7280",
    badge: null,
    emoji: "🆓",
    features: [
      "500 MB cloud storage",
      "Access from 1 device",
      "Basic file types",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹149",
    period: "/month",
    storage: "100 GB",
    color: "#3B82F6",
    badge: "Most Popular",
    emoji: "⚡",
    features: [
      "100 GB cloud storage",
      "Unlimited shared folders",
      "Access from up to 3 device",
      "All file types",
      "community and email support",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "₹599",
    period: "/month",
    storage: "500 GB",
    color: "#8B5CF6",
    badge: "Best Value",
    emoji: "👑",
    features: [
      "500 GB cloud storage",
      "Unlimited everything",
      "Access from up to 4 device",
      "All platforms",
      "Priority upload",
      "24/7 priority support",
    ],
  },
];

const plansRedirect = encodeURIComponent("/subscription");

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();

  function handlePricingClick(e) {
    e.preventDefault();
    if (user) navigate("/subscription");
    else navigate(`/login?redirect=${plansRedirect}`);
  }

  return (
    <div
      style={{
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: "Inter, sans-serif",
        minHeight: "100vh",
      }}
    >
      {/* ── Navbar ── */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <Link to="/" className="landing-logo">
            <div className="landing-logo-icon">☁️</div>
            <span className="landing-logo-text">Haadi Cloud</span>
          </Link>

          <div className="landing-desktop-nav">
            <a href="#features" className="landing-nav-link">
              Features
            </a>
            <a href="#pricing" className="landing-nav-link">
              Plans & Pricing
            </a>
            <Link to="/login" className="landing-nav-link">
              Sign In
            </Link>
            <Link to="/register" className="landing-nav-cta">
              Get Started
            </Link>
          </div>

          <button
            className="landing-mobile-btn"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {menuOpen && (
          <div className="landing-mobile-menu">
            <a
              href="#features"
              className="landing-nav-link"
              onClick={() => setMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#pricing"
              className="landing-nav-link"
              onClick={() => setMenuOpen(false)}
            >
              Plans & Pricing
            </a>
            <Link
              to="/login"
              className="landing-nav-link"
              onClick={() => setMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="landing-mobile-menu-cta"
              onClick={() => setMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="landing-hero-badge">
          <span>☁️</span> Simple personal cloud storage
        </div>
        <h1 className="landing-hero-title">
          Store your files securely
          <br />
          <span className="landing-hero-title-accent">in the cloud.</span>
        </h1>
        <p className="landing-hero-desc">
          Upload, organize, and access your files from anywhere with a clean and
          simple cloud storage experience.
        </p>
        <div className="landing-hero-btns">
          <Link to="/register" className="landing-btn-primary">
            Get Started — Free
          </Link>
          <a href="#pricing" className="landing-btn-secondary">
            View Pricing
          </a>
        </div>
      </section>

      {/* ── Dashboard Screenshot ── */}
      <section className="landing-preview-section">
        <div className="landing-preview-wrapper">
          <div className="landing-preview-chrome">
            <div className="landing-preview-dots">
              {["#FF5F57", "#FFBC2E", "#28C840"].map((c) => (
                <div
                  key={c}
                  className="landing-preview-dot"
                  style={{ background: c }}
                />
              ))}
            </div>
            <div className="landing-preview-url">mirhaadi.in/directory</div>
          </div>
          <img
            src={dashboardPreview}
            alt="Haadi Cloud dashboard"
            className="landing-preview-img"
            loading="lazy"
          />
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="landing-features">
        <div className="landing-section-header">
          <h2 className="landing-section-title">Everything you need</h2>
          <p className="landing-section-desc">
            Simple, powerful features for personal cloud storage.
          </p>
        </div>
        <div className="landing-features-grid">
          {features.map((f) => (
            <div key={f.title} className="landing-feature-card">
              <div className="landing-feature-icon">{f.icon}</div>
              <h3 className="landing-feature-title">{f.title}</h3>
              <p className="landing-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="landing-pricing">
        <div className="landing-section-header">
          <div className="landing-pricing-badge">
            💳 Simple, transparent pricing
          </div>
          <h2 className="landing-section-title">Plans & Pricing</h2>
          <p className="landing-section-desc">
            Pick the storage that fits your workflow.{" "}
            {user
              ? "You're signed in — see your current plan."
              : "Sign in or register to get started for free."}
          </p>
        </div>

        <div className="landing-plans-grid">
          {plans.map((plan) => {
            const isPopular = plan.id === "pro";
            return (
              <div
                key={plan.id}
                className="landing-plan-card"
                style={{
                  background: isPopular
                    ? "linear-gradient(145deg,#1a2433 0%,#0f1d32 100%)"
                    : "var(--surface)",
                  border: isPopular
                    ? `1px solid ${plan.color}55`
                    : "1px solid var(--border)",
                  boxShadow: isPopular ? `0 0 40px ${plan.color}18` : "none",
                }}
              >
                {plan.badge && (
                  <div
                    className="landing-plan-badge"
                    style={{ background: plan.color }}
                  >
                    {plan.badge}
                  </div>
                )}
                <div
                  className="landing-plan-icon"
                  style={{
                    background: plan.color + "22",
                    border: `1px solid ${plan.color}44`,
                  }}
                >
                  {plan.emoji}
                </div>
                <h3 className="landing-plan-name">{plan.name}</h3>
                <div className="landing-plan-price-row">
                  <span
                    className="landing-plan-price"
                    style={{ color: plan.color }}
                  >
                    {plan.price}
                  </span>
                  <span className="landing-plan-period">{plan.period}</span>
                </div>
                <p className="landing-plan-storage">
                  {plan.storage} of cloud storage
                </p>
                <div className="landing-plan-divider" />
                <div className="landing-plan-features">
                  {plan.features.map((f) => (
                    <div key={f} className="landing-plan-feature">
                      <span
                        className="landing-plan-check"
                        style={{
                          background: plan.color + "22",
                          color: plan.color,
                        }}
                      >
                        ✓
                      </span>
                      {f}
                    </div>
                  ))}
                </div>
                <a
                  href={
                    user ? "/subscription" : `/login?redirect=${plansRedirect}`
                  }
                  onClick={handlePricingClick}
                  className="landing-plan-btn"
                  style={{
                    background: isPopular ? plan.color : "transparent",
                    color: isPopular ? "#fff" : plan.color,
                    borderColor: plan.color,
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = plan.color;
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = isPopular
                      ? plan.color
                      : "transparent";
                    e.currentTarget.style.color = isPopular
                      ? "#fff"
                      : plan.color;
                  }}
                >
                  {user
                    ? plan.id === "free"
                      ? "Current Plan"
                      : "Upgrade Now"
                    : plan.id === "free"
                      ? "Get Started Free"
                      : "Sign In to Upgrade"}
                  <span>→</span>
                </a>
              </div>
            );
          })}
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: 32,
            fontSize: 13,
            color: "var(--muted)",
          }}
        >
          {user ? (
            <>
              <Link
                to="/subscription"
                style={{
                  color: "var(--primary)",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Manage your subscription →
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: "var(--primary)",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Sign in →
              </Link>
            </>
          )}
        </p>
      </section>

      {/* ── CTA ── */}
      <section className="landing-cta">
        <div className="landing-cta-box">
          <h2 className="landing-cta-title">Ready to store your files?</h2>
          <p className="landing-cta-desc">
            Create your free account and start uploading in minutes.
          </p>
          <Link to="/register" className="landing-btn-primary">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-top">
            {/* Col 1 — About Us */}
            <div>
              <Link to="/" className="landing-footer-brand-logo">
                <div className="landing-footer-brand-icon">☁️</div>
                <span className="landing-footer-brand-name">Haadi Cloud</span>
              </Link>
              <p className="landing-footer-brand-desc">
                Simple, secure personal cloud storage. Upload, organize, and
                access your files from anywhere — for free or on a plan that
                fits you.
              </p>
              <div className="landing-footer-social">
                <a
                  href="https://www.instagram.com/saif__a__r/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="landing-footer-ig-btn"
                  title="@saif__a__r on Instagram"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <span className="landing-footer-ig-handle">@saif__a__r</span>
              </div>
            </div>

            {/* Col 2 — Useful Links */}
            <div>
              <div className="landing-footer-col-title">Useful Links</div>
              <nav className="landing-footer-links">
                <a href="#" className="landing-footer-link">
                  Home
                </a>
                <a href="#features" className="landing-footer-link">
                  Features
                </a>
                <a href="#pricing" className="landing-footer-link">
                  Plans & Pricing
                </a>
                <Link to="/login" className="landing-footer-link">
                  Sign In
                </Link>
                <Link to="/register" className="landing-footer-link">
                  Get Started
                </Link>
              </nav>
            </div>

            {/* Col 3 — Legal */}
            <div>
              <div className="landing-footer-col-title">Legal</div>
              <nav className="landing-footer-links">
                <Link to="/privacy" className="landing-footer-link">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="landing-footer-link">
                  Terms of Service
                </Link>
              </nav>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="landing-footer-bottom">
            <p className="landing-footer-copy">
              <span>
                © {new Date().getFullYear()} Haadi Cloud. All rights reserved.
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
