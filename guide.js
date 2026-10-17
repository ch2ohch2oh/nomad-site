const tocLinks = [...document.querySelectorAll('.contents-links a[href^="#"]')];
const targets = [...document.querySelectorAll('[data-toc]')];
const mobileContents = document.querySelector('.mobile-contents');

const revealAncestors = target => {
  for (let node = target; node; node = node.parentElement) {
    if (node.matches('details')) node.open = true;
  }
};
const followHash = () => {
  const target = document.getElementById(location.hash.slice(1));
  if (!target) return;
  revealAncestors(target);
  requestAnimationFrame(() => {
    target.scrollIntoView({block: 'start', behavior: 'instant'});
    const focusTarget = target.matches('details') ? target.querySelector(':scope > summary') : target;
    if (!focusTarget.matches('summary') && !focusTarget.hasAttribute('tabindex')) focusTarget.setAttribute('tabindex', '-1');
    focusTarget.focus({preventScroll: true});
  });
};
document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  const target = document.getElementById(link.hash.slice(1));
  if (!target) return;
  if (link.closest('.mobile-contents')) mobileContents.open = false;
  revealAncestors(target);
  // Clicking an already selected link still returns to its heading.
  if (location.hash === link.hash) followHash();
});
window.addEventListener('hashchange', followHash);
if (location.hash) followHash();

let scrollPending = false;
const updateReadingPosition = () => {
  scrollPending = false;
  if (!targets.length) return;
  let current = targets[0];
  for (const target of targets) {
    if (target.getBoundingClientRect().top <= 160) current = target;
  }
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) current = targets.at(-1);
  const currentId = current.id === 'further-reading' && document.getElementById('glossary').getBoundingClientRect().top <= 160 ? 'glossary' : current.id;
  tocLinks.forEach(link => {
    const active = link.hash === `#${currentId}`;
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
};
const scheduleReadingPosition = () => {
  if (!scrollPending) {
    scrollPending = true;
    requestAnimationFrame(updateReadingPosition);
  }
};
window.addEventListener('scroll', scheduleReadingPosition, {passive: true});
window.addEventListener('resize', scheduleReadingPosition);
document.addEventListener('toggle', scheduleReadingPosition, true);
updateReadingPosition();
