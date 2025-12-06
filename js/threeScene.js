import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let scene, camera, renderer, controls;
let solarSystem = null;
let planetClickCallback = () => {};

export function initScene() {
    const canvas = document.getElementById("three-canvas");

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.set(0.001, 0.001, 0.7);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dir = new THREE.DirectionalLight(0xffffff, 1.2);
    dir.position.set(60, 80, 40);
    scene.add(dir);

    // Load GLB
    new GLTFLoader().load(
        "./assets/SolarSystemAtAGlance.glb",
        (gltf) => {
            solarSystem = gltf.scene;
            solarSystem.scale.set(10, 10, 10);
            scene.add(solarSystem);
        }
    );

    window.addEventListener("pointerdown", handleClick);
    window.addEventListener("resize", resize);

    animate();
}

function handleClick(event) {
    if (!solarSystem) return;

    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const hits = raycaster.intersectObjects(solarSystem.children, true);
    if (hits.length > 0) {
        planetClickCallback(hits[0].object.name || "Unknown");
    }
}

export function onPlanetClick(callback) {
    planetClickCallback = callback;
}

function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
