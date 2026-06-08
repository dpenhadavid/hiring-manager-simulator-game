/**
 * The Hiring Manager Simulator - Core Game Logic
 * Antigravity Pair-Programming Project
 */

// ==========================================================================
// 1. Web Audio API Sound Synthesizer
// ==========================================================================
class SoundSynth {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playTone(freq, type, duration, volume = 0.1, delay = 0) {
    if (this.muted) return;
    this.init();
    
    setTimeout(() => {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        console.warn("Audio Context blocked or error: ", e);
      }
    }, delay * 1000);
  }

  // Sound: Typing clack
  playClack() {
    // Noise burst + quick pitch drop
    this.playTone(800 + Math.random() * 200, 'sine', 0.05, 0.08);
  }

  // Sound: Telephone ring (New Req Alert)
  playRing() {
    this.playTone(880, 'sine', 0.1, 0.07);
    this.playTone(980, 'sine', 0.1, 0.07, 0.08);
    this.playTone(880, 'sine', 0.1, 0.07, 0.2);
    this.playTone(980, 'sine', 0.1, 0.07, 0.28);
  }

  // Sound: Error buzz
  playError() {
    this.playTone(150, 'sawtooth', 0.3, 0.12);
    this.playTone(120, 'sawtooth', 0.3, 0.12, 0.08);
  }

  // Sound: Success / Close Hire chime
  playSuccess() {
    const scale = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    scale.forEach((freq, idx) => {
      this.playTone(freq, 'triangle', 0.25, 0.08, idx * 0.1);
    });
  }

  // Sound: Chaos Event warning
  playTension() {
    this.playTone(330, 'sawtooth', 0.25, 0.1);
    this.playTone(311.13, 'sawtooth', 0.25, 0.1, 0.2);
    this.playTone(293.66, 'sawtooth', 0.35, 0.1, 0.4);
  }

  // Sound: Game Over tune
  playGameOver() {
    const notes = [293.66, 261.63, 220.00, 146.83]; // D4, C4, A3, D3
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'sawtooth', 0.4, 0.1, idx * 0.25);
    });
  }

  // Sound: Victory fanfare
  playVictory() {
    const fanfare = [
      { f: 523.25, d: 0.15 }, { f: 523.25, d: 0.15 }, { f: 523.25, d: 0.15 }, 
      { f: 523.25, d: 0.4 },  { f: 659.25, d: 0.4 },  { f: 783.99, d: 0.4 },
      { f: 1046.50, d: 0.8 }
    ];
    let timeAcc = 0;
    fanfare.forEach((n) => {
      this.playTone(n.f, 'triangle', n.d, 0.1, timeAcc);
      timeAcc += n.d * 0.8;
    });
  }
}

const synth = new SoundSynth();

// ==========================================================================
// 2. Character & Mood Definitions (Avatar Config)
// ==========================================================================
const CHARACTER_MOODS = {
  NORMAL: {
    label: "😐 Normal",
    eyebrows: { l: "M 75,135 Q 85,133 93,138", r: "M 125,135 Q 115,133 107,138" },
    mouth: "M 85,175 Q 100,185 115,175",
    blush: 0,
    stress: 0
  },
  HAPPY: {
    label: "😊 Excited",
    eyebrows: { l: "M 75,130 Q 85,125 93,132", r: "M 125,130 Q 115,125 107,132" },
    mouth: "M 85,170 Q 100,195 115,170",
    blush: 0.2,
    stress: 0
  },
  ANGRY: {
    label: "😡 Raging",
    eyebrows: { l: "M 75,138 Q 85,141 93,144", r: "M 125,138 Q 115,141 107,144" },
    mouth: "M 85,180 L 115,180",
    blush: 0.7,
    stress: 1
  },
  SAD: {
    label: "😢 Crying",
    eyebrows: { l: "M 75,130 Q 85,138 93,134", r: "M 125,130 Q 115,138 107,134" },
    mouth: "M 85,185 Q 100,170 115,185",
    blush: 0.3,
    stress: 0
  },
  STRESSED: {
    label: "🤯 Overloaded",
    eyebrows: { l: "M 75,136 L 93,136", r: "M 125,136 L 107,136" },
    mouth: "M 90,175 Q 100,195 110,175",
    blush: 0,
    stress: 2
  }
};

const CHARACTERS = {
  // Hiring Managers
  VIKRAM: {
    name: "Vikram (Director of Engineering)",
    role: "Hiring Manager",
    skin: ["#fed7aa", "#fdba74"],
    hairColor: "#334155",
    hairD: "M 60,120 Q 100,60 140,120 Q 148,85 130,80 Q 100,75 70,80 Q 52,85 60,120 Z",
    suitColor: "url(#suit-grad-navy)",
    tieColor: "#ef4444"
  },
  BRENDA: {
    name: "Brenda (VP of Product Strategy)",
    role: "Hiring Manager",
    skin: ["#ffedd5", "#fed7aa"],
    hairColor: "#d97706",
    hairD: "M 55,130 Q 100,45 145,130 Q 155,100 135,95 Q 100,90 65,95 Q 45,100 55,130 Z",
    suitColor: "url(#suit-grad-grey)",
    tieColor: "#06b6d4"
  },
  CHAD: {
    name: "Chad (Sales Operations Lead)",
    role: "Hiring Manager",
    skin: ["#fed7aa", "#fdba74"],
    hairColor: "#eab308",
    hairD: "M 62,110 Q 100,65 138,110 Q 142,90 125,85 Q 100,80 75,85 Q 58,90 62,110 Z",
    suitColor: "url(#suit-grad-navy)",
    tieColor: "#fbbf24"
  },
  // Candidates
  PRIYA: {
    name: "Priya (Senior Backend Engineer)",
    role: "Candidate",
    skin: ["#fdba74", "#f97316"],
    hairColor: "#0f172a",
    hairD: "M 55,140 Q 100,50 145,140 Q 155,90 135,85 Q 100,80 65,85 Q 45,90 55,140 Z",
    suitColor: "url(#suit-grad-grey)",
    tieColor: "#10b981"
  },
  EUGENE: {
    name: "Eugene (Crypto & Distributed Systems Dev)",
    role: "Candidate",
    skin: ["#ffedd5", "#fed7aa"],
    hairColor: "#475569",
    hairD: "M 60,125 Q 100,55 140,125 Q 145,95 125,90 Q 100,85 75,90 Q 55,95 60,125 Z",
    suitColor: "url(#suit-grad-navy)",
    tieColor: "#8b5cf6"
  },
  SARAH: {
    name: "Sarah (Lead Devops Architect)",
    role: "Candidate",
    skin: ["#fcd34d", "#f59e0b"],
    hairColor: "#172554",
    hairD: "M 55,135 Q 100,55 145,135 Q 155,95 135,90 Q 100,85 65,90 Q 45,95 55,135 Z",
    suitColor: "url(#suit-grad-grey)",
    tieColor: "#f43f5e"
  }
};

