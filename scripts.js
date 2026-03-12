/* ================================================================
   REVEAL.JS INIT
================================================================ */
Reveal.initialize({
  width:  1280,
  height: 720,
  margin: 0.04,
  minScale: 0.2,
  maxScale: 2.0,
  hash: false,
  transition: 'slide',
  backgroundTransition: 'fade',
  controls: true,
  progress: true,
  center: true,
});

/* ================================================================
   GAME ENGINE
================================================================ */

/* ------------------------------------------------------------------
   DATA
------------------------------------------------------------------ */
const VULNS = [
  { id: 'password', icon: '🔑', tag: 'Weak Password "1234"!', style: 'top:50%; left:50%;' },
  { id: 'guard',    icon: '😴', tag: 'Sleeping Guard!',       style: 'top:40%; left:13%;' },
  { id: 'window',   icon: '🪟', tag: 'Open Window!',          style: 'top:20%; left:75%;' },
  { id: 'bridge',   icon: '🚪', tag: 'Drawbridge Down!',      style: 'top:75%; left:48%;' },
];

const CHOICE_SCENES = [
  {
    id: 'password',
    heading: '🔐 Mission 2: Password challenge!',
    sub: 'The castle door needs a secret password. Which one is the strongest?',
    choices: [
      {
        text: 'A)  1234',
        correct: false,
        why: '🚫 "1234" is the most guessed password in the entire world! Way too easy for a bad guy!',
      },
      {
        text: 'B)  password',
        correct: false,
        why: '🚫 "password" is the #2 most guessed password. Bad guys know this one too!',
      },
      {
        text: 'C)  Dr4g0n$l@y3r!  🐉',
        correct: true,
        why: '✅ Yes! Long passwords that mix LETTERS + numbers + symbols are super hard to crack. The longer, the better!',
      },
    ],
  },
  {
    id: 'phishing',
    heading: '📜 Mission 3: Suspicious scroll!',
    sub: 'A mysterious scroll arrives at the castle gates…',
    scroll: true,
    scrollText: [
      '🎉 YOU WON 1,000 GOLD COINS! 🎉',
      'Click here RIGHT NOW before it expires!',
      '⚡ URGENT — only 5 minutes left! ⚡',
      'Enter your castle password to claim your prize!!!',
    ],
    choices: [
      {
        text: 'A)  Click it! Free gold! 🤩',
        correct: false,
        why: '🚫 That was a TRICK! Bad guys send fake messages to fool people. This is called "phishing" (like fishing 🎣 — they\'re fishing for your secrets!).',
      },
      {
        text: 'B)  Tell the castle wizard — it looks fishy! 🧙',
        correct: true,
        why: '✅ Great thinking! When something seems too good to be true, it usually is. Always tell a trusted grown-up.',
      },
      {
        text: 'C)  Open it and see what happens 👀',
        correct: false,
        why: '🚫 Don\'t open unknown messages! Computer germs can sneak in just by being opened.',
      },
    ],
  },
  {
    id: 'sharing',
    heading: '🤝 Mission 4: The sharing mistake!',
    sub: 'Guard Benny needs a day off…',
    story: '"Hey friend! My secret password is CASTLE123. Use it to get in while I\'m gone today!" 😬',
    choices: [
      {
        text: 'A)  Sure! Friends can share passwords! 👍',
        correct: false,
        why: '🚫 Nope! Even best friends shouldn\'t share passwords. If Benny\'s friend tells just one more person, now everyone knows!',
      },
      {
        text: 'B)  No! Passwords are secret — even from friends. 🤐',
        correct: true,
        why: '✅ Exactly! Think of a password like a toothbrush — you NEVER share it with anyone. The castle wizard should make a temporary pass instead.',
      },
    ],
  },
];

/* ------------------------------------------------------------------
   STATE
------------------------------------------------------------------ */
const SCENE_ORDER = ['intro', 'castle', 'password', 'phishing', 'sharing', 'victory'];

const state = {
  scene:        'intro',
  foundVulns:   new Set(),
  choiceMade:   false,
  feedbackHtml: '',
};

/* ------------------------------------------------------------------
   RENDER DISPATCHER
------------------------------------------------------------------ */
function renderGame() {
  const c = document.getElementById('game-container');
  if (!c) return;
  switch (state.scene) {
    case 'intro':    c.innerHTML = renderIntro();       break;
    case 'castle':   c.innerHTML = renderCastle();      break;
    case 'password':
    case 'phishing':
    case 'sharing':  c.innerHTML = renderChoiceScene(); break;
    case 'victory':  c.innerHTML = renderVictory(); launchConfetti(); break;
  }
}

