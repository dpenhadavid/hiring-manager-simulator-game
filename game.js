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
// 2.1 Regional Configurations & Databases
// ==========================================================================
const REGIONS = {
  us: {
    name: "United States",
    currency: "$",
    currencyLabel: "USD",
    names: {
      managers: ["Chad", "Brenda", "Marcus", "Braden", "Sarah"],
      candidates: ["Austin", "Hunter", "Eugene", "Emily", "Taylor"]
    },
    locations: ["Silicon Valley (Hybrid)", "San Francisco Office", "Austin Remote", "Seattle Tech Center"],
    specialRule: "RSUs & Stock Options: Candidates demand stock equity and RSU plans."
  },
  in: {
    name: "India",
    currency: "₹",
    currencyLabel: "LPA",
    names: {
      managers: ["Vikram", "Shalini", "Amit", "Rajesh", "Pooja"],
      candidates: ["Priya", "Rajesh", "Karan", "Aditi", "Rahul"]
    },
    locations: ["Bengaluru Office (Outer Ring Road)", "Mumbai Corporate Park", "Noida Tech Zone", "Gurgaon Cyber City"],
    specialRule: "Notice Period: Candidates have 90-day notice periods and CTC-shopping hikes."
  },
  eu: {
    name: "United Kingdom & Europe",
    currency: "€",
    currencyLabel: "EUR",
    names: {
      managers: ["Alistair", "Gemma", "Nigel", "Oliver", "Fiona"],
      candidates: ["Chloe", "William", "Niamh", "Lucas", "Sophie"]
    },
    locations: ["London Canary Wharf Office", "Berlin Tech Hub", "Paris R&D Center", "Amsterdam Hybrid Hub"],
    specialRule: "Mandatory Holidays: Workers get 30 days PTO. GDPR & strict union compliance required."
  },
  cn: {
    name: "China",
    currency: "¥",
    currencyLabel: "CNY",
    names: {
      managers: ["Director Liang", "VP Zhao", "Tech Lead Chen", "Manager Wu", "VP Wang"],
      candidates: ["Wei", "Min", "Yang", "Xing", "Ruolan"]
    },
    locations: ["Shenzhen High-Tech Park", "Beijing Zhongguancun Office", "Shanghai Pudong Tower"],
    specialRule: "996 Work Hour Culture: Extremely fast turnaround times and high burnout fatigue."
  },
  sg: {
    name: "Singapore",
    currency: "$",
    currencyLabel: "SGD",
    names: {
      managers: ["Jian", "Devon", "Sarah", "Kim", "Lim"],
      candidates: ["Ryan", "Mei", "Arjun", "Bao", "Keith"]
    },
    locations: ["Marina Bay Financial Center", "Remote (Outsourced to Bali)", "One-North Tech Park"],
    specialRule: "EP Bureaucracy: Visa point calculations are highly regulated."
  },
  jp: {
    name: "Japan",
    currency: "¥",
    currencyLabel: "JPY",
    names: {
      managers: ["Sato-san", "Tanaka-san", "Suzuki-san", "Watanabe-san", "Nakamura-san"],
      candidates: ["Hiroshi", "Yuki", "Kenji", "Mai", "Takashi"]
    },
    locations: ["Tokyo Shibuya Office", "Osaka Tech Center", "Yokohama Hub"],
    specialRule: "Hanko Stamp Approvals: Multiphase hierarchal manager signs required for decisions."
  },
  br: {
    name: "LATAM",
    currency: "R$",
    currencyLabel: "BRL",
    names: {
      managers: ["Carlos", "Fernanda", "Matheus", "Sofia", "Ricardo"],
      candidates: ["Diego", "Lucas", "Mariana", "Thiago", "Beatriz"]
    },
    locations: ["São Paulo Tech Hub", "Rio de Janeiro Office", "Nearshore Contractor (US Timezone)"],
    specialRule: "CLT vs Contractor: LatAm candidate battles over USD salaries vs local benefits."
  },
  au: {
    name: "Australia & ANZ",
    currency: "$",
    currencyLabel: "AUD",
    names: {
      managers: ["Lachlan", "Kylie", "Liam", "Mitchell", "Belinda"],
      candidates: ["Angus", "Isla", "Hamish", "Zoe", "Connor"]
    },
    locations: ["Sydney Circular Quay Office", "Melbourne Tech Sandbox", "Brisbane Hybrid Space"],
    specialRule: "Work-Life Balance: Slow hiring speed, strict 5 PM logoffs, and coffee chat interviews."
  }
};

