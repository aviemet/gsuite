# GSuite Signature Manager

Centralized email signature management for Google Workspace.

Admins design HTML signature templates once, fill them with Directory profile data (name, title, phone, company, and more), and assign them to people, groups, or organizational units — instead of asking every user to maintain their own footer in Gmail.

## What it does

- **Template library** — Browse, search, and manage signature templates in grid or table view
- **Design wizard** — Create or edit signatures in four steps: starting point → design → targets & schedule → confirm
- **Rich HTML editing** — Visual (TinyMCE) and code editors, live preview with sample Directory data, and placeholder insertion
- **Dynamic placeholders** — Tokens like `{{fullName}}`, `{{jobTitle}}`, and `{{company}}` resolve from Google Directory fields; conditional blocks hide empty sections
- **Targeted rollout** — Assign templates to individual users, groups, OUs, or as an org-wide default (assignment UI is in place; Directory targets currently use local fixtures)

Templates are stored in Firestore. The admin UI is a React app. Production serves that UI from Firebase Hosting, the API from a Cloud Function, and signature deploys from Cloud Tasks.

## Monorepo layout

| Package | Role |
| --- | --- |
| `packages/frontend` | Admin UI (React, Vite, Mantine, TanStack Router/Query) |
| `packages/shared` | Shared types and placeholder definitions |
| `packages/api` | HTTP API and signature deploy worker |
| `packages/functions` | Firebase Cloud Functions entry points |
| `packages/firebase` | Firestore rules, indexes, and emulator seed data |

## Getting started

Requires Node.js and [Yarn 4](https://yarnpkg.com/) (this repo uses the node-modules linker).

```bash
yarn install
yarn dev
```

`yarn dev` starts the Firebase emulators (Auth, Firestore, etc.) and the Vite frontend together. Emulators import seed data from `packages/firebase/seed` and write it back on exit.

Useful variants:

| Command | What it runs |
| --- | --- |
| `yarn dev` | Emulators + Vite |
| `yarn dev:no-seed` | Emulators without importing/exporting seed |
| `yarn dev:all` | Also rebuilds `shared` and `functions` while you work |
| `yarn test` | Unit tests across workspaces |
| `yarn build` | Production build for all packages |

Client Firebase config comes from `VITE_*` environment variables loaded for the frontend package.

## Deploy

Production is Firebase Hosting plus Cloud Functions. The project must be on the Blaze plan. From the repo root, after `firebase login`:

```bash
yarn deploy
```

That builds the frontend and the functions bundle, then publishes Hosting, Cloud Functions, and the Firestore rules and indexes. Hosting serves the UI and rewrites `/api/**` to the `api` function. The rules are what allow or deny browser access to Firestore. Disconnect the GitHub repository from Vercel before relying on this deploy; Firebase does not replace that connection by itself.

## Stack

React 19 · TypeScript · Vite · Mantine · TinyMCE · TanStack Router & Query · Firebase (Auth, Firestore, Functions) · Yarn workspaces
