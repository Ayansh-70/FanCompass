import type { ReactNode } from 'react';
import '../styles/GlobalHeader.css';

interface GlobalHeaderProps {
  onBack?: () => void;
  title?: ReactNode;
  transparent?: boolean;
  rightAction?: ReactNode;
}

export function GlobalHeader({ onBack, title = "FanCompass", transparent = false, rightAction }: GlobalHeaderProps) {
  return (
    <header className={`global-header ${transparent ? 'transparent' : 'solid'}`}>
      <div className="header-left">
        {onBack && (
          <button className="back-button" onClick={onBack} aria-label="Go back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
        )}
        <div className="header-brand">{title}</div>
      </div>
      <div className="header-right">
        {rightAction}
      </div>
    </header>
  );
}
