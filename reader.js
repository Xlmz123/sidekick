// Sidekick's page reader. This one function is injected into the page you're on, so it has to stand on its own.
// It returns what you've selected, what's on screen right now, form fields, and the page's main text,
// cleaned up and cut to fit. Google Docs and Sheets are read through their own text export.
async function sidekickReadPage(maxChars) {
  maxChars = maxChars || 40000;
  const out = { title: document.title || '', url: location.href, selection: '', onScreen: '', fields: '', text: '', note: '', chars: 0 };
  try { out.selection = String(window.getSelection ? window.getSelection() : '').trim().slice(0, 8000); } catch (e) {}

  // ---- Google Docs / Sheets draw text on a canvas, so read their plain-text export instead
  const host = location.hostname, path = location.pathname;
  const gdoc = host === 'docs.google.com' && path.match(/^\/document\/(?:u\/\d+\/)?d\/([\w-]+)/);
  const gsheet = host === 'docs.google.com' && path.match(/^\/spreadsheets\/(?:u\/\d+\/)?d\/([\w-]+)/);
  if (gdoc || gsheet) {
    try {
      let url;
      if (gdoc) url = '/document/d/' + gdoc[1] + '/export?format=txt';
      else {
        const gid = (location.hash.match(/gid=(\d+)/) || location.search.match(/gid=(\d+)/) || [])[1] || '0';
        url = '/spreadsheets/d/' + gsheet[1] + '/export?format=csv&gid=' + gid;
      }
      const r = await fetch(url, { credentials: 'include' });
      if (r.ok) {
        const t = (await r.text()).replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim();
        out.text = t.slice(0, maxChars);
        if (t.length > maxChars) out.note = 'The document is long; only the first part was read.';
        out.chars = out.text.length;
        out.note = (out.note ? out.note + ' ' : '') + (gdoc ? 'Read from the Google Doc\'s text.' : 'Read from the current sheet (CSV).');
        return out;
      }
    } catch (e) {}
  }

  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'CANVAS', 'IFRAME', 'TEMPLATE', 'OBJECT', 'VIDEO', 'AUDIO', 'PICTURE', 'IMG', 'BUTTON', 'SELECT', 'TEXTAREA', 'INPUT', 'HEAD']);
  const NOISE = /(^|[\s_-])(nav|navbar|menu|footer|cookie|consent|banner|sidebar|share|social|advert|ads?|promo|newsletter|popup|modal-backdrop|breadcrumbs?)($|[\s_-])/i;
  const BLOCK = new Set(['P', 'DIV', 'SECTION', 'ARTICLE', 'MAIN', 'LI', 'UL', 'OL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'TR', 'TABLE', 'BLOCKQUOTE', 'PRE', 'FIGCAPTION', 'DD', 'DT', 'DL', 'HEADER', 'ASIDE', 'FORM', 'FIELDSET', 'LABEL', 'BR', 'HR', 'TD', 'TH', 'CAPTION', 'SUMMARY', 'DETAILS']);
  const vh = window.innerHeight || 800, vw = window.innerWidth || 1200;

  function hidden(el) {
    if (el.hidden || el.getAttribute('aria-hidden') === 'true') return true;
    if (el.getClientRects().length === 0 && el.tagName !== 'BR') return true;
    const cs = getComputedStyle(el);
    return cs.visibility === 'hidden' || cs.display === 'none' || cs.opacity === '0';
  }
  function noisy(el) {
    const tag = el.tagName;
    if (tag === 'NAV' || tag === 'FOOTER' || el.getAttribute('role') === 'navigation' || el.getAttribute('role') === 'contentinfo') return true;
    const idc = (el.id || '') + ' ' + (typeof el.className === 'string' ? el.className : '');
    return idc.length < 200 && NOISE.test(idc);
  }
  function onScreen(el) {
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw && r.height > 0;
  }

  // walk the page and turn it into simple lines ("# heading", "- item", "a | b | c")
  function linesOf(root, budget, screenOnly) {
    const lines = [];
    let used = 0, cur = '', prefix = '';
    function flush() {
      const t = cur.replace(/\s+/g, ' ').trim();
      if (t) {
        const line = prefix + t;
        if (lines[lines.length - 1] !== line) { lines.push(line); used += line.length + 1; }
      }
      cur = ''; prefix = '';
    }
    function walk(node, depth) {
      if (used > budget || depth > 60) return;
      if (node.nodeType === 3) { cur += node.nodeValue; return; }
      if (node.nodeType !== 1) return;
      const el = node, tag = el.tagName;
      if (SKIP.has(tag)) return;
      if (hidden(el)) return;
      if (depth > 0 && noisy(el)) return;
      if (screenOnly && BLOCK.has(tag) && !onScreen(el)) return;
      const block = BLOCK.has(tag);
      if (block) flush();
      if (/^H[1-6]$/.test(tag)) prefix = '#'.repeat(+tag[1]) + ' ';
      else if (tag === 'LI') prefix = '- ';
      else if (tag === 'BLOCKQUOTE') prefix = '> ';
      if (tag === 'TR') {
        const cells = Array.from(el.children).filter(c => c.tagName === 'TD' || c.tagName === 'TH')
          .map(c => (c.innerText || c.textContent || '').replace(/\s+/g, ' ').trim());
        if (cells.some(Boolean)) { cur = cells.join(' | '); flush(); }
        return;
      }
      if (el.shadowRoot) for (const c of el.shadowRoot.childNodes) walk(c, depth + 1);
      for (const c of el.childNodes) walk(c, depth + 1);
      if (block) flush();
    }
    walk(root, 0); flush();
    return lines.join('\n');
  }

  // the main part of the page: <main>/<article> when it holds most of the text, else the whole body
  let root = document.body || document.documentElement;
  const cands = Array.from(document.querySelectorAll('main, article, [role="main"], #content, .content, #main'));
  const bodyLen = (root.innerText || '').length || 1;
  let best = null, bestLen = 0;
  for (const c of cands) { const n = (c.innerText || '').length; if (n > bestLen) { best = c; bestLen = n; } }
  if (best && bestLen > 400 && bestLen > bodyLen * 0.35) root = best;

  // form fields you can see (so it can help fill them in)
  try {
    const f = [];
    for (const el of document.querySelectorAll('input, textarea, select')) {
      if (f.length >= 40) break;
      const type = (el.getAttribute('type') || el.tagName).toLowerCase();
      if (['hidden', 'submit', 'button', 'image', 'reset', 'file'].includes(type)) continue;
      if (type === 'password') continue;   // never read passwords
      if (hidden(el)) continue;
      let label = el.getAttribute('aria-label') || '';
      if (!label && el.labels && el.labels[0]) label = el.labels[0].innerText;
      if (!label) label = el.getAttribute('placeholder') || el.getAttribute('name') || el.id || type;
      let val = '';
      if (type === 'checkbox' || type === 'radio') val = el.checked ? 'checked' : 'not checked';
      else if (el.tagName === 'SELECT') val = el.options[el.selectedIndex] ? el.options[el.selectedIndex].text : '';
      else val = (el.value || '').slice(0, 200);
      f.push('[' + type + '] ' + label.replace(/\s+/g, ' ').trim().slice(0, 80) + (val ? ' = ' + val : ' (empty)'));
    }
    out.fields = f.join('\n');
  } catch (e) {}

  try { out.onScreen = linesOf(document.body, 4000, true).slice(0, 4000); } catch (e) {}
  try {
    const budget = Math.max(2000, maxChars - out.onScreen.length - out.selection.length - out.fields.length);
    let t = linesOf(root, budget + 2000, false);
    if (t.length > budget) { t = t.slice(0, budget); out.note = 'The page is long; only the first part was read (plus what\'s on screen).'; }
    out.text = t;
  } catch (e) { out.text = (document.body && document.body.innerText || '').slice(0, maxChars); }

  const desc = document.querySelector('meta[name="description"], meta[property="og:description"]');
  if (desc && desc.content && out.text.length < 400) out.text = desc.content + '\n' + out.text;
  out.chars = out.text.length + out.onScreen.length + out.selection.length + out.fields.length;
  return out;
}
