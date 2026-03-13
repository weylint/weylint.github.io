const EcoRender = (() => {
  const NAMED_COLORS = new Set([
    'aqua','black','blue','brown','cyan','darkblue','fuchsia','green','grey',
    'lightblue','lime','magenta','maroon','navy','olive','orange','purple',
    'red','silver','teal','white','yellow',
  ]);
  const HEX_RE = /^#[0-9a-f]{6}([0-9a-f]{2})?$/i;

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function isValidColor(value) {
    const v = value.trim().toLowerCase();
    return NAMED_COLORS.has(v) || HEX_RE.test(v);
  }

  function storeNameHTML(raw) {
    if (!raw.includes('<')) return esc(raw);

    const TAG_RE = /<color=([^>]+)>|<\/color>/gi;
    const stack = [];
    let result = '';
    let lastIndex = 0;
    let match;

    while ((match = TAG_RE.exec(raw)) !== null) {
      // Append escaped text between last match and this one
      result += esc(raw.slice(lastIndex, match.index));
      lastIndex = match.index + match[0].length;

      if (match[1] !== undefined) {
        // Opening <color=VALUE>
        const value = match[1].trim().toLowerCase();
        if (isValidColor(value)) {
          stack.push(true);
          result += `<span style="color:${value}">`;
        } else {
          stack.push(false);
        }
      } else {
        // Closing </color>
        if (stack.length === 0) continue; // stray close — ignore
        const wasValid = stack.pop();
        if (wasValid) result += '</span>';
      }
    }

    // Remaining plain text
    result += esc(raw.slice(lastIndex));

    // Auto-close any unclosed spans
    while (stack.length > 0) {
      if (stack.pop()) result += '</span>';
    }

    return result;
  }

  return { esc, storeNameHTML };
})();
