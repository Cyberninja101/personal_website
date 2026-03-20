const projects = [
  {
    num: '01',
    tag: 'Robotics · Leadership',
    name: 'Mars Rover Autonomy',
    desc: 'Led 8-person subteam building a ROS 2 autonomy stack with GPS + vision for autonomous desert navigation at the University Rover Competition.',
    stack: ['ROS 2', 'OpenCV', 'C++', 'Python'],
    link: 'https://youtu.be/rAKKBc-94Zk?t=146',
    image: 'photos/project-rover.png',
    classified: false,
  },
  {
    num: '02',
    tag: 'HPC · Research',
    name: 'Cerebras / HPC Lab',
    desc: 'Building sparse linear algebra and graph kernels on the Cerebras WSE-3 for large-scale HPC workloads.',
    stack: ['WSE-3', 'C++', 'Sparse LA'],
    link: 'https://www.cerebras.ai/',
    image: 'photos/cerebras.png',
    imgClass: 'proj-card-img--contain',
    classified: false,
  },
  {
    num: '03',
    tag: 'ML · Defense',
    name: 'Navy Radar Tracking',
    desc: 'Custom Transformer for time-series radar target tracking on next-gen US Navy ships, validated with Monte Carlo simulations.',
    stack: ['PyTorch', 'Transformers', 'Python'],
    link: null,
    image: null,
    classified: true,
  },
  {
    num: '04',
    tag: 'SWE · Defense',
    name: 'Missile Defense Chatbot',
    desc: 'LLM assistant for APL Air & Missile Defense Sector — fine-tuned LLaMA-7B with RAG over doctrine documents.',
    stack: ['Flask', 'LLaMA-7B', 'RAG'],
    link: 'https://github.com/Cyberninja101/FalconAI',
    image: 'photos/chatbot.png',
    imgClass: 'proj-card-img--top',
    classified: false,
  },
  {
    num: '05',
    tag: 'Hackathon · 24 Hours',
    name: 'GroovyAR (1st Place)',
    desc: 'Built a real-time AR rhythm coach/game that turns any MP3 into playable drum cues. 1st place overall — Cornell × ASML hackathon.',
    stack: ['Raspberry Pi', 'Flask', 'React', 'OpenCV'],
    link: 'https://github.com/Cyberninja101/Groovy',
    image: 'photos/groovy.png',
    classified: false,
  },
  {
    num: '06',
    tag: 'Startup · Co-Founder',
    name: 'MintBox',
    desc: 'Community sustainability startup — 300+ kits deployed, $2.5k+ raised, NYC schools, senior centers, and shelters.',
    stack: ['Co-Founder', 'Fusion 360', 'Sustainability'],
    link: 'https://mintboxny.com/',
    image: 'photos/project-mintbox.png',
    classified: false,
  },
];

// ── Render project feed ────────────────────────────────────────
function renderFeed() {
  const feed = document.getElementById('proj-feed');
  feed.innerHTML = projects.map((p, i) => {
    const imgInner = p.classified
      ? `<div class="proj-card-img proj-card-img--classified"><span class="classified-label">CLASSIFIED</span></div>`
      : `<div class="proj-card-img${p.imgClass ? ' ' + p.imgClass : ''}"><img src="${p.image}" alt="${p.name}" /></div>`;

    const imgHtml = p.link
      ? `<a class="proj-card-img-link" href="${p.link}" target="_blank" rel="noopener noreferrer">${imgInner}</a>`
      : imgInner;

    const linkHtml = p.link
      ? `<a class="proj-card-link" href="${p.link}" target="_blank" rel="noopener noreferrer">View Project ↗</a>`
      : `<span class="proj-card-confidential">Confidential</span>`;

    const stackHtml = p.stack.map(s => `<span>${s}</span>`).join('');

    return `
      <article class="proj-card" data-index="${i}">
        ${imgHtml}
        <div class="proj-card-body" data-num="${p.num}">
          <span class="proj-card-tag">${p.tag}</span>
          <h3 class="proj-card-title">${p.name}</h3>
          <p class="proj-card-desc">${p.desc}</p>
          <div class="proj-card-footer">
            <div class="proj-card-stack">${stackHtml}</div>
            ${linkHtml}
          </div>
        </div>
      </article>`;
  }).join('');
}

