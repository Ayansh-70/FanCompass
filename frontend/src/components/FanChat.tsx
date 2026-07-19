import { useState, useRef, useEffect, useCallback } from 'react';
import type { FormEvent } from 'react';
import { useFanContext } from '../hooks/useFanContext';
import type { AssistantResponse } from '../types/assistant-response';
import { VoiceInput, VoiceOutputToggle } from './VoiceControls';
import { speakText } from '../utils/speech';
import { GlobalHeader } from './GlobalHeader';
import '../styles/FanChat.css';

interface Message {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text?: string;
  data?: AssistantResponse;
}

const QUICK_ACTIONS = [
  { label: '🚻 Nearest restroom', query: 'Where is the nearest restroom?' },
  { label: '🍔 Food & drinks', query: 'Where can I get food and drinks?' },
  { label: '♿ Accessible route', query: 'What is the accessible route to my seat?' },
  { label: '🚗 Parking info', query: 'Where is the nearest parking area?' },
];

const URGENCY_ICONS: Record<string, string> = {
  low: '✅',
  medium: '⚡',
  high: '🚨',
};

interface FanChatProps {
  onBack?: () => void;
}

export function FanChat({ onBack }: FanChatProps) {
  const { fanState, getLiveMinutesToKickoff } = useFanContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [readAloud, setReadAloud] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const submitQuery = async (query: string) => {
    if (!query.trim()) return;

    const userMsg: Message = { id: crypto.randomUUID(), sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsLoading(true);

    try {
      const minutes_to_kickoff = getLiveMinutesToKickoff();
      const payload = {
        query,
        context: {
          language: fanState!.language,
          seat_section: fanState!.seat_section,
          minutes_to_kickoff,
          accessibility_needs: fanState!.accessibility_needs,
        },
      };

      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const res = await fetch(`${API_URL}/api/fan/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw { status: res.status, message: errData.error || `HTTP ${res.status}` };
      }

      const data: AssistantResponse = await res.json();

      const assistantMsg: Message = { id: crypto.randomUUID(), sender: 'assistant', data };
      setMessages((prev) => [...prev, assistantMsg]);

      const accNotes =
        data.accessibility_notes.length > 0
          ? `Accessibility notes: ${data.accessibility_notes.join(', ')}.`
          : '';
      setLiveAnnouncement(
        `Assistant says: ${data.answer}. Recommended Gate is ${data.recommended_gate}. Urgency is ${data.urgency_level}. ${accNotes}`
      );

      if (readAloud && fanState?.bcp47Locale) {
        speakText(data.answer, fanState.bcp47Locale);
      }
    } catch (err: unknown) {
      console.error(err);
      let errorText = "Can't reach the assistant right now — check your connection and try again.";
      
      if (err instanceof Error) {
        errorText = err.message;
      } else if (err && typeof err === 'object' && 'status' in err && err.status === 400 && 'message' in err && typeof err.message === 'string') {
        errorText = err.message;
      }

      const sysMsg: Message = { id: crypto.randomUUID(), sender: 'system', text: errorText };
      setMessages((prev) => [...prev, sysMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    await submitQuery(inputVal.trim());
  };

  const handleVoiceTranscript = useCallback((text: string) => {
    setInputVal((prev) => (prev + ' ' + text).trim());
  }, []);

  return (
    <>
      <GlobalHeader
        onBack={onBack}
        title="Stadium Assistant"
        rightAction={<VoiceOutputToggle readAloud={readAloud} setReadAloud={setReadAloud} />}
      />
      <div className="chat-container">
        {/* Visually hidden aria-live region for screen readers */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {liveAnnouncement}
        </div>

        <div className="chat-header glass-card">
          <div className="context-badges">
            <span className="badge">📍 Sec {fanState?.seat_section}</span>
            <span className="badge">⏱️ {getLiveMinutesToKickoff()}m to kick</span>
            {fanState?.accessibility_needs.map((n) => (
              <span key={n} className="badge access">
                {n}
              </span>
            ))}
          </div>
        </div>

        <div
          className="chat-messages"
          role="region"
          aria-label="Chat messages"
          tabIndex={-1}
          ref={headingRef}
        >
          {messages.length === 0 && (
            <div className="empty-state">
              <div className="empty-compass" aria-hidden="true">
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ opacity: 0.3 }}
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon
                    points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
                    fill="var(--primary)"
                    opacity="0.2"
                    stroke="var(--primary)"
                  ></polygon>
                </svg>
              </div>
              <p className="empty-title">Welcome to FanCompass</p>
              <p className="empty-subtitle">
                Your AI-powered stadium companion. Ask anything about directions, food,
                accessibility, or parking.
              </p>
              <div className="empty-tips">
                <span className="tip-label">Try asking:</span>
                <span className="tip-example">"What's the fastest route to my seat?"</span>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
              <div className={`message-bubble ${msg.sender}`}>
                {msg.sender === 'user' && msg.text}

                {msg.sender === 'system' && (
                  <div className="system-error">
                    <strong>⚠️ Error:</strong> {msg.text}
                  </div>
                )}

                {msg.sender === 'assistant' && msg.data && (
                  <div className="assistant-content">
                    <p className="answer-text">{msg.data.answer}</p>

                    {/* Route Steps Timeline */}
                    {msg.data.route_steps.length > 0 && (
                      <div className="route-timeline">
                        <div className="route-title">🗺️ Route Steps</div>
                        {msg.data.route_steps.map((step, i) => (
                          <div key={i} className="route-step">
                            <div className="route-step-number">{i + 1}</div>
                            <div className="route-step-text">{step}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="structured-data">
                      <div className="data-row">
                        <strong>🧭 Gate:</strong>
                        <span className="gate-badge">{msg.data.recommended_gate}</span>
                      </div>

                      <div className="data-row">
                        <strong>Urgency:</strong>
                        <span className={`urgency-badge ${msg.data.urgency_level}`}>
                          {URGENCY_ICONS[msg.data.urgency_level]}{' '}
                          {msg.data.urgency_level.toUpperCase()}
                        </span>
                      </div>

                      {msg.data.accessibility_notes.length > 0 && (
                        <div className="accessibility-block">
                          <strong>♿ Accessibility Notes:</strong>
                          <ul>
                            {msg.data.accessibility_notes.map((note, i) => (
                              <li key={i}>{note}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <details className="reasoning-details">
                        <summary>Why this recommendation?</summary>
                        <ul className="reasoning-list">
                          {msg.data.reasoning_trail.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ul>
                      </details>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message-wrapper assistant">
              <div className="message-bubble assistant loading">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Action Chips */}
        {messages.length === 0 && !isLoading && (
          <div className="quick-actions">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.query}
                type="button"
                className="quick-chip"
                onClick={() => submitQuery(action.query)}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        <div className="chat-input-area glass-card">
          <form onSubmit={handleSubmit} className="input-form">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask a question..."
              disabled={isLoading}
            />
            <VoiceInput
              onTranscript={handleVoiceTranscript}
              isListening={isListening}
              setIsListening={setIsListening}
            />
            <button type="submit" className="send-btn" disabled={!inputVal.trim() || isLoading}>
              ➤
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
