import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

//setup code

const canvas = document.getElementById("three-canvas");

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.8;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  5000
);

// Camera starts near the center for intro orbit
camera.position.set(0.001, 0.001, 0.7);
camera.lookAt(0, 0, 0);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.65;


let solarSystem = null;
let isFlyingToPlanet = false;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const HOME_POSITION = new THREE.Vector3(0, 50, 200);   
const HOME_TARGET = new THREE.Vector3(0, 0, 0);


const light1 = new THREE.DirectionalLight(0xffffff, 1.1);
light1.position.set(50, 50, 50);
scene.add(light1);

const light2 = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(light2);

// load glb in

const loader = new GLTFLoader();
const modelURL = "https://raw.githubusercontent.com/soap2705/ExogenicArchive/main/assets/SolarSystemAtAGlance.glb";

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

//inputhandling

// input handling
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

//camera flying to planet controls

function startFlyToPlanet(planet) {
  isFlyingToPlanet = true;

  // Compute bounding sphere for proper zoom framing
  const boundingSphere = new THREE.Sphere();
  new THREE.Box3().setFromObject(planet).getBoundingSphere(boundingSphere);

  const target = boundingSphere.center.clone();
  const radius = boundingSphere.radius;

  const minDistance = radius * 1.3;
  const maxDistance = radius * 2.2;
  const distance = THREE.MathUtils.clamp(radius * 1.6, minDistance, maxDistance);

  const direction = new THREE.Vector3()
    .subVectors(camera.position, target)
    .normalize();

  const cameraTargetPos = target.clone().add(direction.multiplyScalar(distance));

  const duration = 60;
  let frame = 0;

  const startPos = camera.position.clone();
  const startTarget = controls.target.clone();

  function animateFly() {
    if (!isFlyingToPlanet) return;

    frame++;
    const t = Math.min(frame / duration, 1);

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



window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    returnToHome();
  }
});

function returnToHome() {
  isFlyingToPlanet = true;

  const duration = 60;
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
      controls.autoRotate = true;
      isFlyingToPlanet = false;
    }
  }

  animateReturn();
}

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