// ==========================================================================
// 3. Game State
// ==========================================================================
let state = {
  day: 1,
  hiresClosed: 0,
  difficulty: 'junior',
  metrics: {
    happiness: 80, // Hiring Manager Happiness
    candidate: 80, // Candidate Experience
    sanity: 100,   // Recruiter Sanity
    time: 90       // Time Remaining (Deadlines)
  },
  activeRole: null,
  activeCharacter: null,
  roleProgress: 0,  // Stages passed for current role (0 to 3)
  history: [],
  realityCheckTriggered: false
};

// ==========================================================================
// 4. Role Templates
// ==========================================================================
const ROLE_TEMPLATES = [
  {
    title: "Principal AI Architect",
    exp: "15+ Years AI/ML",
    loc: "Bangalore (In-Office)",
    stack: "LLMs, Distributed Systems, PyTorch",
    budget: "₹35L Max",
    character: CHARACTERS.VIKRAM
  },
  {
    title: "Senior Kubernetes Janitor",
    exp: "8+ Years Cloud Infra",
    loc: "Remote (Hybrid)",
    stack: "Kubernetes, Go, AWS, Helm",
    budget: "₹25L Max",
    character: CHARACTERS.BRENDA
  },
  {
    title: "VP of Synergy & Innovation",
    exp: "12+ Years SaaS Strategy",
    loc: "Mumbai (In-Office)",
    stack: "AI Integration, Pitch Decks, Jargon",
    budget: "₹50L Max",
    character: CHARACTERS.CHAD
  },
  {
    title: "Developer Evangelist",
    exp: "5+ Years Dev Advocacy",
    loc: "Delhi (Hybrid)",
    stack: "React, TikTok API, Public Speaking",
    budget: "₹18L Max",
    character: CHARACTERS.CHAD
  },
  {
    title: "Full-Stack Rockstar",
    exp: "10+ Years Web Dev",
    loc: "Bangalore (In-Office)",
    stack: "Angular, Java, COBOL, Guitar solos",
    budget: "₹15L Max (Peanuts)",
    character: CHARACTERS.VIKRAM
  },
  {
    title: "Database Wizard & Necromancer",
    exp: "20+ Years SQL Server",
    loc: "Remote",
    stack: "SQL Optimizations, Legacy Migration",
    budget: "₹30L Max",
    character: CHARACTERS.BRENDA
  }
];

// ==========================================================================
// 5. Scenarios & Events Database
// ==========================================================================

// Sourcing Stage Scenarios (Role introduction)
const SOURCING_SCENARIOS = [
  {
    id: "src_kubernetes_20",
    title: "Unreasonable Tech Age Requirements",
    description: "The manager demands a Senior Architect with 20 years of experience in Kubernetes. Kubernetes was released in 2014.",
    speaker: "Hiring Manager",
    mood: "NORMAL",
    choices: [
      {
        text: "Start searching immediately. Time to find a time traveler.",
        metrics: { happiness: 15, candidate: 0, sanity: -15, time: -15 },
        feedback: "The manager is happy you 'can-do'. You, however, start looking for doctors who can manipulate physics."
      },
      {
        text: "Gently explain that Kubernetes is only 12 years old.",
        metrics: { happiness: -15, candidate: 5, sanity: 10, time: -5 },
        feedback: "The manager sighs, 'I need someone who was thinking about it before it was released.' You negotiate the requirement to 10 years."
      },
      {
        text: "Suggest Docker/Containers flexibility instead.",
        metrics: { happiness: -5, candidate: 10, sanity: 5, time: 5 },
        feedback: "A compromise! You agree to look for general containerization skills. Recruitment speed improves."
      },
      {
        text: "Cry quietly into your keyboard.",
        metrics: { happiness: -10, candidate: -5, sanity: 15, time: -10 },
        feedback: "You spend the afternoon sobbing. Surprisingly, it buys you time as the manager feels awkward and goes to lunch."
      }
    ]
  },
  {
    id: "src_urgent_friday",
    title: "The Imminent Friday Deadline",
    description: "'We need this Principal AI Engineer position filled by Friday afternoon. No exceptions.' It is currently Tuesday.",
    speaker: "Hiring Manager",
    mood: "ANGRY",
    choices: [
      {
        text: "Accept the challenge and work 16-hour days.",
        metrics: { happiness: 25, candidate: -10, sanity: -25, time: -20 },
        feedback: "You source half-asleep candidates at 2 AM. HM is thrilled with the pipeline, but your eyes won't stop twitching."
      },
      {
        text: "Explain that quality hires require at least 4-6 weeks.",
        metrics: { happiness: -20, candidate: 10, sanity: 15, time: 5 },
        feedback: "The manager calls you 'unaligned with corporate velocity.' But your boundaries remain intact."
      },
      {
        text: "Ask for 5 additional interviewers to speed up evaluations.",
        metrics: { happiness: -10, candidate: 5, sanity: 5, time: 10 },
        feedback: "The manager complains about team productivity dropping, but agrees to recruit some colleagues to interview."
      },
      {
        text: "Pretend your Teams connection disconnected.",
        metrics: { happiness: -5, candidate: -5, sanity: 20, time: -15 },
        feedback: "You pull the ethernet cord. The silent break saves your sanity, but you've lost an entire day of sourcing."
      }
    ]
  }
];

