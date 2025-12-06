import { initScene, onPlanetClick } from "./js/threeScene.js";
import { initAuth, getUser } from "./js/auth.js";
import { loadPlanetEntries } from "./js/database.js";
import { showLoginUI, showJournalUI } from "./js/ui.js";

// Initialize 3D scene
initScene();

// Initialize UI + Auth
showLoginUI();
initAuth();

// When a planet is clicked:
onPlanetClick(async (planetName) => {
    const user = await getUser();
    showJournalUI(planetName);
    loadPlanetEntries(planetName, user);
});
