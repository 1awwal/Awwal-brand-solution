(() => {
  const tour = document.querySelector('.room-tour');
  const stage = tour?.querySelector('.room-stage');
  const canvas = stage?.querySelector('.room-canvas');
  const camera = canvas?.querySelector('.room-camera');
  const images = camera ? [...camera.querySelectorAll('.room-light, .room-dark')] : [];
  if (!tour || !stage || !canvas || !camera || !images.length) return;

  const stops = [
    { x: .5, y: .5, zoom: 1, title: 'A whole world, built around your brand.', description: 'Explore a connected world of identity, print, packaging and digital experiences.', category: 'THE BRAND ROOM' },
    { x: .435, y: .19, zoom: 1.7, title: 'The first impression.', description: 'A distinctive mark and visual language give every touchpoint a clear point of view.', category: 'BRAND IDENTITY' },
    { x: .15, y: .60, zoom: 2.35, title: 'Identity you can carry.', description: 'Thoughtful bags and everyday objects bring your brand into people’s lives.', category: 'BAGS & MERCHANDISE' },
    { x: .50, y: .77, zoom: 2.10, title: 'Stories worth keeping.', description: 'Brochures, profiles and editorial pieces turn your story into something tangible.', category: 'PRINT & EDITORIAL' },
    { x: .595, y: .69, zoom: 2.25, title: 'Considered down to the detail.', description: 'Cards, stationery and the smallest details carry the same considered identity.', category: 'STATIONERY' },
    { x: .54, y: .38, zoom: 2.3, title: 'Made to be opened.', description: 'Packaging makes the first touch, the reveal and the product feel connected.', category: 'PACKAGING' },
    { x: .78, y: .65, zoom: 1.85, title: 'Your brand, on every screen.', description: 'Websites and digital experiences bring the identity to life in daily use.', category: 'WEB & DIGITAL' },
    { x: .86, y: .27, zoom: 1.85, title: 'A presence beyond the screen.', description: 'Signage, photography and event materials make your brand part of the real world.', category: 'EVENTS, PHOTO & FILM' },
    { x: .5, y: .5, zoom: 1, title: 'One identity. Every dimension.', description: 'Each detail belongs to one recognisable world, from the first idea to the final experience.', category: 'THE COMPLETE PICTURE' }
  ];
  const MAX_STOP_ZOOM = 2.35;
  // Camera feel. HOLD is the share of each scroll segment spent resting on a stop, at either end.
  const HOLD = .15;
  const FOLLOW_MS = 150;      // how quickly the camera catches up with the scroll position
  const POINTER_MS = 420;     // how softly the camera leans towards the pointer
  const POINTER_SHIFT = .014; // share of the image the pointer can shift the view by
  const DRIFT_ZOOM = .012;    // idle "breathing" so a resting frame never looks frozen
  const DRIFT_PERIOD = 15000;

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
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const last = stops.length - 1;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const mix = (from, to, amount) => from + (to - from) * amount;
  const smoother = t => t * t * t * (t * (t * 6 - 15) + 10);
  let active = -1;
  let manualIndex = 0;
  let current = null;
  let pointer = { x: 0, y: 0 };
  let pointerTarget = { x: 0, y: 0 };
  let animationFrame = 0;
  let scrollFrame = 0;
  let previousTime = 0;
  let captionTimer = 0;
  let needsMeasure = true;
  let snapNextFrame = true;
  let visible = true;
  let geometry = { width: 0, height: 0, imageWidth: 0, imageHeight: 0, zoomScale: 1, top: 0, range: 0 };

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
    const imageWidth = width / height >= 1.2 ? Math.max(width, height * ratio) : Math.min(width, height * ratio);
    const imageHeight = imageWidth / ratio;
    // Close-ups are scaled to what the photo can carry on this screen. A large retina display
    // still gets a clear push-in (never less than 1.6x) instead of no zoom at all; smaller or
    // standard displays get the full close-ups.
    const density = window.devicePixelRatio || 1;
    const sharpZoom = loadedImage && imageWidth > 0 ? loadedImage.naturalWidth / (imageWidth * density) : 1;
    const zoomCap = clamp(sharpZoom * 1.9, 1.6, MAX_STOP_ZOOM);
    geometry = {
      width, height, imageWidth, imageHeight,
      zoomScale: (zoomCap - 1) / (MAX_STOP_ZOOM - 1),
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

  const view = index => ({ x: stops[index].x, y: stops[index].y, zoom: 1 + (stops[index].zoom - 1) * geometry.zoomScale });

  // Where the camera should be for a scroll position: rest on each stop, then fly to the next
  // one on an eased path, pulling back slightly mid-flight so long moves read as one gesture.
  function cameraAt(position) {
    const from = Math.min(last, Math.floor(position));
    const to = Math.min(last, from + 1);
    const travel = smoother(clamp((position - from - HOLD) / (1 - 2 * HOLD), 0, 1));
    const a = view(from);
    const b = view(to);
    const distance = Math.hypot(b.x - a.x, b.y - a.y);
    const pullBack = Math.min(.2, distance * .45) * Math.sin(Math.PI * travel);
    const zoom = Math.exp(mix(Math.log(a.zoom), Math.log(b.zoom), travel)) * (1 - pullBack);
    return { x: mix(a.x, b.x, travel), y: mix(a.y, b.y, travel), zoom: Math.max(1, zoom) };
  }

  function draw(time) {
    animationFrame = 0;
    if (needsMeasure) measure();
    if (!geometry.width || !geometry.height) return;
    const position = readPosition();
    const target = cameraAt(position);
    activate(Math.round(position));
    const still = reduced.matches;
    const elapsed = previousTime ? clamp(time - previousTime, 0, 50) : 16.67;
    if (!current || snapNextFrame || still) {
      current = { ...target };
      pointer = still ? { x: 0, y: 0 } : { ...pointerTarget };
    } else {
      const follow = 1 - Math.exp(-elapsed / FOLLOW_MS);
      current.x = mix(current.x, target.x, follow);
      current.y = mix(current.y, target.y, follow);
      current.zoom = Math.exp(mix(Math.log(current.zoom), Math.log(target.zoom), follow));
      const lean = 1 - Math.exp(-elapsed / POINTER_MS);
      pointer.x = mix(pointer.x, pointerTarget.x, lean);
      pointer.y = mix(pointer.y, pointerTarget.y, lean);
    }
    snapNextFrame = false;
    previousTime = time;

    const alive = !still && visible;
    const breath = alive ? Math.sin((time / DRIFT_PERIOD) * Math.PI * 2) : 0;
    const zoom = current.zoom * (1 + DRIFT_ZOOM * (1 + breath) / 2);
    const focusX = current.x + (alive ? pointer.x * POINTER_SHIFT / zoom : 0);
    const focusY = current.y + (alive ? pointer.y * POINTER_SHIFT / zoom : 0);
    const { width, height, imageWidth, imageHeight } = geometry;
    const scaledWidth = imageWidth * zoom;
    const scaledHeight = imageHeight * zoom;
    const x = scaledWidth <= width ? (width - scaledWidth) / 2 : clamp(width / 2 - scaledWidth * focusX, width - scaledWidth, 0);
    const y = scaledHeight <= height ? (height - scaledHeight) / 2 : clamp(height / 2 - scaledHeight * focusY, height - scaledHeight, 0);
    camera.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${zoom.toFixed(5)})`;
    if (progressBar) progressBar.style.transform = `scaleX(${((position + 1) / stops.length).toFixed(5)})`;

    const settling = Math.abs(current.x - target.x) > .00003 || Math.abs(current.y - target.y) > .00003 || Math.abs(current.zoom - target.zoom) > .0001;
    if (alive || settling) schedule();
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

  function stopScrollAnimation() {
    if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
    scrollFrame = 0;
  }

  // Button and keyboard moves use one eased glide, so the camera flight has time to play out.
  function glideTo(top) {
    stopScrollAnimation();
    const start = window.scrollY;
    const distance = top - start;
    if (Math.abs(distance) < 2) return;
    const duration = clamp(700 + Math.abs(distance) * .35, 900, 1700);
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    let began = 0;
    const step = time => {
      if (!began) began = time;
      const t = clamp((time - began) / duration, 0, 1);
      const eased = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      window.scrollTo(0, start + distance * eased);
      if (t < 1) scrollFrame = window.requestAnimationFrame(step);
      else { scrollFrame = 0; root.style.scrollBehavior = previousBehavior; }
    };
    scrollFrame = window.requestAnimationFrame(step);
  }

  function go(index) {
    manualIndex = clamp(index, 0, last);
    if (needsMeasure) measure();
    if (reduced.matches || geometry.range < 1) {
      snapNextFrame = true;
      schedule();
      return;
    }
    glideTo(window.scrollY + tour.getBoundingClientRect().top - geometry.top + geometry.range * manualIndex / last);
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
  ['wheel', 'touchstart', 'pointerdown'].forEach(type => window.addEventListener(type, event => {
    if (type === 'pointerdown' && event.target.closest('.room-actions')) return;
    stopScrollAnimation();
  }, { passive: true }));
  stage.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !finePointer.matches) return;
    const rect = stage.getBoundingClientRect();
    pointerTarget = {
      x: clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1),
      y: clamp((event.clientY - rect.top) / rect.height * 2 - 1, -1, 1)
    };
    schedule();
  }, { passive: true });
  stage.addEventListener('pointerleave', () => { pointerTarget = { x: 0, y: 0 }; schedule(); }, { passive: true });
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', refresh, { passive: true });
  images.forEach(image => image.addEventListener('load', refresh));
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(refresh);
    observer.observe(tour);
    observer.observe(stage);
    observer.observe(canvas);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible) schedule();
    }).observe(stage);
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) schedule(); });
  if (document.fonts?.ready) document.fonts.ready.then(refresh);
  const onMotionChange = () => {
    manualIndex = Math.max(0, active);
    clearTimeout(captionTimer);
    caption?.classList.remove('is-changing');
    stopScrollAnimation();
    refresh();
  };
  if (reduced.addEventListener) reduced.addEventListener('change', onMotionChange);
  else if (reduced.addListener) reduced.addListener(onMotionChange);
  activate(0);
  schedule();
})();
