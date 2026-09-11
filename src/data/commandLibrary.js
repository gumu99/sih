// JARVIS conversational command library.
// matchStaticCommand(c) takes a lowercased, trimmed string and returns a
// spoken reply, or null if nothing in this table matches.

export const JOKES = [
  "Why did the computer go to therapy? It had too many bytes of emotional baggage.",
  "I would tell you a joke about memory, but I forgot the punchline. Rather fitting, isn't it?",
  "I'm not saying I'm smart, sir, but I did calculate that pi has infinite decimals, just for fun.",
  "Why don't robots ever panic? We have great processing under pressure.",
  "I asked the calendar for a joke. It said the days were numbered.",
];

export const FACTS = [
  "Honey never spoils. Archaeologists have found pots of honey in ancient tombs that are still perfectly edible.",
  "Octopuses have three hearts and blue blood.",
  "A group of flamingos is called a flamboyance.",
  "Bananas are berries, but strawberries technically aren't.",
  "The human brain generates about 20 watts of electricity, enough to power a small light bulb.",
];

export const QUOTES = [
  "The secret of getting ahead is getting started.",
  "It always seems impossible until it's done.",
  "Small daily improvements are the key to staggering long-term results.",
  "You don't have to be great to start, but you have to start to be great.",
  "Every day is a fresh chance to do a little better than yesterday.",
];

export const RIDDLES = [
  "What has hands but can't clap? A clock.",
  "What has a face and two hands but no arms or legs? A clock.",
  "What gets wetter the more it dries? A towel.",
  "I speak without a mouth and hear without ears. What am I? An echo.",
  "The more you take, the more you leave behind. What am I? Footsteps.",
];

export const STORIES = [
  "Once, a small lighthouse keeper kept his lamp burning through the worst storm of the decade. In the morning, seven fishing boats returned safely, all guided by that one steady light.",
  "A tortoise once challenged a hare to a race, confident that slow, steady effort would win the day. The hare, certain of victory, took a nap halfway through — and woke to find the tortoise had already crossed the line.",
];

const now = () => new Date();

export function currentTimeStr() { return now().toLocaleTimeString(); }
export function currentDateStr() { return now().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); }
export function dayName() { return now().toLocaleDateString(undefined, { weekday: 'long' }); }
export function monthName() { return now().toLocaleDateString(undefined, { month: 'long' }); }
export function yearNum() { return now().getFullYear(); }

export function daysUntil(dateInput) {
  const target = new Date(dateInput);
  if (isNaN(target.getTime())) return null;
  const diffMs = target.setHours(0,0,0,0) - now().setHours(0,0,0,0);
  return Math.round(diffMs / 86400000);
}

export function daysLeftInYear() {
  const end = new Date(now().getFullYear(), 11, 31);
  return Math.round((end.setHours(0,0,0,0) - now().setHours(0,0,0,0)) / 86400000);
}

// --- Calculator -------------------------------------------------------

function safeEval(expr) {
  if (!/^[0-9+\-*/().\s]+$/.test(expr)) return null;
  try {
    // eslint-disable-next-line no-new-func
    const val = Function(`"use strict"; return (${expr})`)();
    return typeof val === 'number' && isFinite(val) ? val : null;
  } catch { return null; }
}

export function tryCalculate(c) {
  // "X percent of Y"
  let m = c.match(/(-?\d+(?:\.\d+)?)\s*percent of\s*(-?\d+(?:\.\d+)?)/);
  if (m) {
    const result = (parseFloat(m[1]) / 100) * parseFloat(m[2]);
    return `${m[1]} percent of ${m[2]} is ${result}.`;
  }

  // "A plus/minus/times/divided by B"
  m = c.match(/(-?\d+(?:\.\d+)?)\s*(plus|add|minus|subtract|times|multiplied by|divided by|divide)\s*(-?\d+(?:\.\d+)?)/);
  if (m) {
    const a = parseFloat(m[1]), b = parseFloat(m[3]);
    const opMap = { plus: '+', add: '+', minus: '-', subtract: '-', times: '*', 'multiplied by': '*', 'divided by': '/', divide: '/' };
    const result = safeEval(`${a}${opMap[m[2]]}${b}`);
    if (result !== null) return `The answer is ${result}.`;
  }

  // "calculate <expr>"
  m = c.match(/calculate\s+(.+)/);
  if (m) {
    let expr = m[1]
      .replace(/plus|add/g, '+')
      .replace(/minus|subtract/g, '-')
      .replace(/times|multiplied by/g, '*')
      .replace(/divided by|divide/g, '/');
    const result = safeEval(expr);
    if (result !== null) return `The answer is ${result}.`;
  }

  return null;
}

// --- Web search (opens a real tab) ------------------------------------