/* ------------------------------------------------------------------
   INTRO
------------------------------------------------------------------ */
function renderIntro() {
  return `
    <div class="float-in" style="text-align:center;">
      <div class="intro-badge">🏰</div>
      <div class="game-heading" style="font-size:2em;">Castle security adventure!</div>
      <div class="game-subheading" style="font-size:1.1em; margin:0.4em auto 0.9em;">
        You are <strong style="color:var(--cyan);">Tenable's newest Security Inspector!</strong><br>
        Your mission: find every weakness before the bad guys do. 🕵️
      </div>
      <button class="game-btn" onclick="startGame()">⚔️ Start Investigating!</button>
    </div>`;
}

function startGame() {
  state.scene = 'castle';
  renderGame();
}

/* ------------------------------------------------------------------
   CASTLE
------------------------------------------------------------------ */
function renderCastle() {
  const allFound = state.foundVulns.size === VULNS.length;

  const stars = Array.from({ length: 16 }, (_, i) => {
    const sz = [3, 2, 1.5][i % 3];
    return `<div class="star" style="width:${sz}px;height:${sz}px;top:${5 + (i * 97 % 45)}%;left:${4 + (i * 137 % 92)}%;"></div>`;
  }).join('');

  const spots = VULNS.map(v => {
    const found = state.foundVulns.has(v.id);
    return `
      <div class="vuln-spot ${found ? 'found' : ''}"
           style="position:absolute;${v.style}transform:translate(-50%,-50%);"
           ${found ? '' : `onclick="findVuln('${v.id}')"`}>
        <span class="vuln-tag">${v.tag}</span>
        <span class="vuln-icon">${v.icon}</span>
      </div>`;
  }).join('');

  return `
    <div class="castle-scene-wrapper float-in">
      ${progressDots()}
      <div class="game-heading">🏰 Mission 1: Spot the vulnerabilities!</div>
      <div class="game-subheading">Can you find all 4 security problems? Click each one you spot!</div>
      <div class="vuln-counter">🔍 Found: ${state.foundVulns.size} / ${VULNS.length}</div>

      <div class="castle-visual">
        <div class="star-field">${stars}</div>
        <div class="castle-bg" style="width:580px;height:195px;">
          <div class="c-tower" style="height:155px;">
            <div class="battlements">
              <div class="battlement"></div><div class="battlement"></div><div class="battlement"></div>
            </div>
          </div>
          <div class="c-wall" style="width:135px;height:95px;"></div>
          <div class="c-tower" style="width:120px;height:125px;">
            <div class="battlements">
              <div class="battlement"></div><div class="battlement"></div><div class="battlement"></div>
              <div class="battlement"></div><div class="battlement"></div>
            </div>
            <div class="c-gate"></div>
          </div>
          <div class="c-wall" style="width:135px;height:95px;"></div>
          <div class="c-tower" style="height:155px;">
            <div class="battlements">
              <div class="battlement"></div><div class="battlement"></div><div class="battlement"></div>
            </div>
          </div>
        </div>
        ${spots}
      </div>

      ${allFound ? `
        <div class="feedback-box float-in" style="border-color:var(--green);margin-top:0.6em;">
          🎉 <strong>Amazing!</strong> You found all 4 vulnerabilities — exactly what Tenable does for 40,000+ companies every day!<br>
          These weak spots are called <strong style="color:var(--cyan);">VULNERABILITIES</strong>.
        </div>
        <button class="game-btn" onclick="advanceScene()" style="margin-top:0.35em;">Next Mission ➡️</button>
      ` : `
        <p style="font-size:0.85em;color:#446;margin-top:0.4em;">💡 Hint: look for a sleepy guard, open window, weak password, and an unlocked door!</p>
      `}
    </div>`;
}

function findVuln(id) {
  state.foundVulns.add(id);
  renderGame();
}

/* ------------------------------------------------------------------
   CHOICE SCENES
------------------------------------------------------------------ */
function renderChoiceScene() {
  const data   = CHOICE_SCENES.find(s => s.id === state.scene);
  const locked = state.choiceMade;

  let extra = '';
  if (data.scroll) {
    extra = `
      <div class="scroll-visual">
        <span class="scroll-cap left">📜</span>
        <span class="scroll-cap right">📜</span>
        ${data.scrollText.map((line, i) =>
          (i === 0 || i === data.scrollText.length - 1)
            ? `<div class="scroll-flag">${line}</div>`
            : `<div>${line}</div>`
        ).join('')}
      </div>`;
  } else if (data.story) {
    extra = `<div class="story-box">"${data.story}"</div>`;
  }

  const buttons = data.choices.map((c, i) => {
    const cls = 'choice-btn' + (locked ? ' locked' + (c.correct ? ' correct' : '') : '');
    return `<button class="${cls}" ${locked ? '' : `onclick="handleChoice(${i})"`}>${c.text}</button>`;
  }).join('');

  return `
    <div class="float-in choice-layout">
      <div class="choice-left">
        ${progressDots()}
        <div class="game-heading">${data.heading}</div>
        <div class="game-subheading">${data.sub}</div>
        ${extra}
      </div>
      <div class="choice-right">
        ${buttons}
        ${locked && state.feedbackHtml ? `
          <div class="feedback-box float-in">${state.feedbackHtml}</div>
          <button class="game-btn" onclick="advanceScene()" style="margin-top:0.2em;">
            ${state.scene === 'sharing' ? '🏆 See Results!' : 'Next Mission ➡️'}
          </button>` : ''}
      </div>
    </div>`;
}