// Interview & Candidate Stage Scenarios
const CANDIDATE_SCENARIOS = [
  {
    id: "cand_comp_range",
    title: "Candidate Demands Salary Transparency",
    description: "Your best candidate asks: 'What is the compensation range for this position?' The budget is extremely tight.",
    speaker: "Candidate",
    mood: "NORMAL",
    choices: [
      {
        text: "Be honest. Tell them the exact maximum budget of ₹35L.",
        metrics: { happiness: -10, candidate: 20, sanity: 5, time: 5 },
        feedback: "The candidate appreciates the honesty. However, the manager is furious that you didn't leave room to negotiate."
      },
      {
        text: "Say compensation is 'highly competitive, based on experience'.",
        metrics: { happiness: 10, candidate: -20, sanity: 5, time: -10 },
        feedback: "The candidate sighs. They schedule another call but their trust in the process drops. Standard industry behavior."
      },
      {
        text: "Schedule an introductory call with the Team Lead first.",
        metrics: { happiness: -10, candidate: -5, sanity: -5, time: 15 },
        feedback: "You kick the can down the road. The tech lead handles the pressure, saving your time, but candidate is slightly annoyed."
      },
      {
        text: "Send a friendly smile emoji and ignore the question.",
        metrics: { happiness: 5, candidate: -25, sanity: 15, time: -5 },
        feedback: "You send '😊'. The candidate leaves you on read for 48 hours. Red flags are raised."
      }
    ]
  },
  {
    id: "cand_coding_test",
    title: "The 10-Hour Take-Home Coding Test",
    description: "The team wants the candidate to build an entire microservice architecture over the weekend for their initial technical round.",
    speaker: "Hiring Manager",
    mood: "NORMAL",
    choices: [
      {
        text: "Enforce it. Send the Github template to the candidate.",
        metrics: { happiness: 15, candidate: -30, sanity: 10, time: -10 },
        feedback: "Candidate replies: 'No thanks, I have a life.' and drops out of the process. Manager thinks they lacked 'hustle'."
      },
      {
        text: "Push back. Propose a 1-hour live coding session instead.",
        metrics: { happiness: -15, candidate: 25, sanity: 5, time: 10 },
        feedback: "Candidate is delighted. The manager complains that 'anyone can fake it for an hour,' but relents."
      },
      {
        text: "Offer to review the candidate's existing public portfolio.",
        metrics: { happiness: -10, candidate: 20, sanity: 10, time: 15 },
        feedback: "Speeds up the timeline immensely. Candidate is impressed with your flexibility."
      },
      {
        text: "Do the coding test yourself to keep them in the loop.",
        metrics: { happiness: 20, candidate: 30, sanity: -40, time: -20 },
        feedback: "You learn Python overnight and submit the test under their name. They pass! Your sanity is in ruins."
      }
    ]
  }
];

// Feedback Stage Scenarios
const FEEDBACK_SCENARIOS = [
  {
    id: "feed_more_profiles",
    title: "The Profile Hoarder",
    description: "After 4 rounds of interviews, the manager says: 'The candidate is perfect! But let's look at 5 more profiles just to compare.'",
    speaker: "Hiring Manager",
    mood: "HAPPY",
    choices: [
      {
        text: "Push back hard. Warn them they will lose this candidate.",
        metrics: { happiness: -20, candidate: 15, sanity: 15, time: 5 },
        feedback: "Manager is grumpy but agrees to make an offer. You saved the deal."
      },
      {
        text: "Continue the search and source 5 more profiles.",
        metrics: { happiness: 20, candidate: -15, sanity: -25, time: -25 },
        feedback: "The first candidate gets tired of waiting and signs with a competitor. You start from scratch."
      },
      {
        text: "Escalate to the VP of Engineering.",
        metrics: { happiness: -15, candidate: 5, sanity: -10, time: 15 },
        feedback: "The VP overrides the manager, instructing them to close. You created some office friction but saved the timeline."
      },
      {
        text: "Scream internally and nod politely.",
        metrics: { happiness: 15, candidate: -10, sanity: -15, time: -15 },
        feedback: "Your stomach lining dissolves. You source profiles while sending apologize-for-delay emails to the candidate."
      }
    ]
  }
];

// Offer & Final Stage Scenarios
const OFFER_SCENARIOS = [
  {
    id: "off_google_match",
    title: "Counter-Offer Panic",
    description: "The selected candidate just received a counter-offer from Google for 40% more than our maximum budget.",
    speaker: "Candidate",
    mood: "HAPPY",
    choices: [
      {
        text: "Match the compensation by requesting a budget expansion.",
        metrics: { happiness: -15, candidate: 25, sanity: -10, time: 10 },
        feedback: "CFO yells at you for 30 minutes, but grants the exception. Candidate verbally accepts!"
      },
      {
        text: "Sell the 'exceptional company culture and work-life balance'.",
        metrics: { happiness: 5, candidate: -20, sanity: 10, time: -15 },
        feedback: "The candidate laughs. 'Culture doesn't pay my rent.' They reject the offer."
      },
      {
        text: "Engage the CEO for a personal passion outreach call.",
        metrics: { happiness: 15, candidate: 20, sanity: 5, time: -5 },
        feedback: "The CEO calls the candidate. They feel highly valued and accept the offer for a slightly lower bump."
      },
      {
        text: "Panic, delete their profile, and pretend they ghosted.",
        metrics: { happiness: -20, candidate: -10, sanity: 20, time: -20 },
        feedback: "You cover your tracks. The manager is disappointed, and you've wasted weeks of progress."
      }
    ]
  }
];

