const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const memories = document.querySelectorAll('[data-reveal]');

if (!motionPreference.matches && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.remove('is-waiting');
      entry.target.classList.add('is-revealing');
      observer.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px 12% 0px' });

  for (const memory of memories) {
    if (memory.getBoundingClientRect().top > window.innerHeight) {
      memory.classList.add('is-waiting');
      revealObserver.observe(memory);
    }
  }
}

const tide = document.querySelector('.tide');
let framePending = false;

function followScroll() {
  framePending = false;
  if (motionPreference.matches) return;

  const viewport = window.innerHeight;
  if (window.scrollY < viewport) {
    tide.style.setProperty('--drift', `${window.scrollY * 0.065}px`);
  }

  const visibleMemories = [];
  for (const memory of memories) {
    const { top, bottom, height } = memory.getBoundingClientRect();
    if (bottom < 0 || top > viewport) continue;
    const position = (viewport / 2 - top - height / 2) / viewport;
    visibleMemories.push([memory, Math.max(-1, Math.min(1, position)) * 11]);
  }

  for (const [memory, drift] of visibleMemories) {
    memory.style.setProperty('--drift', `${drift}px`);
  }
}

function requestScrollFrame() {
  if (framePending || motionPreference.matches) return;
  framePending = true;
  window.requestAnimationFrame(followScroll);
}

window.addEventListener('scroll', requestScrollFrame, { passive: true });
window.addEventListener('resize', requestScrollFrame);
requestScrollFrame();
