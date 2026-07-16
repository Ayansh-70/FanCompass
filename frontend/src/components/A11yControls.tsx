import { useState, useEffect } from 'react';
import '../styles/A11yControls.css';

// SVG Icons for the controls
const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const MinusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const TextIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line>
  </svg>
);

export function A11yControls() {
  const [fontSizeOffset, setFontSizeOffset] = useState(0);
  const [highContrast, setHighContrast] = useState(false);

  // Font Scaling
  useEffect(() => {
    document.documentElement.style.fontSize = `calc(100% + ${fontSizeOffset}px)`;
  }, [fontSizeOffset]);

  // High Contrast
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);

  const increaseFont = () => setFontSizeOffset(prev => Math.min(prev + 2, 8)); // Max +8px
  const decreaseFont = () => setFontSizeOffset(prev => Math.max(prev - 2, -4)); // Min -4px

  return (
    <div className="a11y-controls-wrapper animate-fade-up">
      <div className="a11y-controls-pill glass-card" role="region" aria-label="Accessibility Controls">
        
        <button 
          type="button"
          className={`a11y-btn theme-btn ${highContrast ? 'active' : ''}`}
          onClick={() => setHighContrast(prev => !prev)}
          aria-pressed={highContrast}
          aria-label="Toggle High Contrast"
        >
          <span className="icon-wrapper">
            {highContrast ? <SunIcon /> : <MoonIcon />}
          </span>
          <span className="btn-text">Contrast</span>
        </button>

        <div className="a11y-divider"></div>

        <div className="font-scaling-group" role="group" aria-label="Font Scaling Controls">
          <button 
            type="button" 
            className="a11y-btn icon-only" 
            onClick={decreaseFont}
            aria-label="Decrease font size"
            disabled={fontSizeOffset <= -4}
          >
            <MinusIcon />
          </button>
          
          <div className="font-size-indicator" aria-hidden="true">
            <TextIcon />
          </div>

          <button 
            type="button" 
            className="a11y-btn icon-only" 
            onClick={increaseFont}
            aria-label="Increase font size"
            disabled={fontSizeOffset >= 8}
          >
            <PlusIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
