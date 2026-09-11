import { useState, useEffect } from 'react';
import { speak } from '../utils/speech';
import { COMPLIMENTS, ENCOURAGEMENTS, randomFrom } from '../data/messages';

const ICONS = ['🌟', '🌙', '☀️', '🌈', '🍀', '🎵', '🌺', '🔥'];
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

export default function MemoryGame({ onExit }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  useEffect(() => { resetGame(); }, []);

  useEffect(() => {
    if (cards.length > 0 && matched.length === cards.length) {
      setWon(true);
      speak("Excellent work. Your memory match is complete.");
    }
  }, [matched, cards]);

  function resetGame() {
    const deck = shuffle([...ICONS, ...ICONS]).map((icon, i) => ({ id: i, icon }));
    setCards(deck); setFlipped([]); setMatched([]); setMoves(0); setWon(false);
  }

  function handleClick(idx) {
    if (flipped.length === 2 || flipped.includes(idx) || matched.includes(idx)) return;
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newFlipped;
      if (cards[a].icon === cards[b].icon) {
        speak(randomFrom(COMPLIMENTS));
        setTimeout(() => { setMatched(m => [...m, a, b]); setFlipped([]); }, 500);
      } else {
        speak(randomFrom(ENCOURAGEMENTS));
        setTimeout(() => setFlipped([]), 900);
      }
    }
  }

  return (
    <div className="memory-game">
      <div className="game-header">
        <button className="btn-back" onClick={onExit}>← Back</button>
        <h2>Memory Match</h2>
        <div className="game-stats">Moves: {moves}</div>
      </div>
      <div className="card-grid">
        {cards.map((card, idx) => {
          const isFlipped = flipped.includes(idx) || matched.includes(idx);
          return (
            <div key={card.id} className={`memory-card ${isFlipped ? 'flipped' : ''} ${matched.includes(idx) ? 'matched' : ''}`} onClick={() => handleClick(idx)}>
              <div className="card-inner">
                <div className="card-front">?</div>
                <div className="card-back">{card.icon}</div>
              </div>
            </div>
          );
        })}
      </div>
      {won && (
        <div className="win-banner">
          <h3>🎉 Well Done!</h3>
          <p>Completed in {moves} moves</p>
          <button onClick={resetGame}>Play Again</button>
        </div>
      )}
    </div>
  );
}
