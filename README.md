# Diffy

A fully client-side JSON diff viewer for comparing two JSON payloads side-by-side. Built for API debugging — paste, upload, or fetch JSON and inspect differences in split or tree view.

## Features

- **Paste** — validate JSON with line-number errors
- **Upload** — drag-and-drop `.json` files
- **API** — Postman-style URL bar with `{{variable}}` substitution, query params, headers, and auth (Bearer, Basic, API Key)
- **Diff engine** — recursive object/array diff with added / removed / changed / unchanged stats
- **Split view** — side-by-side color-coded diff
- **Tree view** — collapsible DevTools-style tree with expand/collapse all

## Tech Stack

- React + Vite
- Tailwind CSS v4
- Zustand

## Getting Started

```bash
cd Diffy
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Notes

- **CORS**: Browser `fetch()` may be blocked by APIs that do not allow your origin. Use a proxy or extension when needed.
- **Large JSON**: Payloads over ~500KB may slow the diff; a warning is shown when applicable.
- **Array diffing**: Index-based comparison (LCS matching is a future enhancement).

## License

MIT