const REGIONAL_CHAOS_EVENTS = {
  us: [
    {
      title: "🚨 Tech Lead Unlimited PTO!",
      description: "Your tech lead took 4 weeks of unannounced 'unlimited' PTO right before the final loop.",
      choices: [
        {
          text: "Wait for their return.",
          metrics: { happiness: 10, candidate: -15, sanity: 10, time: -25 },
          feedback: "The candidate gets another offer and drops out. Manager is glad rules were followed."
        },
        {
          text: "Escalate to VP to bypass interviews.",
          metrics: { happiness: -20, candidate: 15, sanity: -10, time: 10 },
          feedback: "VP approves the bypass. Tech lead is furious when they return, damaging manager satisfaction."
        }
      ]
    }
  ],
  in: [
    {
      title: "🚨 90-Day Notice Period Shopping!",
      description: "During their 90-day notice period, your candidate shopping-spreed 4 counter-offers. They demand a 50% hike to join.",
      choices: [
        {
          text: "Beg the CEO to match the hike.",
          metrics: { happiness: -20, candidate: 20, sanity: -15, time: 5 },
          feedback: "CEO matches it. You get the hire, but finance is watching your budget like a hawk."
        },
        {
          text: "Refuse. Restart search.",
          metrics: { happiness: -10, candidate: -5, sanity: -10, time: -20 },
          feedback: "You reset the pipeline. Manager complains about the delays."
        }
      ]
    }
  ],
  eu: [
    {
      title: "🚨 Mandatory Holiday Shutdown!",
      description: "Europe shuts down for the entire month of August. All interviewers are in the South of France.",
      choices: [
        {
          text: "Send 'keep warm' emails and wait.",
          metrics: { happiness: 10, candidate: 10, sanity: 20, time: -30 },
          feedback: "You enjoy a peaceful month. The timeline drops severely."
        },
        {
          text: "Attempt to call interviewers on holiday.",
          metrics: { happiness: -30, candidate: -10, sanity: -15, time: 10 },
          feedback: "Interviewers ignore you. You violated the Right to Disconnect. Severe penalties."
        }
      ]
    }
  ],
  cn: [
    {
      title: "🚨 996 Fatigue Burnout!",
      description: "Your team lead was hospitalized due to working late shifts. Sourcing pipeline halts.",
      choices: [
        {
          text: "Send them fruit baskets and wait.",
          metrics: { happiness: 15, candidate: -10, sanity: 15, time: -25 },
          feedback: "Morale rises, but candidates grow impatient with the silent pipeline."
        },
        {
          text: "Ask another lead to take over immediately.",
          metrics: { happiness: -15, candidate: 10, sanity: -20, time: 10 },
          feedback: "Interviews proceed, but the new lead has no context on the role requirements."
        }
      ]
    }
  ],
  sg: [
    {
      title: "🚨 EP Points Quota Shift!",
      description: "The Ministry of Manpower changes points quotas for tech visas. Active candidate no longer qualifies.",
      choices: [
        {
          text: "Request a salary hike to meet criteria.",
          metrics: { happiness: -20, candidate: 15, sanity: -15, time: 15 },
          feedback: "The company pays more, but matches the visa quota. Candidate is saved."
        },
        {
          text: "Outsource them as a remote contractor to Bali.",
          metrics: { happiness: 10, candidate: -15, sanity: 10, time: -10 },
          feedback: "The candidate works remotely. You save budget but candidate misses the office energy."
        }
      ]
    }
  ],
  jp: [
    {
      title: "🚨 Hanko Stamp Delay!",
      description: "The Director is out of office, and his assistant refuses to use the Hanko stamp on the offer letter.",
      choices: [
        {
          text: "Wait for Director's return.",
          metrics: { happiness: 10, candidate: -15, sanity: 10, time: -20 },
          feedback: "Candidate assumes they are ghosted. Company processes remain rigid."
        },
        {
          text: "Attempt to forge the stamp seal.",
          metrics: { happiness: -30, candidate: 20, sanity: -25, time: 10 },
          feedback: "The candidate accepts. If compliance discovers it, you're toast."
        }
      ]
    }
  ],
  br: [
    {
      title: "🚨 Nearshore US Dollar War!",
      description: "A US startup offers your candidate $6,000 USD/month as a remote contractor. We pay in BRL CLT.",
      choices: [
        {
          text: "Try to explain the stability of CLT benefits.",
          metrics: { happiness: 10, candidate: -20, sanity: 10, time: -15 },
          feedback: "Candidate prefers cash over benefits. They drop out."
        },
        {
          text: "Beg manager to match in USD contracting.",
          metrics: { happiness: -25, candidate: 25, sanity: -10, time: 10 },
          feedback: "Manager matches. Company takes on legal risks but candidate accepts!"
        }
      ]
    }
  ],
  au: [
    {
      title: "🚨 Mandatory 5 PM Logoff Lock!",
      description: "Aussie work-life regulations shut down the corporate VPN at 5:00 PM on Friday, canceling a final interview.",
      choices: [
        {
          text: "Reschedule to Monday morning.",
          metrics: { happiness: 10, candidate: 15, sanity: 15, time: -15 },
          feedback: "Everyone respects the boundaries. You enjoy your weekend, but lose days of progress."
        },
        {
          text: "Beg tech lead to interview via personal WhatsApp.",
          metrics: { happiness: -20, candidate: -10, sanity: -15, time: 10 },
          feedback: "Tech lead feels micro-managed on the weekend. Souring relationships."
        }
      ]
    }
  ]
};

