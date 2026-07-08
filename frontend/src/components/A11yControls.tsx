import { useState, useEffect } from 'react';
import '../styles/A11yControls.css';

export function A11yControls() {
  const [highContrast, setHighContrast] = useState(false);
  const [fontSizeOffset, setFontSizeOffset] = useState(0); // in px

  // High Contrast toggle
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  // Font Scaling
  useEffect(() => {
    // Base font size is usually 16px. We use 100% + offset.
    document.documentElement.style.fontSize = `calc(100% + ${fontSizeOffset}px)`;
  }, [fontSizeOffset]);

  const toggleHighContrast = () => setHighContrast(prev => !prev);
  const increaseFont = () => setFontSizeOffset(prev => Math.min(prev + 2, 8)); // Max +8px
  const decreaseFont = () => setFontSizeOffset(prev => Math.max(prev - 2, -4)); // Min -4px

  return (
    <div className="a11y-controls-bar" role="region" aria-label="Accessibility Controls">
      <div className="a11y-inner">
        <button 
          type="button"
          className={`a11y-toggle-btn ${highContrast ? 'active' : ''}`}
          onClick={toggleHighContrast}
          aria-pressed={highContrast}
        >
          ◐ High Contrast
        </button>
        <div className="font-scaling-group" role="group" aria-label="Font Scaling Controls">
          <button 
            type="button" 
            className="a11y-font-btn" 
            onClick={decreaseFont}
            aria-label="Decrease font size"
            disabled={fontSizeOffset <= -4}
          >
            A-
          </button>
          <button 
            type="button" 
            className="a11y-font-btn" 
            onClick={increaseFont}
            aria-label="Increase font size"
            disabled={fontSizeOffset >= 8}
          >
            A+
          </button>
        </div>
      </div>
    </div>
  );
}
