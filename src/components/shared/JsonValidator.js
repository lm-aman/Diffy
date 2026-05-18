/**
 * @param {string} text
 * @returns {{ valid: boolean; data?: unknown; error?: string; line?: number }}
 */
export function validateJson(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    return { valid: false, error: 'JSON is empty' };
  }

  try {
    const data = JSON.parse(trimmed);
    return { valid: true, data };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid JSON';
    const lineMatch = message.match(/position (\d+)/i);
    let line = 1;
    if (lineMatch) {
      const pos = parseInt(lineMatch[1], 10);
      line = text.slice(0, pos).split('\n').length;
    } else {
      const lineMatch2 = message.match(/line (\d+)/i);
      if (lineMatch2) line = parseInt(lineMatch2[1], 10);
    }
    return { valid: false, error: message, line };
  }
}

/**
 * @param {string} text
 * @returns {{ lines: number; chars: number }}
 */
export function countTextStats(text) {
  return {
    lines: text ? text.split('\n').length : 0,
    chars: text.length,
  };
}

/**
 * @param {*} data
 * @param {number} [sizeBytes]
 * @returns {string | null}
 */
export function largeJsonWarning(data, sizeBytes) {
  const bytes = sizeBytes ?? JSON.stringify(data).length;
  if (bytes > 500 * 1024) {
    return `Large payload (~${Math.round(bytes / 1024)}KB). Diff may be slow.`;
  }
  return null;
}
