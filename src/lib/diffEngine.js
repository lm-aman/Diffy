/**
 * @typedef {'added' | 'removed' | 'changed' | 'unchanged'} DiffStatus
 */

/**
 * @typedef {Object} DiffNode
 * @property {string} key
 * @property {string} path
 * @property {DiffStatus} status
 * @property {*} [leftValue]
 * @property {*} [rightValue]
 * @property {DiffNode[]} [children]
 * @property {'object' | 'array' | 'primitive'} type
 */

const seen = new WeakSet();

function isObject(val) {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}

function isArray(val) {
  return Array.isArray(val);
}

function getType(val) {
  if (isArray(val)) return 'array';
  if (isObject(val)) return 'object';
  return 'primitive';
}

function pathSegment(parentPath, key) {
  if (parentPath === '') return String(key);
  if (/^\d+$/.test(String(key))) return `${parentPath}[${key}]`;
  return `${parentPath}.${key}`;
}

/**
 * @param {*} left
 * @param {*} right
 * @param {string} [path]
 * @param {string} [key]
 * @returns {DiffNode}
 */
function diffNodes(left, right, path = '', key = 'root') {
  if (isObject(left) && isObject(right)) {
    if (seen.has(left) || seen.has(right)) {
      return {
        key,
        path: path || key,
        status: left === right ? 'unchanged' : 'changed',
        leftValue: left,
        rightValue: right,
        type: 'object',
      };
    }
    seen.add(left);
    seen.add(right);

    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    const allKeys = [...new Set([...leftKeys, ...rightKeys])];

    const children = allKeys.map((k) => {
      const inLeft = k in left;
      const inRight = k in right;
      const childPath = pathSegment(path, k);

      if (inLeft && !inRight) {
        return buildSubtree(left[k], null, childPath, k, 'removed');
      }
      if (!inLeft && inRight) {
        return buildSubtree(null, right[k], childPath, k, 'added');
      }
      return diffNodes(left[k], right[k], childPath, k);
    });

    const status = children.every((c) => c.status === 'unchanged')
      ? 'unchanged'
      : 'changed';

    return {
      key,
      path: path || key,
      status: key === 'root' ? status : status,
      leftValue: left,
      rightValue: right,
      children,
      type: 'object',
    };
  }

  if (isArray(left) && isArray(right)) {
    const maxLen = Math.max(left.length, right.length);
    const children = [];

    for (let i = 0; i < maxLen; i++) {
      const childPath = pathSegment(path, i);
      if (i >= left.length) {
        children.push(buildSubtree(null, right[i], childPath, String(i), 'added'));
      } else if (i >= right.length) {
        children.push(buildSubtree(left[i], null, childPath, String(i), 'removed'));
      } else {
        children.push(diffNodes(left[i], right[i], childPath, String(i)));
      }
    }

    const status = children.every((c) => c.status === 'unchanged')
      ? 'unchanged'
      : 'changed';

    return {
      key,
      path: path || key,
      status,
      leftValue: left,
      rightValue: right,
      children,
      type: 'array',
    };
  }

  const leftType = getType(left);
  const rightType = getType(right);

  if (leftType !== rightType) {
    return {
      key,
      path: path || key,
      status: 'changed',
      leftValue: left,
      rightValue: right,
      type: 'primitive',
    };
  }

  if (left === right) {
    return {
      key,
      path: path || key,
      status: 'unchanged',
      leftValue: left,
      rightValue: right,
      type: 'primitive',
    };
  }

  return {
    key,
    path: path || key,
    status: 'changed',
    leftValue: left,
    rightValue: right,
    type: 'primitive',
  };
}

/**
 * @param {*} leftVal
 * @param {*} rightVal
 * @param {string} path
 * @param {string} key
 * @param {DiffStatus} status
 * @returns {DiffNode}
 */
function buildSubtree(leftVal, rightVal, path, key, status) {
  const val = leftVal ?? rightVal;
  const type = getType(val);

  if (type === 'object' && val !== null) {
    const source = status === 'removed' ? leftVal : rightVal;
    const keys = Object.keys(source);
    const children = keys.map((k) => {
      const childPath = pathSegment(path, k);
      if (status === 'removed') {
        return buildSubtree(source[k], null, childPath, k, 'removed');
      }
      return buildSubtree(null, source[k], childPath, k, 'added');
      });

    return {
      key,
      path,
      status,
      leftValue: leftVal,
      rightValue: rightVal,
      children,
      type: 'object',
    };
  }

  if (type === 'array' && val !== null) {
    const source = status === 'removed' ? leftVal : rightVal;
    const children = source.map((item, i) => {
      const childPath = pathSegment(path, i);
      if (status === 'removed') {
        return buildSubtree(item, null, childPath, String(i), 'removed');
      }
      return buildSubtree(null, item, childPath, String(i), 'added');
    });

    return {
      key,
      path,
      status,
      leftValue: leftVal,
      rightValue: rightVal,
      children,
      type: 'array',
    };
  }

  return {
    key,
    path,
    status,
    leftValue: leftVal,
    rightValue: rightVal,
    type: 'primitive',
  };
}

/**
 * @param {*} leftJson
 * @param {*} rightJson
 * @returns {DiffNode[]}
 */
export function computeDiff(leftJson, rightJson) {
  seen.clear();
  const left = leftJson ?? {};
  const right = rightJson ?? {};
  const root = diffNodes(left, right, '', 'root');
  return root.children ?? [root];
}

export { diffNodes };
