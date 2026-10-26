import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const container = document.getElementById('ncalc-overlay-root');
if (container) {
  createRoot(container).render(<App />);
} else {
  const newContainer = document.createElement('div');
  newContainer.id = 'ncalc-overlay-root';
  document.body.appendChild(newContainer);
  createRoot(newContainer).render(<App />);
}
