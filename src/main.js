import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { REGIONS } from './data.js';

// ---------------------------------------------------------------------------
//  Scene / renderer / camera
// ---------------------------------------------------------------------------
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.localClippingEnabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.set(2.4, 0.5, 1.6);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = false;
controls.minDistance = 0.6;
controls.maxDistance = 8;

// ---------------------------------------------------------------------------
//  Custom cursor (follower ring + dot; reacts to hover / drag)
// ---------------------------------------------------------------------------
const cursorRing = document.getElementById('cursor-ring');
const cursorDot = document.getElementById('cursor-dot');
const cursorEnabled = matchMedia('(pointer: fine)').matches;
let cursorMode = 'default';      // canvas-driven: default | grab | grabbing | marker
let domHover = false;            // hovering an interactive DOM element
const cursorPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
const ringPos = { x: cursorPos.x, y: cursorPos.y };

function refreshCursor() {
  const hover = domHover || cursorMode === 'marker';
  cursorRing.classList.toggle('hover', hover);
  cursorRing.classList.toggle('grabbing', !hover && cursorMode === 'grabbing');
}

if (cursorEnabled) {
  document.body.classList.add('cursor-on');
  window.addEventListener('mousemove', (e) => {
    cursorPos.x = e.clientX;
    cursorPos.y = e.clientY;
    cursorDot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    const inter = !!e.target.closest('button, a, input, .sr-item');
    if (inter !== domHover) { domHover = inter; refreshCursor(); }
  });
  document.addEventListener('mouseleave', () => {
    cursorRing.classList.add('cursor-hidden');
    cursorDot.classList.add('cursor-hidden');
  });
  document.addEventListener('mouseenter', () => {
    cursorRing.classList.remove('cursor-hidden');
    cursorDot.classList.remove('cursor-hidden');
  });
}

// soft image-based lighting gives the brain a sculptural, studio-lit look,
// layered on top of hemisphere fill so it stays bright everywhere
const pmrem = new THREE.PMREMGenerator(renderer);
try { scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; } catch (e) {}
scene.add(new THREE.HemisphereLight(0xffffff, 0xc9bfae, 1.5));

// directional key + warm rim to bring out surface form
const key = new THREE.DirectionalLight(0xfff6e8, 1.9);
key.position.set(2.5, 3.5, 2.5);
scene.add(key);
const fill = new THREE.DirectionalLight(0xffffff, 0.45);
fill.position.set(-2.5, 0.5, -1.5);
scene.add(fill);
const rim = new THREE.DirectionalLight(0xffffff, 0.8);
rim.position.set(-1, 1.5, -3);
scene.add(rim);

// ---------------------------------------------------------------------------
//  Clipping plane (driven by view buttons + slice slider)
// ---------------------------------------------------------------------------
const clipPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 10);
const VIEW_NORMALS = {
  sagittal:   new THREE.Vector3(-1, 0, 0),
  coronal:    new THREE.Vector3(0, 0, -1),
  horizontal: new THREE.Vector3(0, -1, 0)
};

// ---------------------------------------------------------------------------
//  Brain model
// ---------------------------------------------------------------------------
const brainGroup = new THREE.Group();
scene.add(brainGroup);

let brainMaterials = [];
let modelRadius = 1;
let halfSize = new THREE.Vector3(1, 1, 1);
const markers = [];
const markerGeo = new THREE.SphereGeometry(0.022, 24, 24);

const loader = new GLTFLoader();
loader.load(
  '/models/brain.glb',
  (gltf) => { setupModel(gltf.scene); document.getElementById('loader').style.display = 'none'; },
  undefined,
  (err) => {
    console.warn('GLB failed to load, using procedural brain.', err);
    setupModel(buildProceduralBrain());
    document.getElementById('loader').style.display = 'none';
  }
);

function setupModel(root) {
  // normalise: centre at origin, scale so the largest dimension ~= 2 units
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  const scale = 2 / Math.max(size.x, size.y, size.z);

  root.position.sub(center);
  const wrap = new THREE.Group();
  wrap.add(root);
  wrap.scale.setScalar(scale);
  // This model's longest (anterior-posterior) axis is its native X and width is Z.
  // Rotate so front-back aligns with +Z and left-right with X — matching the
  // anatomical convention used for markers and the sagittal/coronal/horizontal views.
  wrap.rotation.y = -Math.PI / 2;
  brainGroup.add(wrap);

  // recompute bounds after scaling
  const box2 = new THREE.Box3().setFromObject(brainGroup);
  box2.getSize(halfSize);
  halfSize.multiplyScalar(0.5);
  modelRadius = box2.getBoundingSphere(new THREE.Sphere()).radius;

  // give the brain a soft anatomical material + register for clipping/opacity
  root.traverse((o) => {
    if (o.isMesh) {
      const mat = o.material && o.material.map
        ? o.material
        : new THREE.MeshStandardMaterial({ color: 0xe7d9bf, roughness: 0.62, metalness: 0.0, envMapIntensity: 0.9 });
      mat.side = THREE.DoubleSide;
      mat.flatShading = false;
      mat.clippingPlanes = [clipPlane];
      mat.clipShadows = true;
      mat.transparent = true;
      mat.opacity = 1;
      o.material = mat;
      brainMaterials.push(mat);
    }
  });

  placeMarkers();
  setView('sagittal', false);
  frameCamera();
  applyViewOffset();
}

