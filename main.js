console.log("JS is running!");

// Three.js imports from unpkg
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.164.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.164.0/examples/jsm/controls/OrbitControls.js";

// Supabase import from esm.sh (web-native, no npm)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://rcmvcwcaiekcxeqzldgh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_DEi-boPg6PzlS0BmznpinQ_O8W5eWyw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log("Supabase connected:", supabase);

let scene, camera, renderer, controls;

init();
loadSolarSystem();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const canvas = document.getElementById("three-canvas");
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    5000
  );
  camera.position.set(0, 50, 200);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 30;
  controls.maxDistance = 500;

  const light = new THREE.PointLight(0xffffff, 2);
  light.position.set(0, 0, 0);
  scene.add(light);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function loadSolarSystem() {
  const loader = new GLTFLoader();
  loader.load(
    "assets/SolarSystemAtAGlance.glb",
    (gltf) => {
      const model = gltf.scene;
      model.scale.set(10, 10, 10);
      scene.add(model);
    },
    undefined,
    (err) => {
      console.error("GLB failed to load", err);
    }
  );
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