// ==========================================================================
// 3. Game State
// ==========================================================================
let state = {
  day: 1,
  hiresClosed: 0,
  difficulty: 'junior',
  country: 'us',
  playerName: 'Anonymous Recruiter',
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
// 3.1 Leaderboard Persistence System
// ==========================================================================
const DEFAULT_LEADERBOARD = [
  { name: "Braden Chadwick (VP of Synergy)", score: 24000, hires: 12, days: 90, country: "us" },
  { name: "ChatGPT (AI Sourcing Bot)", score: 18500, hires: 10, days: 90, country: "sg" },
  { name: "Chad (Sales Ops Lead)", score: 11200, hires: 8, days: 90, country: "us" },
  { name: "Skeptical Hiring Manager", score: 1200, hires: 1, days: 12, country: "in" }
];

function loadLeaderboard() {
  try {
    const data = localStorage.getItem("hiring_manager_leaderboard");
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => b.score - a.score);
      }
    }
  } catch (e) {
    console.error("Failed to parse leaderboard: ", e);
  }
  return [...DEFAULT_LEADERBOARD].sort((a, b) => b.score - a.score);
}

function saveScore(name, score, hires, days) {
  const leaderboard = loadLeaderboard();
  leaderboard.push({
    name: name,
    score: score,
    hires: hires,
    days: days,
    country: state.country
  });
  
  // Sort descending and keep top 10
  leaderboard.sort((a, b) => b.score - a.score);
  if (leaderboard.length > 10) {
    leaderboard.splice(10);
  }
  
  try {
    localStorage.setItem("hiring_manager_leaderboard", JSON.stringify(leaderboard));
  } catch (e) {
    console.error("Failed to save score: ", e);
  }
}

