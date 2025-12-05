import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// load in

const canvas = document.getElementById("three-canvas");

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1; // brighter overall

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  5000
);

// Camera starts near the center
camera.position.set(0.001, 0.001, 0.7);
camera.lookAt(0, 0, 0);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.2;

// global standards and setup

let solarSystem = null;
let isFlyingToPlanet = false;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const HOME_POSITION = new THREE.Vector3(0, 50, 200);
const HOME_TARGET = new THREE.Vector3(0, 0, 0);

//lighting

const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(60, 80, 40);
dirLight.castShadow = false;
scene.add(dirLight);

const ambient = new THREE.AmbientLight(0xffffff, 0.9);
scene.add(ambient);

const hemi = new THREE.HemisphereLight(0xffffff, 0x222233, 0.6);
scene.add(hemi);

// load glb

const loader = new GLTFLoader();
const modelURL =
  "https://raw.githubusercontent.com/soap2705/ExogenicArchive/main/assets/SolarSystemAtAGlance.glb";

loader.load(
  modelURL,
  (gltf) => {
    solarSystem = gltf.scene;
    solarSystem.scale.set(10, 10, 10);
    scene.add(solarSystem);
    console.log("GLB loaded!");
  },
  undefined,
  (err) => console.error("GLB failed to load", err)
);

// handling input

window.addEventListener("pointerdown", (event) => {
  if (!solarSystem) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(solarSystem.children, true);

  if (intersects.length > 0) {
    const planet = intersects[0].object;
    startFlyToPlanet(planet);
  }

  controls.autoRotate = false;
});

// camera fly to planet

function startFlyToPlanet(planet) {
  isFlyingToPlanet = true;
  controls.autoRotate = false;

  const boundingSphere = new THREE.Sphere();
  new THREE.Box3().setFromObject(planet).getBoundingSphere(boundingSphere);

  const target = boundingSphere.center.clone();
  const radius = boundingSphere.radius;

  const distance = radius * 1.2;

  const direction = new THREE.Vector3()
    .subVectors(camera.position, target)
    .normalize();

  const cameraTargetPos = target.clone().add(direction.multiplyScalar(distance));

  const duration = 30; 
  let frame = 0;

  const startPos = camera.position.clone();
  const startTarget = controls.target.clone();

  function animateFly() {
    if (!isFlyingToPlanet) return;

    frame++;
    let t = frame / duration;

    t = 1 - Math.pow(1 - t, 3);

    camera.position.lerpVectors(startPos, cameraTargetPos, t);
    controls.target.lerpVectors(startTarget, target, t);
    controls.update();

    if (t < 1) {
      requestAnimationFrame(animateFly);
    } else {
      isFlyingToPlanet = false;
    }
  }

  animateFly();
}

//escape to return home

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    returnToHome();
  }
});

function returnToHome() {
  isFlyingToPlanet = true;

  const duration = 45;
  let frame = 0;

  const startPos = camera.position.clone();
  const startTarget = controls.target.clone();

  function animateReturn() {
    frame++;
    let t = frame / duration;

    t = 1 - Math.pow(1 - t, 3); // easeOutCubic

    camera.position.lerpVectors(startPos, HOME_POSITION, t);
    controls.target.lerpVectors(startTarget, HOME_TARGET, t);
    controls.update();

    if (t < 1) {
      requestAnimationFrame(animateReturn);
    } else {
      controls.autoRotate = true;
      isFlyingToPlanet = false;
    }
  }

  animateReturn();
}

//loop and resize

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
