// Tiny, safe Markdown → HTML for answers. Everything is escaped first, so nothing in a reply can inject HTML.
function skEscape(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function skInline(s) {
  // s is already escaped
  const codes = [];
  s = s.replace(/`([^`\n]+)`/g, (m, c) => { codes.push(c); return '\u0000' + (codes.length - 1) + '\u0000'; });
  s = s.replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g, (m, t, u) => '<a href="' + u + '" target="_blank" rel="noopener noreferrer">' + t + '</a>');
  s = s.replace(/(^|[\s(])(https?:\/\/[^\s<)]+[^\s<).,;:!?'"])/g, (m, pre, u) => pre + '<a href="' + u + '" target="_blank" rel="noopener noreferrer">' + u + '</a>');
  s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>').replace(/__([^_\n]+)__/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^\w*])\*([^*\n]+)\*(?!\w)/g, '$1<em>$2</em>').replace(/(^|[^\w_])_([^_\n]+)_(?!\w)/g, '$1<em>$2</em>');
  s = s.replace(/~~([^~\n]+)~~/g, '<del>$1</del>');
  s = s.replace(/\u0000(\d+)\u0000/g, (m, i) => '<code>' + codes[+i] + '</code>');
  return s;
}
function skMarkdown(src) {
  const lines = skEscape(String(src || '')).replace(/\r/g, '').split('\n');
  const html = [];
  let i = 0;
  let para = [];
  const flushPara = () => { if (para.length) { html.push('<p>' + skInline(para.join('<br>')) + '</p>'); para = []; } };
  while (i < lines.length) {
    const line = lines[i];
    const fence = line.match(/^\s*```\s*([\w+-]*)\s*$/);
    if (fence) {
      flushPara();
      const code = [];
      i++;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) { code.push(lines[i]); i++; }
      i++;
      html.push('<div class="code"><button class="copy-code" title="Copy">Copy</button><pre><code>' + code.join('\n') + '</code></pre></div>');
      continue;
    }
    if (/^\s*$/.test(line)) { flushPara(); i++; continue; }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { flushPara(); const n = Math.min(h[1].length + 2, 6); html.push('<h' + n + '>' + skInline(h[2]) + '</h' + n + '>'); i++; continue; }
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { flushPara(); html.push('<hr>'); i++; continue; }
    if (/^\s*&gt;\s?/.test(line)) {
      flushPara();
      const q = [];
      while (i < lines.length && /^\s*&gt;\s?/.test(lines[i])) { q.push(lines[i].replace(/^\s*&gt;\s?/, '')); i++; }
      html.push('<blockquote>' + skInline(q.join('<br>')) + '</blockquote>');
      continue;
    }
    if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
      flushPara();
      const row = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map(c => skInline(c.trim()));
      const head = row(line);
      i += 2;
      const body = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) { body.push(row(lines[i])); i++; }
      html.push('<div class="tbl"><table><thead><tr>' + head.map(c => '<th>' + c + '</th>').join('') + '</tr></thead><tbody>' +
        body.map(r => '<tr>' + r.map(c => '<td>' + c + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>');
      continue;
    }
    const li = line.match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
    if (li) {
      flushPara();
      const ordered = /\d/.test(li[2]);
      const items = [];
      while (i < lines.length) {
        const m = lines[i].match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
        if (m && (/\d/.test(m[2]) === ordered || m[1].length >= 2)) {
          items.push((m[1].length >= 2 ? '<span class="sub">' : '') + skInline(m[3]) + (m[1].length >= 2 ? '</span>' : ''));
          i++;
        } else if (!m && /^\s{2,}\S/.test(lines[i]) && items.length) { items[items.length - 1] += '<br>' + skInline(lines[i].trim()); i++; }
        else break;
      }
      html.push((ordered ? '<ol>' : '<ul>') + items.map(x => '<li>' + x + '</li>').join('') + (ordered ? '</ol>' : '</ul>'));
      continue;
    }
    para.push(line);
    i++;
  }
  flushPara();
  return html.join('');
}
if (typeof module !== 'undefined') module.exports = { skMarkdown, skEscape };
