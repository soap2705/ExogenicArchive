import { initScene, onPlanetClick } from "./js/threeScene.js";
import { initAuth, getUser } from "./js/auth.js";
import { loadPlanetEntries } from "./js/database.js";
import { showJournalUI } from "./js/ui.js";

initScene();
initAuth();

onPlanetClick(async (planetName) => {
    const user = await getUser();
    showJournalUI(planetName);
    loadPlanetEntries(planetName, user);
});