function handleChoice(idx) {
  if (state.choiceMade) return;
  const data         = CHOICE_SCENES.find(s => s.id === state.scene);
  const choice       = data.choices[idx];
  state.choiceMade   = true;
  state.feedbackHtml = choice.why;
  renderGame();
  requestAnimationFrame(() => {
    const btns = document.querySelectorAll('.choice-btn');
    if (btns[idx]) btns[idx].classList.add(choice.correct ? 'correct' : 'wrong');
  });
}

/* ------------------------------------------------------------------
   NAVIGATION
------------------------------------------------------------------ */
function advanceScene() {
  const idx          = SCENE_ORDER.indexOf(state.scene);
  state.scene        = SCENE_ORDER[idx + 1] || 'victory';
  state.choiceMade   = false;
  state.feedbackHtml = '';
  renderGame();
}

function progressDots() {
  const missions = ['castle', 'password', 'phishing', 'sharing'];
  const dots = missions.map(m => {
    const done   = SCENE_ORDER.indexOf(state.scene) > SCENE_ORDER.indexOf(m);
    const active = state.scene === m;
    return `<div class="progress-dot ${done ? 'done' : active ? 'active' : ''}"></div>`;
  }).join('');
  return `<div class="game-progress">${dots}</div>`;
}

/* ------------------------------------------------------------------
   VICTORY
------------------------------------------------------------------ */
function renderVictory() {
  return `
    <div class="float-in victory-layout">
      <div class="victory-left">
        <div class="victory-badge">🛡️</div>
        <div style="font-size:1.8em;margin:0.3em 0;">🏰 🛡️ ⚔️ 🌟</div>
      </div>
      <div class="victory-right">
        <div class="game-heading" style="font-size:1.6em;margin:0 0 0.05em;">YOU DID IT!</div>
        <div class="game-heading" style="font-size:0.98em;color:#fff;font-weight:600;margin:0 0 0.2em;">
          Official Digital Security Superhero! ⚔️🎉
        </div>
        <div class="victory-message" style="margin:0 0 0.25em;">
          <strong>Just like you</strong>, Tenable's Security Inspectors find vulnerabilities, spot phishing tricks,
          and protect passwords — for <strong style="color:var(--cyan);">40,000+ organizations</strong> around the world every single day!
        </div>
        <p style="font-size:0.85em;color:#446;margin:0 0 0.35em;">
          The world needs more cybersecurity superheroes. Maybe that's <strong style="color:var(--cyan);">YOU</strong> someday! 🚀
        </p>
        <button class="game-btn secondary" onclick="restartGame()">🔄 Play Again</button>
      </div>
    </div>`;
}

function restartGame() {
  Object.assign(state, { scene: 'intro', foundVulns: new Set(), choiceMade: false, feedbackHtml: '' });
  document.getElementById('confetti-container').innerHTML = '';
  renderGame();
}

/* ------------------------------------------------------------------
   CONFETTI
------------------------------------------------------------------ */
function launchConfetti() {
  const box = document.getElementById('confetti-container');
  box.innerHTML = '';
  const colors = ['#00f0ff', '#0099cc', '#ff6b6b', '#81c784', '#ce93d8', '#ffb74d', '#fff'];
  for (let i = 0; i < 70; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    const sz = 8 + Math.random() * 10;
    el.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${sz}px; height: ${sz}px;
      background: ${colors[i % colors.length]};
      --drift: ${(Math.random() - 0.5) * 220}px;
      animation-duration: ${2.2 + Math.random() * 2}s;
      animation-delay: ${Math.random() * 1.8}s;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
    `;
    box.appendChild(el);
  }
  setTimeout(() => { box.innerHTML = ''; }, 6000);
}

/* ------------------------------------------------------------------
   KEYBOARD INTERCEPT — prevent slide navigation while game is active
------------------------------------------------------------------ */
document.addEventListener('keydown', e => {
  const slide = Reveal.getCurrentSlide && Reveal.getCurrentSlide();
  if (
    slide &&
    slide.querySelector('#game-container') &&
    state.scene !== 'intro' &&
    (e.key === 'ArrowLeft' || e.key === 'ArrowRight')
  ) {
    e.stopImmediatePropagation();
  }
}, true);

/* ------------------------------------------------------------------
   INIT — render game when its slide becomes active
------------------------------------------------------------------ */
Reveal.on('slidechanged', e => {
  if (e.currentSlide.querySelector('#game-container')) renderGame();
});

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const s = Reveal.getCurrentSlide && Reveal.getCurrentSlide();
    if (s && s.querySelector('#game-container')) renderGame();
  }, 300);
});
