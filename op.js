// javascript:(function(d){if(location.origin=="https://kamai.tachi.ac"){var s=d.createElement("script");s.src="https://raw.githack.com/c0linw/chuni-tachi-op/refs/heads/main/op.js";d.body.append(s);}})(document)

(async () => {
    if (location.origin !== "https://kamai.tachi.ac") {
        return;
    }

    function calculateMaxOP(chart) {
        let songName = songsByID.get(chart.songID).title
        let constant = constants.hasOwnProperty(songName) ? constants[songName] : chart.levelNum;
        return (constant + 3) * 5;
    }

    function calculatePlayerOP(chart) {
        if (!pbsByChartID.has(chart.chartID)) {
            return 0;
        }
        const pb = pbsByChartID.get(chart.chartID);
        let lampBonus = 0;
        switch (pb.scoreData.lamp) {
            case "ALL JUSTICE CRITICAL":
                lampBonus = 1.25;
                break;
            case "ALL JUSTICE":
                lampBonus = 1.0;
                break;
            case "FULL COMBO":
                lampBonus = 0.5;
                break;
        }
        let scoreBonus = pb.scoreData.score > 1007500 ? (pb.scoreData.score - 1007500) * 0.0015 : 0;

        let songName = songsByID.get(chart.songID).title

        let playRating = Math.min(pb.calculatedData.rating, chart.levelNum + 2);

        // adjust play rating if version cc is different from latest cc
        if (constants.hasOwnProperty(songName)) {
            playRating -= chart.levelNum - constants[songName]
        }

        return playRating * 5 + lampBonus + scoreBonus;
    }

    const songsByID = new Map();
    const pbsByChartID = new Map();
    let maxOP = 0;
    let playerOP = 0;
    let playCount = 0;

    const ccURLs = {
        "newplus": "https://raw.githubusercontent.com/Dogeon188/chuni-tools/refs/heads/master/docs/data/song-const/newplus.json",
        "sun": "https://raw.githubusercontent.com/Dogeon188/chuni-tools/refs/heads/master/docs/data/song-const/sun.json",
        "sunplus": "https://raw.githubusercontent.com/Dogeon188/chuni-tools/refs/heads/master/docs/data/song-const/sunplus.json",
        "luminous": "https://raw.githubusercontent.com/Dogeon188/chuni-tools/refs/heads/master/docs/data/song-const/luminous.json"
    }
    const version = prompt('Select version (supported versions: "newplus", "sun", "sunplus", "luminous")', "sun");
    if (version == null || !ccURLs.hasOwnProperty(version)) {
        alert("Unsupported game version");
        return;
    }

    const constants = await fetch(ccURLs[version])
        .then((r) => r.json());

    const allCharts = await fetch("https://raw.githubusercontent.com/zkrising/Tachi/refs/heads/main/seeds/collections/charts-chunithm.json")
        .then((r) => r.json())
        .then((r) => r.filter((chart) => (chart.difficulty == "MASTER" || chart.difficulty == "ULTIMA") && chart.versions.includes(version)));

    const { username, id } = await fetch("/api/v1/users/me")
        .then((r) => r.json())
        .then((r) => r.body);

    const { pbs, songs, charts } = await fetch(`/api/v1/users/${id}/games/chunithm/Single/pbs/all?alg=rating`)
        .then((r) => r.json())
        .then((r) => r.body);

    for (const song of songs) {
        songsByID.set(song.id, song);
    }

    for (const pb of pbs) {
        pbsByChartID.set(pb.chartID, pb);
    }

    for (const chart of allCharts) {
        maxOP += calculateMaxOP(chart);
        if (pbsByChartID.has(chart.chartID)) {
            playerOP += calculatePlayerOP(chart);
            playCount++
        }
    }

    alert(`Your OP for version "${version}" is ${playerOP.toFixed(4)}/${maxOP} (${(playerOP / maxOP * 100).toFixed(4)}%)\nCharts played: ${playCount}/${allCharts.length || "0"}`);
})();
