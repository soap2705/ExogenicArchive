import { initScene, onPlanetClick } from "./js/threeScene.js";
import { initAuth, getUser } from "./js/auth.js";
import { loadPlanetEntries } from "./js/database.js";

// Initialize 3D scene
initScene();

// Initialize UI + Auth
initAuth();

// When a planet is clicked:
onPlanetClick(async (planetName) => {
    const user = await getUser();
    showJournalUI(planetName);
    loadPlanetEntries(planetName, user);
});