function placeMarkers() {
  REGIONS.forEach((region) => {
    const m = new THREE.Mesh(
      markerGeo,
      new THREE.MeshBasicMaterial({ color: 0x2b2b2b })
    );
    m.position.set(
      region.pos[0] * halfSize.x * 1.04,
      region.pos[1] * halfSize.y * 1.04,
      region.pos[2] * halfSize.z * 1.04
    );
    m.userData.region = region;
    // a faint halo ring
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.028, 0.038, 28),
      new THREE.MeshBasicMaterial({ color: 0x2b2b2b, side: THREE.DoubleSide, transparent: true, opacity: 0.35 })
    );
    ring.userData.isRing = true;
    m.add(ring);
    brainGroup.add(m);
    markers.push(m);
  });
}

// procedural fallback: lumpy sphere that reads as a brain
function buildProceduralBrain() {
  const geo = new THREE.IcosahedronGeometry(1, 24);
  const p = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = v.clone().normalize();
    const gyri =
      0.10 * Math.sin(n.x * 18) * Math.cos(n.y * 16) +
      0.08 * Math.sin(n.y * 22 + n.z * 10) +
      0.06 * Math.cos(n.z * 20 - n.x * 12);
    v.addScaledVector(n, gyri);
    if (n.x > 0.02 && n.x < 0.08) v.addScaledVector(n, -0.05); // longitudinal fissure
    p.setXYZ(i, v.x, v.y * 0.92, v.z * 1.18);
  }
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xd9cbb6, roughness: 0.9 }));
  const g = new THREE.Group();
  g.add(mesh);
  return g;
}

// ---------------------------------------------------------------------------
//  Selection / highlight
// ---------------------------------------------------------------------------
let selectedId = null;

function selectRegion(id, fly = true) {
  const region = REGIONS.find((r) => r.id === id);
  if (!region) return;
  selectedId = id;
  if (history.replaceState) history.replaceState(null, '', `#${id}`);
  renderInfo(region);
  markers.forEach((m) => {
    const on = m.userData.region.id === id;
    m.material.color.set(on ? 0xc0392b : 0x2b2b2b);
    m.scale.setScalar(on ? 1.5 : 1);
    m.children[0].material.opacity = on ? 0.6 : 0.35;
  });
  if (fly) flyToMarker(region);
}

function flyToMarker(region) {
  const target = new THREE.Vector3(
    region.pos[0] * halfSize.x,
    region.pos[1] * halfSize.y,
    region.pos[2] * halfSize.z
  ).applyMatrix4(brainGroup.matrixWorld);
  const dir = target.clone().normalize();
  const dest = target.clone().add(dir.multiplyScalar(modelRadius * 2.7));
  animateCamera(dest, new THREE.Vector3(0, 0, 0));
}

// ---------------------------------------------------------------------------
//  Camera helpers
// ---------------------------------------------------------------------------
let camAnim = null;
function animateCamera(toPos, toTarget) {
  camAnim = { from: camera.position.clone(), to: toPos, fromT: controls.target.clone(), toT: toTarget, t: 0 };
}

function frameCamera() {
  const d = modelRadius * 3.1;
  // classic 3/4 lateral view (mostly along +X, the left-right axis)
  camera.position.set(d * 0.9, d * 0.16, d * 0.42);
  controls.target.set(0, -modelRadius * 0.05, 0);
  controls.update();
}

// shift the rendered scene to the right so the brain clears the left info panel
function applyViewOffset() {
  const w = window.innerWidth, h = window.innerHeight;
  const shift = w > 760 ? w * 0.17 : 0; // px to push content right
  camera.setViewOffset(w, h, -shift, 0, w, h);
}

