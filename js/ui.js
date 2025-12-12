export function showJournalUI(planetName) {
    const panel = document.getElementById("journal-panel");
    document.getElementById("journal-planet-title").textContent = planetName;

    panel.classList.remove("hidden");

    document.getElementById("close-journal").onclick = () => {
        panel.classList.add("hidden");
    };
}

export function displayEntries(entries) {
    const container = document.getElementById("journal-entries");

    container.innerHTML = entries.map(e => `
        <div class="entry">
            <h3>${e.title || "(Untitled Entry)"}</h3>
            <p>${e.content || ""}</p>
            ${
                e.image_urls
                    ? e.image_urls.map(url => `<img src="${url}">`).join("")
                    : ""
            }
        </div>
    `).join("");
}
