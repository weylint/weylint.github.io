const StarAlgo = (() => {
    const DEFAULTS = { edm: 2, pm: 105, bc: 12, srps: 3, eia: 9 };

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
        const table = [];
        let prev = p.edm * p.pm * p.bc;
        table.push(prev);
        for (let x = 1; x < count; x++) {
            prev = prev * p.pm + p.eia * Math.floor((x + 1) / p.srps);
            table.push(prev);
        }
        return table;
    }

    return { DEFAULTS, getParams, buildXpTable };
})();