// Random Chaos Events (Triggered on day ticks)
const CHAOS_EVENTS = [
  {
    title: "🚨 Hiring Freeze Declared!",
    description: "Global finance announces an immediate hiring freeze. All active roles are paused for 3 days.",
    choices: [
      {
        text: "Write polite 'keep warm' emails to candidates.",
        metrics: { happiness: -10, candidate: -10, sanity: 15, time: -10 },
        feedback: "You spend days crafting messages. Candidates smell the corporate trouble."
      },
      {
        text: "Use this time to clean up the ATS and sleep.",
        metrics: { happiness: -15, candidate: -15, sanity: 25, time: -15 },
        feedback: "The break restores your mental health, but managers blame you for lost momentum."
      }
    ]
  },
  {
    title: "🚨 Sudden Org Restructuring!",
    description: "A leadership change occurs. Your active role's requirements completely change mid-search.",
    choices: [
      {
        text: "Reword the description and start sourcing from scratch.",
        metrics: { happiness: -5, candidate: -10, sanity: -20, time: -20 },
        feedback: "You throw away weeks of pipeline. Back to square one."
      },
      {
        text: "Confront the leadership about wasted resources.",
        metrics: { happiness: -25, candidate: 10, sanity: 15, time: 5 },
        feedback: "You stand up for recruitment. You are labeled 'uncooperative,' but they let you continue the original search."
      }
    ]
  },
  {
    title: "🚨 The 20% Budget Cut!",
    description: "Finance reduces the salary budget for your active role by 20% due to market adjustments.",
    choices: [
      {
        text: "Try to renegotiate active candidates to the lower rate.",
        metrics: { happiness: 10, candidate: -30, sanity: -15, time: -10 },
        feedback: "Candidates feel insulted. Three of them drop out of the process immediately."
      },
      {
        text: "Search for less experienced, junior-level candidates.",
        metrics: { happiness: -15, candidate: 10, sanity: 5, time: -15 },
        feedback: "Hiring manager is disappointed in the 'downgraded pipeline,' but the search continues."
      }
    ]
  },
  {
    title: "🚨 Tech Lead Ghosts Interviews!",
    description: "The technical lead goes on an unannounced 10-day digital detox, leaving candidates stranded.",
    choices: [
      {
        text: "Apologize to candidates and reschedule everything.",
        metrics: { happiness: -5, candidate: -15, sanity: -15, time: -20 },
        feedback: "Scheduling nightmare. You lose 20% of your time remaining trying to fix calendars."
      },
      {
        text: "Conduct the technical assessment yourself using AI tools.",
        metrics: { happiness: 20, candidate: 15, sanity: -30, time: 10 },
        feedback: "You copy questions from ChatGPT. It works, but you have no idea what 'idempotency' means."
      }
    ]
  },
  {
    title: "🚨 Candidate Drops After Verbal Acceptance!",
    description: "Your star candidate verbally accepted the offer yesterday, but just sent an email saying they decided to stay at their current firm.",
    choices: [
      {
        text: "Restart the sourcing engine and weep.",
        metrics: { happiness: -25, candidate: 0, sanity: -30, time: -20 },
        feedback: "Total reset. The manager holds you personally responsible for the candidate's cold feet."
      },
      {
        text: "Call them and offer a sign-on bonus.",
        metrics: { happiness: -15, candidate: 15, sanity: -10, time: -5 },
        feedback: "You secure a small sign-on bonus. They accept, but the manager is annoyed you spent more money."
      }
    ]
  }
];

// ==========================================================================
// 6. LinkedIn Feed Content Library (LinkedOut)
// ==========================================================================
const LINKEDIN_POSTS = [
  {
    author: "Braden Chadwick",
    title: "Thought Leader & Corporate Motivator",
    avatar: "💼",
    content: "Today, I asked a candidate to code a new search engine on a whiteboard in binary. They cried. It showed me they lack resilience. Remember, hiring is about character, not just 'skills'. #grindset #hiring"
  },
  {
    author: "Sarah Jenkin-Smythe",
    title: "Chief Happiness Officer & Recruiter",
    avatar: "🌟",
    content: "We just replaced our coffee machine with a hydration-monitoring AI. Morale has increased by 14.2%! If your team isn't optimized, are you even managing? #hrtech #wellbeing"
  },
  {
    author: "Douglas 'Fintech' Miller",
    title: "Co-Founder of Stealth AI Synergy",
    avatar: "🚀",
    content: "I don't look at resumes. I look at eye contact. If a candidate blinks more than 4 times a minute during a Zoom call, I know they aren't ready for a hyper-growth environment. Blinking is for followers. #leadership #mindset"
  },
  {
    author: "Gemma Watson",
    title: "Corporate Recruiter @ MegaCorp",
    avatar: "📊",
    content: "Please stop asking for remote work. The office energy is unmatched. Last Tuesday, we had a pizza party and everyone got exactly one slice. You don't get that synergy at home! #backtooffice #corporateculture"
  },
  {
    author: "Kaleb '10x' Chen",
    title: "Senior VP of Disruptive Coding",
    avatar: "💻",
    content: "True developers don't use frameworks. True developers build their own compiler before writing a Hello World app. If a candidate uses React, they're just an expensive typist. #swe #codingwisdom"
  }
];

// ==========================================================================
// 7. Reality Check AI Advisor Quotes
// ==========================================================================
const REALITY_CHECK_QUOTES = [
  "The market does not contain what your hiring manager has invented.",
  "You are searching for a unicorn. Unicorns are currently unavailable due to supply chain issues.",
  "Budget and expectations appear to be in different time zones.",
  "15 years of experience in a technology that was invented 3 years ago is a bold requirement.",
  "Sourcing an engineer willing to work 80 hours a week for exposure is not a 'sourcing strategy'. It's a miracle.",
  "The Hiring Manager's budget suggests they are looking for a highly skilled unpaid intern.",
  "If a candidate is 'like family', it usually means they are expected to work holidays for free.",
  "The job description is not a role; it is the entire engineering department wrapped in a single salary.",
  "Your hiring manager is looking for a FAANG VP who will work for equity in a pre-revenue web3 dog-walking app.",
  "Pro-tip: If you cry in the server room, the sound is muffled by the cooling fans.",
  "A 'competitive salary' is like a ghost: people talk about it, but no one has actually seen it.",
  "Remember: 'We work hard and play hard' translates to 'You will work hard and we will play golf'."
];

// ==========================================================================
// 8. Game Initialization & Level Configuration
// ==========================================================================
function setDifficulty(diff) {
  state.difficulty = diff;
  const label = document.getElementById("current-diff-display");
  
  if (diff === 'junior') {
    state.metrics = { happiness: 85, candidate: 85, sanity: 100, time: 90 };
    label.className = "badge difficulty-badge";
    label.innerText = "Junior Recruiter";
  } else if (diff === 'senior') {
    state.metrics = { happiness: 70, candidate: 70, sanity: 80, time: 75 };
    label.className = "badge difficulty-badge";
    label.style.borderColor = "rgba(245, 158, 11, 0.4)";
    label.style.color = "#fbbf24";
    label.innerText = "Senior Recruiter";
  } else if (diff === 'executive') {
    state.metrics = { happiness: 50, candidate: 50, sanity: 60, time: 60 };
    label.className = "badge difficulty-badge";
    label.style.borderColor = "rgba(239, 68, 68, 0.4)";
    label.style.color = "#ef4444";
    label.innerText = "Executive Recruiter";
  }
  
  updateDashboard();
}

