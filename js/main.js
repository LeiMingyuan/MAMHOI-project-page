const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('#nav-links');

navToggle?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(open));
});

navLinks?.addEventListener('click', (event) => {
  if (event.target.matches('a')) {
    navLinks.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }
});

document.querySelectorAll('.media-frame img').forEach((image) => {
  const markMissing = () => image.closest('.media-frame')?.classList.add('is-missing');
  image.addEventListener('error', markMissing);
  if (image.complete && image.naturalWidth === 0) markMissing();
});

document.querySelectorAll('.video-shell video').forEach((video) => {
  const shell = video.closest('.video-shell');
  const button = shell?.querySelector('.video-control');
  video.addEventListener('loadeddata', () => shell?.classList.add('has-video'));
  button?.addEventListener('click', async () => {
    if (video.paused) {
      await video.play();
      button.textContent = 'Pause';
      button.setAttribute('aria-label', button.getAttribute('aria-label').replace('Play', 'Pause'));
    } else {
      video.pause();
      button.textContent = 'Play';
      button.setAttribute('aria-label', button.getAttribute('aria-label').replace('Pause', 'Play'));
    }
  });
});

document.querySelectorAll('[data-placeholder-link]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    link.animate([{ transform: 'translateY(-2px)' }, { transform: 'translateY(-2px) scale(.96)' }, { transform: 'translateY(-2px)' }], { duration: 260 });
  });
  link.title = 'Replace this placeholder URL before publishing';
});

document.querySelector('.copy-button')?.addEventListener('click', async (event) => {
  const button = event.currentTarget;
  const target = document.getElementById(button.dataset.copyTarget);
  await navigator.clipboard.writeText(target.innerText);
  button.textContent = 'Copied';
  setTimeout(() => { button.textContent = 'Copy'; }, 1600);
});

const comparisonGroups = [
  'demo-21_path-000_largebox',
  'demo-21_path-003_largetable',
  'demo-21_path-003_smallbox',
  'demo-21_path-005_clothesstand',
  'demo-21_path-008_largebox',
  'demo-22_path-000_largebox',
  'demo-22_path-002_largebox',
  'demo-22_path-003_clothesstand',
  'demo-22_path-004_floorlamp',
  'demo-22_path-008_largetable',
  'demo-25_path-001_largebox',
  'demo-25_path-003_largetable',
  'demo-25_path-003_whitechair'
];

const comparisonPrompts = [
  'Pick up the large box, walk between the sofas and the table, and place it down.',
  'Lift the large table, carry it to the corner, and place it down.',
  'Pick up the small box, carry it into the corner, and place it down.',
  'Lift the clothes stand, carry it into the next room, and place it beside the sofa.',
  'Pick up the large box, carry it around the table once, and place it down.',
  'Pick up the large box, carry it around the table once, and place it down.',
  'Pick up the large box, carry it around the sofa, and place it beside the door.',
  'Lift the clothes stand, carry it past the table, and place it beside the door.',
  'Lift the floor lamp, carry it through the space between the sofa and the table, and place it beside the door.',
  'Lift the large table, carry it to the other side of the bed, and place it down.',
  'Pick up the large box, carry it through the chairs, and place it on the other side of the table.',
  'Lift the table, move it to the bedside, and place it down.',
  'Pick up the chair, move it to the bedside, and place it down.'
];
const comparisonVideos = [...document.querySelectorAll('[data-method]')];
const comparisonCounter = document.querySelector('#comparison-counter');
const comparisonPromptNode = document.querySelector('#comparison-prompt');
const comparisonDots = document.querySelector('#comparison-dots');
const affordanceVideo = document.querySelector('[data-affordance]');
const oursVideo = document.querySelector('[data-method="Ours"]');
const affordanceCompare = document.querySelector('#affordance-compare');
const affordanceSlider = document.querySelector('#affordance-slider');
const affordanceDivider = document.querySelector('#affordance-divider');
const affordanceViewButtons = [...document.querySelectorAll('[data-affordance-view]')];
let activeComparison = 0;

function setAffordanceSplit(value) {
  const clampedValue = Math.max(0, Math.min(100, Number(value)));
  affordanceCompare?.style.setProperty('--affordance-split', `${clampedValue}%`);
  if (affordanceSlider) {
    affordanceSlider.value = String(clampedValue);
    affordanceSlider.setAttribute('aria-valuetext', `${Math.round(clampedValue)}% affordance`);
  }
  if (affordanceDivider) {
    affordanceDivider.setAttribute('aria-valuenow', String(Math.round(clampedValue)));
    affordanceDivider.setAttribute('aria-valuetext', `${Math.round(clampedValue)}% affordance`);
  }
  affordanceViewButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(Number(button.dataset.affordanceView) === clampedValue));
  });
}

affordanceSlider?.addEventListener('input', () => {
  setAffordanceSplit(affordanceSlider.value);
});

function setSplitFromPointer(event) {
  if (!affordanceCompare) return;
  const bounds = affordanceCompare.getBoundingClientRect();
  setAffordanceSplit(((event.clientX - bounds.left) / bounds.width) * 100);
}