// ── Scroll dots ────────────────────────────────────────────────
function initDots() {
  const feed  = document.getElementById('proj-feed');
  const cards = document.querySelectorAll('.proj-card');
  const wrap  = document.createElement('div');
  wrap.className = 'proj-dots';

  projects.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.className = 'proj-dot';
    btn.setAttribute('aria-label', `Go to project ${i + 1}`);
    btn.addEventListener('click', () => {
      cards[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    wrap.appendChild(btn);
  });

  feed.appendChild(wrap);
}

// ── Scroll tracking — recomputes state fresh on every scroll tick ──
function initScrollTracking() {
  const feed    = document.getElementById('proj-feed');
  const cards   = document.querySelectorAll('.proj-card');
  const outside = document.querySelector('.outside');
  const getDots = () => document.querySelectorAll('.proj-dot');

  let rafId  = null;
  let lastActiveIdx = -1;
  let hasPassedFirstCard = false;

  function update() {
    const vh         = window.innerHeight;
    const firstRect  = cards[0].getBoundingClientRect();
    const outsideRect = outside.getBoundingClientRect();

    // Remember once first card has scrolled fully above viewport
    if (firstRect.bottom < 0) hasPassedFirstCard = true;
    if (firstRect.top > vh)   hasPassedFirstCard = false; // jumped back above

    // Active card: ≥60% visible within center 64% of viewport
    const margin = vh * 0.18;
    let activeIdx = -1;
    cards.forEach((card, i) => {
      const r = card.getBoundingClientRect();
      const visible = Math.max(0, Math.min(r.bottom, vh - margin) - Math.max(r.top, margin));
      if (visible / r.height >= 0.6) activeIdx = i;
    });

    // Appear when first card's top is in upper 40% of viewport (card roughly centered)
    const scrolledIntoFeed = firstRect.top < vh * 0.4;

    // Leave on scroll up: hide only when first card is almost fully back in view
    const backAtStart  = hasPassedFirstCard && firstRect.bottom > vh * 0.92;

    // Disappear at bottom: when outside section top reaches 70% down viewport
    const pastOutside  = outsideRect.top < vh * 0.7;

    const showDots = activeIdx >= 0 && scrolledIntoFeed && !backAtStart && !pastOutside;

    feed.classList.toggle('has-active', showDots);

    // Only update DOM when something changed
    const effectiveIdx = showDots ? activeIdx : -1;
    if (effectiveIdx !== lastActiveIdx) {
      cards.forEach((c, i) => c.classList.toggle('card--active', i === effectiveIdx));
      getDots().forEach((d, i) => d.classList.toggle('proj-dot--active', i === effectiveIdx));
      lastActiveIdx = effectiveIdx;
    }
  }

  window.addEventListener('scroll', () => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(update);
  }, { passive: true });

  update(); // initial state on load
}

renderFeed();
initDots();
initScrollTracking();

// ── Rotating tagline — typewriter ─────────────────────────────
(function () {
  const words = ['move.', 'track.', 'compute.', 'navigate.', 'reason.'];
  const el = document.getElementById('rotating-word');
  if (!el) return;

  let wordIndex = 0;
  let charIndex = words[0].length; // first word already shown in HTML
  let isDeleting = true;

  function tick() {
    const current = words[wordIndex];

    if (isDeleting) {
      charIndex--;
      el.textContent = current.slice(0, charIndex);
    } else {
      charIndex++;
      el.textContent = current.slice(0, charIndex);
    }

    let delay = isDeleting ? 50 : 90;

    if (!isDeleting && charIndex === current.length) {
      delay = 1800; // hold full word
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      delay = 220;
    }

    setTimeout(tick, delay);
  }

  setTimeout(tick, 2400); // pause before first deletion
})();

// ── Typewriter: "Active Secret Clearance" ──────────────────────
(function () {
  const text = 'Active Secret Clearance';
  const el   = document.getElementById('typewriter');
  let i = 0;

  setTimeout(function type() {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(type, 52);
    }
  }, 500);
})();