function initGame() {
  state.day = 1;
  state.hiresClosed = 0;
  state.roleProgress = 0;
  state.history = [];
  state.realityCheckTriggered = false;
  
  // Clear Placement Wall
  const gallery = document.getElementById("hired-gallery-container");
  gallery.innerHTML = '<div class="gallery-empty-state" id="gallery-empty">No hires closed yet. Make some placements to fill the wall!</div>';
  document.getElementById("hired-stats").innerText = "0 Candidates Placed";
  
  // Setup First Role
  generateNewRole();
  
  // Hide overlays
  document.getElementById("modal-start").classList.add("hidden");
  document.getElementById("modal-gameover").classList.add("hidden");
  document.getElementById("modal-victory").classList.add("hidden");
  
  synth.playRing();
}

// Generate a random role and assign to recruiter
function generateNewRole() {
  const index = Math.floor(Math.random() * ROLE_TEMPLATES.length);
  const template = ROLE_TEMPLATES[index];
  
  // Create deep copy
  state.activeRole = {
    title: template.title,
    exp: template.exp,
    loc: template.loc,
    stack: template.stack,
    budget: template.budget,
    character: template.character
  };
  
  // Adjust budget randomly based on difficulty
  if (state.difficulty === 'senior') {
    state.activeRole.budget = `₹${Math.floor(20 + Math.random() * 12)}L Max`;
  } else if (state.difficulty === 'executive') {
    state.activeRole.budget = `₹${Math.floor(12 + Math.random() * 8)}L Max`;
  }
  
  state.roleProgress = 0;
  state.activeCharacter = state.activeRole.character;
  
  // Update Role UI Card
  document.getElementById("active-role-title").innerText = state.activeRole.title;
  document.getElementById("role-exp").innerText = state.activeRole.exp;
  document.getElementById("role-loc").innerText = state.activeRole.loc;
  document.getElementById("role-stack").innerText = state.activeRole.stack;
  document.getElementById("role-budget").innerText = state.activeRole.budget;
  
  // Set Role Status
  const status = document.getElementById("active-role-status");
  status.className = "role-status badge-success";
  status.innerText = "Sourcing Stage";

  // Trigger Sourcing Scenario
  loadScenario(getRandomSourcingScenario());
}

// ==========================================================================
// 9. Scenario & Choice Handlers
// ==========================================================================
function getRandomSourcingScenario() {
  const index = Math.floor(Math.random() * SOURCING_SCENARIOS.length);
  return SOURCING_SCENARIOS[index];
}

function getNextStageScenario() {
  // progress determines which deck we pick from
  if (state.roleProgress === 1) {
    const index = Math.floor(Math.random() * CANDIDATE_SCENARIOS.length);
    return CANDIDATE_SCENARIOS[index];
  } else if (state.roleProgress === 2) {
    const index = Math.floor(Math.random() * FEEDBACK_SCENARIOS.length);
    return FEEDBACK_SCENARIOS[index];
  } else {
    const index = Math.floor(Math.random() * OFFER_SCENARIOS.length);
    return OFFER_SCENARIOS[index];
  }
}

function loadScenario(scenario) {
  // Update speaker avatar
  let char = state.activeRole.character;
  if (scenario.speaker === "Candidate") {
    // Select a candidate character corresponding to role
    const candidates = [CHARACTERS.PRIYA, CHARACTERS.EUGENE, CHARACTERS.SARAH];
    char = candidates[Math.floor(Math.random() * candidates.length)];
  }
  
  state.activeCharacter = char;
  updateAvatar(char, scenario.mood || "NORMAL");
  
  // Update speech bubble text
  document.getElementById("speaker-title").innerText = char.name.split(" ")[0];
  document.getElementById("speaker-quote").innerText = `"${scenario.description}"`;
  
  // Update scenario card text
  document.getElementById("scenario-tag").innerText = scenario.speaker.toUpperCase();
  document.getElementById("scenario-title").innerText = scenario.title;
  
  // Calculate description based on scenario
  document.getElementById("scenario-desc").innerText = `Requirements match: ${state.activeRole.title} (${state.activeRole.budget}). Action required.`;
  
  // Render choices
  const choicesContainer = document.getElementById("choices-container");
  choicesContainer.innerHTML = "";
  
  const letters = ["A", "B", "C", "D"];
  scenario.choices.forEach((choice, index) => {
    const btn = document.createElement("button");
    btn.className = "choice-button";
    btn.innerHTML = `
      <span class="choice-letter">${letters[index]}</span>
      <span class="choice-text">${choice.text}</span>
    `;
    btn.addEventListener("click", () => handleChoice(choice, scenario));
    choicesContainer.appendChild(btn);
  });
  
  // Hide reality check sticky when loading new scenario
  document.getElementById("reality-sticky").classList.remove("open");
  state.realityCheckTriggered = false;
}

function handleChoice(choice, scenario) {
  synth.playClack();
  
  // Apply metric updates
  applyMetricChange('happiness', choice.metrics.happiness);
  applyMetricChange('candidate', choice.metrics.candidate);
  applyMetricChange('sanity', choice.metrics.sanity);
  applyMetricChange('time', choice.metrics.time);
  
  // Add popup message or push to social feed
  addFeedPost(choice.feedback, state.activeCharacter.name);
  
  // Check sound triggers
  const negativeMetrics = Object.values(choice.metrics).some(v => v < -15);
  if (negativeMetrics) {
    synth.playError();
  }
  
  // Move scenario stages
  if (scenario.id && scenario.id.startsWith("src_")) {
    state.roleProgress = 1;
    document.getElementById("active-role-status").innerText = "Interviewing";
    document.getElementById("active-role-status").className = "role-status badge-alert";
  } else if (state.roleProgress === 1) {
    state.roleProgress = 2;
    document.getElementById("active-role-status").innerText = "Feedback Loop";
  } else if (state.roleProgress === 2) {
    state.roleProgress = 3;
    document.getElementById("active-role-status").innerText = "Offer Negotiation";
  } else {
    // Offer accepted! Placed candidate!
    closePlacement();
    return;
  }
  
  // Tick Day forward
  progressDay();
  
  // Load next stage card if game is still active
  if (checkGameEnd()) return;
  
  loadScenario(getNextStageScenario());
}