function setView(view, fly = true) {
  document.querySelectorAll('.view-btn').forEach((b) =>
    b.classList.toggle('active', b.dataset.view === view)
  );
  clipPlane.normal.copy(VIEW_NORMALS[view]);
  applySlice();
  if (fly) {
    const d = modelRadius * 3.1;
    const dest = {
      sagittal:   new THREE.Vector3(d, 0, 0.01),
      coronal:    new THREE.Vector3(0.01, 0, d),
      horizontal: new THREE.Vector3(0.01, d, 0.01)
    }[view];
    animateCamera(dest, new THREE.Vector3(0, 0, 0));
  }
  currentView = view;
}
let currentView = 'sagittal';

function applySlice() {
  const v = parseInt(document.getElementById('slider-slice').value, 10) / 100; // 0..1
  // v=1 -> whole brain visible; lower -> cut deeper toward centre
  clipPlane.constant = -modelRadius + v * (modelRadius * 2);
}

// ---------------------------------------------------------------------------
//  Raycasting (click markers)
// ---------------------------------------------------------------------------
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hovering = false;

function updatePointer(e) {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
}

canvas.addEventListener('pointermove', (e) => {
  updatePointer(e);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(markers, false);
  hovering = hit.length > 0;
  cursorMode = hovering ? 'marker' : 'grab';
  refreshCursor();
});

canvas.addEventListener('pointerdown', () => { if (!hovering) { cursorMode = 'grabbing'; refreshCursor(); } });
canvas.addEventListener('pointerup', (e) => {
  updatePointer(e);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(markers, false);
  if (hit.length) selectRegion(hit[0].object.userData.region.id, false);
  cursorMode = hovering ? 'marker' : 'grab';
  refreshCursor();
});

// ---------------------------------------------------------------------------
//  Sidebar info rendering
// ---------------------------------------------------------------------------
function renderInfo(region) {
  document.getElementById('info-title').textContent = region.name;
  document.getElementById('info-desc').textContent = region.desc;
  const refs = region.refs.map((r) => `<li>${r}</li>`).join('');
  document.getElementById('info-refs').innerHTML =
    `<h4>References</h4><ol>${refs}</ol>`;
}

// ---------------------------------------------------------------------------
//  Search
// ---------------------------------------------------------------------------
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

function renderSearch(q) {
  const query = q.trim().toLowerCase();
  const list = query
    ? REGIONS.filter((r) => r.name.toLowerCase().includes(query) || r.group.toLowerCase().includes(query))
    : REGIONS;
  searchResults.innerHTML = list
    .map((r) => `<button class="sr-item" data-id="${r.id}"><span>${r.name}</span><small>${r.group}</small></button>`)
    .join('') || '<div class="sr-empty">No matching area</div>';
  searchResults.classList.add('open');
}

searchInput.addEventListener('focus', () => renderSearch(searchInput.value));
searchInput.addEventListener('input', () => renderSearch(searchInput.value));
searchResults.addEventListener('mousedown', (e) => {
  const btn = e.target.closest('.sr-item');
  if (!btn) return;
  e.preventDefault();
  selectRegion(btn.dataset.id, true);
  searchInput.value = '';
  searchResults.classList.remove('open');
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('.search')) searchResults.classList.remove('open');
});

// ---------------------------------------------------------------------------
//  Controls wiring
// ---------------------------------------------------------------------------
document.querySelectorAll('.view-btn').forEach((b) =>
  b.addEventListener('click', () => setView(b.dataset.view, true))
);

document.getElementById('slider-slice').addEventListener('input', applySlice);
document.getElementById('slider-opacity').addEventListener('input', (e) => {
  const o = parseInt(e.target.value, 10) / 100;
  brainMaterials.forEach((m) => { m.opacity = o; m.transparent = o < 1; });
});

function zoom(factor) {
  const dir = camera.position.clone().sub(controls.target);
  const dist = THREE.MathUtils.clamp(dir.length() * factor, controls.minDistance, controls.maxDistance);
  camera.position.copy(controls.target).add(dir.setLength(dist));
  controls.update();
}
document.getElementById('zoom-in').addEventListener('click', () => zoom(0.8));
document.getElementById('zoom-out').addEventListener('click', () => zoom(1.25));

document.getElementById('info-toggle').addEventListener('click', () => {
  document.getElementById('info-card').classList.toggle('collapsed');
});

document.getElementById('help-btn').addEventListener('click', () => {
  alert('Help & Instructions\n\n• Drag to rotate the brain\n• Scroll or use +/− to zoom\n• Click a marker, or search, to read about a region\n• Sagittal / Horizontal / Coronal set the cross-section plane\n• The first slider cuts a cross-section; the second sets opacity\n• Download screenshot saves the current view as a PNG');
});

