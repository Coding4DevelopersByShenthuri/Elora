import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const rootElement = document.getElementById("root")!;
createRoot(rootElement).render(<App />);

// Ensure initial fade-in happens after mount/paint
window.requestAnimationFrame(() => {
  rootElement.classList.add('loaded');
});
