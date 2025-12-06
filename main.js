import { initScene, onPlanetClick } from "./js/threeScene.js";
import { initAuth, isGuestMode, getUser } from "./js/auth.js";
import { loadPlanetEntries } from "./js/database.js";
import { showLoginUI, showJournalUI } from "./js/ui.js";

// Initialize everything
initScene();

// UI
showLoginUI();
initAuth();

//onplanetclick function
onPlanetClick(async (planetName) => {
    const user = await getUser();
    showJournalUI(planetName);
    loadPlanetEntries(planetName, user);
});