function renderLeaderboard(elementId, highlightName = null) {
  const container = document.getElementById(elementId);
  if (!container) return;
  
  const leaderboard = loadLeaderboard();
  
  let html = `
    <div class="leaderboard-table-container">
      <table class="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Recruiter</th>
            <th style="text-align: center;">Territory</th>
            <th style="text-align: center;">Hires</th>
            <th style="text-align: center;">Days</th>
            <th style="text-align: right;">Score</th>
          </tr>
        </thead>
        <tbody>
    `;
  
  const flags = { us: "🇺🇸", in: "🇮🇳", eu: "🇪🇺", cn: "🇨🇳", sg: "🇸🇬", jp: "🇯🇵", br: "🌎", au: "🇦🇺" };
  
  leaderboard.forEach((entry, idx) => {
    const isPlayer = entry.name === highlightName;
    const highlightClass = isPlayer ? 'class="highlight-player"' : '';
    
    // Rank badges for top 3
    let rankDisplay = idx + 1;
    if (idx < 3) {
      rankDisplay = `<span class="rank-badge rank-${idx + 1}">${idx + 1}</span>`;
    }
    
    const flag = flags[entry.country] || "🌐";
    
    html += `
      <tr ${highlightClass}>
        <td>${rankDisplay}</td>
        <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${entry.name}</td>
        <td style="text-align: center; font-size: 1.1rem;" title="${entry.country ? entry.country.toUpperCase() : ''}">${flag}</td>
        <td style="text-align: center;">${entry.hires}</td>
        <td style="text-align: center;">${entry.days}</td>
        <td style="text-align: right; font-weight: 800; color: var(--accent-gold);">${entry.score.toLocaleString()}</td>
      </tr>
    `;
  });
  
  html += `
        </tbody>
      </table>
    </div>
  `;
  
  container.innerHTML = html;
}

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

// Scenarios & Events Database (Loaded dynamically from scenarios.json)
let SOURCING_SCENARIOS = [];
let CANDIDATE_SCENARIOS = [];
let FEEDBACK_SCENARIOS = [];
let OFFER_SCENARIOS = [];
let CHAOS_EVENTS = [];

async function fetchScenarios() {
  try {
    const response = await fetch('scenarios.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    SOURCING_SCENARIOS = data.sourcing || [];
    CANDIDATE_SCENARIOS = data.candidate || [];
    FEEDBACK_SCENARIOS = data.feedback || [];
    OFFER_SCENARIOS = data.offer || [];
    CHAOS_EVENTS = data.chaos || [];
    console.log(`Loaded ${SOURCING_SCENARIOS.length + CANDIDATE_SCENARIOS.length + FEEDBACK_SCENARIOS.length + OFFER_SCENARIOS.length + CHAOS_EVENTS.length} scenarios successfully.`);
    
    // Initialize decks immediately upon loading
    initDecks();
    // Update active country indicator
    updateCountryDisplay();
  } catch (error) {
    console.error("Error loading scenarios.json:", error);
  }
}

// Shuffled Decks Engine
function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

function initDecks() {
  state.decks = {
    sourcing: shuffle([...SOURCING_SCENARIOS]),
    candidate: shuffle([...CANDIDATE_SCENARIOS]),
    feedback: shuffle([...FEEDBACK_SCENARIOS]),
    offer: shuffle([...OFFER_SCENARIOS])
  };
  
  // Combine generic and regional chaos events
  let chaosPool = [...CHAOS_EVENTS];
  const regEvents = REGIONAL_CHAOS_EVENTS[state.country];
  if (regEvents && regEvents.length > 0) {
    chaosPool = chaosPool.concat(regEvents);
  }
  state.decks.chaos = shuffle(chaosPool);
  console.log("Decks initialized and shuffled successfully.");
}

function drawFromDeck(deckName, originalPool) {
  if (!state.decks || !state.decks[deckName] || state.decks[deckName].length === 0) {
    console.log(`Deck ${deckName} depleted. Reshuffling...`);
    if (deckName === 'chaos') {
      let chaosPool = [...CHAOS_EVENTS];
      const regEvents = REGIONAL_CHAOS_EVENTS[state.country];
      if (regEvents && regEvents.length > 0) {
        chaosPool = chaosPool.concat(regEvents);
      }
      state.decks.chaos = shuffle(chaosPool);
    } else {
      state.decks[deckName] = shuffle([...originalPool]);
    }
  }
  return state.decks[deckName].pop();
}

// Update the active territory flag and label in the header
function updateCountryDisplay() {
  const display = document.getElementById("current-country-display");
  if (display) {
    const reg = REGIONS[state.country] || REGIONS.us;
    const flags = {
      us: "🇺🇸",
      in: "🇮🇳",
      eu: "🇪🇺",
      cn: "🇨🇳",
      sg: "🇸🇬",
      jp: "🇯🇵",
      br: "🌎",
      au: "🇦🇺"
    };
    const flag = flags[state.country] || "🇺🇸";
    display.innerText = `${flag} ${reg.name}`;
  }
}


// Toast notification helper
function showToast(message) {
  let toast = document.querySelector(".toast-notification");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast-notification";
    document.body.appendChild(toast);
  }
  toast.innerHTML = `📋 <span>${message}</span>`;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// Verification hashing for score submissions
function generateVerificationCode(name, score, hires, days, region) {
  const data = `${name}|${score}|${hires}|${days}|${region}|synergy-salt-2026`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = (hash << 5) - hash + data.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).toUpperCase();
}

