import React, { useState, useEffect, useRef } from 'react';
import { useFanContext } from '../hooks/useFanContext';
import '../styles/VoiceControls.css';

// Type definitions for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  isListening: boolean;
  setIsListening: (val: boolean) => void;
}

export function VoiceInput({ onTranscript, isListening, setIsListening }: VoiceInputProps) {
  const { fanState } = useFanContext();
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = fanState?.bcp47Locale || 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [fanState?.bcp47Locale, onTranscript, setIsListening]);

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
        console.error("Could not start speech recognition", e);
      }
    }
  };

  return (
    <button 
      type="button"
      className={`mic-btn ${isListening ? 'listening' : ''}`}
      onClick={toggleListen}
      title="Voice Input"
      aria-label="Voice Input"
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
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setSupported(false);
    }
  }, []);

  if (!supported) {
    return <div className="voice-unsupported-note">Voice output not supported by browser.</div>;
  }

  return (
    <label className="voice-toggle">
      <input 
        type="checkbox" 
        checked={readAloud} 
        onChange={(e) => setReadAloud(e.target.checked)} 
      />
      <span>🔊 Read Aloud</span>
    </label>
  );
}

export function speakText(text: string, lang: string) {
  if (!('speechSynthesis' in window)) return;
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  window.speechSynthesis.speak(utterance);
}
