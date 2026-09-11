import { useState, useEffect } from 'react';
import { unlockSpeech } from '../utils/speech';

export default function BootScreen({ onActivate }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1800);
    return () => clearTimeout(t);
  }, []);

  function handleActivate() {
    // Must be called directly inside the click handler so the browser
    // treats speech synthesis as user-initiated and doesn't block it.
    unlockSpeech();
    onActivate();
  }

  return (
    <div className="boot-screen">
      <div className="boot-orb">
        <div className="boot-ring"></div>
        <div className="boot-ring r2"></div>
        <div className="boot-core"></div>
      </div>
      <h1 className="boot-title">J.A.R.V.I.S.</h1>
      <p className="boot-sub">Initializing Cognitive Care Systems...</p>
      <div className="boot-bar"><div className="boot-fill"></div></div>
      {ready && (
        <button className="boot-activate" onClick={handleActivate}>
          ▶ Activate JARVIS
        </button>
      )}
    </div>
  );
}
