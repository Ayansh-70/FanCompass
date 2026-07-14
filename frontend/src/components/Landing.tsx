import '../styles/Landing.css';
import { GlobalHeader } from './GlobalHeader';
interface LandingProps {
  onStart: () => void;
}

export function Landing({ onStart }: LandingProps) {
  return (
    <div className="landing-page">
      <GlobalHeader
        transparent
        rightAction={
          <>
            <div className="nav-links">
              <a href="#" className="nav-link">How It Works</a>
              <a href="#" className="nav-link">Accessibility</a>
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
    </div>
  );
}
