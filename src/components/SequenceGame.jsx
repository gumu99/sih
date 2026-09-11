import { useState, useRef } from 'react';
import { speak } from '../utils/speech';
import { COMPLIMENTS, ENCOURAGEMENTS, randomFrom } from '../data/messages';

const COLORS = [
  { id: 0, color: '#ff4757' },
  { id: 1, color: '#00a8ff' },
  { id: 2, color: '#2ed573' },
  { id: 3, color: '#ffd700' },
];

export default function SequenceGame({ onExit }) {
  const [sequence, setSequence] = useState([]);
  const [playerSeq, setPlayerSeq] = useState([]);
  const [level, setLevel] = useState(0);
  const [active, setActive] = useState(null);
  const [status, setStatus] = useState('ready');
  const timeoutsRef = useRef([]);

  function startGame() {
    const first = [Math.floor(Math.random() * 4)];
    setSequence(first);
    setPlayerSeq([]);
    setLevel(1);
    playSequence(first);
  }

  function playSequence(seq) {
    setStatus('showing');
    seq.forEach((colorId, i) => {
      timeoutsRef.current.push(setTimeout(() => setActive(colorId), i * 900));
      timeoutsRef.current.push(setTimeout(() => setActive(null), i * 900 + 500));
    });
    timeoutsRef.current.push(setTimeout(() => setStatus('playing'), seq.length * 900));
  }

  function handleColorClick(id) {
    if (status !== 'playing') return;
    setActive(id);
    setTimeout(() => setActive(null), 300);
    const newSeq = [...playerSeq, id];
    setPlayerSeq(newSeq);
    const idx = newSeq.length - 1;
    if (newSeq[idx] !== sequence[idx]) {
      setStatus('over');
      speak(`${randomFrom(ENCOURAGEMENTS)} You reached level ${level}.`);
      return;
    }
    if (newSeq.length === sequence.length) {
      speak(randomFrom(COMPLIMENTS));
      setTimeout(() => {
        const nextSeq = [...sequence, Math.floor(Math.random() * 4)];
        setSequence(nextSeq);
        setPlayerSeq([]);
        setLevel(l => l + 1);
        playSequence(nextSeq);
      }, 1000);
    }
  }

  function resetGame() {
    timeoutsRef.current.forEach(clearTimeout);
    setSequence([]); setPlayerSeq([]); setLevel(0); setStatus('ready'); setActive(null);
  }

  return (
    <div className="sequence-game">
      <div className="game-header">
        <button className="btn-back" onClick={onExit}>← Back</button>
        <h2>Sequence Recall</h2>
        <div className="game-stats">Level: {level}</div>
      </div>
      <div className="sequence-board">
        {COLORS.map(c => (
          <button key={c.id} className={`seq-btn ${active === c.id ? 'active' : ''}`} style={{ '--btn-color': c.color }} onClick={() => handleColorClick(c.id)} disabled={status !== 'playing'} />
        ))}
      </div>
      <div className="sequence-controls">
        {status === 'ready' && <button className="btn-start" onClick={startGame}>Start Game</button>}
        {status === 'showing' && <p className="status-text">Watch closely...</p>}
        {status === 'playing' && <p className="status-text">Your turn</p>}
        {status === 'over' && (
          <div>
            <p className="status-text">Game Over — Level {level}</p>
            <button className="btn-start" onClick={resetGame}>Try Again</button>
          </div>
        )}
      </div>
    </div>
  );
}
