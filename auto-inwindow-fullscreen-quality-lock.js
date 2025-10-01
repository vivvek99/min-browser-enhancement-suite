// ==UserScript==
// @name         Auto In-Window Fullscreen + Overlay Play + Quality Lock + Esc Exit
// @namespace    https://min.userscripts
// @version      1.3
// @description  Click overlay, in-window fullscreen (container), keep site controls, auto highest quality, Esc to exit (with 5s re-entry)
// @match        *://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // ---------- Config ----------
    const RELOCK_MS = 30000; // Re-assert best quality every 30s (livestreams often revert)
    const START_VOLUME = 1.0; // Set once on first play
    const REENTRY_DELAY_MS = 5000; // Delay after Escape before re-entering in-window fullscreen
    const QUALITY_PREFS = [
        { label: /^(source|original)$/i, score: 10000 },
        { label: /2160|4320|8k|4k/i, score: 2160 },
        { label: /1440|2k/i, score: 1440 },
        { label: /1080/i, score: 1080 },
        { label: /720/i, score: 720 },
        { label: /480/i, score: 480 },
        { label: /high(est)?/i, score: 700 }
        // Add site-specific labels above "Auto" if needed
    ];
    const AVOID_LABEL = /auto/i; // try not to select "Auto"

    // ---------- State ----------
    const APPLIED_ATTR = 'data-iwf-applied';
    let qualityInterval = null;
    let mo = null;
    // Cooldown state for re-entry after Escape
    let reentryAt = 0;
    let reapplyTimer = null;

    // ---------- Utilities ----------
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    function robustClick(el) {
        if (!el) return;
        try {
            const r = el.getBoundingClientRect();
            const opts = { bubbles: true, cancelable: true, view: window,
                           clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, button: 0 };
            el.dispatchEvent(new PointerEvent('pointerdown', opts));
            el.dispatchEvent(new MouseEvent('mousedown', opts));
            el.dispatchEvent(new MouseEvent('mouseup', opts));
            el.dispatchEvent(new MouseEvent('click', opts));
        } catch {
            try { el.click(); } catch {}
        }
    }

    function simulateMouseMove(el) {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const opts = { bubbles: true, cancelable: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
        el.dispatchEvent(new MouseEvent('mousemove', opts));
        el.dispatchEvent(new MouseEvent('mouseover', opts));
    }

    function commonAncestor(a, b) {
        if (!a) return b || null;
        if (!b) return a || null;
        const set = new Set();
        for (let x = a; x; x = x.parentElement) set.add(x);
        for (let y = b; y; y = y.parentElement) if (set.has(y)) return y;
        return document.body;
    }

    // ---------- Targets ----------
    function getVideo() {
        return document.querySelector('video');
    }

    function findPlayOverlay() {
        const img = document.querySelector('img[src*="tsdefaultassets/play-inactive.svg"]');
        if (!img) return null;
        return img.closest('div[style*="border-radius"]') || img.parentElement || img;
    }

    function getPlayerContainer() {
        const vid = getVideo();
        if (!vid) return null;

        // Prefer a container that likely holds site controls
        const overlay = findPlayOverlay();
        const candidate = overlay ? commonAncestor(vid, overlay) : null;
        const labeledAncestor = vid.closest(
            '[class*="player"], [id*="player"], [class*="video"], [id*="video"], [data-player], [data-testid*="player"]'
        );
        const container = candidate || labeledAncestor || vid.parentElement || vid;
        return container;
    }

    // ---------- In-window fullscreen ----------
    function applyInWindowFullscreen() {
        const container = getPlayerContainer();
        const vid = getVideo();
        if (!container || !vid) return false;
        if (container.hasAttribute(APPLIED_ATTR)) return false;

        // Save originals for full restore
        container.dataset.iwfOrigStyle = container.getAttribute('style') || '';
        document.documentElement.dataset.iwfOrigOverflow = document.documentElement.style.overflow || '';
        document.body.dataset.iwfOrigBg = document.body.style.backgroundColor || '';
        Object.assign(container.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            zIndex: '9999',
            backgroundColor: 'black'
        });
        document.documentElement.style.overflow = 'hidden';
        document.body.style.backgroundColor = 'black';
        container.setAttribute(APPLIED_ATTR, '1');
        // Initial volume once; do not fight user thereafter
        try { vid.volume = START_VOLUME; } catch {}
        return true;
    }

    function exitInWindowFullscreen() {
        const container = getPlayerContainer();
        if (!container || !container.hasAttribute(APPLIED_ATTR)) return;

        // Restore styles
        container.setAttribute('style', container.dataset.iwfOrigStyle || '');
        document.documentElement.style.overflow = document.documentElement.dataset.iwfOrigOverflow || '';
        document.body.style.backgroundColor = document.body.dataset.iwfOrigBg || '';
        container.removeAttribute(APPLIED_ATTR);
        // Stop quality re-lock loop
        if (qualityInterval) {
            clearInterval(qualityInterval);
            qualityInterval = null;
        }
    }

    // ---------- Quality control ----------
    function findGearButton(scope) {
        const root = scope || getPlayerContainer() || document;
        const sel = [
            'button[aria-label*="setting" i]',
            'button[aria-label*="quality" i]',
            '[title*="setting" i]',
            '[title*="quality" i]',
            '[class*="setting" i]',
            '[class*="gear" i]',
            '[class*="quality" i]',
            '[data-testid*="setting" i]',
            '[data-testid*="quality" i]'
        ].join(', ');
        const all = Array.from(root.querySelectorAll(sel));
        if (all.length) return all[0];
        const svgBtn = root.querySelector('button svg')?.closest('button');
        return svgBtn || null;
    }

    function findQualityMenu(scope) {
        const root = scope || getPlayerContainer() || document;
        const candidates = Array.from(root.querySelectorAll(
            '[role="menu"], [role="listbox"], [class*="menu" i], [class*="dropdown" i], ul, div[aria-expanded="true"]'
        ));
        return candidates.find(menu =>
            Array.from(menu.querySelectorAll('*')).some(el => /(\d{3,4})p|source|original|auto|high(est)?/i.test(el.textContent || ''))
        ) || null;
    }

    function bestQualityItem(menu) {
        const items = Array.from(menu.querySelectorAll('button, li, [role="menuitem"], [role="option"], span, div'))
            .filter(el => (el.textContent || '').trim());

        let best = null;
        let bestScore = -1;
        for (const el of items) {
            const t = el.textContent.trim();
            if (!t) continue;
            if (AVOID_LABEL.test(t)) continue;
            let score = -1;
            for (const pref of QUALITY_PREFS) {
                if (pref.label.test(t)) {
                    score = Math.max(score, pref.score);
                }
            }
            const m = t.match(/(\d{3,4})\s*p/i);
            if (m) score = Math.max(score, parseInt(m[1], 10));
            const isActive = el.getAttribute('aria-checked') === 'true' ||
                /active|selected|current/i.test(el.className || '');
            if (isActive) score += 0.5;
            if (score > bestScore) {
                bestScore = score;
                best = el;
            }
        }
        return best;
    }

    async function openMenuIfNeeded() {
        const container = getPlayerContainer();
        const vid = getVideo();
        if (!container || !vid) return null;
        simulateMouseMove(container);
        let gear = findGearButton(container);
        if (!gear) {
            await sleep(250);
            simulateMouseMove(container);
            gear = findGearButton(container);
        }
        if (!gear) return null;
        let menu = findQualityMenu(container);
        if (!menu) {
            robustClick(gear);
            for (let i = 0; i < 5; i++) {
                await sleep(200);
                menu = findQualityMenu(container);
                if (menu) break;
            }
        }
        return menu || null;
    }

    async function setHighestQualityOnce() {
        const menu = await openMenuIfNeeded();
        if (!menu) return false;
        const best = bestQualityItem(menu);
        if (best) {
            robustClick(best);
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));
            return true;
        }
        return false;
    }

    function ensureRelockLoop() {
        if (qualityInterval) return;
        qualityInterval = setInterval(() => {
            const container = getPlayerContainer();
            if (container && container.hasAttribute(APPLIED_ATTR)) {
                setHighestQualityOnce();
            }
        }, RELOCK_MS);
    }

    async function step() {
        if (Date.now() < reentryAt) return;
        const currentContainer = getPlayerContainer();
        if (currentContainer && currentContainer.hasAttribute(APPLIED_ATTR)) return;
        const appliedNow = applyInWindowFullscreen();
        if (appliedNow) {
            setTimeout(() => { setHighestQualityOnce(); ensureRelockLoop(); }, 800);
            return;
        }
        const overlay = findPlayOverlay();
        if (overlay) {
            robustClick(overlay);
            setTimeout(step, 400);
        }
    }

    if (document.readyState !== 'loading') step();
    window.addEventListener('DOMContentLoaded', step, { once: true });
    window.addEventListener('load', step, { once: true });

    mo = new MutationObserver(() => step());
    mo.observe(document.documentElement, { childList: true, subtree: true });

    window.addEventListener('resize', () => {
        const container = getPlayerContainer();
        if (container && container.hasAttribute(APPLIED_ATTR)) {
            Object.assign(container.style, { width: '100vw', height: '100vh' });
        } else {
            step();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const container = getPlayerContainer();
            if (container && container.hasAttribute(APPLIED_ATTR)) {
                e.stopPropagation();
                e.preventDefault();
                exitInWindowFullscreen();
                reentryAt = Date.now() + REENTRY_DELAY_MS;
                if (reapplyTimer) clearTimeout(reapplyTimer);
                reapplyTimer = setTimeout(() => {
                    reapplyTimer = null;
                    step();
                }, REENTRY_DELAY_MS);
            }
        }
    }, true);
})();