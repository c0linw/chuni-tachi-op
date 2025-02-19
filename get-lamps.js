(async () => {
    function abbreviateLamp(lamp) {
        switch (lamp) {
            case "ALL JUSTICE CRITICAL":
                return "AJC";
            case "ALL JUSTICE":
                return "AJ";
            case "FULL COMBO":
                return "FC";
            default:
                return "";
        }
    }

    if (location.origin !== "https://kamai.tachi.ac") {
        return;
    }

    const songsByID = new Map();
    const pbsByChartID = new Map();

    const urls = [
        "https://raw.githubusercontent.com/zkrising/Tachi/refs/heads/main/seeds/collections/charts-chunithm.json",
        "https://raw.githubusercontent.com/zvuc/otoge-db/refs/heads/master/chunithm/data/music-ex.json",
        "/api/v1/users/me"
    ]
    const responses = await Promise.all(urls.map((url) => fetch(url).then((r) => r.json())));

    const allCharts = responses[0].filter((chart) => (chart.difficulty == "MASTER" || chart.difficulty == "ULTIMA" || (chart.difficulty == "EXPERT" && chart.levelNum >= 13.5)));

    const verseData = responses[1];

    const { username, id } = responses[2].body;

    const { pbs, songs, charts } = await fetch(`/api/v1/users/${id}/games/chunithm/Single/pbs/all?alg=rating`)
        .then((r) => r.json())
        .then((r) => r.body);

    for (const song of verseData) {
        songsByID.set(song.id, song);
    }

    for (const pb of pbs) {
        pbsByChartID.set(pb.chartID, pb);
    }

    const filteredPbs = {};
    for (const chart of allCharts) {
        if (pbsByChartID.has(chart.chartID) && songsByID.has(chart.songID.toString())) {
            let scoreData = pbsByChartID.get(chart.chartID).scoreData;
            if (scoreData.lamp == 'FULL COMBO' || scoreData.lamp == 'ALL JUSTICE' || scoreData.lamp == 'ALL JUSTICE CRITICAL') {
                const songData = songsByID.get(chart.songID.toString());
                const cc_str = chart.difficulty == "MASTER" ? songData.lev_mas_i :
                    chart.difficulty == "ULTIMA" ? songData.lev_ult_i :
                        chart.difficulty == "EXPERT" ? songData.lev_exp_i : "0";
                const cc = parseFloat(cc_str);
                const songName = songData.title;
                if (filteredPbs.hasOwnProperty(songName)) {
                    filteredPbs[songName][cc] = abbreviateLamp(scoreData.lamp);
                } else {
                    let ccLampMap = {};
                    ccLampMap[cc] = abbreviateLamp(scoreData.lamp);
                    filteredPbs[songName] = ccLampMap;
                }
            }
        }
    }

    const blob = new Blob([JSON.stringify(filteredPbs)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chunithm-lamp-data_${Math.floor(Date.now() / 1000)}.json`;
    a.click();
    a.remove();
})();