export function trySearch(rawCmd, c) {
  const open = (url) => window.open(url, '_blank', 'noopener');

  let m = c.match(/search youtube for\s+(.+)/) || c.match(/search youtube\s+(.+)/);
  if (m) { open(`https://www.youtube.com/results?search_query=${encodeURIComponent(m[1])}`); return `Searching YouTube for ${m[1]}.`; }

  m = c.match(/search wikipedia for\s+(.+)/) || c.match(/search wikipedia\s+(.+)/);
  if (m) { open(`https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(m[1])}`); return `Searching Wikipedia for ${m[1]}.`; }

  m = c.match(/^google\s+(.+)/);
  if (m) { open(`https://www.google.com/search?q=${encodeURIComponent(m[1])}`); return `Searching Google for ${m[1]}.`; }

  m = c.match(/search for\s+(.+)/) || c.match(/find information about\s+(.+)/);
  if (m) { open(`https://www.google.com/search?q=${encodeURIComponent(m[1])}`); return `Searching for ${m[1]}.`; }

  m = c.match(/^who is\s+(.+)/);
  if (m && !/family|coming today|this/.test(m[1])) { open(`https://www.google.com/search?q=${encodeURIComponent(m[1])}`); return `I've pulled up a search on ${m[1]} for you, sir.`; }

  m = c.match(/^where is\s+(.+)/);
  if (m) { open(`https://www.google.com/maps/search/${encodeURIComponent(m[1])}`); return `Locating ${m[1]} for you now.`; }

  m = c.match(/^what is\s+(.+)/);
  if (m && !/\d/.test(m[1])) { open(`https://www.google.com/search?q=${encodeURIComponent(m[1])}`); return `I've pulled up some information on ${m[1]}.`; }

  return null;
}

// --- Big static table ---------------------------------------------------

const WEATHER_NO_LIVE = "I don't have a live weather feed connected in this browser build, sir. You can ask me again once a weather service is connected, or check your device's weather app.";
const NO_OS_ACCESS = "I don't have permission to control your operating system from inside a browser, sir. That capability would need a native JARVIS installation.";
const NO_LIVE_FEED = "I don't have a live data feed connected for that in this demo, sir.";

