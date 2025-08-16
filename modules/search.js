const searchInput = document.querySelector(".search__input");
const searchEngines = document.querySelectorAll(".engine");
let selectedEngine = null; // store the last clicked engine

searchEngines.forEach(engine => {
    engine.addEventListener("click", () => {
        selectedEngine = engine.getAttribute("data-engine");
        performSearch();
    });
});

searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && selectedEngine) {
        event.preventDefault(); // stop form submission
        performSearch();
    }
});

function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;
    const url = getSearchEngineUrl(selectedEngine, query);
    window.open(url, "_blank");
}

function getSearchEngineUrl(engine, query) {
    switch (engine) {
        default:
            eturn `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        case "google":
            return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        case "bing":
            return `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
        case "duckduckgo":
            return `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
    }
}
