import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Canvas
const canvas = document.getElementById("three-canvas");

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.8;

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Store clicked planet
let selectedPlanet = null;
let isFlyingToPlanet = false;

// Camera
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  5000
);

const HOME_POSITION = new THREE.Vector3(0, 50, 200);   // or whatever your default was
const HOME_TARGET = new THREE.Vector3(0, 0, 0);


// Start camera near center
camera.position.set(0.001, 0.001, 0.7);
camera.lookAt(0, 0, 0);

// Controls 
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);

controls.enableDamping = true;
controls.dampingFactor = 0.05;

controls.autoRotate = true;
controls.autoRotateSpeed = 0.65;

// Stop auto-rotate on interaction
window.addEventListener("pointerdown", () => controls.autoRotate = false);
window.addEventListener("wheel", () => controls.autoRotate = false);

// Lighting
const light1 = new THREE.DirectionalLight(0xffffff, 1.1);
light1.position.set(50, 50, 50);
scene.add(light1);

const light2 = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(light2);

// GLTF Loader
const loader = new GLTFLoader();
const modelURL = "https://raw.githubusercontent.com/soap2705/ExogenicArchive/main/assets/SolarSystemAtAGlance.glb";

loader.load(
  modelURL,
  (gltf) => {
    const model = gltf.scene;
    model.scale.set(10, 10, 10);
    scene.add(model);
    console.log("GLB loaded!");
  },
  undefined,
  (err) => console.error("GLB failed to load", err)
);
window.addEventListener("pointerdown", onClickPlanet);

function onClickPlanet(event) {
  // Normalize mouse position for raycasting
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // IMPORTANT: Intersect the entire scene
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    // Get the mesh that was clicked
    selectedPlanet = intersects[0].object;

    console.log("Planet clicked:", selectedPlanet.name);

    // Now start the camera fly animation
    startFlyToPlanet(selectedPlanet);
  }
}

function startFlyToPlanet(planet) {
  isFlyingToPlanet = true;

  // Turn off autorotate while flying
  controls.autoRotate = false;

  // Target world position of planet
  const target = new THREE.Vector3();
  planet.getWorldPosition(target);

  // Where camera should end up (slightly away from surface)
  const cameraTarget = target.clone().add(new THREE.Vector3(0, 10, 30));

  // Animation params
  const duration = 60; // frames ~1 second
  let frame = 0;

  const startPos = camera.position.clone();
  const startTarget = controls.target.clone();

  function animateFly() {
    if (!isFlyingToPlanet) return;

    frame++;
    const t = Math.min(frame / duration, 1);

    // smooth interpolation
    camera.position.lerpVectors(startPos, cameraTarget, t);
    controls.target.lerpVectors(startTarget, target, t);
    controls.update();

    if (t < 1) {
      requestAnimationFrame(animateFly);
    } else {
      // Stop flying once arrived
      isFlyingToPlanet = false;
      console.log("Arrived at planet:", planet.name);
    }
  }

  animateFly();
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    returnToHome();
  }
});

function returnToHome() {
  isFlyingToPlanet = true;   // reuse same flag so animation interrupts correctly

  const duration = 60; // frames (~1 second)
  let frame = 0;

  const startPos = camera.position.clone();
  const startTarget = controls.target.clone();

  function animateReturn() {
    frame++;
    const t = Math.min(frame / duration, 1);

    camera.position.lerpVectors(startPos, HOME_POSITION, t);
    controls.target.lerpVectors(startTarget, HOME_TARGET, t);
    controls.update();

    if (t < 1) {
      requestAnimationFrame(animateReturn);
    } else {
      // restore autorotate
      controls.autoRotate = true;
      isFlyingToPlanet = false;
      console.log("Returned to home.");
    }
  }

  animateReturn();
}

// Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animate
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
