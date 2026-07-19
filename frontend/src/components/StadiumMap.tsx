import { useState, useEffect, useCallback } from 'react';
import type { Gate } from '../types/stadium';
import '../styles/StadiumMap.css';

interface StadiumMapProps {
  selectedSection: string;
  onSelectSection: (section: string) => void;
}

// Section definitions positioned around an oval stadium
const SECTIONS = [
  {
    id: 'A',
    label: 'Section A',
    cx: 200,
    cy: 60,
    path: 'M 130,80 Q 130,30 200,25 Q 270,30 270,80 L 245,100 Q 200,90 155,100 Z',
  },
  {
    id: 'B',
    label: 'Section B',
    cx: 320,
    cy: 150,
    path: 'M 270,80 Q 310,60 345,100 Q 370,140 360,190 L 330,175 Q 340,140 310,105 Z',
  },
  {
    id: 'C',
    label: 'Section C',
    cx: 320,
    cy: 270,
    path: 'M 360,210 Q 370,260 345,300 Q 310,340 270,320 L 310,295 Q 340,260 330,225 Z',
  },
  {
    id: 'D',
    label: 'Section D',
    cx: 200,
    cy: 345,
    path: 'M 270,320 Q 270,370 200,375 Q 130,370 130,320 L 155,300 Q 200,310 245,300 Z',
  },
  {
    id: 'E',
    label: 'Section E',
    cx: 80,
    cy: 270,
    path: 'M 130,320 Q 90,340 55,300 Q 30,260 40,210 L 70,225 Q 60,260 90,295 Z',
  },
  {
    id: 'F',
    label: 'Section F',
    cx: 80,
    cy: 150,
    path: 'M 40,190 Q 30,140 55,100 Q 90,60 130,80 L 90,105 Q 60,140 70,175 Z',
  },
];

// Gate positions around the stadium perimeter (matching stadium.json cardinal positions)
const GATE_POSITIONS = [
  { id: 'G1', label: 'G1', name: 'North', cx: 200, cy: 12 },
  { id: 'G2', label: 'G2', name: 'NE', cx: 360, cy: 80 },
  { id: 'G3', label: 'G3', name: 'East', cx: 385, cy: 200 },
  { id: 'G4', label: 'G4', name: 'South', cx: 200, cy: 390 },
  { id: 'G5', label: 'G5', name: 'SW', cx: 40, cy: 320 },
  { id: 'G6', label: 'G6', name: 'West', cx: 15, cy: 200 },
];

export function StadiumMap({ selectedSection, onSelectSection }: StadiumMapProps) {
  const [gates, setGates] = useState<Gate[]>([]);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  useEffect(() => {
    const fetchGates = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${API_URL}/api/stadium/gates`);
        if (res.ok) {
          const data = await res.json();
          // Defensive check against backend returning { gates: [...] } instead of [...]
          const gatesArray = Array.isArray(data) ? data : data.gates || [];
          setGates(gatesArray);
        }
      } catch {
        // Silently fail — map still works without live data
      }
    };
    fetchGates();
  }, []);

  const getGateCrowdLevel = useCallback(
    (gateId: string): string => {
      if (!Array.isArray(gates)) return 'low';
      const gate = gates.find((g) => g && g.id === gateId);
      return gate ? gate.current_crowd_level : 'low';
    },
    [gates]
  );

  const getSectionFill = useCallback(
    (sectionId: string) => {
      if (selectedSection === sectionId) return 'var(--primary)';
      if (hoveredSection === sectionId) return 'var(--muted)';
      return 'var(--secondary)';
    },
    [selectedSection, hoveredSection]
  );

  const getSectionOpacity = useCallback(
    (sectionId: string) => {
      if (selectedSection === sectionId) return 0.9;
      if (hoveredSection === sectionId) return 0.8;
      return 0.5;
    },
    [selectedSection, hoveredSection]
  );

  return (
    <div className="stadium-map-container">
      <svg
        className="stadium-map-svg"
        viewBox="0 0 400 405"
        role="img"
        aria-label="Stadium seating map. Click a section to select your seat."
      >
        {/* Stadium outer ring */}
        <ellipse
          cx="200"
          cy="200"
          rx="190"
          ry="195"
          fill="none"
          stroke="var(--border)"
          strokeWidth="1.5"
          opacity="0.4"
        />

        {/* Sections */}
        {SECTIONS.map((section) => (
          <g key={section.id}>
            <path
              d={section.path}
              fill={getSectionFill(section.id)}
              opacity={getSectionOpacity(section.id)}
              className={`stadium-section ${selectedSection === section.id ? 'selected' : ''}`}
              onClick={() => onSelectSection(section.id)}
              onMouseEnter={() => setHoveredSection(section.id)}
              onMouseLeave={() => setHoveredSection(null)}
              role="button"
              tabIndex={0}
              aria-label={`${section.label}${selectedSection === section.id ? ' (selected)' : ''}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectSection(section.id);
                }
              }}
            />
            <text
              x={section.cx}
              y={section.cy}
              className={`section-label ${selectedSection === section.id ? 'selected' : ''}`}
            >
              {section.id}
            </text>
          </g>
        ))}

        {/* Pitch */}
        <rect className="pitch-rect" x="110" y="120" width="180" height="160" />
        <ellipse className="pitch-circle" cx="200" cy="200" rx="30" ry="30" />
        <text className="pitch-label" x="200" y="200">
          Pitch
        </text>

        {/* Gate markers */}
        {GATE_POSITIONS.map((gate) => {
          const level = getGateCrowdLevel(gate.id);
          return (
            <g key={gate.id} className="gate-marker-group">
              <circle cx={gate.cx} cy={gate.cy} r={5} className={`gate-dot ${level}`} />
              <text x={gate.cx} y={gate.cy - 10} className="gate-label">
                {gate.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Selection info */}
      <div className="map-selection-info" aria-live="polite">
        {selectedSection ? (
          <span>
            Selected: <span className="selected-name">Section {selectedSection}</span>
          </span>
        ) : (
          <span>Tap a section on the map to select your seat</span>
        )}
      </div>

      {/* Legend */}
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-dot low"></span> Low crowd
        </div>
        <div className="legend-item">
          <span className="legend-dot medium"></span> Medium
        </div>
        <div className="legend-item">
          <span className="legend-dot high"></span> High crowd
        </div>
      </div>
    </div>
  );
}
