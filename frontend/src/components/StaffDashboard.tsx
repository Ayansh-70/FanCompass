import { useState, useEffect, useMemo } from 'react';
import { useKickoffTimer } from '../hooks/useKickoffTimer';
import type { Gate } from '../types/stadium';
import { GlobalHeader } from './GlobalHeader';
import '../styles/StaffDashboard.css';

type StaffRole = 'volunteer' | 'organizer' | 'security';

interface InsightResult {
  isLoading: boolean;
  error?: string;
  data?: any;
  liveAnnouncement: string;
}

interface StaffDashboardProps {
  onBack?: () => void;
}

const ROLE_CONFIG: Record<StaffRole, { label: string; color: string; icon: string }> = {
  volunteer: { label: 'Volunteer', color: 'hsl(190, 90%, 50%)', icon: '🤝' },
  organizer: { label: 'Organizer', color: 'hsl(270, 80%, 60%)', icon: '📋' },
  security:  { label: 'Security',  color: 'hsl(350, 72%, 51%)', icon: '🛡️' },
};

export function StaffDashboard({ onBack }: StaffDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const { getLiveMinutesToKickoff } = useKickoffTimer();
  
  const [kickoffTimeStr, setKickoffTimeStr] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  
  const [role, setRole] = useState<StaffRole>('volunteer');
  const [gates, setGates] = useState<Gate[]>([]);
  const [loadingGates, setLoadingGates] = useState(true);
  const [gatesError, setGatesError] = useState('');
  const [insights, setInsights] = useState<Record<string, InsightResult>>({});

  useEffect(() => {
    const fetchGates = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${API_URL}/api/stadium/gates`);
        if (!res.ok) throw new Error('Failed to fetch stadium data');
        const data = await res.json();
        const gatesArray = Array.isArray(data) ? data : (data.gates || []);
        const initialInsights: Record<string, InsightResult> = {};
        gatesArray.forEach((g: Gate) => {
          initialInsights[g.id] = { isLoading: false, liveAnnouncement: '' };
        });
        setGates(gatesArray);
        setInsights(initialInsights);
      } catch {
        setGatesError("Could not load stadium gates.");
      } finally {
        setLoadingGates(false);
      }
    };
    fetchGates();
  }, []);

  // Computed stats
  const stats = useMemo(() => {
    const crowdMap: Record<string, number> = { low: 1, medium: 2, high: 3 };
    const total = gates.length;
    const highCount = gates.filter(g => g.current_crowd_level === 'high').length;
    const avgCrowd = total > 0
      ? gates.reduce((sum, g) => sum + (crowdMap[g.current_crowd_level] || 1), 0) / total
      : 0;
    const avgLabel = avgCrowd < 1.5 ? 'Low' : avgCrowd < 2.5 ? 'Medium' : 'High';
    const accessibleCount = gates.filter(g => g.wheelchair_accessible).length;
    return { total, highCount, avgLabel, accessibleCount };
  }, [gates]);

  const handleGetInsight = async (gateId: string) => {
    setInsights(prev => ({
      ...prev,
      [gateId]: { ...prev[gateId], isLoading: true, error: undefined, data: undefined }
    }));

    try {
      const minutes_to_kickoff = getLiveMinutesToKickoff(new Date(kickoffTimeStr));
      const payload = {
        minutes_to_kickoff,
        context: { gate_id: gateId, requesting_role: role }
      };

      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const res = await fetch(`${API_URL}/api/staff/insight`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer fancompass_staff_token'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw { status: res.status, message: errData.error || `HTTP ${res.status}` };
      }

      const data = await res.json();
      const directive = data.staff_directive || data.directive || 'No directive provided';
      const announcement = `Insight received for Gate ${gateId}. Action: ${directive}.`;

      setInsights(prev => ({
        ...prev,
        [gateId]: { isLoading: false, data: { directive }, liveAnnouncement: announcement }
      }));

    } catch (err: any) {
      console.error(err);
      let errorText = "Can't reach the backend right now — check your connection.";
      if (err.status === 400) errorText = err.message;
      setInsights(prev => ({
        ...prev,
        [gateId]: { isLoading: false, error: errorText, liveAnnouncement: `Error for Gate ${gateId}: ${errorText}` }
      }));
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'fancompass_staff') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid password. Please try again.');
    }
  };

  if (loadingGates) return <div className="staff-loading">Loading Stadium Data...</div>;
  if (gatesError) return <div className="staff-error glass-card">⚠️ {gatesError}</div>;

  /* ─── LOGIN SCREEN ─── */
  if (!isAuthenticated) {
    return (
      <>
        <GlobalHeader onBack={onBack} title="Staff Portal" />
        <div className="staff-login-wrapper">
          <div className="staff-login-card glass-card animate-fade-up">
            <div className="login-logo" aria-hidden="true">🛡️</div>
            <h2 className="login-title">Staff Access</h2>
            <p className="login-subtitle">Enter your staff credentials to access the operational dashboard.</p>
            
            <form onSubmit={handleLogin} className="login-form">
              <div className="login-input-wrapper">
                <input 
                  type="password" 
                  value={password}
                  onChange={e => { setPassword(e.target.value); setLoginError(''); }}
                  placeholder="Staff password"
                  className="login-input"
                  aria-label="Staff password"
                  autoFocus
                />
              </div>
              {loginError && (
                <div className="login-error" role="alert">{loginError}</div>
              )}
              <button type="submit" className="login-btn">
                Unlock Dashboard
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  /* ─── MAIN DASHBOARD ─── */
  const roleConfig = ROLE_CONFIG[role];
  const minutesToKickoff = getLiveMinutesToKickoff(new Date(kickoffTimeStr));

  return (
    <>
      <GlobalHeader onBack={onBack} title="Operational Dashboard" />
      <div className="staff-dashboard">

        {/* ── Stats Summary Bar ── */}
        <div className="stats-bar">
          <div className="stat-card glass-card">
            <div className="stat-icon">🏟️</div>
            <div className="stat-content">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Gates</div>
            </div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">{stats.avgLabel}</div>
              <div className="stat-label">Avg. Crowd</div>
            </div>
          </div>
          <div className={`stat-card glass-card ${stats.highCount > 0 ? 'stat-alert' : ''}`}>
            <div className="stat-icon">🚨</div>
            <div className="stat-content">
              <div className="stat-value">{stats.highCount}</div>
              <div className="stat-label">High Capacity</div>
            </div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <div className="stat-value">{minutesToKickoff}m</div>
              <div className="stat-label">To Kickoff</div>
            </div>
          </div>
        </div>

        {/* ── Controls Bar ── */}
        <div className="staff-controls glass-card">
          <div className="controls-left">
            <div className="form-group">
              <label htmlFor="staffRole">Role</label>
              <select id="staffRole" value={role} onChange={(e) => setRole(e.target.value as StaffRole)}>
                <option value="volunteer">Volunteer</option>
                <option value="organizer">Organizer</option>
                <option value="security">Security</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="staffKickoff">Match Kickoff</label>
              <input 
                id="staffKickoff" 
                type="datetime-local" 
                value={kickoffTimeStr} 
                onChange={e => setKickoffTimeStr(e.target.value)} 
              />
            </div>
          </div>
          <div className="role-badge" style={{ '--role-color': roleConfig.color } as React.CSSProperties}>
            <span className="role-badge-icon">{roleConfig.icon}</span>
            <span className="role-badge-label">{roleConfig.label}</span>
          </div>
        </div>

        {/* ── Gate Cards ── */}
        <div className="gates-list">
          {gates.map(gate => {
            const insight = insights[gate.id];
            return (
              <div key={gate.id} className={`gate-card glass-card crowd-${gate.current_crowd_level}`}>
                <div className="sr-only" aria-live="polite" aria-atomic="true">
                  {insight?.liveAnnouncement || ''}
                </div>

                <div className="gate-card-header">
                  <div className="gate-info">
                    <div className="gate-id-block">
                      <h3>{gate.id}</h3>
                      <span className="gate-name">{gate.name}</span>
                    </div>
                    <div className="gate-badges">
                      <span className={`crowd-badge ${gate.current_crowd_level}`}>
                        <span className="live-dot" aria-hidden="true"></span>
                        {gate.current_crowd_level.toUpperCase()}
                      </span>
                      {gate.wheelchair_accessible && (
                        <span className="a11y-badge" title="Wheelchair Accessible">♿</span>
                      )}
                    </div>
                  </div>
                  <button 
                    className={`insight-btn ${insight?.isLoading ? 'loading-shimmer' : ''}`}
                    onClick={() => handleGetInsight(gate.id)}
                    disabled={insight?.isLoading}
                  >
                    {insight?.isLoading ? 'Requesting...' : 'Get Recommendation'}
                  </button>
                </div>

                {/* Gate Meta Row */}
                <div className="gate-meta">
                  {gate.accommodations && gate.accommodations.length > 0 && (
                    <div className="gate-accommodations">
                      {gate.accommodations.map((acc: string) => (
                        <span key={acc} className="accommodation-tag">
                          {acc === 'hearing_impaired_support' ? '🦻 Hearing' : 
                           acc === 'low_vision_support' ? '👁️ Low Vision' : acc}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="gate-updated">
                    Updated {gate.last_update_minutes_ago === 0 ? 'just now' : `${gate.last_update_minutes_ago}m ago`}
                  </span>
                </div>

                {insight?.error && (
                  <div role="alert" className="insight-error">
                    <strong>⚠️ Error:</strong> {insight.error}
                  </div>
                )}

                {insight?.data && (
                  <div className="insight-result">
                    <p className="directive"><strong>Action Required:</strong> {insight.data.directive}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

