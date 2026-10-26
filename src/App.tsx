import React, { useState, useEffect } from 'react';
import NcalcHeader from './components/NcalcHeader';
import GeminiAiToolbar from './components/GeminiAiToolbar';

export default function App() {
  const [isAiOpen, setIsAiOpen] = useState(false);

  // Sync right margin of spreadsheet container when AI toolbar opens/closes
  useEffect(() => {
    const container = document.getElementById('ncalc-app-container');
    if (container) {
      container.style.transition = 'right 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
      if (isAiOpen) {
        container.style.right = '380px';
      } else {
        container.style.right = '0px';
      }
      // Re-trigger layout measurement for grid canvas & ECharts
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 220);
      return () => clearTimeout(timer);
    }
  }, [isAiOpen]);

  // Global keyboard shortcut to toggle AI: Ctrl+Shift+A or Cmd+Shift+A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setIsAiOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* 1. Royal Blue Header matching Foto 1 */}
      <NcalcHeader
        isAiOpen={isAiOpen}
        onToggleAi={() => setIsAiOpen((prev) => !prev)}
      />

      {/* 2. Gemini AI Right Toolbar & Smart Data Pipeline matching Foto 2 */}
      <GeminiAiToolbar
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
      />
    </>
  );
}
