import { useState, useEffect } from 'react';
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

export function StaffDashboard({ onBack }: StaffDashboardProps) {
  const { getLiveMinutesToKickoff } = useKickoffTimer();
  
  // 1. Kickoff Time State
  const [kickoffTimeStr, setKickoffTimeStr] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  
  // 2. Role Selector State
  // Note: In a production environment, staff roles would be securely determined
  // via JWT payload or session authentication, rather than a client-side selector.
  const [role, setRole] = useState<StaffRole>('volunteer');
  
  // 3. Gates State
  const [gates, setGates] = useState<Gate[]>([]);
  const [loadingGates, setLoadingGates] = useState(true);
  const [gatesError, setGatesError] = useState('');
  
  // 4. Insights State (keyed by gate_id)
  const [insights, setInsights] = useState<Record<string, InsightResult>>({});

  useEffect(() => {
    const fetchGates = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${API_URL}/api/stadium/gates`);
        if (!res.ok) throw new Error('Failed to fetch stadium data');
        const data = await res.json();
        
        // Defensive check against backend returning { gates: [...] } instead of [...]
        const gatesArray = Array.isArray(data) ? data : (data.gates || []);
        
        // Initialize insight state for each gate
        const initialInsights: Record<string, InsightResult> = {};
        gatesArray.forEach((g: Gate) => {
          initialInsights[g.id] = { isLoading: false, liveAnnouncement: '' };
        });
        
        setGates(gatesArray);
        setInsights(initialInsights);
      } catch (err: any) {
        setGatesError("Could not load stadium gates.");
      } finally {
        setLoadingGates(false);
      }
    };
    fetchGates();
  }, []);

  const handleGetInsight = async (gateId: string) => {
    setInsights(prev => ({
      ...prev,
      [gateId]: { ...prev[gateId], isLoading: true, error: undefined, data: undefined }
    }));

    try {
      const minutes_to_kickoff = getLiveMinutesToKickoff(new Date(kickoffTimeStr));
      const payload = {
        minutes_to_kickoff,
        context: {
          gate_id: gateId,
          requesting_role: role
        }
      };

      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const res = await fetch(`${API_URL}/api/staff/insight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw { status: res.status, message: errData.error || `HTTP ${res.status}` };
      }

      const data = await res.json();
      
      const announcement = `Insight received for Gate ${gateId}. Action: ${data.directive}. Reasoning: ${data.reasoning.join(', ')}.`;

      setInsights(prev => ({
        ...prev,
        [gateId]: { 
          isLoading: false, 
          data, 
          liveAnnouncement: announcement 
        }
      }));

    } catch (err: any) {
      console.error(err);
      let errorText = "Can't reach the backend right now — check your connection.";
      if (err.status === 400) {
        errorText = err.message;
      }
      setInsights(prev => ({
        ...prev,
        [gateId]: { 
          isLoading: false, 
          error: errorText, 
          liveAnnouncement: `Error for Gate ${gateId}: ${errorText}`
        }
      }));
    }
  };

  if (loadingGates) return <div className="staff-loading">Loading Stadium Data...</div>;
  if (gatesError) return <div className="staff-error glass-card">⚠️ {gatesError}</div>;

  return (
    <>
      <GlobalHeader onBack={onBack} title="Operational Dashboard" />
      <div className="staff-dashboard">
        <div className="staff-controls glass-card">
          <div className="form-group">
            <label htmlFor="staffRole">Current Role</label>
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

      <div className="gates-list">
        {gates.map(gate => {
          const insight = insights[gate.id];
          return (
            <div key={gate.id} className={`gate-card glass-card crowd-${gate.current_crowd_level}`}>
              {/* Unconditionally rendered aria-live region per gate */}
              <div className="sr-only" aria-live="polite" aria-atomic="true">
                {insight?.liveAnnouncement || ''}
              </div>

              <div className="gate-card-header">
                <div className="gate-info">
                  <h3>Gate {gate.id}</h3>
                  <span className={`crowd-badge ${gate.current_crowd_level}`}>
                    <span className="live-dot" aria-hidden="true"></span>
                    Crowd: {gate.current_crowd_level.toUpperCase()}
                  </span>
                </div>
                <button 
                  className={`insight-btn ${insight?.isLoading ? 'loading-shimmer' : ''}`}
                  onClick={() => handleGetInsight(gate.id)}
                  disabled={insight?.isLoading}
                >
                  {insight?.isLoading ? 'Requesting...' : 'Get Recommendation'}
                </button>
              </div>

              {insight?.error && (
                <div role="alert" className="insight-error">
                  <strong>⚠️ Error:</strong> {insight.error}
                </div>
              )}

              {insight?.data && (
                <div className="insight-result">
                  <p className="directive"><strong>Action Required:</strong> {insight.data.directive}</p>
                  <details className="staff-reasoning">
                    <summary>Reasoning Trail</summary>
                    <ul>
                      {insight.data.reasoning.map((step: string, i: number) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </details>
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
