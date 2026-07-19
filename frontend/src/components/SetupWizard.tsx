import { useState, useMemo } from 'react';
import { useFanContext } from '../hooks/useFanContext';
import { LOCALE_MAP } from '../utils/locales';
import { StadiumMap } from './StadiumMap';
import { GlobalHeader } from './GlobalHeader';
import '../styles/SetupWizard.css';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];

const A11Y_OPTIONS = [
  { value: 'wheelchair', label: 'Wheelchair', icon: '♿' },
  { value: 'low_vision', label: 'Low Vision', icon: '👁️' },
  { value: 'hearing_impaired', label: 'Hearing', icon: '🦻' },
];
interface SetupWizardProps {
  onBack?: () => void;
}

export function SetupWizard({ onBack }: SetupWizardProps) {
  const { setFanState } = useFanContext();

  const [step, setStep] = useState(1);
  const [language, setLanguage] = useState('en');
  const [seatSection, setSeatSection] = useState('');
  const [accessibility, setAccessibility] = useState<Record<string, boolean>>({
    wheelchair: false,
    low_vision: false,
    hearing_impaired: false,
  });
  const [kickoffTimeStr, setKickoffTimeStr] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [errorMsg, setErrorMsg] = useState('');

  const toggleA11y = (key: string) => {
    setAccessibility((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const countdownText = useMemo(() => {
    const kickoff = new Date(kickoffTimeStr);
    const now = new Date();
    const diffMs = kickoff.getTime() - now.getTime();
    if (diffMs <= 0) return 'Kickoff has passed';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  }, [kickoffTimeStr]);

  const handleNext = () => {
    if (step === 2 && !seatSection) {
      setErrorMsg('Please select a section on the map.');
      return;
    }
    setErrorMsg('');
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    setErrorMsg('');
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    const needs = Object.entries(accessibility)
      .filter(([, checked]) => checked)
      .map(([key]) => key);

    setFanState({
      language,
      bcp47Locale: LOCALE_MAP[language] || 'en-US',
      seat_section: seatSection.trim(),
      accessibility_needs: needs,
      kickoffTime: new Date(kickoffTimeStr),
    });
  };

  const stepTitles = ['Your Profile', 'Your Seat', 'Match Time'];
  const stepSubtitles = [
    'Choose your language and accessibility preferences.',
    'Tap a section on the stadium map.',
    'When does the match kick off?',
  ];

  return (
    <>
      <GlobalHeader onBack={onBack} title="FanCompass Setup" />
      <div className="wizard-container">
        <div className="wizard-card glass-card">
          {/* Progress Bar */}
          <div
            className="wizard-progress"
            role="progressbar"
            aria-valuenow={step}
            aria-valuemin={1}
            aria-valuemax={3}
            aria-label={`Step ${step} of 3: ${stepTitles[step - 1]}`}
          >
            {[1, 2, 3].map((s, i) => (
              <div className="progress-step" key={s}>
                <div
                  className={`step-circle ${step === s ? 'active' : ''} ${step > s ? 'completed' : ''}`}
                >
                  {step > s ? '✓' : s}
                </div>
                {i < 2 && <div className={`step-line ${step > s ? 'completed' : ''}`} />}
              </div>
            ))}
          </div>

          {/* Step Header */}
          <h2 className="step-title">{stepTitles[step - 1]}</h2>
          <p className="step-subtitle">{stepSubtitles[step - 1]}</p>

          {/* Error */}
          {errorMsg && (
            <div role="alert" aria-live="assertive" className="wizard-error">
              {errorMsg}
            </div>
          )}

          {/* Step Content — key forces React to re-mount the div on step change */}
          <div className="wizard-step-content" key={step}>
            {step === 1 && (
              <>
                <div className="language-grid">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      className={`lang-chip ${language === lang.code ? 'selected' : ''}`}
                      onClick={() => setLanguage(lang.code)}
                      aria-pressed={language === lang.code}
                    >
                      <span className="lang-flag">{lang.flag}</span>
                      <span className="lang-name">{lang.label}</span>
                    </button>
                  ))}
                </div>

                <div className="a11y-section-label">Accessibility Needs</div>
                <div className="a11y-pills">
                  {A11Y_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`a11y-pill ${accessibility[opt.value] ? 'active' : ''}`}
                      onClick={() => toggleA11y(opt.value)}
                      aria-pressed={accessibility[opt.value]}
                    >
                      <span className="a11y-pill-icon">{opt.icon}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 2 && (
              <StadiumMap
                selectedSection={seatSection}
                onSelectSection={(s) => {
                  setSeatSection(s);
                  setErrorMsg('');
                }}
              />
            )}

            {step === 3 && (
              <>
                <div className="kickoff-input-wrapper">
                  <label htmlFor="kickoffTime">Kickoff Time</label>
                  <input
                    id="kickoffTime"
                    type="datetime-local"
                    value={kickoffTimeStr}
                    onChange={(e) => setKickoffTimeStr(e.target.value)}
                    required
                  />
                </div>

                <div className="countdown-preview">
                  <span className="countdown-icon">⏱️</span>
                  <div className="countdown-text">
                    Kickoff in <strong>{countdownText}</strong>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Navigation */}
          <div className="wizard-nav">
            {step > 1 ? (
              <button type="button" className="wizard-btn back" onClick={handleBack}>
                ← Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button type="button" className="wizard-btn next" onClick={handleNext}>
                Next →
              </button>
            ) : (
              <button type="button" className="wizard-btn next" onClick={handleSubmit}>
                Start Chat 🚀
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