// Leaderboard ticket generator and clipboard exporter
function submitScoreToGitHub() {
  const name = state.playerName;
  const score = state.lastScore || 0;
  const hires = state.hiresClosed;
  const days = state.day;
  const region = REGIONS[state.country]?.name || state.country.toUpperCase();
  const difficulty = state.difficulty.toUpperCase();
  
  const verificationCode = generateVerificationCode(name, score, hires, days, state.country);
  const payload = btoa(unescape(encodeURIComponent(`${name}:${score}:${hires}:${days}:${state.country}`))).replace(/=/g, '');
  
  const title = `Leaderboard Entry: ${name} - ${score} pts`;
  const body = `### 🏆 Hiring Manager Simulator - Score Ticket

| Metric | Value |
| :--- | :--- |
| **Player Name** | ${name} |
| **Territory / Region** | ${region} |
| **Difficulty Level** | ${difficulty} |
| **Hires Closed** | ${hires} / 10 |
| **Days Survived** | ${days} / 90 |
| **Final Score** | **${score} pts** |

---

#### 🔒 Verification Metadata
\`\`\`
Version: 1.0.0
Payload: ${payload}
Verification Code: ${verificationCode}
\`\`\`

*Instructions: Do not modify the Verification Metadata above. Just click "Submit new issue" to log your score on the leaderboard!*`;

  navigator.clipboard.writeText(body).then(() => {
    showToast("Score ticket copied to clipboard!");
  }).catch(err => {
    console.error("Clipboard copy failed:", err);
  });
  
  const githubUrl = `https://github.com/dpenhadavid/hiring-manager-simulator-game/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
  window.open(githubUrl, "_blank");
}



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
  if (SOURCING_SCENARIOS.length === 0) {
    alert("Scenarios are still loading, please wait a second.");
    return;
  }
  state.day = 1;
  state.hiresClosed = 0;
  state.roleProgress = 0;
  state.history = [];
  state.realityCheckTriggered = false;
  
  // Reset and shuffle decks for the new game session
  initDecks();
  
  // Set Player Name
  const nameInput = document.getElementById("player-name");
  let pName = nameInput ? nameInput.value.trim() : "";
  if (!pName) {
    const titles = ["Hustling Recruiter", "Vibe Coder", "Headhunter", "Corporate Drone", "Unicorn Chaser"];
    pName = `${titles[Math.floor(Math.random() * titles.length)]} #${Math.floor(Math.random() * 900 + 100)}`;
  }
  state.playerName = pName;
  
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
  
  const reg = REGIONS[state.country] || REGIONS.us;
  
  // Pick a random manager from the country pool
  const managerName = reg.names.managers[Math.floor(Math.random() * reg.names.managers.length)];
  const managerChar = {
    name: `${managerName} (${template.character.name.split(" (")[1]}`,
    role: "Hiring Manager",
    skin: template.character.skin,
    hairColor: template.character.hairColor,
    hairD: template.character.hairD,
    suitColor: template.character.suitColor,
    tieColor: template.character.tieColor
  };
  
  // Localize location
  const locIndex = Math.floor(Math.random() * reg.locations.length);
  const location = reg.locations[locIndex];
  
  // Localize budget based on country
  let budget = "";
  if (state.country === 'in') {
    const baseBudget = state.difficulty === 'junior' ? 45 : state.difficulty === 'senior' ? 30 : 18;
    budget = `₹${Math.floor(baseBudget + Math.random() * 10)}L Max`;
  } else if (state.country === 'jp') {
    const baseBudget = state.difficulty === 'junior' ? 12 : state.difficulty === 'senior' ? 8 : 5;
    budget = `¥${Math.floor(baseBudget + Math.random() * 3)}M Max`;
  } else if (state.country === 'br') {
    const baseBudget = state.difficulty === 'junior' ? 240 : state.difficulty === 'senior' ? 180 : 120;
    budget = `R$ ${Math.floor(baseBudget + Math.random() * 40)}k Max`;
  } else if (state.country === 'cn') {
    const baseBudget = state.difficulty === 'junior' ? 400 : state.difficulty === 'senior' ? 300 : 180;
    budget = `¥${Math.floor(baseBudget + Math.random() * 50)}k Max`;
  } else {
    // US, EU, SG, AU
    const cur = reg.currency;
    const baseBudget = state.difficulty === 'junior' ? 180 : state.difficulty === 'senior' ? 130 : 80;
    budget = `${cur}${Math.floor(baseBudget + Math.random() * 30)}k Max`;
  }

  state.activeRole = {
    title: template.title,
    exp: template.exp,
    loc: location,
    stack: template.stack,
    budget: budget,
    character: managerChar
  };
  
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
  
  // Set specific stage text
  if (state.country === 'in') {
    status.innerText = "Notice Period Sourcing";
  } else if (state.country === 'jp') {
    status.innerText = "Hanko Clearance Stage";
  } else {
    status.innerText = "Sourcing Stage";
  }

  // Trigger Sourcing Scenario
  loadScenario(getRandomSourcingScenario());
}

