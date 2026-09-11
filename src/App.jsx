import { useState, useEffect } from 'react';
import BootScreen from './components/BootScreen';
import Jarvis from './components/Jarvis';
import Dashboard from './components/Dashboard';
import MemoryGame from './components/MemoryGame';
import SequenceGame from './components/SequenceGame';
import ReminderPanel from './components/ReminderPanel';
import PhotoMemory from './components/PhotoMemory';
import { defaultReminders } from './data/sampleData';

export default function App() {
  const [booting, setBooting] = useState(true);
  const [activated, setActivated] = useState(false);
  const [view, setView] = useState('dashboard');
  const [gameType, setGameType] = useState(null);
  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('jarvis_reminders');
    return saved ? JSON.parse(saved) : defaultReminders;
  });
  const [theme, setTheme] = useState(() => localStorage.getItem('jarvis_theme') || 'dark');

  useEffect(() => { localStorage.setItem('jarvis_reminders', JSON.stringify(reminders)); }, [reminders]);

  useEffect(() => {
    document.body.classList.toggle('light', theme === 'light');
    localStorage.setItem('jarvis_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  if (booting) return <BootScreen onActivate={() => { setActivated(true); setBooting(false); }} />;

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">◈</span>
          <div>
            <h1>COGNITIVE<span className="accent">CARE</span></h1>
            <p>AI Memory Assistance Platform</p>
          </div>
        </div>
        <nav className="main-nav">
          <button className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>Dashboard</button>
          <button className={view === 'games' ? 'active' : ''} onClick={() => { setView('games'); setGameType(null); }}>Cognitive Games</button>
          <button className={view === 'memories' ? 'active' : ''} onClick={() => setView('memories')}>Memory Gallery</button>
          <button className={view === 'reminders' ? 'active' : ''} onClick={() => setView('reminders')}>Reminders</button>
        </nav>

        <div className="header-right">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle light and dark theme">
            <span className="icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </header>

      <Jarvis onNavigate={setView} reminders={reminders} setReminders={setReminders} justActivated={activated} />

      <main className="app-main">
        {view === 'dashboard' && <Dashboard onNavigate={setView} reminders={reminders} />}

        {view === 'games' && !gameType && (
          <div className="game-select">
            <h2>Select a Training Module</h2>
            <div className="game-cards">
              <div className="game-card" onClick={() => setGameType('memory')}>
                <div className="game-icon">🃏</div>
                <h3>Memory Match</h3>
                <p>Match pairs of cards to strengthen recall</p>
              </div>
              <div className="game-card" onClick={() => setGameType('sequence')}>
                <div className="game-icon">🎯</div>
                <h3>Sequence Recall</h3>
                <p>Repeat growing patterns to sharpen focus</p>
              </div>
            </div>
          </div>
        )}
        {view === 'games' && gameType === 'memory' && <MemoryGame onExit={() => setGameType(null)} />}
        {view === 'games' && gameType === 'sequence' && <SequenceGame onExit={() => setGameType(null)} />}

        {view === 'memories' && <PhotoMemory />}
        {view === 'reminders' && <ReminderPanel reminders={reminders} setReminders={setReminders} />}
      </main>

      <footer className="app-footer">
        <p>Powered by J.A.R.V.I.S. AI • Designed for Cognitive Wellness</p>
      </footer>
    </div>
  );
}
