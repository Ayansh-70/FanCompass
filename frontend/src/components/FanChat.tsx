import { useState, useRef, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useFanContext } from '../hooks/useFanContext';
import type { AssistantResponse } from '../types/assistant-response';
import { VoiceInput, VoiceOutputToggle, speakText } from './VoiceControls';
import '../styles/FanChat.css';

interface Message {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text?: string; // For user/system messages
  data?: AssistantResponse; // For assistant messages
}

export function FanChat() {
  const { fanState, getLiveMinutesToKickoff } = useFanContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [readAloud, setReadAloud] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Focus heading on mount
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const query = inputVal.trim();
    if (!query) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
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
          accessibility_needs: fanState!.accessibility_needs
        }
      };

      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const res = await fetch(`${API_URL}/api/fan/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw { status: res.status, message: errData.error || `HTTP ${res.status}` };
      }

      const data: AssistantResponse = await res.json();
      
      const assistantMsg: Message = { id: Date.now().toString(), sender: 'assistant', data };
      setMessages(prev => [...prev, assistantMsg]);
      
      // Update the visually hidden aria-live region with a clean, synthesized string
      const accNotes = data.accessibility_notes.length > 0 
        ? `Accessibility notes: ${data.accessibility_notes.join(', ')}.` 
        : '';
      setLiveAnnouncement(`Assistant says: ${data.answer}. Recommended Gate is ${data.recommended_gate}. Urgency is ${data.urgency_level}. ${accNotes}`);

      if (readAloud && fanState?.bcp47Locale) {
        speakText(data.answer, fanState.bcp47Locale);
      }

    } catch (err: any) {
      console.error(err);
      let errorText = "Can't reach the assistant right now — check your connection and try again.";
      
      // If it's a 400 error we deliberately threw, surface the specific message
      if (err.status === 400) {
        errorText = err.message;
      }
      
      const sysMsg: Message = { id: Date.now().toString(), sender: 'system', text: errorText };
      setMessages(prev => [...prev, sysMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceTranscript = (text: string) => {
    setInputVal(prev => (prev + ' ' + text).trim());
  };

  return (
    <div className="chat-container">
      {/* Visually hidden aria-live region for screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      <div className="chat-header glass-card">
        <div>
          <h2 tabIndex={-1} ref={headingRef} className="chat-heading">Stadium Assistant</h2>
          <div className="context-badges">
            <span className="badge">Sec {fanState?.seat_section}</span>
            <span className="badge">Kickoff: {getLiveMinutesToKickoff()}m</span>
            {fanState?.accessibility_needs.map(n => (
              <span key={n} className="badge access">{n}</span>
            ))}
          </div>
        </div>
        <VoiceOutputToggle readAloud={readAloud} setReadAloud={setReadAloud} />
      </div>

      <div className="chat-messages">
        {messages.map(msg => (
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
                  
                  <div className="structured-data">
                    <div className="data-row">
                      <strong>Recommended Gate:</strong> 
                      <span className="gate-badge">{msg.data.recommended_gate}</span>
                    </div>
                    
                    <div className="data-row">
                      <strong>Urgency:</strong> 
                      <span className={`urgency-badge ${msg.data.urgency_level}`}>
                        Urgency: {msg.data.urgency_level.toUpperCase()}
                      </span>
                    </div>

                    {msg.data.accessibility_notes.length > 0 && (
                      <div className="accessibility-block">
                        <strong>Accessibility Notes:</strong>
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

      <div className="chat-input-area glass-card">
        <form onSubmit={handleSubmit} className="input-form">
          <input 
            type="text" 
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            placeholder="Ask a question..."
            disabled={isLoading}
          />
          <VoiceInput 
            onTranscript={handleVoiceTranscript}
            isListening={isListening}
            setIsListening={setIsListening}
          />
          <button type="submit" className="send-btn" disabled={!inputVal.trim() || isLoading}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
