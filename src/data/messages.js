export const GREETINGS = {
  morning: "Good morning, sir. JARVIS online and at your service. How may I assist you today?",
  afternoon: "Good afternoon, sir. JARVIS online and at your service. How may I assist you today?",
  evening: "Good evening, sir. JARVIS online and at your service. How may I assist you today?",
};

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return GREETINGS.morning;
  if (hour < 18) return GREETINGS.afternoon;
  return GREETINGS.evening;
}

export const COMPLIMENTS = [
  "Excellent work, sir. Your memory is razor sharp today.",
  "Impressive. You're doing wonderfully.",
  "Well done. That was a great move.",
  "Beautifully done. You should be proud of that one.",
  "Outstanding, sir. Keep that momentum going.",
];

export const ENCOURAGEMENTS = [
  "Not quite, sir, but that's perfectly alright. Every attempt sharpens the mind a little more. Take a breath and try the next one — I have full confidence in you.",
  "That one didn't land, but don't worry about it at all. Progress isn't about being perfect, it's about showing up. Let's keep going together.",
  "A small miss, nothing more. Your effort is what matters most here, and I can see you're trying hard. I believe you'll get the next one.",
  "Close, but not this time. That's completely fine — mistakes are simply part of learning. Stay relaxed, sir, and give it another go.",
  "No trouble at all. Even the sharpest minds miss one now and then. Take your time, and I'll be right here cheering you on.",
];

export function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
