import { useState, useEffect, useRef } from 'react';
import { speak, createRecognizer } from '../utils/speech';
import { getGreeting } from '../data/messages';
import { matchStaticCommand, tryCalculate, trySearch } from '../data/commandLibrary';
import { getWeatherReport, getLocationReport, getBatteryReport, getStorageReport, getBitcoinPrice, getUsdInrRate, getSystemInfoReport } from '../utils/liveData';
import './Jarvis.css';

export default function Jarvis({ onNavigate, reminders, setReminders, justActivated }) {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [message, setMessage] = useState("Systems online.");
  const [textInput, setTextInput] = useState('');
  const pendingGameRef = useRef(null); // { type: 'guess'|'rps', secret? }

  useEffect(() => {
    if (!justActivated) return;
    const t = setTimeout(() => handleSay(getGreeting()), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justActivated]);

  function handleSay(text) {
    setMessage(text);
    setSpeaking(true);
    speak(text, { onEnd: () => setSpeaking(false) });
  }

  function handleSayAsync(promise, loadingText) {
    if (loadingText) handleSay(loadingText);
    promise
      .then((text) => handleSay(text))
      .catch(() => handleSay("I wasn't able to fetch that just now, sir. It may need permission or a live connection."));
  }

  function tryPendingGame(c) {
    const game = pendingGameRef.current;
    if (!game) return false;

    if (game.type === 'rps') {
      const choices = ['rock', 'paper', 'scissors'];
      const userChoice = choices.find(ch => c.includes(ch));
      if (!userChoice) return false;
      const jarvisChoice = choices[Math.floor(Math.random() * 3)];
      pendingGameRef.current = null;
      let result;
      if (userChoice === jarvisChoice) result = "It's a tie.";
      else if (
        (userChoice === 'rock' && jarvisChoice === 'scissors') ||
        (userChoice === 'paper' && jarvisChoice === 'rock') ||
        (userChoice === 'scissors' && jarvisChoice === 'paper')
      ) result = `You win! I chose ${jarvisChoice}.`;
      else result = `I win this round. I chose ${jarvisChoice}.`;
      handleSay(result);
      return true;
    }

    if (game.type === 'guess') {
      const num = parseInt(c.match(/-?\d+/)?.[0], 10);
      if (isNaN(num)) return false;
      game.tries += 1;
      if (num === game.secret) {
        pendingGameRef.current = null;
        handleSay(`Correct! The number was ${game.secret}. You got it in ${game.tries} tries.`);
      } else if (num < game.secret) {
        handleSay("Higher.");
      } else {
        handleSay("Lower.");
      }
      return true;
    }

    return false;
  }

  function tryStartMiniGame(c) {
    if (c.includes('rock paper scissors')) {
      pendingGameRef.current = { type: 'rps' };
      // check if the choice was included in the same command
      if (tryPendingGame(c)) return true;
      handleSay("Rock, paper, scissors. Make your choice.");
      return true;
    }
    if (c.includes('number guessing')) {
      const secret = 1 + Math.floor(Math.random() * 50);
      pendingGameRef.current = { type: 'guess', secret, tries: 0 };
      handleSay("I've selected a number between 1 and 50. Try to guess it.");
      return true;
    }
    return false;
  }

  function tryHandleReminders(c) {
    if (!setReminders) return null;

    let m = c.match(/remind me to (.+?) at (\d{1,2}:\d{2}|\d{1,2}\s?(am|pm))/i);
    if (m) {
      setReminders(prev => [...prev, { id: Date.now(), title: m[1], time: m[2], type: 'custom', done: false }]);
      onNavigate('reminders');
      return `Reminder set: ${m[1]} at ${m[2]}.`;
    }

    m = c.match(/set an alarm for (\d{1,2}:\d{2}|\d{1,2}\s?(am|pm))/i) || c.match(/wake me up at (\d{1,2}:\d{2}|\d{1,2}\s?(am|pm))/i);
    if (m) {
      setReminders(prev => [...prev, { id: Date.now(), title: 'Alarm', time: m[1], type: 'custom', done: false }]);
      onNavigate('reminders');
      return `Alarm set for ${m[1]}.`;
    }

    m = c.match(/add (.+) to my to-?do list/);
    if (m) {
      setReminders(prev => [...prev, { id: Date.now(), title: m[1], time: '--:--', type: 'custom', done: false }]);
      onNavigate('reminders');
      return `${m[1]} added to your to-do list.`;
    }

    m = c.match(/mark (.+) (complete|done)/);
    if (m) {
      setReminders(prev => prev.map(r => r.title.toLowerCase().includes(m[1]) ? { ...r, done: true } : r));
      return `${m[1]} marked complete.`;
    }

    m = c.match(/remove (.+)/);
    if (m) {
      const found = reminders.some(r => r.title.toLowerCase().includes(m[1]));
      if (found) {
        setReminders(prev => prev.filter(r => !r.title.toLowerCase().includes(m[1])));
        return `${m[1]} removed.`;
      }
    }

    if (c.includes('what do i have to do today') || c.includes('show my tasks')) {
      const pending = reminders.filter(r => !r.done);
      if (pending.length === 0) return "You have no pending tasks today, sir.";
      return `Here are your tasks for today: ${pending.map(r => r.title).join(', ')}.`;
    }

    if (c.includes('what is my next appointment') || c.includes("what's my next appointment")) {
      const next = reminders.filter(r => !r.done && r.type === 'appointment')[0] || reminders.filter(r => !r.done)[0];
      return next ? `Your next appointment is ${next.title} at ${next.time}.` : "You have no upcoming appointments recorded, sir.";
    }

    if (c.includes('what medicine') || c.includes('remind me about my medicine')) {
      const med = reminders.filter(r => !r.done && r.type === 'medication')[0];
      return med ? `Your medication reminder is set for ${med.time}: ${med.title}.` : "I don't have a medication reminder set right now, sir.";
    }

    return null;
  }

  function processCommand(rawCmd) {
    const c = rawCmd.toLowerCase().trim();

    // 1. Emergency phrasing is checked inside the static table with top priority already,
    //    but we check pending mini-games first so an in-progress guess isn't hijacked.
    if (tryPendingGame(c)) return;

    // 2. Live/async browser-backed data
    if (c.includes('weather') && !c.includes('tomorrow')) { handleSayAsync(getWeatherReport(), "Checking the weather now."); return; }
    if (c.includes('battery')) { handleSayAsync(getBatteryReport(), "Checking battery status."); return; }
    if (c.includes('where am i') || c.includes('my location')) { handleSayAsync(getLocationReport(), "Locating you now."); return; }
    if (c.includes('how much storage')) { handleSayAsync(getStorageReport(), "Checking storage."); return; }
    if (c.includes('ram') || c.includes('cpu usage') || c.includes('what operating system') || c.includes('what computer am i using')) { handleSayAsync(Promise.resolve(getSystemInfoReport())); return; }
    if (c.includes('bitcoin') || c.includes('price of bitcoin')) { handleSayAsync(getBitcoinPrice(), "Checking the current price."); return; }
    if (c.includes('dollar rate') || c.includes('to rupees') || c.includes('usd/inr') || c.includes('usd to inr')) { handleSayAsync(getUsdInrRate(), "Checking the exchange rate."); return; }

    // 3. Navigation shortcuts (games / reminders / memories / dashboard)
    if (c.includes('game') || c.includes('play a game') || c.includes('brain game') || c.includes('test my memory')) {
      if (tryStartMiniGame(c)) return;
      onNavigate('games'); handleSay("Launching cognitive training modules now."); return;
    }
    if (c.includes('reminder') || c.includes('medication') || c.includes('schedule')) {
      const reminderReply = tryHandleReminders(c);
      if (reminderReply) { handleSay(reminderReply); return; }
      onNavigate('reminders'); handleSay(`You have ${reminders.filter(r => !r.done).length} pending reminders today.`); return;
    }
    if (c.includes('family') || c.includes('photo') || c.includes('show me my family')) {
      onNavigate('memories'); handleSay("Displaying your family memory gallery."); return;
    }
    if (c.includes('dashboard') || c.includes('home')) { onNavigate('dashboard'); handleSay("Returning to the main dashboard."); return; }

    // 4. Task/reminder queries that don't require navigation keywords
    const reminderReply = tryHandleReminders(c);
    if (reminderReply) { handleSay(reminderReply); return; }

    // 5. Mini games not caught above
    if (tryStartMiniGame(c)) return;

    // 6. Web search (opens a real tab)
    const searchReply = trySearch(rawCmd, c);
    if (searchReply) { handleSay(searchReply); return; }

    // 7. Calculator
    const calcReply = tryCalculate(c);
    if (calcReply) { handleSay(calcReply); return; }

    // 8. Big static conversation table
    const staticReply = matchStaticCommand(c);
    if (staticReply) { handleSay(staticReply); return; }

    // 9. Fallback
    handleSay("I'm still learning that one, sir. Try: 'play a game', 'show reminders', 'tell me a joke', or ask me the time.");
  }

  function startListening() {
    const recognizer = createRecognizer((transcript) => {
      setMessage(`"${transcript}"`);
      processCommand(transcript);
    }, () => setListening(false));
    if (!recognizer) { handleSay("Voice recognition isn't supported here. Please use Chrome or Edge."); return; }
    setListening(true);
    recognizer.start();
  }

  function handleTextSubmit(e) {
    e.preventDefault();
    if (!textInput.trim()) return;
    processCommand(textInput);
    setTextInput('');
  }

  return (
    <div className="jarvis-panel">
      <div className={`jarvis-orb ${speaking ? 'speaking' : ''} ${listening ? 'listening' : ''}`}>
        <div className="orb-core"></div>
        <div className="orb-ring ring1"></div>
        <div className="orb-ring ring2"></div>
        <div className="orb-ring ring3"></div>
      </div>
      <div className="jarvis-text">
        <span className="jarvis-label">J.A.R.V.I.S.</span>
        <p className="jarvis-message">{message}</p>
      </div>
      <div className="jarvis-controls">
        <button className={`mic-btn ${listening ? 'active' : ''}`} onClick={startListening}>
          {listening ? '🎙️ Listening...' : '🎤 Speak to JARVIS'}
        </button>
        <form onSubmit={handleTextSubmit} className="jarvis-form">
          <input value={textInput} onChange={e => setTextInput(e.target.value)} placeholder="Or type a command..." />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}
