import { useState, useEffect, useRef } from 'react';
import { useFanContext } from '../hooks/useFanContext';
import '../styles/VoiceControls.css';

// Type definitions for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
  }
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  isListening: boolean;
  setIsListening: (val: boolean) => void;
}

export function VoiceInput({ onTranscript, isListening, setIsListening }: VoiceInputProps) {
  const { fanState } = useFanContext();
  const [supported] = useState<boolean>(() => !!(window.SpeechRecognition || window.webkitSpeechRecognition));
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!supported) {
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = fanState?.bcp47Locale || 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.abort();
      } catch {
        // Ignore abort errors
      }
    };
  }, [fanState?.bcp47Locale, onTranscript, setIsListening, supported]);

  if (!supported) return null;

  const toggleListen = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error('Could not start speech recognition', e);
      }
    }
  };

  return (
    <button
      type="button"
      className={`mic-btn ${isListening ? 'listening' : ''}`}
      onClick={toggleListen}
      title="Voice Input"
      aria-label="Toggle voice input"
      aria-pressed={isListening}
    >
      {isListening ? '🛑' : '🎤'}
    </button>
  );
}

interface VoiceOutputToggleProps {
  readAloud: boolean;
  setReadAloud: (val: boolean) => void;
}

export function VoiceOutputToggle({ readAloud, setReadAloud }: VoiceOutputToggleProps) {
  const [supported] = useState<boolean>(() => 'speechSynthesis' in window);

  if (!supported) {
    return <div className="voice-unsupported-note">Voice output not supported by browser.</div>;
  }

  return (
    <button
      type="button"
      className={`voice-toggle-btn ${readAloud ? 'active' : ''}`}
      onClick={() => {
        if (!readAloud) {
          // Prime speech engine on user interaction
          const utterance = new SpeechSynthesisUtterance('');
          window.speechSynthesis.speak(utterance);
        }
        setReadAloud(!readAloud);
      }}
      aria-pressed={readAloud}
      aria-label="Toggle Read Aloud"
    >
      <span className="voice-icon">🔊</span> Read Aloud
    </button>
  );
}

