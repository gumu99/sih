import { useState } from 'react';
import { speak, createRecognizer } from '../utils/speech';
import { familyMembers } from '../data/sampleData';
import { COMPLIMENTS, ENCOURAGEMENTS, randomFrom } from '../data/messages';

export default function PhotoMemory() {
  const [quizMode, setQuizMode] = useState(false);
  const [current, setCurrent] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState({ correct: 0, total: 0 });

  function startQuiz() {
    setQuizMode(true);
    setScore({ correct: 0, total: 0 });
    nextQuestion();
  }

  function nextQuestion() {
    const person = familyMembers[Math.floor(Math.random() * familyMembers.length)];
    setCurrent(person);
    setFeedback('');
    speak("Do you remember this person's name?");
  }

  function askName() {
    const recognizer = createRecognizer((transcript) => checkAnswer(transcript));
    if (recognizer) recognizer.start();
  }

  function checkAnswer(transcript) {
    const correct = transcript.toLowerCase().includes(current.name.toLowerCase());
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    if (correct) {
      setFeedback(`✅ Correct! This is ${current.name}, your ${current.relation}.`);
      speak(`${randomFrom(COMPLIMENTS)} This is ${current.name}, your ${current.relation}.`);
    } else {
      setFeedback(`This is ${current.name}, your ${current.relation}.`);
      speak(`This is actually ${current.name}, your ${current.relation}. ${randomFrom(ENCOURAGEMENTS)}`);
    }
  }

  return (
    <div className="photo-memory">
      <div className="panel-header">
        <h2>Family Memory Gallery</h2>
        {!quizMode && <button className="btn-announce" onClick={startQuiz}>🧠 Start Recognition Quiz</button>}
      </div>
      {!quizMode && (
        <div className="family-grid">
          {familyMembers.map(p => (
            <div key={p.id} className="family-card">
              <div className="family-avatar">{p.emoji}</div>
              <h3>{p.name}</h3>
              <p>{p.relation}</p>
            </div>
          ))}
        </div>
      )}
      {quizMode && current && (
        <div className="quiz-box">
          <div className="quiz-avatar">{current.emoji}</div>
          <p className="quiz-question">Who is this?</p>
          <button className="mic-btn" onClick={askName}>🎤 Answer by Voice</button>
          {feedback && <p className="quiz-feedback">{feedback}</p>}
          <div className="quiz-actions">
            <button onClick={nextQuestion}>Next Person</button>
            <button onClick={() => setQuizMode(false)}>Exit Quiz</button>
          </div>
          <p className="quiz-score">Score: {score.correct}/{score.total}</p>
        </div>
      )}
    </div>
  );
}
