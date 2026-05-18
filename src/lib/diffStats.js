/**
 * @typedef {import('./diffEngine.js').DiffNode} DiffNode
 */

/**
 * @param {DiffNode[]} nodes
 * @returns {{ added: number; removed: number; changed: number; unchanged: number }}
 */
export function aggregateStats(nodes) {
  const stats = { added: 0, removed: 0, changed: 0, unchanged: 0 };

  function walk(node) {
    if (node.key !== 'root') {
      if (node.status === 'added') stats.added++;
      else if (node.status === 'removed') stats.removed++;
      else if (node.status === 'changed') stats.changed++;
      else if (node.status === 'unchanged') stats.unchanged++;
    }
    if (node.children) {
      node.children.forEach(walk);
    }
  }

  nodes.forEach(walk);
  return stats;
}

/**
 * @param {DiffNode} root
 * @returns {{ added: number; removed: number; changed: number; unchanged: number }}
 */
export function computeStatsFromTree(nodes) {
  return aggregateStats(nodes);
}

/**
 * @param {DiffNode[]} nodes
 * @param {'added' | 'removed' | 'changed' | 'unchanged'} filter
 * @returns {string[]}
 */
export function collectPathsByStatus(nodes, filter) {
  const paths = [];

  function walk(node) {
    if (node.status === filter && node.key !== 'root') {
      paths.push(node.path);
    }
    node.children?.forEach(walk);
  }

  nodes.forEach(walk);
  return paths;
}
