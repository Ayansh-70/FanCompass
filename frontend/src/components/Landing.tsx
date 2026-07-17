import '../styles/Landing.css';
import { GlobalHeader } from './GlobalHeader';
interface LandingProps {
  onStart: () => void;
}

const FEATURES = [
  { icon: '🤖', title: 'AI-Powered Guidance', desc: 'Instant, intelligent directions powered by multi-agent AI that never gets your gate wrong.' },
  { icon: '🌍', title: '6 Languages', desc: 'We speak your language — English, Spanish, French, German, Arabic, and Chinese.' },
  { icon: '♿', title: 'Accessibility First', desc: 'Wheelchair, low-vision, and hearing-impaired routing built into every recommendation.' },
  { icon: '📊', title: 'Real-Time Crowds', desc: 'Live crowd density data at every gate so you always find the fastest entry.' },
];

export function Landing({ onStart }: LandingProps) {
  return (
    <div className="landing-page">
      <GlobalHeader
        transparent
        rightAction={
          <>
            <div className="nav-links">
              <a href="#features" className="nav-link">Features</a>
              <a href="/accessibility" className="nav-link">Accessibility</a>
              <a href="/staff" className="nav-link">For Staff</a>
            </div>
            <button className="nav-cta" onClick={onStart}>
              Get Started
            </button>
          </>
        }
      />

      <main className="hero-section">
        {/* Decorative Background Motif */}
        <div className="hero-visual" aria-hidden="true">
          <div className="circle-motif circle-1"></div>
          <div className="circle-motif circle-2"></div>
          <div className="circle-motif circle-3"></div>
          <div className="compass-needle">
            <div className="needle-line"></div>
          </div>
        </div>
        
        {/* Contrast Overlay */}
        <div className="hero-overlay"></div>

        {/* Hero Content */}
        <div className="hero-content">
          <h1 className="hero-heading animate-fade-up delay-1">
            <span className="fan">FAN</span>
            <span className="compass">COMPASS</span>
          </h1>
          
          <h2 className="hero-subheading animate-fade-up delay-2">
            Real-time guidance, in your language, built for every fan.
          </h2>
          
          <p className="hero-description animate-fade-up delay-3">
            FanCompass gives every fan at FIFA World Cup 2026 instant, accessible directions and live crowd guidance — powered by AI, grounded in deterministic logic that never gets your gate wrong.
          </p>
          
          <div className="hero-buttons animate-fade-up delay-4">
            <button className="btn-primary" onClick={onStart}>
              Find Your Gate
            </button>
            <a href="/staff" className="btn-secondary">
              Staff Dashboard
            </a>
          </div>
          
          <p className="hero-trust animate-fade-up delay-5">
            Built for FIFA World Cup 2026 &middot; 6 languages supported &middot; Wheelchair, low-vision &amp; hearing-accessible routing
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator animate-fade-in delay-5" aria-hidden="true">
          <span className="chevron-down">⌄</span>
        </div>
      </main>

      {/* ── Feature Cards Section ── */}
      <section className="features-section" id="features">
        <h2 className="features-heading animate-fade-up">Why FanCompass?</h2>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={f.title} className={`feature-card glass-card animate-fade-up delay-${i + 1}`}>
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stadium Map Visual ── */}
      <section className="stadium-visual-section">
        <div className="stadium-visual-inner animate-fade-up">
          <svg className="stadium-mini-map" viewBox="0 0 400 400" aria-hidden="true">
            <ellipse cx="200" cy="200" rx="180" ry="185" fill="none" stroke="var(--border)" strokeWidth="1" opacity="0.3" />
            <ellipse cx="200" cy="200" rx="140" ry="145" fill="none" stroke="var(--primary)" strokeWidth="0.5" opacity="0.15" />
            <rect x="130" y="140" width="140" height="120" rx="4" fill="none" stroke="var(--primary)" strokeWidth="0.5" opacity="0.2" />
            <ellipse cx="200" cy="200" rx="25" ry="25" fill="none" stroke="var(--primary)" strokeWidth="0.5" opacity="0.2" />
            {/* Gate dots */}
            <circle cx="200" cy="15" r="4" fill="var(--primary)" opacity="0.6" />
            <circle cx="360" cy="80" r="4" fill="var(--primary)" opacity="0.6" />
            <circle cx="380" cy="200" r="4" fill="var(--primary)" opacity="0.6" />
            <circle cx="200" cy="385" r="4" fill="var(--primary)" opacity="0.6" />
            <circle cx="40" cy="320" r="4" fill="var(--primary)" opacity="0.6" />
            <circle cx="20" cy="200" r="4" fill="var(--primary)" opacity="0.6" />
          </svg>
          <div className="stadium-visual-text">
            <p className="stadium-visual-label">Live stadium monitoring</p>
            <p className="stadium-visual-sub">6 gates · Real-time crowd data · AI recommendations</p>
          </div>
        </div>
      </section>
    </div>
  );
}

