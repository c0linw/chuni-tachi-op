(async () => {
    if (location.origin !== "https://kamai.tachi.ac") {
        return;
    }

    const songsByID = new Map();
    const pbsByChartID = new Map();

    const version = 'sun';

    const urls = [
        "https://raw.githubusercontent.com/zkrising/Tachi/refs/heads/main/seeds/collections/charts-chunithm.json",
        "https://raw.githubusercontent.com/zkrising/Tachi/refs/heads/main/seeds/collections/songs-chunithm.json",
        "/api/v1/users/me"
    ]
    const responses = await Promise.all(urls.map((url) => fetch(url).then((r) => r.json())));

    const allCharts = responses[0].filter((chart) => (chart.difficulty == "MASTER" || chart.difficulty == "ULTIMA") && chart.versions.includes(version));

    const allSongs = responses[1];

    const { username, id } = responses[2].body;

    const { pbs, songs, charts } = await fetch(`/api/v1/users/${id}/games/chunithm/Single/pbs/all?alg=rating`)
        .then((r) => r.json())
        .then((r) => r.body);

    for (const song of allSongs) {
        songsByID.set(song.id, song);
    }

    for (const pb of pbs) {
        pbsByChartID.set(pb.chartID, pb);
    }

    const filteredPbs = [];
    for (const chart of allCharts) {
        if (pbsByChartID.has(chart.chartID)) {
            filteredPbs.push(pbsByChartID.get(chart.chartID));
        }
    }

    const data = {
        "pbs": filteredPbs,
        "charts": allCharts,
        "songs": allSongs
    }

    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chunithm-player-data-sun.json`;
    a.click();
    a.remove();
})();