// Successful Placement Logic
function closePlacement() {
  synth.playSuccess();
  state.hiresClosed += 1;
  
  // Metric boost
  applyMetricChange('happiness', 25);
  applyMetricChange('candidate', 15);
  applyMetricChange('sanity', 20);
  applyMetricChange('time', 30);
  
  // Add placement card
  const gallery = document.getElementById("hired-gallery-container");
  const emptyState = document.getElementById("gallery-empty");
  if (emptyState) emptyState.remove();
  
  const card = document.createElement("div");
  card.className = "hired-card";
  
  const avatars = ["👩‍💻", "👨‍💻", "👩‍💼", "👨‍💼"];
  const randAvatar = avatars[Math.floor(Math.random() * avatars.length)];
  const candName = state.activeCharacter.name.split(" ")[0];
  
  card.innerHTML = `
    <div class="hired-avatar">${randAvatar}</div>
    <div class="hired-name">${candName}</div>
    <div class="hired-role">${state.activeRole.title}</div>
    <div class="hired-comp">${state.activeRole.budget.split(" ")[0]}</div>
  `;
  gallery.appendChild(card);
  
  document.getElementById("hired-stats").innerText = `${state.hiresClosed} Candidates Placed`;
  
  // Log message
  addFeedPost(`🎉 SUCCESS! Placed ${candName} as ${state.activeRole.title} after intense negotiations! #hired #recruitersuccess`, "HR Placement Office");
  
  // Move Day
  progressDay();
  
  if (checkGameEnd()) return;
  
  // Generate a brand new role
  generateNewRole();
}

// Progress Day Loop
function progressDay() {
  state.day += 1;
  
  // Day-based overhead costs
  const sanityDeduction = state.difficulty === 'executive' ? -3 : -1;
  const timeDeduction = state.difficulty === 'junior' ? -2 : -4;
  
  applyMetricChange('sanity', sanityDeduction);
  applyMetricChange('time', timeDeduction);
  
  updateDashboard();
  
  // Random LinkedIn update check
  if (Math.random() < 0.35) {
    generateRandomLinkedInPost();
  }
  
  // Trigger Random Chaos events check (approx every 8-10 days)
  if (state.day > 2 && state.day % 8 === 0) {
    triggerChaosEvent();
  }
}

// Chaos Event popup loader
function triggerChaosEvent() {
  synth.playTension();
  const event = CHAOS_EVENTS[Math.floor(Math.random() * CHAOS_EVENTS.length)];
  
  updateAvatar(CHARACTERS.VIKRAM, "STRESSED");
  
  document.getElementById("speaker-title").innerText = "COMPANY ALERT";
  document.getElementById("speaker-quote").innerText = `"${event.description}"`;
  
  document.getElementById("scenario-tag").innerText = "CHAOS EVENT";
  document.getElementById("scenario-title").innerText = event.title;
  document.getElementById("scenario-desc").innerText = "A corporate emergency has affected recruitment pipelines immediately.";
  
  const choicesContainer = document.getElementById("choices-container");
  choicesContainer.innerHTML = "";
  
  event.choices.forEach((choice, index) => {
    const btn = document.createElement("button");
    btn.className = "choice-button";
    btn.innerHTML = `
      <span class="choice-letter">${index === 0 ? 'A' : 'B'}</span>
      <span class="choice-text">${choice.text}</span>
    `;
    btn.addEventListener("click", () => {
      synth.playClack();
      
      applyMetricChange('happiness', choice.metrics.happiness);
      applyMetricChange('candidate', choice.metrics.candidate);
      applyMetricChange('sanity', choice.metrics.sanity);
      applyMetricChange('time', choice.metrics.time);
      
      addFeedPost(`⚠️ CHAOS RESOLUTION: ${choice.feedback}`, "Corporate News Desk");
      
      progressDay();
      
      if (!checkGameEnd()) {
        // Resume candidate stages
        loadScenario(getNextStageScenario());
      }
    });
    choicesContainer.appendChild(btn);
  });
}

// ==========================================================================
// 10. Dashboard UI Rendering
// ==========================================================================
function applyMetricChange(key, value) {
  state.metrics[key] = Math.max(0, Math.min(100, state.metrics[key] + value));
}

function updateDashboard() {
  // Day counter
  const dayStr = state.day < 10 ? `0${state.day}` : `${state.day}`;
  document.getElementById("days-count").innerHTML = `${dayStr}<span class="max-val">/90</span>`;
  
  // Hires counter
  const hiresStr = state.hiresClosed < 10 ? `0${state.hiresClosed}` : `${state.hiresClosed}`;
  document.getElementById("hires-count").innerHTML = `${hiresStr}<span class="max-val">/10</span>`;
  
  // Metric Bars updates
  updateBar('happiness', state.metrics.happiness, '❤️');
  updateBar('candidate', state.metrics.candidate, '⭐');
  updateBar('sanity', state.metrics.sanity, '🧠');
  updateBar('time', state.metrics.time, '⏰');
  
  // Skyline colors / Sun & Moon position based on Day progress
  const timeProgress = state.day / 90;
  const sky = document.getElementById("office-sky");
  const sunMoon = document.getElementById("office-sun-moon");
  
  if (timeProgress < 0.4) {
    sky.style.background = "linear-gradient(to bottom, #38bdf8, #bae6fd)"; // day
    sunMoon.style.background = "#fef08a";
    sunMoon.style.top = "15px";
  } else if (timeProgress < 0.75) {
    sky.style.background = "linear-gradient(to bottom, #f97316, #ffedd5)"; // sunset
    sunMoon.style.background = "#fdba74";
    sunMoon.style.top = "30px";
  } else {
    sky.style.background = "linear-gradient(to bottom, #0f172a, #1e293b)"; // night
    sunMoon.style.background = "#e2e8f0";
    sunMoon.style.top = "10px";
    sunMoon.style.boxShadow = "0 0 10px #e2e8f0";
  }
}

function updateBar(key, value, emoji) {
  const bar = document.getElementById(`bar-${key}`);
  const pct = document.getElementById(`pct-${key}`);
  const emojis = document.getElementById(`emojis-${key}`);
  
  bar.style.width = `${value}%`;
  pct.innerText = `${value}%`;
  
  // Draw 5-segmented emojis based on percent
  const count = Math.ceil(value / 20);
  emojis.innerText = emoji.repeat(count);
  
  // Highlight danger states
  const card = document.getElementById(`metric-${key}-card`);
  if (value < 25) {
    card.style.animation = "shake-avatar 0.2s infinite";
    card.style.borderColor = "var(--accent-danger)";
  } else {
    card.style.animation = "none";
    card.style.borderColor = "rgba(255,255,255,0.05)";
  }
}

