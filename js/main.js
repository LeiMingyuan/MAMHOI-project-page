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
  'cropped_largebox',
  'cropped_smallbox',
  'demo-21_path-000_largebox',
  'demo-21_path-003_largetable',
  'demo-21_path-003_smallbox',
  'demo-21_path-005_clothesstand',
  'demo-21_path-008_largebox',
  'demo-21_path-008_whitechair',
  'demo-22_path-000_largebox',
  'demo-22_path-002_largebox',
  'demo-22_path-003_clothesstand',
  'demo-22_path-004_floorlamp',
  'demo-22_path-008_largetable',
  'demo-25_path-001_largebox',
  'demo-25_path-001_smallbox',
  'demo-25_path-003_largetable',
  'demo-25_path-003_whitechair',
  'demo-25_path-005_floorlamp'
];

const comparisonPrompt = 'Pick up the object, Move the object and put the object down';
const comparisonVideos = [...document.querySelectorAll('[data-method]')];
const comparisonCounter = document.querySelector('#comparison-counter');
const comparisonGroupName = document.querySelector('#comparison-group-name');
const comparisonPromptNode = document.querySelector('#comparison-prompt');
const comparisonDots = document.querySelector('#comparison-dots');
let activeComparison = 0;

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
    video.play().catch(() => {});
  });

  if (comparisonPromptNode) comparisonPromptNode.textContent = `“${comparisonPrompt}”`;
  if (comparisonGroupName) comparisonGroupName.textContent = group;
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
