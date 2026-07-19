import { GlobalHeader } from './GlobalHeader';
import '../styles/AccessibilityPage.css';

interface AccessibilityPageProps {
  onBack: () => void;
}

export function AccessibilityPage({ onBack }: AccessibilityPageProps) {
  return (
    <div className="a11y-page">
      <GlobalHeader
        rightAction={
          <button className="nav-cta" onClick={onBack}>
            Back to Home
          </button>
        }
      />

      <main className="a11y-main">
        {/* Hero Section */}
        <header className="a11y-hero animate-fade-up">
          <div className="a11y-hero-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
            </svg>
          </div>
          <h1 className="a11y-title">Empowering Every Fan</h1>
          <p className="a11y-subtitle">
            FanCompass is built from the ground up to ensure that every fan, regardless of ability,
            has a seamless and safe journey to their seat.
          </p>
        </header>

        {/* Interactive Demo Section */}
        <section className="a11y-demo animate-fade-up delay-1">
          <div className="demo-content glass-card">
            <h2>Universal Controls</h2>
            <p>
              Our floating accessibility widget is always available at the top of your screen. Try
              the <strong>A- / A+</strong> buttons to dynamically scale the entire interface, or
              toggle <strong>High Contrast</strong> mode for maximum readability.
            </p>
            <div className="demo-visual" aria-hidden="true">
              <div className="demo-pill">
                <span className="demo-icon">🌓</span> Contrast
                <span className="demo-divider"></span>
                <span className="demo-icon">A-</span>
                <span className="demo-icon">A+</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="a11y-features">
          <h2 className="sr-only">Accessibility Features</h2>
          <div className="a11y-grid">
            <div className="a11y-card glass-card animate-fade-up delay-2">
              <div className="a11y-card-icon">♿</div>
              <h3>Mobility Paths</h3>
              <p>
                Our AI routing engine intelligently calculates step-free paths, prioritizing ramps
                and elevators for wheelchair users, avoiding stairs and heavy congestion.
              </p>
            </div>

            <div className="a11y-card glass-card animate-fade-up delay-3">
              <div className="a11y-card-icon">👁️</div>
              <h3>Visual Clarity</h3>
              <p>
                Exceeding WCAG AA contrast standards, our cinematic dark theme and low-vision
                routing options ensure critical wayfinding information is always clear.
              </p>
            </div>

            <div className="a11y-card glass-card animate-fade-up delay-4">
              <div className="a11y-card-icon">🦻</div>
              <h3>Hearing Support</h3>
              <p>
                We never rely on sound alone. Important alerts and routing changes are conveyed
                through strong visual indicators and haptic-ready design patterns.
              </p>
            </div>

            <div className="a11y-card glass-card animate-fade-up delay-5">
              <div className="a11y-card-icon">🗣️</div>
              <h3>Screen Reader Ready</h3>
              <p>
                Full ARIA compliance with semantic HTML and <code>aria-live</code> regions
                guarantees that assistive technologies announce live routing updates perfectly.
              </p>
            </div>

            <div
              className="a11y-card glass-card animate-fade-up delay-6"
              style={{ gridColumn: '1 / -1' }}
            >
              <div className="a11y-card-icon">🌍</div>
              <h3>Language Diversity</h3>
              <p>
                Our Translation Bridge allows you to chat in English, Spanish, French, German,
                Arabic, or Chinese—giving you native instructions powered by deterministic routing.
              </p>
            </div>
          </div>
        </section>

        <footer className="a11y-footer animate-fade-in delay-7">
          <button className="btn-primary large" onClick={onBack}>
            Experience FanCompass
          </button>
        </footer>
      </main>
    </div>
  );
}
