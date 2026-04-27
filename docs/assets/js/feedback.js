(function() {
  'use strict';
  // ══════════════════════════════════════════════════════════════════════════
  // CONFIG
  // ══════════════════════════════════════════════════════════════════════════
  // TODO: Replace with your deployed Apps Script Web App URL
  const FEEDBACK_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyR73H3H_q1i2pr68yZcUszcofd0PwGAkrAC2sXa3iFWiztJw0YmYTq1-VWUrexio6Sqg/exec';
  // SVG icons (inline, no emoji)
  const ICONS = {
    smiley: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#00ff88" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><circle cx="9" cy="10" r="0.8" fill="#00ff88"/><circle cx="15" cy="10" r="0.8" fill="#00ff88"/><path d="M8.5 14.5 Q12 17.5 15.5 14.5"/></svg>',
    frown: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#ff6b6b" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><circle cx="9" cy="10" r="0.8" fill="#ff6b6b"/><circle cx="15" cy="10" r="0.8" fill="#ff6b6b"/><path d="M8.5 16 Q12 13 15.5 16"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/></svg>'
  };
  // State
  let _toolName = '';
  let _errorContext = null;
  let _inputSnapshot = null;
  let _popoverOpen = false;
  let _selectedRating = null;
  // ══════════════════════════════════════════════════════════════════════════
  // DOM ELEMENTS
  // ══════════════════════════════════════════════════════════════════════════
  function createPassiveBar() {
    const bar = document.createElement('div');
    bar.className = 'ck-feedback-bar';
    bar.innerHTML = `
      <span class="ck-feedback-bar-label">Was this tool helpful?</span>
      <div class="ck-feedback-bar-btns">
        <button class="ck-feedback-vote-btn" data-vote="up" aria-label="Yes, helpful">
          ${ICONS.smiley} <span>Yes</span>
        </button>
        <button class="ck-feedback-vote-btn negative" data-vote="down" aria-label="No, not helpful">
          ${ICONS.frown} <span>No</span>
        </button>
      </div>
    `;
    return bar;
  }
  function createFAB() {
    const fab = document.createElement('button');
    fab.className = 'ck-fab';
    fab.setAttribute('aria-label', 'Feedback and error reporting');
    fab.innerHTML = ICONS.chat;
    return fab;
  }
  function createPopover() {
    const popover = document.createElement('div');
    popover.className = 'ck-feedback-popover';
    popover.setAttribute('role', 'dialog');
    popover.setAttribute('aria-labelledby', 'ck-fp-title');
    popover.innerHTML = `
      <div class="ck-fp-header">
        <div class="ck-fp-title" id="ck-fp-title">Leave feedback</div>
        <button class="ck-fp-close" aria-label="Close">&times;</button>
      </div>
      <div class="ck-fp-body" id="ck-fp-body">
        <!-- Content dynamically inserted -->
      </div>
    `;
    return popover;
  }
  // ══════════════════════════════════════════════════════════════════════════
  // LAYER 1: PASSIVE BAR
  // ══════════════════════════════════════════════════════════════════════════
  function initPassiveBar(bar) {
    const toolSlug = _toolName.toLowerCase().replace(/\s+/g, '-');
    const storageKey = `ck_vote_${toolSlug}`;
    // Check if user already voted
    if (localStorage.getItem(storageKey)) {
      bar.classList.add('hidden');
      return;
    }
    // Wire vote buttons
    bar.querySelectorAll('.ck-feedback-vote-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const vote = btn.dataset.vote;
        // Visual feedback
        btn.classList.add(vote === 'up' ? 'voted-yes' : 'voted-no');
        // Send to backend
        sendFeedback({
          type: 'passive_vote',
          tool: _toolName,
          vote: vote,
          url: window.location.href,
          userAgent: navigator.userAgent,
          ts: new Date().toISOString()
        });
        // Store vote & hide bar
        localStorage.setItem(storageKey, vote);
        bar.querySelector('.ck-feedback-bar-label').textContent = 'Thanks for your feedback!';
        setTimeout(() => {
          bar.classList.add('hidden');
        }, 2000);
      });
    });
  }
  // ══════════════════════════════════════════════════════════════════════════
  // LAYER 2 & 3: FAB + POPOVER
  // ══════════════════════════════════════════════════════════════════════════
  function openPopover(fab, popover, isError) {
    _popoverOpen = true;
    popover.classList.add('show');
    const title = popover.querySelector('.ck-fp-title');
    const body = popover.querySelector('#ck-fp-body');
    if (isError && _errorContext) {
      // Error report mode
      title.textContent = 'Report an issue';
      body.innerHTML = buildErrorForm();
      wireErrorForm(body, fab, popover);
    } else {
      // Normal feedback mode
      title.textContent = 'Leave feedback';
      body.innerHTML = buildFeedbackForm();
      wireFeedbackForm(body, fab, popover);
    }
  }
  function closePopover(popover, fab) {
    _popoverOpen = false;
    popover.classList.remove('show');
    _selectedRating = null;
  }
  function buildErrorForm() {
    const errorMsg = _errorContext || 'An error occurred';
    const hasInput = _inputSnapshot && Object.keys(_inputSnapshot).length > 0;
    return `
      <div class="ck-fp-error-chip">
        ${ICONS.alert}
        <div class="ck-fp-error-text">${escapeHtml(errorMsg)}</div>
      </div>
      ${hasInput ? `
      <div class="ck-fp-debug-toggle">
        <div class="ck-fp-debug-row">
          <span class="ck-fp-debug-label">Include my input for debugging</span>
          <div class="ck-fp-toggle" id="ck-debug-toggle" role="switch" aria-checked="false"></div>
        </div>
        <div class="ck-fp-debug-sublabel">First 2000 chars per field — preview below before sending</div>
        <div class="ck-fp-preview" id="ck-preview">
          <div class="ck-fp-preview-box" id="ck-preview-box"></div>
        </div>
      </div>
      ` : ''}
      <textarea class="ck-fp-textarea" id="ck-comment" placeholder="Anything else? (optional)" rows="2"></textarea>
      <button class="ck-fp-submit" id="ck-submit">Send report</button>
    `;
  }
  function buildFeedbackForm() {
    return `
      <div class="ck-fp-thumbs">
        <button class="ck-fp-thumb-btn" data-rating="positive">
          ${ICONS.smiley}
        </button>
        <button class="ck-fp-thumb-btn negative" data-rating="negative">
          ${ICONS.frown}
        </button>
      </div>
      <textarea class="ck-fp-textarea" id="ck-comment" placeholder="Tell us more... (optional)" rows="2"></textarea>
      <button class="ck-fp-submit" id="ck-submit" disabled>Send feedback</button>
    `;
  }
  function wireErrorForm(body, fab, popover) {
    const toggle = body.querySelector('#ck-debug-toggle');
    const preview = body.querySelector('#ck-preview');
    const previewBox = body.querySelector('#ck-preview-box');
    const submitBtn = body.querySelector('#ck-submit');
    const commentTA = body.querySelector('#ck-comment');
    let debugEnabled = false;
    if (toggle && preview && previewBox) {
      toggle.addEventListener('click', () => {
        debugEnabled = !debugEnabled;
        toggle.classList.toggle('on', debugEnabled);
        toggle.setAttribute('aria-checked', debugEnabled);
        preview.classList.toggle('show', debugEnabled);
        if (debugEnabled) {
          previewBox.innerHTML = buildInputPreview();
        }
      });
    }
    submitBtn.addEventListener('click', () => {
      const comment = commentTA.value.trim();
      const inputData = debugEnabled ? _inputSnapshot : null;
      sendFeedback({
        type: 'error_report',
        tool: _toolName,
        errorMessage: _errorContext || '',
        comment: comment,
        inputSnapshot: inputData,
        userAgent: navigator.userAgent,
        url: window.location.href,
        ts: new Date().toISOString()
      });
      submitBtn.textContent = '✓ Sent — thank you';
      submitBtn.classList.add('sent');
      submitBtn.disabled = true;
      fab.classList.remove('error');
      fab.classList.add('success');
      setTimeout(() => {
        closePopover(popover, fab);
        _errorContext = null;
        _inputSnapshot = null;
      }, 1800);
    });
  }
  function wireFeedbackForm(body, fab, popover) {
    const thumbBtns = body.querySelectorAll('.ck-fp-thumb-btn');
    const submitBtn = body.querySelector('#ck-submit');
    const commentTA = body.querySelector('#ck-comment');
    thumbBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        thumbBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        _selectedRating = btn.dataset.rating;
        submitBtn.disabled = false;
      });
    });
    submitBtn.addEventListener('click', () => {
      if (!_selectedRating) return;
      const comment = commentTA.value.trim();
      sendFeedback({
        type: 'feedback',
        tool: _toolName,
        rating: _selectedRating,
        comment: comment,
        userAgent: navigator.userAgent,
        url: window.location.href,
        ts: new Date().toISOString()
      });
      submitBtn.textContent = '✓ Sent — thank you';
      submitBtn.classList.add('sent');
      submitBtn.disabled = true;
      fab.classList.add('success');
      setTimeout(() => {
        closePopover(popover, fab);
        setTimeout(() => fab.classList.remove('success'), 600);
      }, 1800);
    });
  }
  function buildInputPreview() {
    if (!_inputSnapshot) return '<div style="color:var(--muted)">No input data</div>';
    let html = '';
    for (const [label, value] of Object.entries(_inputSnapshot)) {
      const preview = truncateValue(value, 2000);
      html += `
        <div class="ck-fp-preview-row">
          <div class="ck-fp-preview-label">${escapeHtml(label)}:</div>
          <div class="ck-fp-preview-value">${escapeHtml(preview)}</div>
        </div>
      `;
    }
    return html || '<div style="color:var(--muted)">No input data</div>';
  }
  function truncateValue(val, maxLen) {
    if (!val) return '';
    // File metadata
    if (typeof val === 'object' && val.name && val.type) {
      return `[File: ${val.name}, ${val.type}, ${(val.size / 1024).toFixed(1)} KB]`;
    }
    const str = String(val);
    if (str.length <= maxLen) return str;
    return str.slice(0, maxLen) + `... [truncated · ${str.length.toLocaleString()} of ${str.length.toLocaleString()} chars]`;
  }
  // ══════════════════════════════════════════════════════════════════════════
  // BACKEND COMMUNICATION
  // ══════════════════════════════════════════════════════════════════════════
  function sendFeedback(data) {
    if (!FEEDBACK_ENDPOINT || FEEDBACK_ENDPOINT === 'YOUR_APPS_SCRIPT_URL_HERE') {
      console.warn('[CKFeedback] Apps Script endpoint not configured. See docs/feedback-setup.md');
      return;
    }
    fetch(FEEDBACK_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(err => {
      console.error('[CKFeedback] Send failed:', err);
    });
  }
  // ══════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ══════════════════════════════════════════════════════════════════════════
  function init(toolName) {
    if (!toolName) {
      console.warn('[CKFeedback] No tool name provided. Set window.CIPHERKIT_TOOL_NAME before loading feedback.js');
      return;
    }
    _toolName = toolName;
    // Create elements
    const bar = createPassiveBar();
    const fab = createFAB();
    const popover = createPopover();
    // Insert into DOM
    const toolWrap = document.querySelector('.tool-interface-wrap');
    if (toolWrap) {
      toolWrap.appendChild(bar);
      initPassiveBar(bar);
    }
    document.body.appendChild(fab);
    document.body.appendChild(popover);
    // Wire FAB
    fab.addEventListener('click', () => {
      if (_popoverOpen) {
        closePopover(popover, fab);
      } else {
        openPopover(fab, popover, fab.classList.contains('error'));
      }
    });
    // Wire close button
    popover.querySelector('.ck-fp-close').addEventListener('click', () => {
      closePopover(popover, fab);
    });
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (_popoverOpen && !popover.contains(e.target) && !fab.contains(e.target)) {
        closePopover(popover, fab);
      }
    });
  }
  function reportError(errorMsg, inputSnapshot) {
    _errorContext = errorMsg || 'An error occurred';
    _inputSnapshot = sanitizeInputSnapshot(inputSnapshot);
    const fab = document.querySelector('.ck-fab');
    if (fab) {
      fab.classList.add('error');
    }
  }
  function sanitizeInputSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') return null;
    const sanitized = {};
    for (const [key, value] of Object.entries(snapshot)) {
      // If it's a file input, extract metadata only
      if (value instanceof File) {
        sanitized[key] = {
          name: value.name,
          type: value.type,
          size: value.size
        };
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
  // ══════════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ══════════════════════════════════════════════════════════════════════════
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  // ══════════════════════════════════════════════════════════════════════════
  // EXPORT
  // ══════════════════════════════════════════════════════════════════════════
  window.CKFeedback = {
    init: init,
    reportError: reportError
  };
  // Auto-init if tool name is set
  if (window.CIPHERKIT_TOOL_NAME) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => init(window.CIPHERKIT_TOOL_NAME));
    } else {
      init(window.CIPHERKIT_TOOL_NAME);
    }
  }
})();