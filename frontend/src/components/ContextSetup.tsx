import { useState, FormEvent } from 'react';
import { useFanContext, LOCALE_MAP } from '../hooks/useFanContext';
import { ACCESSIBILITY_NEEDS } from '../constants/accessibility';
import '../styles/ContextSetup.css';

export function ContextSetup() {
  const { setFanState } = useFanContext();
  
  const [language, setLanguage] = useState('en');
  const [seatSection, setSeatSection] = useState('');
  // For datetime-local, we need a string in YYYY-MM-DDTHH:mm format
  const [kickoffTimeStr, setKickoffTimeStr] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1); // default 1 hr from now
    // convert to local datetime string preserving timezone offset (rough ISO slice)
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  
  const [accessibility, setAccessibility] = useState<Record<string, boolean>>({
    'wheelchair': false,
    'low_vision': false,
    'hearing_impaired': false
  });

  const handleToggle = (key: string) => {
    setAccessibility(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!seatSection.trim()) {
      alert("Please enter a seat section");
      return;
    }

    const needs = Object.entries(accessibility)
      .filter(([_, checked]) => checked)
      .map(([key]) => key);

    const kTime = new Date(kickoffTimeStr);

    setFanState({
      language,
      bcp47Locale: LOCALE_MAP[language] || 'en-US',
      seat_section: seatSection.trim(),
      accessibility_needs: needs,
      kickoffTime: kTime
    });
  };

  return (
    <div className="setup-container">
      <div className="setup-card glass-card">
        <h2>Fan Setup</h2>
        <p>Help us personalize your stadium experience.</p>
        
        <form onSubmit={handleSubmit} className="setup-form">
          <div className="form-group">
            <label htmlFor="language">Language</label>
            <select id="language" value={language} onChange={e => setLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ar">العربية</option>
              <option value="zh">中文</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="seatSection">Seat Section</label>
            <input 
              id="seatSection" 
              type="text" 
              placeholder="e.g. A1, B3..." 
              value={seatSection} 
              onChange={e => setSeatSection(e.target.value)} 
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="kickoffTime">Kickoff Time</label>
            <input 
              id="kickoffTime" 
              type="datetime-local" 
              value={kickoffTimeStr} 
              onChange={e => setKickoffTimeStr(e.target.value)} 
              required
            />
          </div>

          <div className="form-group">
            <label>Accessibility Needs</label>
            <div className="checkbox-grid">
              {ACCESSIBILITY_NEEDS.map(need => (
                <label key={need.value} className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={accessibility[need.value]} 
                    onChange={() => handleToggle(need.value)} 
                  />
                  <span>{need.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="primary-btn">Start Chat</button>
        </form>
      </div>
    </div>
  );
}
