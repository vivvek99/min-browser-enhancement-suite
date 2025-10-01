// ==UserScript==
// @name         Min Optimizer + Overlay (v2.0)
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  /**************************************************************************
   * CONFIG (edit live with hotkeys too)
   ***************************************************************************/
  let STAGGER_ENABLED = true;          // toggle: Ctrl+Shift+S
  let STAGGER_MS = 250;                // increment between queued plays
  let BUFFER_TARGET_S = 12;            // target live buffer seconds (Ctrl+Shift+[ / ])
  let BUFFER_HARD_MAX_S = 20;          // never let live buffer exceed this
  let CPU_RELIEF_RATE = 0.92;          // playbackRate when CPU saturated
  let CPU_RELIEF_ON = true;            // toggle: Ctrl+Shift+R

  /**************************************************************************
   * REDUNDANCY: Prefer GPU-friendly codecs (H.264) from multiple angles
   ***************************************************************************/
  // 1) Downgrade support claims for AV1/VP9 at canPlayType level
  const _origCanPlayType = HTMLMediaElement.prototype.canPlayType;
  HTMLMediaElement.prototype.canPlayType = function (type) {
    if (typeof type === 'string' && (type.includes('av01') || type.includes('vp09') || type.includes('vp9'))) {
      return '';
    }
    return _origCanPlayType.call(this, type);
  };

  // 2) Influence MediaCapabilities.decodingInfo for MSE/HLS/DASH selection
  if ('mediaCapabilities' in navigator && navigator.mediaCapabilities?.decodingInfo) {
    const mc = navigator.mediaCapabilities;
    const _origDecodingInfo = mc.decodingInfo.bind(mc);
    mc.decodingInfo = async (config) => {
      try {
        const v = config?.video;
        if (v && (/(av01|vp09|vp9)/i.test(v.contentType || v.codec || ''))) {
          // Say "not smooth/powerEfficient" to steer servers away
          return { supported: true, smooth: false, powerEfficient: false };
        }
        if (v && /(avc1|h264)/i.test(v.contentType || v.codec || '')) {
          return { supported: true, smooth: true, powerEfficient: true };
        }
      } catch (_) {}
      return _origDecodingInfo(config);
    };
  }

  /**************************************************************************
   * Force GPU compositing on videos (helps compositor path)
   **************************************************************************/
  const style = document.createElement('style');
  style.textContent = `
    video {
      will-change: transform;
      transform: translateZ(0);
      image-rendering: -webkit-optimize-contrast;
    }
  `;
  document.documentElement.appendChild(style);

  /**************************************************************************
   * Staggered start queue: prevents network/decoder stampedes
   **************************************************************************/
  const playQueue = [];
  let queueTimer = null;

  function enqueuePlay(v) {
    if (!STAGGER_ENABLED) { safePlay(v); return; }
    playQueue.push(v);
    if (!queueTimer) pumpQueue();
  }

  function pumpQueue() {
    queueTimer = setTimeout(() => {
      const v = playQueue.shift();
      if (v && v.paused && !v._playPending) { safePlay(v); }
      if (playQueue.length) {
        STAGGER_MS = Math.max(100, Math.min(1000, STAGGER_MS)); // bounds
        pumpQueue();
      } else {
        queueTimer = null;
      }
    }, STAGGER_MS);
  }

  function safePlay(v) {
    v._playPending = true;
    v.play().catch(() => {}).finally(() => { v._playPending = false; });
  }

  // Intercept plays on new videos to queue them
  const mo = new MutationObserver(() => hookVideos());
  mo.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('DOMContentLoaded', hookVideos);
  hookVideos();

  function hookVideos() {
    document.querySelectorAll('video').forEach(v => {
      if (v._hooked) return;
      v._hooked = true;

      // Keep preload sane for lives
      try { if (v.preload !== 'metadata') v.preload = 'auto'; } catch (_) {}

      // Intercept programmatic play() to apply stagger
      const _origPlay = v.play.bind(v);
      v.play = function () {
        enqueuePlay(v);
        return Promise.resolve();
      };

      // If already autoplaying, re-route through queue
      if (!v.paused && !v._playPending) {
        v.pause();
        enqueuePlay(v);
      }
    });
  }

  /**************************************************************************
   * Live buffer trimming: adaptive and hard cap
   **************************************************************************/
  function trimBuffers() {
    const videos = document.querySelectorAll('video');
    videos.forEach(v => {
      try {
        if (v.paused || v.readyState < 2 || v.buffered.length === 0) return;
        const end = v.buffered.end(v.buffered.length - 1);
        let target = BUFFER_TARGET_S;

        // Adaptive: if lots of videos, aim smaller buffer
        const N = videos.length;
        if (N >= 24 && N < 48) target = Math.max(8, BUFFER_TARGET_S - 2);
        if (N >= 48) target = Math.max(6, BUFFER_TARGET_S - 4);

        const over = end - v.currentTime - target;
        const hardOver = end - v.currentTime - BUFFER_HARD_MAX_S;

        if (hardOver > 0 || over > 0) {
          v.currentTime = v.currentTime + Math.max(0.01, Math.min(over, 1));
        }
      } catch (_) {}
    });
  }
  setInterval(trimBuffers, 8000);

  /**************************************************************************
   * Mild CPU relief under saturation (keeps playback smooth)
   **************************************************************************/
  function cpuBusyEstimate(ms = 60) {
    const start = performance.now();
    while (performance.now() - start < ms) {}
    const elapsed = performance.now() - start;
    return Math.max(0, Math.min(100, ((elapsed / ms) - 1) * 100));
  }

  setInterval(() => {
    if (!CPU_RELIEF_ON) return;
    const busy = cpuBusyEstimate();
    if (busy > 85) {
      document.querySelectorAll('video').forEach(v => {
        if (!v.paused && v.playbackRate > CPU_RELIEF_RATE) v.playbackRate = CPU_RELIEF_RATE;
      });
    } else if (busy < 60) {
      document.querySelectorAll('video').forEach(v => {
        if (!v.paused && v.playbackRate < 1) v.playbackRate = 1;
      });
    }
  }, 5000);

  /**************************************************************************
   * Toggleable diagnostic overlay (hidden by default)
   **************************************************************************/
  let OVERLAY_VISIBLE = false;
  const overlay = document.createElement('div');
  overlay.id = 'min-perf-overlay';
  overlay.style.cssText = `
    position: fixed; top: 10px; left: 10px; z-index: 999999;
    background: rgba(0,0,0,.75); color: #0f0; font-family: monospace;
    font-size: 12px; line-height: 1.2; padding: 6px; border-radius: 4px;
    pointer-events: none; white-space: pre; display: none;
  `;
  document.documentElement.appendChild(overlay);

  let gpuName = 'Unknown GPU';
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (gl) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) {
        gpuName = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || gpuName;
      }
    }
  } catch (_) {}

  function updateOverlay() {
    if (!OVERLAY_VISIBLE) return;
    const vids = Array.from(document.querySelectorAll('video'));
    const cpu = cpuBusyEstimate(50).toFixed(0);
    const buffers = vids.map(v => {
      try {
        if (!v.buffered.length) return '0.0';
        return (v.buffered.end(v.buffered.length - 1) - v.currentTime).toFixed(1);
      } catch (_) { return '0.0'; }
    });
    const avg = buffers.length ? (buffers.reduce((a, b) => a + (+b), 0) / buffers.length).toFixed(1) : '0.0';
    const drops = vids.map(v => {
      const q = v.getVideoPlaybackQuality?.() || {};
      const t = q.totalVideoFrames || 0, d = q.droppedVideoFrames || 0;
      return t ? `${(d*100/t).toFixed(1)}%` : 'N/A';
    });

    overlay.textContent =
      `GPU: ${gpuName}\n` +
      `CPU Busy: ${cpu}%  Videos: ${vids.length}\n` +
      `Buffers: [${buffers.join(', ')}]s  Avg: ${avg}s\n` +
      `Dropped: [${drops.join(', ')}]`;
  }
  setInterval(updateOverlay, 1000);

  /**************************************************************************
   * Hotkeys
   *  Ctrl+Shift+O : toggle overlay
   *  Ctrl+Shift+S : toggle staggering
   *  Ctrl+Shift+[ : reduce buffer target by 2s (min 4s)
   *  Ctrl+Shift+] : increase buffer target by 2s (max 30s)
   *  Ctrl+Shift+R : toggle CPU relief
   **************************************************************************/
  document.addEventListener('keydown', (e) => {
    const k = e.key?.toLowerCase();
    if (!(e.ctrlKey && e.shiftKey)) return;

    if (k === 'o') {
      OVERLAY_VISIBLE = !OVERLAY_VISIBLE;
      overlay.style.display = OVERLAY_VISIBLE ? 'block' : 'none';
      return;
    }
    if (k === 's') {
      STAGGER_ENABLED = !STAGGER_ENABLED;
      flash(`Stagger: ${STAGGER_ENABLED ? 'ON' : 'OFF'}`);
      return;
    }
    if (k === '[') {
      BUFFER_TARGET_S = Math.max(4, BUFFER_TARGET_S - 2);
      flash(`Buffer target: ${BUFFER_TARGET_S}s`);
      return;
    }
    if (k === ']') {
      BUFFER_TARGETS = Math.min(30, BUFFER_TARGET_S + 2);
      flash(`Buffer target: ${BUFFER_TARGET_S}s`);
      return;
    }
    if (k === 'r') {
      CPU_RELIEF_ON = !CPU_RELIEF_ON;
      flash(`CPU relief: ${CPU_RELIEF_ON ? 'ON' : 'OFF'}`);
      return;
    }
  });

  function flash(msg) {
    if (!OVERLAY_VISIBLE) { OVERLAY_VISIBLE = true; overlay.style.display = 'block'; }
    overlay.textContent = `GPU: ${gpuName}\n${msg}`;
    setTimeout(updateOverlay, 600);
  }
})();