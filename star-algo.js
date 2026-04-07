const StarAlgo = (() => {
    const DEFAULTS = { edm: 2.5, pm: 105, bc: 13, srps: 8, eia: 5 };

    function getParams() {
        const d = DEFAULTS;
        return {
            edm:  parseFloat(document.getElementById('p-edm').value)  || d.edm,
            pm:   (parseFloat(document.getElementById('p-pm').value)   || d.pm) / 100,
            bc:   parseFloat(document.getElementById('p-bc').value)   || d.bc,
            srps: parseInt(document.getElementById('p-srps').value)   || d.srps,
            eia:  parseFloat(document.getElementById('p-eia').value)  || d.eia,
        };
    }

    function buildXpTable(p, count) {
        const baseXp = p.bc * p.edm;
        const mp = p.pm ** p.srps;
        const table = [];
        for (let star = 0; star < count; star++) {
            const fullStages = Math.floor(star / p.srps);
            const remainder  = star % p.srps;
            const mr  = p.pm ** remainder;
            const mnp = mp ** fullStages;
            let xp;
            if (Math.abs(mp - 1) < 1e-10) {
                xp = baseXp * p.pm ** star + p.eia * mr * fullStages;
            } else {
                xp = baseXp * p.pm ** star + p.eia * mr * (mnp - 1) / (mp - 1);
            }
            table.push(xp);
        }
        return table;
    }

    return { DEFAULTS, getParams, buildXpTable };
})();