affordanceDivider?.addEventListener('pointerdown', (event) => {
  event.preventDefault();
  affordanceDivider.setPointerCapture(event.pointerId);
  affordanceDivider.classList.add('is-dragging');
  setSplitFromPointer(event);
});
affordanceDivider?.addEventListener('pointermove', (event) => {
  if (affordanceDivider.hasPointerCapture(event.pointerId)) setSplitFromPointer(event);
});
affordanceDivider?.addEventListener('pointerup', (event) => {
  if (affordanceDivider.hasPointerCapture(event.pointerId)) affordanceDivider.releasePointerCapture(event.pointerId);
  affordanceDivider.classList.remove('is-dragging');
});
affordanceDivider?.addEventListener('pointercancel', () => affordanceDivider.classList.remove('is-dragging'));
affordanceDivider?.addEventListener('keydown', (event) => {
  const currentValue = Number(affordanceSlider?.value ?? 50);
  if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') setAffordanceSplit(currentValue - 2);
  else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') setAffordanceSplit(currentValue + 2);
  else if (event.key === 'Home') setAffordanceSplit(0);
  else if (event.key === 'End') setAffordanceSplit(100);
  else return;
  event.preventDefault();
});

affordanceViewButtons.forEach((button) => {
  button.addEventListener('click', () => setAffordanceSplit(button.dataset.affordanceView));
});

function syncAffordanceVideo(force = false) {
  if (!oursVideo || !affordanceVideo || !Number.isFinite(oursVideo.currentTime)) return;
  const drift = Math.abs(affordanceVideo.currentTime - oursVideo.currentTime);
  if (force || drift > 0.08) affordanceVideo.currentTime = oursVideo.currentTime;
  affordanceVideo.playbackRate = oursVideo.playbackRate;
}

oursVideo?.addEventListener('play', () => {
  syncAffordanceVideo(true);
  affordanceVideo?.play().catch(() => {});
});
oursVideo?.addEventListener('pause', () => affordanceVideo?.pause());
oursVideo?.addEventListener('seeking', () => syncAffordanceVideo(true));
oursVideo?.addEventListener('ratechange', () => syncAffordanceVideo());
affordanceVideo?.addEventListener('loadedmetadata', () => syncAffordanceVideo(true));
window.setInterval(() => {
  if (oursVideo && !oursVideo.paused) syncAffordanceVideo();
}, 250);

comparisonGroups.forEach((group, index) => {
  const dot = document.createElement('button');
  dot.className = 'carousel-dot';
  dot.type = 'button';
  dot.setAttribute('aria-label', `Show comparison ${index + 1}: ${group}`);
  dot.addEventListener('click', () => showComparison(index));
  comparisonDots?.appendChild(dot);
});

function showComparison(index) {
  activeComparison = (index + comparisonGroups.length) % comparisonGroups.length;
  const group = comparisonGroups[activeComparison];

  comparisonVideos.forEach((video) => {
    const method = video.dataset.method;
    video.src = `assets/videos/comparison/${group}/${method}_penetration.mp4`;
    video.load();
  });

  if (affordanceVideo) {
    affordanceVideo.src = `assets/videos/comparison/${group}/Ours_penetration_affordance.mp4`;
    affordanceVideo.load();
  }

  comparisonVideos.forEach((video) => video.play().catch(() => {}));
  affordanceVideo?.play().catch(() => {});

  if (comparisonPromptNode) comparisonPromptNode.textContent = `“${comparisonPrompts[activeComparison]}”`;
  if (comparisonCounter) comparisonCounter.textContent = `${activeComparison + 1} / ${comparisonGroups.length}`;
  document.querySelectorAll('.carousel-dot').forEach((dot, dotIndex) => {
    dot.classList.toggle('is-active', dotIndex === activeComparison);
    dot.setAttribute('aria-current', dotIndex === activeComparison ? 'true' : 'false');
  });
}

document.querySelector('#comparison-prev')?.addEventListener('click', () => showComparison(activeComparison - 1));
document.querySelector('#comparison-next')?.addEventListener('click', () => showComparison(activeComparison + 1));
document.addEventListener('keydown', (event) => {
  if (!document.querySelector('.comparison-carousel:hover')) return;
  if (event.key === 'ArrowLeft') showComparison(activeComparison - 1);
  if (event.key === 'ArrowRight') showComparison(activeComparison + 1);
});
if (comparisonVideos.length) showComparison(0);

const paperSections = [...document.querySelectorAll('[data-section]')];
const sideNavLinks = [...document.querySelectorAll('[data-section-link]')];
if (paperSections.length && 'IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    sideNavLinks.forEach((link) => {
      const active = link.dataset.sectionLink === visible.target.dataset.section;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-22% 0px -58% 0px', threshold: [0, 0.2, 0.6] });
  paperSections.forEach((section) => sectionObserver.observe(section));
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reducedMotion || !('IntersectionObserver' in window)) {
  document.querySelectorAll('.reveal').forEach((item) => item.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((item) => observer.observe(item));
}