// ==========================================================================
// 11. SVG Avatar Mood Modifier
// ==========================================================================
function updateAvatar(character, moodName) {
  const mood = CHARACTER_MOODS[moodName] || CHARACTER_MOODS.NORMAL;
  
  // Skin Gradient colors
  const neck = document.querySelector(".avatar-element.neck");
  const ears = document.querySelectorAll(".avatar-element.ear");
  const head = document.querySelector(".avatar-element.head-base");
  const grad = document.getElementById("avatar-skin-grad");
  
  grad.children[0].setAttribute("stop-color", character.skin[0]);
  grad.children[1].setAttribute("stop-color", character.skin[1]);
  
  neck.setAttribute("fill", character.skin[1]);
  ears.forEach(e => e.setAttribute("fill", character.skin[1]));
  
  // Hair styles
  const hair = document.getElementById("avatar-hair");
  hair.setAttribute("d", character.hairD);
  if (character.hairColor.startsWith("#")) {
    hair.setAttribute("fill", character.hairColor);
  } else {
    hair.setAttribute("fill", character.hairColor);
  }
  
  // Suit & Tie
  const suit = document.getElementById("avatar-suit");
  const tie = document.getElementById("avatar-tie");
  suit.setAttribute("fill", character.suitColor);
  tie.setAttribute("fill", character.tieColor);
  
  // Mouth Path modification
  const mouth = document.getElementById("avatar-mouth");
  mouth.setAttribute("d", mood.mouth);
  
  // Eyebrows
  const ebL = document.getElementById("eyebrow-left");
  const ebR = document.getElementById("eyebrow-right");
  ebL.setAttribute("d", mood.eyebrows.l);
  ebR.setAttribute("d", mood.eyebrows.r);
  
  // Blushing cheeks
  const cheekL = document.getElementById("cheek-left");
  const cheekR = document.getElementById("cheek-right");
  cheekL.setAttribute("fill-opacity", mood.blush);
  cheekR.setAttribute("fill-opacity", mood.blush);
  
  // Sweat & anger animations
  const sweat = document.getElementById("sweat-1");
  const anger = document.getElementById("anger-cross");
  const container = document.getElementById("avatar-container");
  
  container.className = "avatar-container";
  sweat.setAttribute("opacity", "0");
  anger.setAttribute("opacity", "0");
  
  if (mood.stress === 1) {
    anger.setAttribute("opacity", "1");
  } else if (mood.stress === 2) {
    sweat.setAttribute("opacity", "1");
    container.classList.add("shaking-avatar");
  }
  
  // Mood Label
  document.getElementById("char-name").innerText = character.name;
  document.getElementById("char-mood").innerText = mood.label;
}

// ==========================================================================
// 12. LinkedIn Feed Updates (The Office Jargons)
// ==========================================================================
function addFeedPost(text, author) {
  const container = document.getElementById("feed-posts-container");
  
  const post = document.createElement("div");
  post.className = "feed-post";
  post.innerHTML = `
    <div class="post-header">
      <div class="post-avatar">🏢</div>
      <div class="post-meta">
        <span class="post-author">${author}</span>
        <span class="post-title">Corporate Recruiter Daily Feed</span>
      </div>
    </div>
    <div class="post-content">
      ${text}
    </div>
    <div class="post-stats">👍 ${Math.floor(5 + Math.random() * 50)} Likes</div>
  `;
  
  container.insertBefore(post, container.firstChild);
  
  // Cap feed length
  if (container.children.length > 10) {
    container.removeChild(container.lastChild);
  }
}

function generateRandomLinkedInPost() {
  const randomPost = LINKEDIN_POSTS[Math.floor(Math.random() * LINKEDIN_POSTS.length)];
  const container = document.getElementById("feed-posts-container");
  
  const post = document.createElement("div");
  post.className = "feed-post";
  post.innerHTML = `
    <div class="post-header">
      <div class="post-avatar">${randomPost.avatar}</div>
      <div class="post-meta">
        <span class="post-author">${randomPost.author}</span>
        <span class="post-title">${randomPost.title}</span>
      </div>
    </div>
    <div class="post-content">
      ${randomPost.content}
    </div>
    <div class="post-stats">👍 ${randomPost.stats}</div>
  `;
  
  container.insertBefore(post, container.firstChild);
  if (container.children.length > 10) {
    container.removeChild(container.lastChild);
  }
}

// ==========================================================================
// 13. Reality Check advisor trigger
// ==========================================================================
function triggerRealityCheck() {
  if (state.realityCheckTriggered) return;
  
  synth.playClack();
  const quote = REALITY_CHECK_QUOTES[Math.floor(Math.random() * REALITY_CHECK_QUOTES.length)];
  
  const sticky = document.getElementById("reality-sticky");
  const advice = document.getElementById("reality-advice");
  
  advice.innerText = `"${quote}"`;
  sticky.classList.add("open");
  state.realityCheckTriggered = true;
  
  // Cost to manager satisfaction if you rely too much on Reality advice
  applyMetricChange('happiness', -5);
  updateDashboard();
}

// ==========================================================================
// 14. Win / Loss Checking
// ==========================================================================
function checkGameEnd() {
  // Check Loss Conditions first
  if (state.metrics.sanity <= 0) {
    endGame(false, "Your Recruiter Sanity hit 0%. You were found crying under your desk trying to source Kubernetes engineers with 25 years of experience.");
    return true;
  }
  if (state.metrics.happiness <= 0) {
    endGame(false, "Hiring Manager Happiness hit 0%. The VP of Sales convinced the CEO that your recruitment speed is the only reason the company missed Q2 revenue projections. You're fired!");
    return true;
  }
  if (state.metrics.candidate <= 0) {
    endGame(false, "Candidate Experience hit 0%. Candidates boycotted your hiring pipeline. A viral thread on Glassdoor titled 'Avoid This Recruiter At All Costs' ended your career.");
    return true;
  }
  if (state.metrics.time <= 0) {
    endGame(false, "Time Remaining hit 0%. You missed crucial corporate SLA deadlines to fill positions. The roles were outsourced to an external agency.");
    return true;
  }

  // Check Win Conditions (Survive 90 days, make 10 successful hires)
  if (state.day >= 90) {
    if (state.hiresClosed >= 10 && state.metrics.sanity > 20 && state.metrics.happiness > 50) {
      endGame(true);
    } else {
      endGame(false, `You survived 90 days, but failed to meet targets. You closed only ${state.hiresClosed}/10 hires. Your contract was not renewed.`);
    }
    return true;
  }
  
  return false;
}