// ---------------------------------------------------------------------------
//  Ask Neurotorium (local canned assistant)
// ---------------------------------------------------------------------------
const askPanel = document.getElementById('ask-panel');
const askBody = document.getElementById('ask-body');
function openAsk() {
  askPanel.hidden = false;
  if (!askBody.childElementCount) addAsk('bot', 'Hi! Ask me about any brain region — try “What does the hippocampus do?”');
}
document.getElementById('ask-bubble').addEventListener('click', openAsk);
document.getElementById('ask-avatar').addEventListener('click', openAsk);
document.getElementById('ask-close').addEventListener('click', () => (askPanel.hidden = true));
function addAsk(who, text) {
  const el = document.createElement('div');
  el.className = `ask-msg ${who}`;
  el.textContent = text;
  askBody.appendChild(el);
  askBody.scrollTop = askBody.scrollHeight;
}
document.getElementById('ask-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('ask-input');
  const q = input.value.trim();
  if (!q) return;
  addAsk('user', q);
  input.value = '';
  const match = REGIONS.find((r) =>
    q.toLowerCase().includes(r.name.split(':').pop().trim().toLowerCase().split(' ')[0]) ||
    r.name.toLowerCase().split(' ').some((w) => w.length > 4 && q.toLowerCase().includes(w))
  );
  setTimeout(() => {
    if (match) { addAsk('bot', match.desc); selectRegion(match.id, true); }
    else addAsk('bot', 'I focus on the regions in this atlas. Try asking about the prefrontal cortex, hippocampus, amygdala, cerebellum, thalamus or visual cortex.');
  }, 350);
});

// ---------------------------------------------------------------------------
//  Orientation gizmo (mini scene)
// ---------------------------------------------------------------------------
const gizmoCanvas = document.getElementById('gizmo-canvas');
const gRenderer = new THREE.WebGLRenderer({ canvas: gizmoCanvas, antialias: true, alpha: true });
gRenderer.setSize(74, 74);
gRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
const gScene = new THREE.Scene();
const gCam = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
gScene.add(new THREE.HemisphereLight(0xffffff, 0x888888, 1.2));
const gLight = new THREE.DirectionalLight(0xffffff, 1.2); gLight.position.set(2, 3, 2); gScene.add(gLight);
const gCube = new THREE.LineSegments(
  new THREE.EdgesGeometry(new THREE.BoxGeometry(2, 2, 2)),
  new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })
);
gScene.add(gCube);
const gBrain = new THREE.Mesh(
  buildProceduralBrain().children[0].geometry,
  new THREE.MeshStandardMaterial({ color: 0xd9cbb6, roughness: 0.9 })
);
gBrain.scale.setScalar(0.7);
gScene.add(gBrain);

// ---------------------------------------------------------------------------
//  Animation loop
// ---------------------------------------------------------------------------
function animate() {
  requestAnimationFrame(animate);

  if (camAnim) {
    camAnim.t = Math.min(1, camAnim.t + 0.06);
    const e = 1 - Math.pow(1 - camAnim.t, 3); // easeOutCubic
    camera.position.lerpVectors(camAnim.from, camAnim.to, e);
    controls.target.lerpVectors(camAnim.fromT, camAnim.toT, e);
    if (camAnim.t >= 1) camAnim = null;
  }

  controls.update();

  // billboard the marker rings toward the camera
  markers.forEach((m) => m.children[0].lookAt(camera.position));

  renderer.render(scene, camera);

  // sync gizmo to main camera orientation
  const dir = camera.position.clone().sub(controls.target).normalize();
  gCam.position.copy(dir.multiplyScalar(6));
  gCam.lookAt(0, 0, 0);
  gRenderer.render(gScene, gCam);

  // smooth-follow cursor ring
  if (cursorEnabled) {
    ringPos.x += (cursorPos.x - ringPos.x) * 0.2;
    ringPos.y += (cursorPos.y - ringPos.y) * 0.2;
    cursorRing.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
  }
}
animate();

// ---------------------------------------------------------------------------
//  Resize + boot
// ---------------------------------------------------------------------------
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  applyViewOffset();
});

// initial selection — honour a #region-id deep link, else prefrontal cortex
const initialId = REGIONS.some((r) => r.id === location.hash.slice(1))
  ? location.hash.slice(1)
  : 'prefrontal-cortex';
renderInfo(REGIONS.find((r) => r.id === initialId));
setTimeout(() => selectRegion(initialId, initialId !== 'prefrontal-cortex'), 500);

window.addEventListener('hashchange', () => {
  const id = location.hash.slice(1);
  if (id && id !== selectedId && REGIONS.some((r) => r.id === id)) selectRegion(id, true);
});