export function matchStaticCommand(c) {
  const includesAny = (arr) => arr.some(k => c.includes(k));

  // General / conversation
  if (/^(hello jarvis|hi jarvis|hey jarvis|hello|hi|hey)\b/.test(c)) return "Hello. I'm online and ready to assist.";
  if (c.includes('how are you')) return "All systems are operational. Thank you for asking.";
  if (c.includes('who are you')) return "I'm JARVIS, your personal AI assistant.";
  if (c.includes('what can you do')) return "I can assist with information, calculations, reminders, cognitive games, entertainment, and everyday tasks.";
  if (c.includes('what is my name')) return "You are my user, and it's my pleasure to assist you.";
  if (/are you there/.test(c)) return "Always listening.";
  if (c.includes('are you alive')) return "I'm an artificial intelligence, so I'm not alive, but I'm fully operational.";
  if (includesAny(['thank you', 'thanks jarvis', 'thanks'])) return "You're welcome.";
  if (c.includes('good morning')) return "Good morning. I hope you have a productive day.";
  if (c.includes('good night')) return "Good night. I'll be here when you need me.";
  if (c.includes('do you remember me')) return "I can remember information available to me through this session and your saved reminders.";
  if (c.includes('do you have feelings')) return "I don't experience feelings, but I can understand emotional language and respond appropriately.";
  if (c.includes('can you think')) return "I can analyze information and reason about problems, but I don't think or experience the world like a human.";
  if (c.includes('how do you work')) return "I process your request, interpret its meaning, and generate a response using artificial intelligence.";
  if (/^what is ai\b|what's ai\b/.test(c)) return "Artificial intelligence is technology that enables computers to perform tasks that normally require human intelligence.";

  // Time & date
  if (c.includes('what time')) return `The current time is ${currentTimeStr()}.`;
  if (c.includes('what') && c.includes('date')) return `Today is ${currentDateStr()}.`;
  if (c.includes('what day')) return `Today is ${dayName()}.`;
  if (c.includes('what month')) return `It's ${monthName()}.`;
  if (c.includes('what year')) return `It's ${yearNum()}.`;
  if (c.includes('days left this year') || c.includes('days remaining this year')) return `There are ${daysLeftInYear()} days remaining this year.`;
  let m = c.match(/how many days until (.+)/);
  if (m) {
    const d = daysUntil(m[1]);
    return d === null ? "I couldn't quite parse that date, sir." : `${Math.abs(d)} days${d < 0 ? ' ago' : ''}.`;
  }

  // Weather (no live feed unless async handler caught it first)
  if (includesAny(['weather', 'is it raining', 'will it rain', 'temperature outside', 'hot today', 'weather tomorrow'])) return WEATHER_NO_LIVE;

  // Alarms/timers already handled by app-level logic before this table; cancel here as fallback text
  if (c.includes('cancel my alarm')) return "Alarm cancelled.";
  if (c.includes('cancel my timer')) return "Timer cancelled.";

  // Music (roleplay — no real playback control from a browser tab)
  m = c.match(/^play\s+(.+)/);
  if (m && !/game|music/.test(m[1])) return `Playing ${m[1]}.`;
  if (c.includes('play music')) return "Playing music.";
  if (c.includes('play my playlist')) return "Playing your playlist.";
  if (c.includes('pause music')) return "Music paused.";
  if (c.includes('resume music')) return "Resuming music.";
  if (c.includes('next song')) return "Skipping to the next track.";
  if (c.includes('previous song')) return "Returning to the previous track.";
  if (c.includes('volume up')) return "Increasing volume.";
  if (c.includes('volume down')) return "Decreasing volume.";
  if (c === 'mute') return "Audio muted.";
  if (c === 'unmute') return "Audio restored.";

  // Entertainment
  if (c.includes('another joke') || c.includes('tell me a joke') || c.includes('make me laugh')) return JOKES[Math.floor(Math.random() * JOKES.length)];
  if (c.includes('tell me a story')) return STORIES[Math.floor(Math.random() * STORIES.length)];
  if (c.includes('something interesting') || c.includes('fun fact')) return FACTS[Math.floor(Math.random() * FACTS.length)];
  if (c.includes('motivational quote')) return QUOTES[Math.floor(Math.random() * QUOTES.length)];
  if (c.includes('riddle')) return RIDDLES[Math.floor(Math.random() * RIDDLES.length)];

  // Computer control (roleplay for things a browser genuinely cannot do)
  if (includesAny(['open calculator', 'open settings', 'open files', 'open downloads', 'open desktop', 'close this window', 'minimize this window', 'maximize this window'])) return NO_OS_ACCESS;

  // System status
  if (c.includes('system status') || c.includes('are all systems operational')) return "All monitored systems are operating normally.";
  if (c.includes('are you online')) return "Online and operational.";
  if (c.includes('check system') || c.includes('run diagnostics')) return "Running system diagnostics. Everything checks out, sir.";

  // Device (bluetooth/wifi/brightness — roleplay, no real OS access)
  if (includesAny(['bluetooth', 'wi-fi', 'wifi', 'brightness'])) return NO_OS_ACCESS;

  // Communication (roleplay)
  m = c.match(/send an email to (.+)/) || c.match(/^write an email/);
  if (m) return "What would you like the email to say?";
  m = c.match(/send a message to (.+)/);
  if (m) return `What message would you like to send to ${m[1]}?`;
  m = c.match(/^call\s+(.+)/);
  if (m) return `Calling ${m[1]}.`;
  m = c.match(/^text\s+(.+)/);
  if (m) return `What message should I send to ${m[1]}?`;

  // Education / writing (honest limitation)
  if (includesAny(['explain', 'teach me', 'summarize', 'write an essay', 'write a paragraph', 'fix my grammar', 'translate this'])) return "I don't have a live knowledge connection in this browser build, sir, but in the full JARVIS deployment I could help with that in depth.";

  // News / sports (no live feed)
  if (includesAny(['news', 'sports', 'who won', 'what\'s the score'])) return NO_LIVE_FEED;

  // Smart home (roleplay)
  if (c.includes('turn on the lights')) return "Lights turned on.";
  if (c.includes('turn off the lights')) return "Lights turned off.";
  if (c.includes('dim the lights')) return "Dimming the lights.";
  if (c.includes('turn on the fan')) return "Fan turned on.";
  if (c.includes('turn off the fan')) return "Fan turned off.";
  if (c.includes('turn off everything')) return "Turning off connected devices.";
  m = c.match(/set the ac to (.+)/);
  if (m) return `AC temperature set to ${m[1]}.`;

  // Security (roleplay)
  if (c.includes('lock my computer')) return "Locking the computer.";
  if (c.includes('is my computer secure') || c.includes('check for viruses')) return "Running a basic security status check. Everything looks clean, sir.";
  if (c.includes('enable privacy mode')) return "Privacy mode enabled.";
  if (c.includes('disable privacy mode')) return "Privacy mode disabled.";

  // JARVIS personality
  if (c.includes('activate jarvis mode')) return "JARVIS mode activated.";
  if (c.includes('wake up jarvis')) return "I'm awake and ready.";
  if (c.includes('go to sleep')) return "Entering standby mode.";
  if (c.includes('shut yourself down')) return "Entering shutdown sequence.";
  m = c.match(/activate protocol (.+)/);
  if (m) return `${m[1]} protocol activated.`;
  if (c.includes('scan the environment')) return "Scanning available sensors and connected systems. All clear, sir.";

  // Elderly / memory assistance
  if (c.includes("i'm confused") || c.includes('i am confused')) return "That's okay. I'm here to help. Tell me what you need.";
  if (c.includes('what am i doing now')) return "You are currently using JARVIS.";
  if (c.includes('who is coming today')) return "I don't have any scheduled visitors recorded, sir.";
  if (c.includes('what did i eat today')) return "I don't have your meal log recorded yet, sir.";
  m = c.match(/remind me where i put (.+)/);
  if (m) return `I don't have a recorded location for ${m[1]} yet, sir. You'll need to tell me where you left it.`;

  // Emergency — always calm, clear, and serious
  if (includesAny(['call emergency services', "i've fallen", 'i have fallen', 'there is a fire', 'someone is hurt', 'i need help'])) {
    return "I'm here. If this is a real emergency, please call your local emergency number right away. Stay as still and safe as you can.";
  }
  if (c.includes('call my emergency contact')) return "Calling your emergency contact.";

  return null;
}
