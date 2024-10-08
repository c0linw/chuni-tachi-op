// javascript:(function(d){if(location.origin=="https://kamai.tachi.ac"){var s=d.createElement("script");s.src="https://raw.githack.com/c0linw/chuni-tachi-op/refs/heads/main/op.js";d.body.append(s);}})(document)

(async () => {
    if (location.origin !== "https://kamai.tachi.ac") {
        return;
    }

    function calculateMaxOP(chart) {
        return (chart.levelNum + 3) * 5;
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
        let playRating = Math.min(pb.calculatedData.rating, chart.levelNum + 2);

        return playRating * 5 + lampBonus + scoreBonus;
    }
    const pbsByChartID = new Map();
    let maxOP = 0;
    let playerOP = 0;
    let playCount = 0;

    const version = prompt('Select version (e.g. "paradiselost", "new", "newplus", "sun")', "sun");
    if (version == null) {
        alert("Please enter a version name");
        return;
    }

    const allCharts = await fetch("https://raw.githubusercontent.com/zkrising/Tachi/refs/heads/main/seeds/collections/charts-chunithm.json")
        .then((r) => r.json())
        .then((r) => r.filter((chart) => (chart.difficulty == "MASTER" || chart.difficulty == "ULTIMA") && chart.versions.includes(version)));

    const { username, id } = await fetch("/api/v1/users/me")
        .then((r) => r.json())
        .then((r) => r.body);

    const { pbs, songs, charts } = await fetch(`/api/v1/users/${id}/games/chunithm/Single/pbs/all?alg=rating`)
        .then((r) => r.json())
        .then((r) => r.body);

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
