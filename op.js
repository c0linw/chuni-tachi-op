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

    const { username, id } = await fetch("/api/v1/users/me")
        .then((r) => r.json())
        .then((r) => r.body);

    const { pbs, songs, charts } = await fetch(`/api/v1/users/${id}/games/chunithm/Single/pbs/all?alg=rating`)
        .then((r) => r.json())
        .then((r) => r.body);

    for (const pb of pbs) {
        pbsByChartID.set(pb.chartID, pb);
    }

    for (const chart of charts) {
        //chartsByID.set(chart.chartID, chart);
        if ((chart.difficulty == "MASTER" || chart.difficulty == "ULTIMA") && chart.versions.includes("sun")) {
            maxOP += calculateMaxOP(chart);
            playerOP += calculatePlayerOP(chart);
        }
    }

    alert(`Your OP for CHUNITHM SUN is ${playerOP}/${maxOP} (${playerOP / maxOP}%)`);
})();
