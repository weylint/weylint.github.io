/**
 * law-diff.js — shared Eco law diffing helpers.
 *
 * Used by election-diff.html (current law → proposed law) and
 * draft-diff.html (active law → draft law). Both render the same side-by-side
 * view; the matching styles live in law-diff.css.
 *
 * Exposes a global `LawDiff` object:
 *   LawDiff.preprocessEcoLines(raw)  → string[]  normalized display lines
 *   LawDiff.renderSplitBlock(old, new)→ HTML      side-by-side diff, collapsed context
 *   LawDiff.countChanges(old, new)    → {del,ins} removed / added line counts
 *   LawDiff.isIdentical(oldRaw,newRaw)→ boolean   cheap equality check
 *
 * The rendered lines contain inline HTML (spans for colors/chips/keywords) but no
 * wrapper divs, so they can be compared as plain strings.
 */
(function () {
    'use strict';

    // ── Eco text preprocessing ──────────────────────────────────────────────
    // Converts raw Eco markup to an array of normalized display lines.

    function preprocessEcoLines(raw) {
        if (!raw) return [];
        let s = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        // Strip <nl ...> wrappers used in some API endpoints
        s = s.replace(/<nl[^>]*>([\s\S]*?)<\/nl>/g, '$1\n');

        let prev, passes = 0;
        do {
            prev = s;
            s = s
                .replace(/<foldout><linktext>([\s\S]*?)<\/linktext><title>[\s\S]*?<\/title>([\s\S]*?)<\/foldout>/g,
                    (_, sum, body) => `<span class="eco-foldout"><span class="eco-foldout-label">${sum}</span><span class="eco-foldout-tooltip">${body.trim().replace(/\n/g, '<br>')}</span></span>`)
                .replace(/<link="[^"]*"><icon[^>]*><color=#([0-9A-Fa-f]{6})[0-9A-Fa-f]{0,2}>([\s\S]*?)<\/color><\/icon><\/link>/g,
                    (_, rgb, text) => `<span class="eco-chip" style="color:#${rgb}">${text}</span>`)
                .replace(/<link="[^"]*"><icon[^>]*>([\s\S]*?)<\/icon><\/link>/g,
                    (_, text) => `<span class="eco-chip">${text}</span>`)
                .replace(/<link="[^"]*">([\s\S]*?)<\/link>/g, '$1')
                .replace(/<icon[^>]*>([\s\S]*?)<\/icon>/g, '$1')
                // Use a control-char sentinel for section headers (keeps them inline)
                .replace(/<style="Header">([\s\S]*?)<\/style>/g, '\x01$1\x01')
                .replace(/<style="Government">([\s\S]*?)<\/style>/g, '<span class="eco-govt">$1</span>')
                .replace(/<style="Currency">([\s\S]*?)<\/style>/g, '<span class="eco-currency">$1</span>')
                .replace(/<style="BankAccount">([\s\S]*?)<\/style>/g, '<span class="eco-bank">$1</span>')
                .replace(/<style="Positive">([\s\S]*?)<\/style>/g, '<span class="eco-positive">$1</span>')
                .replace(/<style="[^"]*">([\s\S]*?)<\/style>/g, '$1');
        } while (s !== prev && ++passes < 10);

        s = s.replace(/<color=#([0-9A-Fa-f]{6})[0-9A-Fa-f]{0,2}>/g, '<span style="color:#$1">');
        s = s.replace(/<\/color>/g, '</span>');

        const savedI = [];
        s = s.replace(/<i>[\s\S]*?<\/i>/gi, m => { savedI.push(m); return `\x00${savedI.length - 1}\x00`; });

        s = s.replace(/\bthen\s+if\b/gi, 'then\nif');
        s = s.replace(/([^\n]+?)(if)(?=[ \t])/gi, '$1\nif');
        s = s.replace(/\belse\s*\n\s*if\b/gi, 'else if');
        s = s.replace(/\band\s*\n\s*if\b/gi, 'and if');

        s = s.replace(/\x00(\d+)\x00/g, (_, i) =>
            savedI[+i].replace(/^<i>([\s\S]*?)<\/i>$/i, (_, c) =>
                '\n// ' + c.trim().replace(/\n\s*/g, '\n// ') + '\n'));

        return s.split('\n').map(l => l.trimStart());
    }

    // ── LCS diff ────────────────────────────────────────────────────────────

    function computeDiff(a, b) {
        const m = a.length, n = b.length;
        const dp = Array.from({length: m + 1}, () => new Uint32Array(n + 1));
        for (let i = 1; i <= m; i++)
            for (let j = 1; j <= n; j++)
                dp[i][j] = a[i-1] === b[j-1]
                    ? dp[i-1][j-1] + 1
                    : Math.max(dp[i-1][j], dp[i][j-1]);

        const out = [];
        let i = m, j = n;
        while (i > 0 || j > 0) {
            if (i > 0 && j > 0 && a[i-1] === b[j-1]) {
                out.push({t: 'eq',  s: a[i-1]}); i--; j--;
            } else if (j > 0 && (i === 0 || dp[i][j-1] >= dp[i-1][j])) {
                out.push({t: 'ins', s: b[j-1]}); j--;
            } else {
                out.push({t: 'del', s: a[i-1]}); i--;
            }
        }
        return out.reverse();
    }

    // Group diff into visible hunks (3 context lines) and collapsed spans.
    function buildHunks(diff, ctx) {
        ctx = ctx == null ? 3 : ctx;
        const vis = new Uint8Array(diff.length);
        for (let i = 0; i < diff.length; i++)
            if (diff[i].t !== 'eq') {
                const lo = Math.max(0, i - ctx), hi = Math.min(diff.length - 1, i + ctx);
                for (let k = lo; k <= hi; k++) vis[k] = 1;
            }

        const segs = [];
        let i = 0;
        while (i < diff.length) {
            if (vis[i]) {
                const seg = {shown: true, lines: []};
                while (i < diff.length && vis[i]) seg.lines.push(diff[i++]);
                segs.push(seg);
            } else {
                let count = 0;
                while (i < diff.length && !vis[i]) { count++; i++; }
                segs.push({shown: false, count});
            }
        }
        return segs;
    }

    // ── Line rendering ───────────────────────────────────────────────────────

    function colorLine(line) {
        if (!line.trim()) return '';
        // Section header sentinel
        if (line.startsWith('\x01') && line.endsWith('\x01'))
            return `<span class="eco-hdr">${line.slice(1, -1)}</span>`;
        if (/^\/\//.test(line))
            return `<span class="eco-comment">${line}</span>`;
        return line
            .replace(/^(on\s+event|on\s+every)\b/i, '<span class="eco-kw-event">$1</span>')
            .replace(/^(then)\b/i,                   '<span class="eco-kw-then">$1</span>')
            .replace(/^(else\s+if|and\s+if|if)\b/i,  '<span class="eco-kw-cond">$1</span>')
            .replace(/^(else)\b/i,                   '<span class="eco-kw-cond">$1</span>')
            .replace(/^(and|or|not)\b/i,             '<span class="eco-kw-op">$1</span>');
    }

    // ── Split (side-by-side) rendering ───────────────────────────────────────

    // Turn a run of changed lines into aligned rows: deletions on the left,
    // insertions on the right, zipped by index. The shorter side is padded with
    // empty cells so both columns stay in step.
    function zipChanges(run) {
        const dels = run.filter(d => d.t === 'del');
        const inss = run.filter(d => d.t === 'ins');
        const rows = [];
        for (let k = 0; k < Math.max(dels.length, inss.length); k++)
            rows.push({old: dels[k] || null, new: inss[k] || null});
        return rows;
    }

    // Flatten a diff into {old, new} row pairs, with collapsed spans preserved.
    function buildSplitRows(diff, ctx) {
        const out = [];
        for (const seg of buildHunks(diff, ctx)) {
            if (!seg.shown) { out.push({collapsed: seg.count}); continue; }

            let i = 0;
            while (i < seg.lines.length) {
                if (seg.lines[i].t === 'eq') {
                    const l = seg.lines[i++];
                    out.push({old: l, new: l});
                } else {
                    const run = [];
                    while (i < seg.lines.length && seg.lines[i].t !== 'eq') run.push(seg.lines[i++]);
                    out.push(...zipChanges(run));
                }
            }
        }
        return out;
    }

    function splitCell(entry, side) {
        if (!entry) return `<div class="sp-cell sp-${side} sp-empty"></div>`;
        const mark = entry.t === 'del' ? 'del' : entry.t === 'ins' ? 'ins' : '';
        const g = mark === 'del' ? '<span class="sp-g sp-g-del">\u2212</span>'
                : mark === 'ins' ? '<span class="sp-g sp-g-ins">+</span>'
                :                  '<span class="sp-g">\u00a0</span>';
        return `<div class="sp-cell sp-${side}${mark ? ' sp-' + mark : ''}">`
             + `${g}<span class="sp-c">${colorLine(entry.s)}</span></div>`;
    }

    // Side-by-side diff: old law on the left, new law on the right.
    // Each row is a flex pair, so both cells share the row height even when the
    // (very long) law lines wrap.
    function renderSplitBlock(oldLines, newLines) {
        const diff = computeDiff(oldLines, newLines);
        if (diff.every(d => d.t === 'eq'))
            return '<div class="diff-identical">No changes</div>';

        return buildSplitRows(diff, 3).map(row => {
            if (row.collapsed != null)
                return `<div class="sp-collapsed">\u00b7\u00b7\u00b7 ${row.collapsed} unchanged line${row.collapsed === 1 ? '' : 's'} \u00b7\u00b7\u00b7</div>`;
            return `<div class="sp-row">${splitCell(row.old, 'old')}${splitCell(row.new, 'new')}</div>`;
        }).join('');
    }

    // Number of removed / added lines between two rendered line lists.
    function countChanges(oldLines, newLines) {
        const diff = computeDiff(oldLines, newLines);
        return {
            del: diff.filter(d => d.t === 'del').length,
            ins: diff.filter(d => d.t === 'ins').length
        };
    }

    // True when the two texts render to an identical set of lines.
    function isIdentical(oldRaw, newRaw) {
        const a = preprocessEcoLines(oldRaw), b = preprocessEcoLines(newRaw);
        return a.length === b.length && a.every((l, i) => l === b[i]);
    }

    window.LawDiff = {
        preprocessEcoLines,
        computeDiff,
        buildHunks,
        colorLine,
        renderSplitBlock,
        countChanges,
        isIdentical
    };
})();
