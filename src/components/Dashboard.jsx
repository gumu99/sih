export default function Dashboard({ onNavigate, reminders }) {
  const pending = reminders.filter(r => !r.done).length;
  return (
    <div className="dashboard">
      <div className="welcome-banner">
        <h2>Welcome Back</h2>
        <p>Your cognitive wellness companion is ready to assist you today.</p>
      </div>
      <div className="stat-cards">
        <div className="stat-card" onClick={() => onNavigate('reminders')}>
          <span className="stat-icon">⏰</span>
          <h3>{pending}</h3>
          <p>Pending Reminders</p>
        </div>
        <div className="stat-card" onClick={() => onNavigate('games')}>
          <span className="stat-icon">🧩</span>
          <h3>2</h3>
          <p>Training Modules</p>
        </div>
        <div className="stat-card" onClick={() => onNavigate('memories')}>
          <span className="stat-icon">👨‍👩‍👧‍👦</span>
          <h3>6</h3>
          <p>Family Memories</p>
        </div>
      </div>
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button onClick={() => onNavigate('games')}>Start Brain Training</button>
          <button onClick={() => onNavigate('memories')}>View Family Photos</button>
          <button onClick={() => onNavigate('reminders')}>Check Reminders</button>
        </div>
      </div>
    </div>
  );
}
