(function () {
    const NAV_HTML = `
<nav class="wt-nav">
    <div class="wt-nav-title">White Tiger</div>
    <div class="wt-nav-section">Skills</div>
    <a class="wt-nav-link" href="skills.html" data-page="skills.html">Skills</a>
    <a class="wt-nav-link" href="professions.html" data-page="professions.html">Professions</a>
    <a class="wt-nav-link" href="talent-calculator.html" data-page="talent-calculator.html">Talent Calculator</a>
    <a class="wt-nav-link" href="star-estimate.html" data-page="star-estimate.html">Star Estimate</a>
    <div class="wt-nav-section">Economy</div>
    <a class="wt-nav-link" href="meteorstore.html" data-page="meteorstore.html">Meteor Store</a>
    <a class="wt-nav-link" href="transport.html" data-page="transport.html">Transport</a>
    <a class="wt-nav-link" href="dinnerparty.html" data-page="dinnerparty.html">Dinner Party</a>
    <div class="wt-nav-section">Server</div>
    <a class="wt-nav-link" href="server-stats.html" data-page="server-stats.html">Server Stats</a>
    <a class="wt-nav-link wt-nav-external" href="https://weylint.github.io/ecoflow" target="_blank" rel="noopener">EcoFlow <span class="wt-nav-ext-icon">↗</span></a>
    <div class="wt-nav-section">White Tiger Law</div>
    <a class="wt-nav-link" href="laws.html" data-page="laws.html">Ingame Laws</a>
    <a class="wt-nav-link" href="custom-stats.html" data-page="custom-stats.html">Custom Stats</a>
    <a class="wt-nav-link" href="law.html?doc=server-rules" data-page="law.html?doc=server-rules">Server Rules</a>
    <a class="wt-nav-link" href="law.html?doc=constitution" data-page="law.html?doc=constitution">Constitution</a>
    <a class="wt-nav-link" href="law.html?doc=federal-law" data-page="law.html?doc=federal-law">Federal Law</a>
</nav>`;

    const STYLES = `
.wt-nav {
    width: 220px;
    flex-shrink: 0;
    background: #161b22;
    border-right: 1px solid #30363d;
    overflow-y: auto;
    font-family: 'Consolas', 'Menlo', 'Monaco', monospace;
}
.wt-nav-title {
    color: #58a6ff;
    font-size: 1rem;
    padding: 16px;
    border-bottom: 1px solid #30363d;
}
.wt-nav-section {
    color: #6e7681;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 10px 16px 4px;
    font-family: 'Consolas', 'Menlo', 'Monaco', monospace;
}
.wt-nav-link {
    display: block;
    padding: 7px 16px;
    color: #8b949e;
    font-size: 0.85rem;
    text-decoration: none;
    border-left: 2px solid transparent;
    font-family: 'Consolas', 'Menlo', 'Monaco', monospace;
}
.wt-nav-link:hover {
    background: #1c2128;
    color: #c9d1d9;
}
.wt-nav-link.wt-nav-active {
    border-left-color: #58a6ff;
    color: #58a6ff;
    background: #1c2128;
}
.wt-nav-external .wt-nav-ext-icon {
    color: #6e7681;
}
.wt-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
}
.wt-content-column {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}
.wt-mobile-bar {
    display: none;
}
.wt-nav-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 99;
}
.wt-nav-overlay.wt-nav-overlay-open {
    display: block;
}
@media (max-width: 767px) {
    .wt-mobile-bar {
        display: flex;
        align-items: center;
        gap: 12px;
        position: fixed;
        top: 0; left: 0; right: 0;
        height: 48px;
        background: #161b22;
        border-bottom: 1px solid #30363d;
        padding: 0 16px;
        z-index: 101;
        font-family: 'Consolas', 'Menlo', 'Monaco', monospace;
    }
    .wt-mobile-bar-title {
        color: #58a6ff;
        font-size: 1rem;
    }
    .wt-hamburger {
        background: none;
        border: 1px solid #30363d;
        color: #8b949e;
        font-size: 1.1rem;
        line-height: 1;
        padding: 4px 8px;
        cursor: pointer;
        border-radius: 4px;
        font-family: inherit;
    }
    .wt-hamburger:hover {
        border-color: #58a6ff;
        color: #58a6ff;
    }
    .wt-nav {
        position: fixed;
        top: 0; left: 0;
        height: 100vh;
        width: 220px;
        z-index: 100;
        transform: translateX(-100%);
        transition: transform 0.2s ease;
    }
    .wt-nav.wt-nav-open {
        transform: translateX(0);
    }
    .wt-content,
    .wt-content-column {
        padding-top: calc(48px + 20px);
    }
}`;

    document.addEventListener('DOMContentLoaded', function () {
        // Inject styles
        const style = document.createElement('style');
        style.textContent = STYLES;
        document.head.appendChild(style);

        // Override body layout
        const body = document.body;
        body.style.cssText += ';display:flex;flex-direction:row;height:100vh;overflow:hidden;padding:0;margin:0;';

        // Snapshot existing children
        const children = Array.from(body.childNodes);

        // Mobile top bar
        const mobileBar = document.createElement('div');
        mobileBar.className = 'wt-mobile-bar';
        mobileBar.innerHTML = '<button class="wt-hamburger" aria-label="Men\u00fc \u00f6ffnen">&#9776;</button><span class="wt-mobile-bar-title">White Tiger</span>';
        body.insertBefore(mobileBar, body.firstChild);

        // Inject nav
        const navWrapper = document.createElement('div');
        navWrapper.innerHTML = NAV_HTML;
        body.insertBefore(navWrapper.firstElementChild, body.firstChild);

        // Overlay backdrop
        const overlay = document.createElement('div');
        overlay.className = 'wt-nav-overlay';
        const navEl = document.querySelector('.wt-nav');
        navEl.insertAdjacentElement('afterend', overlay);

        // Drawer logic
        function openDrawer() {
            navEl.classList.add('wt-nav-open');
            overlay.classList.add('wt-nav-overlay-open');
            body.style.overflow = 'hidden';
        }
        function closeDrawer() {
            navEl.classList.remove('wt-nav-open');
            overlay.classList.remove('wt-nav-overlay-open');
            body.style.overflow = '';
        }
        mobileBar.querySelector('.wt-hamburger').addEventListener('click', openDrawer);
        overlay.addEventListener('click', closeDrawer);
        navEl.querySelectorAll('.wt-nav-link').forEach(function (a) {
            a.addEventListener('click', closeDrawer);
        });

        // Wrap existing content
        const isColumn = body.dataset.layout === 'column';
        const content = document.createElement('div');
        content.className = isColumn ? 'wt-content-column' : 'wt-content';
        children.forEach(node => content.appendChild(node));
        body.appendChild(content);

        // Mark active link
        const currentPath = window.location.pathname;
        const currentSearch = window.location.search;
        const currentFile = currentPath.split('/').pop() || '';
        document.querySelectorAll('.wt-nav-link[data-page]').forEach(a => {
            const page = a.dataset.page;
            let isActive;
            if (page.includes('?')) {
                const [pageFile, pageQuery] = page.split('?');
                isActive = (pageFile === currentFile || currentPath.startsWith(pageFile))
                           && currentSearch === '?' + pageQuery;
            } else if (page.includes('/')) {
                isActive = currentPath.startsWith(page);
            } else {
                isActive = page === currentFile;
            }
            if (isActive) a.classList.add('wt-nav-active');
        });
    });
}());