// ==========================================================================
// 9. Scenario & Choice Handlers
// ==========================================================================
function getRandomSourcingScenario() {
  return drawFromDeck('sourcing', SOURCING_SCENARIOS);
}

function getNextStageScenario() {
  // progress determines which deck we pick from
  if (state.roleProgress === 1) {
    return drawFromDeck('candidate', CANDIDATE_SCENARIOS);
  } else if (state.roleProgress === 2) {
    return drawFromDeck('feedback', FEEDBACK_SCENARIOS);
  } else {
    return drawFromDeck('offer', OFFER_SCENARIOS);
  }
}

function loadScenario(scenario) {
  // Update speaker avatar
  let char = state.activeRole.character;
  if (scenario.speaker === "Candidate") {
    const reg = REGIONS[state.country] || REGIONS.us;
    const candName = reg.names.candidates[Math.floor(Math.random() * reg.names.candidates.length)];
    const baseCandidates = [CHARACTERS.PRIYA, CHARACTERS.EUGENE, CHARACTERS.SARAH];
    const baseCand = baseCandidates[Math.floor(Math.random() * baseCandidates.length)];
    
    char = {
      name: `${candName} (${baseCand.name.split(" (")[1]}`,
      role: "Candidate",
      skin: baseCand.skin,
      hairColor: baseCand.hairColor,
      hairD: baseCand.hairD,
      suitColor: baseCand.suitColor,
      tieColor: baseCand.tieColor
    };
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
  
  const event = drawFromDeck('chaos', CHAOS_EVENTS);
  
  // Localize manager character for the chaos alert
  const reg = REGIONS[state.country] || REGIONS.us;
  const managerName = reg.names.managers[0];
  const baseCand = CHARACTERS.VIKRAM;
  const managerChar = {
    name: `${managerName} (Primary Manager)`,
    role: "Hiring Manager",
    skin: baseCand.skin,
    hairColor: baseCand.hairColor,
    hairD: baseCand.hairD,
    suitColor: baseCand.suitColor,
    tieColor: baseCand.tieColor
  };
  
  updateAvatar(managerChar, "STRESSED");
  
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
  // Calculate final score
  let score = (state.hiresClosed * 1000) + (state.day * 100);
  score += Math.floor(state.metrics.sanity * 50);
  score += Math.floor(state.metrics.happiness * 50);
  score += Math.floor(state.metrics.candidate * 50);
  if (won) {
    score += 5000; // Victory bonus
  }
  
  // Save to leaderboard
  saveScore(state.playerName, score, state.hiresClosed, state.day);
  state.lastScore = score;

  if (won) {
    synth.playVictory();
    document.getElementById("vic-hires").innerText = `${state.hiresClosed} Hires Placed`;
    document.getElementById("vic-hm").innerText = `${state.metrics.happiness}%`;
    document.getElementById("vic-cx").innerText = `${state.metrics.candidate}%`;
    document.getElementById("vic-sanity").innerText = `${state.metrics.sanity}%`;
    
    document.getElementById("victory-score").innerText = score.toLocaleString();
    renderLeaderboard("victory-leaderboard", state.playerName);
    
    document.getElementById("modal-victory").classList.remove("hidden");
    startConfetti();
  } else {
    synth.playGameOver();
    document.getElementById("defeat-reason").innerText = reason;
    document.getElementById("report-days").innerText = `${state.day} / 90 Days`;
    document.getElementById("report-hires").innerText = `${state.hiresClosed} / 10 Hires`;
    document.getElementById("report-hm").innerText = `${state.metrics.happiness}%`;
    document.getElementById("report-cx").innerText = `${state.metrics.candidate}%`;
    
    document.getElementById("defeat-score").innerText = score.toLocaleString();
    renderLeaderboard("defeat-leaderboard", state.playerName);
    
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
  // Fetch scenarios dynamically from scenarios.json
  fetchScenarios();

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

  // Screen 2 -> Screen 3 Transition (Go to Country Selection)
  document.getElementById("go-to-country-btn").addEventListener("click", () => {
    synth.playClack();
    document.getElementById("start-screen-test").classList.add("hidden");
    document.getElementById("start-screen-country").classList.remove("hidden");
  });

  // Country Selection Action
  const countryCards = document.querySelectorAll(".country-card");
  countryCards.forEach(card => {
    card.addEventListener("click", () => {
      countryCards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      
      state.country = card.getAttribute("data-country");
      updateCountryDisplay();
      synth.playClack();
    });
  });

  // Screen 3 -> Screen 4 Transition (Go to Difficulty Selection)
  document.getElementById("go-to-diff-btn").addEventListener("click", () => {
    synth.playClack();
    document.getElementById("start-screen-country").classList.add("hidden");
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
  
  // Initial leaderboard load
  renderLeaderboard("start-leaderboard");

  // Game Restart and Leaderboard Submission Buttons
  document.getElementById("defeat-github-btn").addEventListener("click", () => {
    synth.playSuccess();
    submitScoreToGitHub();
  });

  document.getElementById("victory-github-btn").addEventListener("click", () => {
    synth.playSuccess();
    submitScoreToGitHub();
  });

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
    document.getElementById("start-screen-country").classList.add("hidden");
    document.getElementById("start-screen-diff").classList.add("hidden");
    document.getElementById("test-feedback-box").classList.add("hidden");
    document.querySelectorAll(".test-choice-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".country-card").forEach(b => b.classList.remove("active"));
    document.querySelector(".country-card[data-country='us']").classList.add("active");
    state.country = 'us';
    updateCountryDisplay();
    
    // Refresh start screen leaderboard
    renderLeaderboard("start-leaderboard");
  }
});