function endGame(won, reason = "") {
  if (won) {
    synth.playVictory();
    document.getElementById("vic-hires").innerText = `${state.hiresClosed} Hires Placed`;
    document.getElementById("vic-hm").innerText = `${state.metrics.happiness}%`;
    document.getElementById("vic-cx").innerText = `${state.metrics.candidate}%`;
    document.getElementById("vic-sanity").innerText = `${state.metrics.sanity}%`;
    document.getElementById("modal-victory").classList.remove("hidden");
    startConfetti();
  } else {
    synth.playGameOver();
    document.getElementById("defeat-reason").innerText = reason;
    document.getElementById("report-days").innerText = `${state.day} / 90 Days`;
    document.getElementById("report-hires").innerText = `${state.hiresClosed} / 10 Hires`;
    document.getElementById("report-hm").innerText = `${state.metrics.happiness}%`;
    document.getElementById("report-cx").innerText = `${state.metrics.candidate}%`;
    document.getElementById("modal-gameover").classList.remove("hidden");
  }
}

// ==========================================================================
// 15. Celebratory Confetti Physics Canvas
// ==========================================================================
let confettiActive = false;
let confettiArr = [];

function startConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  const ctx = canvas.getContext("2d");
  
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
  
  confettiActive = true;
  confettiArr = [];
  
  const colors = ["#ef4444", "#3b82f6", "#10b981", "#fbbf24", "#a855f7", "#06b6d4"];
  for (let i = 0; i < 150; i++) {
    confettiArr.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * canvas.height,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngleIncremental: Math.random() * 0.07 + 0.02,
      tiltAngle: 0
    });
  }
  
  function draw() {
    if (!confettiActive) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    confettiArr.forEach((p, idx) => {
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
      p.x += Math.sin(p.tiltAngle);
      p.tilt = Math.sin(p.tiltAngle - idx / 3) * 15;
      
      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      ctx.stroke();
      
      // Loop particle to top if it exits bottom
      if (p.y > canvas.height) {
        confettiArr[idx] = {
          x: Math.random() * canvas.width,
          y: -20,
          r: p.r,
          d: p.d,
          color: p.color,
          tilt: p.tilt,
          tiltAngleIncremental: p.tiltAngleIncremental,
          tiltAngle: p.tiltAngle
        };
      }
    });
    
    requestAnimationFrame(draw);
  }
  
  draw();
}

function stopConfetti() {
  confettiActive = false;
  const canvas = document.getElementById("confetti-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// ==========================================================================
// 16. Event Listeners Setup
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  // Sound Mute Toggle
  document.getElementById("mute-btn").addEventListener("click", () => {
    const isMuted = synth.toggleMute();
    document.getElementById("mute-btn").innerText = isMuted ? "🔇" : "🔊";
  });
  
  // Screen 1 -> Screen 2 Transition
  document.getElementById("go-to-test-btn").addEventListener("click", () => {
    synth.playClack();
    document.getElementById("start-screen-intro").classList.add("hidden");
    document.getElementById("start-screen-test").classList.remove("hidden");
  });
  
  // Screen 2 Choice Handling
  const testChoiceBtns = document.querySelectorAll(".test-choice-btn");
  testChoiceBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      testChoiceBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const score = btn.getAttribute("data-score");
      const feedback = btn.getAttribute("data-feedback");
      
      const feedbackBox = document.getElementById("test-feedback-box");
      const feedbackTitle = document.getElementById("test-feedback-title");
      const feedbackText = document.getElementById("test-feedback-text");
      
      feedbackText.innerText = feedback;
      feedbackBox.classList.remove("hidden");
      
      if (score === "correct") {
        synth.playSuccess();
        feedbackTitle.innerText = "Compliance Evaluation: Excellent (100% Synergy)";
        feedbackTitle.style.color = "var(--accent-success)";
      } else if (score === "incorrect") {
        synth.playError();
        feedbackTitle.innerText = "Compliance Evaluation: Warning (Underperforming)";
        feedbackTitle.style.color = "var(--accent-danger)";
      } else {
        synth.playClack();
        feedbackTitle.innerText = "Compliance Evaluation: Standard Corporate Behavior";
        feedbackTitle.style.color = "var(--accent-warning)";
      }
    });
  });

  // Screen 2 -> Screen 3 Transition
  document.getElementById("go-to-diff-btn").addEventListener("click", () => {
    synth.playClack();
    document.getElementById("start-screen-test").classList.add("hidden");
    document.getElementById("start-screen-diff").classList.remove("hidden");
  });

  // Difficulty Selection Action
  const cards = document.querySelectorAll(".diff-card");
  cards.forEach(card => {
    card.addEventListener("click", () => {
      cards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      
      const diff = card.getAttribute("data-difficulty");
      setDifficulty(diff);
      synth.playClack();
    });
  });
  
  // Game Start Trigger
  document.getElementById("start-game-btn").addEventListener("click", () => {
    initGame();
  });
  
  // Reality Check Button trigger
  document.getElementById("btn-reality-check").addEventListener("click", () => {
    triggerRealityCheck();
  });
  
  // Close Reality Check Sticky Note
  document.getElementById("close-sticky").addEventListener("click", () => {
    synth.playClack();
    document.getElementById("reality-sticky").classList.remove("open");
  });
  
  // Game Restart Buttons
  document.getElementById("restart-game-btn").addEventListener("click", () => {
    stopConfetti();
    document.getElementById("modal-gameover").classList.add("hidden");
    document.getElementById("modal-start").classList.remove("hidden");
    resetStartModal();
  });
  
  document.getElementById("victory-restart-btn").addEventListener("click", () => {
    stopConfetti();
    document.getElementById("modal-victory").classList.add("hidden");
    document.getElementById("modal-start").classList.remove("hidden");
    resetStartModal();
  });

  function resetStartModal() {
    document.getElementById("start-screen-intro").classList.remove("hidden");
    document.getElementById("start-screen-test").classList.add("hidden");
    document.getElementById("start-screen-diff").classList.add("hidden");
    document.getElementById("test-feedback-box").classList.add("hidden");
    document.querySelectorAll(".test-choice-btn").forEach(b => b.classList.remove("active"));
  }
});
