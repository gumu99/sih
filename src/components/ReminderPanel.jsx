import { useState } from 'react';
import { speak } from '../utils/speech';

const icons = { medication: '💊', appointment: '🏥', family: '📞', health: '🚶', custom: '📌' };

export default function ReminderPanel({ reminders, setReminders }) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');

  function addReminder(e) {
    e.preventDefault();
    if (!title || !time) return;
    setReminders([...reminders, { id: Date.now(), title, time, type: 'custom', done: false }]);
    speak(`Reminder set: ${title} at ${time}`);
    setTitle(''); setTime('');
  }

  function toggleDone(id) {
    setReminders(reminders.map(r => r.id === id ? { ...r, done: !r.done } : r));
  }

  function deleteReminder(id) {
    setReminders(reminders.filter(r => r.id !== id));
  }

  function announceAll() {
    const pending = reminders.filter(r => !r.done);
    if (pending.length === 0) { speak("You have no pending reminders. Well done."); return; }
    speak(`You have ${pending.length} pending reminders. ${pending.map(r => `${r.title} at ${r.time}`).join('. ')}`);
  }

  return (
    <div className="reminder-panel">
      <div className="panel-header">
        <h2>Daily Reminders</h2>
        <button className="btn-announce" onClick={announceAll}>🔊 Ask JARVIS to Announce</button>
      </div>
      <form className="reminder-form" onSubmit={addReminder}>
        <input placeholder="Reminder title" value={title} onChange={e => setTitle(e.target.value)} />
        <input type="time" value={time} onChange={e => setTime(e.target.value)} />
        <button type="submit">Add</button>
      </form>
      <div className="reminder-list">
        {[...reminders].sort((a, b) => a.time.localeCompare(b.time)).map(r => (
          <div key={r.id} className={`reminder-item ${r.done ? 'done' : ''}`}>
            <span className="reminder-icon">{icons[r.type] || '📌'}</span>
            <div className="reminder-info">
              <p className="reminder-title">{r.title}</p>
              <span className="reminder-time">{r.time}</span>
            </div>
            <div className="reminder-actions">
              <button onClick={() => toggleDone(r.id)}>{r.done ? 'Undo' : 'Done'}</button>
              <button onClick={() => deleteReminder(r.id)} className="btn-delete">✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
