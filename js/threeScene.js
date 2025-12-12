import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { getPlanetByBlenderName } from "./database.js";

let scene, camera, renderer, controls;
let solarSystem = null;
let planetClickCallback = () => {};
let isFlyingToPlanet = false;

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
    controls.autoRotateSpeed = 1.2;

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dir = new THREE.DirectionalLight(0xffffff, 1.5);
    dir.position.set(60, 80, 40);
    scene.add(dir);

    new GLTFLoader().load(
        "./assets/SolarSystemAtAGlanceWebFix.glb",
        (gltf) => {
            solarSystem = gltf.scene;
            solarSystem.scale.set(10, 10, 10);
            scene.add(solarSystem);
        }
    );

    window.addEventListener("pointerdown", handleClick);
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", e => e.key === "Escape" && resetCamera());

    animate();
}

async function handleClick(event) {
    if (!solarSystem) return;

    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const hits = raycaster.intersectObjects(solarSystem.children, true);
    if (!hits.length) return;

    const planet = hits[0].object;

    flyToPlanet(planet);

    const planetData = await getPlanetByBlenderName(planet.name);
    planetClickCallback(planetData.display_name);
}

function flyToPlanet(planet) {
    controls.autoRotate = false;
    isFlyingToPlanet = true;

    const sphere = new THREE.Sphere();
    new THREE.Box3().setFromObject(planet).getBoundingSphere(sphere);

    const target = sphere.center.clone();
    const distance = sphere.radius * 1.3;

    const dir = new THREE.Vector3()
        .subVectors(camera.position, target)
        .normalize();

    const finalPos = target.clone().add(dir.multiplyScalar(distance));
    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();

    let frame = 0;
    const duration = 35;

    function animateFly() {
        frame++;
        let t = frame / duration;
        t = 1 - Math.pow(1 - t, 3);

        camera.position.lerpVectors(startPos, finalPos, t);
        controls.target.lerpVectors(startTarget, target, t);
        controls.update();

        if (t < 1) requestAnimationFrame(animateFly);
        else isFlyingToPlanet = false;
    }

    animateFly();
}

function resetCamera() {
    controls.autoRotate = true;

    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    const HOME_POS = new THREE.Vector3(0, 50, 200);
    const HOME_TARGET = new THREE.Vector3(0, 0, 0);

    let frame = 0;
    const duration = 50;

    function animateHome() {
        frame++;
        let t = frame / duration;
        t = 1 - Math.pow(1 - t, 3);

        camera.position.lerpVectors(startPos, HOME_POS, t);
        controls.target.lerpVectors(startTarget, HOME_TARGET, t);
        controls.update();

        if (t < 1) requestAnimationFrame(animateHome);
    }

    animateHome();
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
