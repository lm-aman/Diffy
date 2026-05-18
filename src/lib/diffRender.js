/** @typedef {import('./diffEngine.js').DiffNode} DiffNode */

const STATUS_BG = {
  added: 'bg-green-100',
  removed: 'bg-red-100',
  changed: 'bg-amber-100',
  unchanged: '',
};

/**
 * @param {*} value
 */
export function formatPrimitive(value) {
  if (value === undefined) return '';
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  return String(value);
}

/**
 * Flatten diff tree into render lines for split view
 * @param {DiffNode[]} nodes
 * @param {'left' | 'right'} side
 * @param {boolean} showUnchanged
 * @param {string} activeFilter
 * @returns {{ path: string; text: string; status: string; indent: number }[]}
 */
export function flattenForSplit(nodes, side, showUnchanged, activeFilter) {
  const lines = [];

  function shouldShow(status) {
    if (!showUnchanged && status === 'unchanged') return false;
    if (activeFilter !== 'all' && status !== activeFilter) return false;
    return true;
  }

  function walk(node, indent = 0) {
    if (node.key === 'root' && node.children) {
      node.children.forEach((c) => walk(c, indent));
      return;
    }

    const status = node.status;
    if (!shouldShow(status) && status === 'unchanged' && node.children?.length) {
      const count = countDescendants(node);
      lines.push({
        path: node.path,
        text: `▶ ${count} unchanged keys`,
        status: 'unchanged-collapsed',
        indent,
        isCollapse: true,
        node,
      });
      return;
    }

    if (!shouldShow(status)) return;

    let text = '';
    if (node.type === 'primitive') {
      const val = side === 'left' ? node.leftValue : node.rightValue;
      if (status === 'added' && side === 'left') text = '';
      else if (status === 'removed' && side === 'right') text = '';
      else text = `  "${node.key}": ${formatPrimitive(val)}`;
    } else if (node.type === 'object') {
      const open = side === 'left' ? node.leftValue : node.rightValue;
      if (open === undefined || open === null) {
        if (status === 'added' && side === 'left') return;
        if (status === 'removed' && side === 'right') return;
      }
      text = `  "${node.key}": {`;
    } else if (node.type === 'array') {
      text = `  "${node.key}": [`;
    }

    if (text) {
      lines.push({ path: node.path, text, status, indent });
    }

    if (node.children) {
      node.children.forEach((c) => walk(c, indent + 1));
      if (node.type === 'object' || node.type === 'array') {
        const close = node.type === 'object' ? '  },' : '  ],';
        if (shouldShow(status) || showUnchanged) {
          lines.push({
            path: `${node.path}__close`,
            text: close,
            status,
            indent,
          });
        }
      }
    }
  }

  nodes.forEach((n) => walk(n));
  return lines;
}

function countDescendants(node) {
  let count = 1;
  node.children?.forEach((c) => {
    count += countDescendants(c);
  });
  return count;
}

export { STATUS_BG };
