(() => {
  const tour = document.querySelector('.room-tour');
  const stage = tour?.querySelector('.room-stage');
  const canvas = stage?.querySelector('.room-canvas');
  const camera = canvas?.querySelector('.room-camera');
  const images = camera ? [...camera.querySelectorAll('.room-light, .room-dark')] : [];
  if (!tour || !stage || !canvas || !camera || !images.length) return;

  const stops = [
    { x: .5, y: .5, zoom: 1, title: 'A whole world, built around your brand.', description: 'Explore a connected world of identity, print, packaging and digital experiences.', category: 'THE BRAND ROOM' },
    { x: .435, y: .19, zoom: 1.85, title: 'The first impression.', description: 'A distinctive mark and visual language give every touchpoint a clear point of view.', category: 'BRAND IDENTITY' },
    { x: .15, y: .60, zoom: 2.35, title: 'Identity you can carry.', description: 'Thoughtful bags and everyday objects bring your brand into people’s lives.', category: 'BAGS & MERCHANDISE' },
    { x: .50, y: .77, zoom: 2.10, title: 'Stories worth keeping.', description: 'Brochures, profiles and editorial pieces turn your story into something tangible.', category: 'PRINT & EDITORIAL' },
    { x: .595, y: .69, zoom: 2.25, title: 'Considered down to the detail.', description: 'Cards, stationery and the smallest details carry the same considered identity.', category: 'STATIONERY' },
    { x: .54, y: .38, zoom: 2.3, title: 'Made to be opened.', description: 'Packaging makes the first touch, the reveal and the product feel connected.', category: 'PACKAGING' },
    { x: .78, y: .65, zoom: 1.85, title: 'Your brand, on every screen.', description: 'Websites and digital experiences bring the identity to life in daily use.', category: 'WEB & DIGITAL' },
    { x: .86, y: .27, zoom: 1.85, title: 'A presence beyond the screen.', description: 'Signage, photography and event materials make your brand part of the real world.', category: 'EVENTS, PHOTO & FILM' },
    { x: .5, y: .5, zoom: 1, title: 'One identity. Every dimension.', description: 'Each detail belongs to one recognisable world, from the first idea to the final experience.', category: 'THE COMPLETE PICTURE' }
  ];
  const caption = stage.querySelector('.room-caption');
  const indexLabel = stage.querySelector('.room-index');
  const title = stage.querySelector('.room-title');
  const description = stage.querySelector('.room-description');
  const category = stage.querySelector('.room-category');
  const progressBar = tour.querySelector('.room-progress i');
  const previous = tour.querySelector('.room-prev');
  const next = tour.querySelector('.room-next');
  const status = tour.querySelector('.room-status');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const last = stops.length - 1;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const mix = (from, to, amount) => from + (to - from) * amount;
  let active = -1;
  let manualIndex = 0;
  let current = null;
  let animationFrame = 0;
  let previousTime = 0;
  let captionTimer = 0;
  let needsMeasure = true;
  let snapNextFrame = true;
  let geometry = { width: 0, height: 0, imageWidth: 0, imageHeight: 0, top: 0, range: 0 };

  function activate(index) {
    if (active === index) return;
    const wasActive = active >= 0;
    active = index;
    const stop = stops[index];
    const count = `${String(index + 1).padStart(2, '0')} / ${String(stops.length).padStart(2, '0')}`;
    stage.dataset.roomStep = String(index + 1);
    if (indexLabel) indexLabel.textContent = count;
    if (title) title.textContent = stop.title;
    if (description) description.textContent = stop.description;
    if (category) category.textContent = stop.category;
    if (status) status.textContent = `${index + 1} of ${stops.length}: ${stop.title}`;
    if (previous) previous.disabled = index === 0;
    if (next) next.disabled = index === last;
    clearTimeout(captionTimer);
    caption?.classList.remove('is-changing');
    if (wasActive && !reduced.matches && caption) {
      caption.classList.add('is-changing');
      captionTimer = window.setTimeout(() => caption.classList.remove('is-changing'), 220);
    }
  }

  function measure() {
    const rect = canvas.getBoundingClientRect();
    const stageStyle = window.getComputedStyle(stage);
    const top = Number.parseFloat(stageStyle.top);
    const fallbackTop = Number.parseFloat(stageStyle.getPropertyValue('--room-nav-offset'));
    const loadedImage = images.find(image => image.naturalWidth && image.naturalHeight);
    const ratio = loadedImage ? loadedImage.naturalWidth / loadedImage.naturalHeight : 1.5;
    const width = rect.width;
    const height = rect.height;
    const imageWidth = Math.min(width, height * ratio);
    const imageHeight = imageWidth / ratio;
    geometry = {
      width, height, imageWidth, imageHeight,
      top: Number.isFinite(top) ? top : (Number.isFinite(fallbackTop) ? fallbackTop : 0),
      range: Math.max(0, tour.getBoundingClientRect().height - stage.getBoundingClientRect().height)
    };
    camera.style.width = `${imageWidth}px`;
    camera.style.height = `${imageHeight}px`;
    camera.style.transformOrigin = '0 0';
    needsMeasure = false;
  }

  function readPosition() {
    if (reduced.matches || geometry.range < 1) return manualIndex;
    return clamp((geometry.top - tour.getBoundingClientRect().top) / geometry.range, 0, 1) * last;
  }

  function draw(time) {
    animationFrame = 0;
    if (needsMeasure) measure();
    if (!geometry.width || !geometry.height) return;
    const position = readPosition();
    const from = Math.floor(position);
    const to = Math.min(last, from + 1);
    const fraction = position - from;
    const eased = fraction * fraction * (3 - 2 * fraction);
    const target = {
      x: mix(stops[from].x, stops[to].x, eased),
      y: mix(stops[from].y, stops[to].y, eased),
      zoom: mix(stops[from].zoom, stops[to].zoom, eased)
    };
    activate(Math.round(position));
    const elapsed = previousTime ? clamp(time - previousTime, 0, 50) : 16.67;
    const damping = 1 - Math.exp(-elapsed / 105);
    if (!current || snapNextFrame || reduced.matches) current = { ...target };
    else {
      current.x = mix(current.x, target.x, damping);
      current.y = mix(current.y, target.y, damping);
      current.zoom = mix(current.zoom, target.zoom, damping);
    }
    snapNextFrame = false;
    previousTime = time;
    const { width, height, imageWidth, imageHeight } = geometry;
    const scaledWidth = imageWidth * current.zoom;
    const scaledHeight = imageHeight * current.zoom;
    const x = scaledWidth <= width ? (width - scaledWidth) / 2 : clamp(width / 2 - scaledWidth * current.x, width - scaledWidth, 0);
    const y = scaledHeight <= height ? (height - scaledHeight) / 2 : clamp(height / 2 - scaledHeight * current.y, height - scaledHeight, 0);
    camera.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${current.zoom.toFixed(5)})`;
    if (progressBar) progressBar.style.transform = `scaleX(${((position + 1) / stops.length).toFixed(5)})`;
    if (Math.abs(current.x - target.x) > .00003 || Math.abs(current.y - target.y) > .00003 || Math.abs(current.zoom - target.zoom) > .0001) schedule();
    else previousTime = 0;
  }

  function schedule() {
    if (!animationFrame) animationFrame = window.requestAnimationFrame(draw);
  }

  function refresh() {
    needsMeasure = true;
    snapNextFrame = true;
    schedule();
  }

  function go(index) {
    manualIndex = clamp(index, 0, last);
    if (needsMeasure) measure();
    if (reduced.matches || geometry.range < 1) {
      snapNextFrame = true;
      schedule();
      return;
    }
    const top = window.scrollY + tour.getBoundingClientRect().top - geometry.top + geometry.range * manualIndex / last;
    window.scrollTo({ top, behavior: 'smooth' });
    schedule();
  }

  previous?.addEventListener('click', () => go(active - 1));
  next?.addEventListener('click', () => go(active + 1));
  stage.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    const actions = { ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: last };
    if (!(event.key in actions)) return;
    event.preventDefault();
    go(actions[event.key]);
  });
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', refresh, { passive: true });
  images.forEach(image => image.addEventListener('load', refresh));
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(refresh);
    observer.observe(tour);
    observer.observe(stage);
    observer.observe(canvas);
  }
  if (document.fonts?.ready) document.fonts.ready.then(refresh);
  const onMotionChange = () => {
    manualIndex = Math.max(0, active);
    clearTimeout(captionTimer);
    caption?.classList.remove('is-changing');
    refresh();
  };
  if (reduced.addEventListener) reduced.addEventListener('change', onMotionChange);
  else if (reduced.addListener) reduced.addListener(onMotionChange);
  activate(0);
  schedule();
})();
