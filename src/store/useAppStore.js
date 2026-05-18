import { create } from 'zustand';
import { computeDiff } from '../lib/diffEngine.js';
import { aggregateStats } from '../lib/diffStats.js';
import { validateJson } from '../components/shared/JsonValidator.js';

const defaultHeaders = [
  { key: 'Content-Type', value: 'application/json', enabled: true },
  { key: 'Accept', value: 'application/json', enabled: true },
];

const defaultApiConfig = () => ({
  url: '',
  pathVariables: [],
  queryParams: [],
  headers: defaultHeaders.map((h) => ({ ...h })),
  authType: 'none',
  authValues: {},
});

const defaultPane = () => ({
  activeTab: 'paste',
  rawJson: '',
  parsedJson: null,
  parseError: null,
  parseErrorLine: null,
  apiConfig: defaultApiConfig(),
  apiLoading: false,
  apiError: null,
  uploadFileName: null,
  uploadFileSize: null,
});

function resolvePaneData(pane) {
  if (pane.parsedJson !== null) return pane.parsedJson;
  if (pane.rawJson.trim()) return null;
  return {};
}

function recomputeDiff(left, right) {
  const leftData = resolvePaneData(left);
  const rightData = resolvePaneData(right);

  if (!left.rawJson.trim() && !right.rawJson.trim()) {
    return { diffResult: null, diffStats: null };
  }

  if (leftData === null || rightData === null) {
    return { diffResult: null, diffStats: null };
  }

  const diffResult = computeDiff(leftData, rightData);
  const diffStats = aggregateStats(diffResult);
  return { diffResult, diffStats };
}

export const useAppStore = create((set, get) => ({
  left: defaultPane(),
  right: defaultPane(),
  viewMode: 'split',
  diffResult: null,
  diffStats: null,
  showUnchanged: false,
  activeFilter: 'all',
  expandedPaths: new Set(),
  setViewMode: (viewMode) => set({ viewMode }),

  setShowUnchanged: (showUnchanged) => set({ showUnchanged }),

  setActiveFilter: (activeFilter) => set({ activeFilter }),

  toggleExpandedPath: (path) =>
    set((state) => {
      const next = new Set(state.expandedPaths);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return { expandedPaths: next };
    }),

  setPaneTab: (side, activeTab) =>
    set((state) => ({
      [side]: { ...state[side], activeTab },
    })),

  setPaneRawJson: (side, rawJson) =>
    set((state) => {
      const pane = { ...state[side], rawJson, parseError: null, parseErrorLine: null };
      const left = side === 'left' ? pane : state.left;
      const right = side === 'right' ? pane : state.right;
      const { diffResult, diffStats } = recomputeDiff(left, right);
      return { [side]: pane, diffResult, diffStats };
    }),

  validatePaneJson: (side) =>
    set((state) => {
      const pane = state[side];
      const result = validateJson(pane.rawJson);
      if (!result.valid) {
        return {
          [side]: {
            ...pane,
            parsedJson: null,
            parseError: result.error,
            parseErrorLine: result.line,
          },
        };
      }
      const updated = {
        ...pane,
        parsedJson: result.data,
        parseError: null,
        parseErrorLine: null,
      };
      const left = side === 'left' ? updated : state.left;
      const right = side === 'right' ? updated : state.right;
      const { diffResult, diffStats } = recomputeDiff(left, right);
      return { [side]: updated, diffResult, diffStats };
    }),

  setPaneParsedJson: (side, parsedJson, rawJson) =>
    set((state) => {
      const pane = {
        ...state[side],
        parsedJson,
        rawJson: rawJson ?? JSON.stringify(parsedJson, null, 2),
        parseError: null,
        parseErrorLine: null,
      };
      const left = side === 'left' ? pane : state.left;
      const right = side === 'right' ? pane : state.right;
      const { diffResult, diffStats } = recomputeDiff(left, right);
      return { [side]: pane, diffResult, diffStats };
    }),

  setApiConfig: (side, partial) =>
    set((state) => ({
      [side]: {
        ...state[side],
        apiConfig: { ...state[side].apiConfig, ...partial },
      },
    })),

  setApiLoading: (side, apiLoading) =>
    set((state) => ({
      [side]: { ...state[side], apiLoading },
    })),

  setApiError: (side, apiError) =>
    set((state) => ({
      [side]: { ...state[side], apiError },
    })),

  setUploadMeta: (side, uploadFileName, uploadFileSize) =>
    set((state) => ({
      [side]: { ...state[side], uploadFileName, uploadFileSize },
    })),
}));
