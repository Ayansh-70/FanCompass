import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { A11yControls } from '../components/A11yControls';

describe('A11yControls Component', () => {
  beforeEach(() => {
    // Reset body classes and font size before each test
    document.body.className = '';
    document.documentElement.style.fontSize = '100%';
  });

  afterEach(() => {
    document.body.className = '';
    document.documentElement.style.fontSize = '';
  });

  it('renders the accessibility controls', () => {
    render(<A11yControls />);
    expect(screen.getByRole('region', { name: /accessibility controls/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /toggle high contrast/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /increase font size/i })).toBeInTheDocument();
  });

  it('toggles high contrast class on the body', () => {
    render(<A11yControls />);
    const contrastBtn = screen.getByRole('button', { name: /toggle high contrast/i });
    
    expect(document.body.classList.contains('high-contrast')).toBe(false);
    
    // Turn on
    fireEvent.click(contrastBtn);
    expect(document.body.classList.contains('high-contrast')).toBe(true);
    
    // Turn off
    fireEvent.click(contrastBtn);
    expect(document.body.classList.contains('high-contrast')).toBe(false);
  });

  it('adjusts font size correctly', () => {
    render(<A11yControls />);
    const increaseBtn = screen.getByRole('button', { name: /increase font size/i });
    const decreaseBtn = screen.getByRole('button', { name: /decrease font size/i });

    // Initial
    expect(document.documentElement.style.fontSize).toBe('calc(100% + 0px)');

    // Increase
    fireEvent.click(increaseBtn);
    expect(document.documentElement.style.fontSize).toBe('calc(100% + 2px)');

    // Decrease
    fireEvent.click(decreaseBtn);
    fireEvent.click(decreaseBtn);
    expect(document.documentElement.style.fontSize).toBe('calc(100% - 2px)');
  });
});
