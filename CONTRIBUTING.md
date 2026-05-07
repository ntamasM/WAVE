# Contributing to WAVE

Thanks for your interest in contributing! WAVE is open-source software under the [MIT License](./LICENSE), and contributions of any size are welcome.

## Ways to contribute

- **Report bugs** — open an issue at https://github.com/ntamasM/WAVE/issues with reproduction steps, the version (Settings → About), and any relevant logs.
- **Suggest features** — open a feature request issue describing what you'd like and why.
- **Submit code** — see the workflow below.
- **Star the repo** ⭐ — it helps others find the project.

## Development setup

Prerequisites:

- Windows 10+ (the app is Windows-only)
- Node.js 20+
- pnpm 9+

```bash
git clone https://github.com/ntamasM/WAVE.git
cd WAVE
pnpm install
pnpm run dev
```

The app launches in development mode with hot reload on the renderer.

## Pull request workflow

1. Fork the repo and create a feature branch off `main`:
   ```bash
   git checkout -b feat/short-description
   ```
2. Make your changes. Keep commits focused and use Conventional Commit prefixes (`feat:`, `fix:`, `chore:`, `docs:`, etc.) — the repo uses them already.
3. Run the checks before pushing:
   ```bash
   pnpm run lint
   pnpm run build
   ```
4. Push your branch and open a PR against `main`. Describe **what** the change does and **why**.
5. Be ready to iterate based on review feedback.

## Code style

- TypeScript everywhere (no JavaScript files in `src/`).
- React function components with hooks (no class components).
- Tailwind for styling — keep new utility classes consistent with what's already there.
- IPC follows the existing `ipcMain.handle` / `ipcRenderer.invoke` pattern; expose new APIs via `contextBridge` in `src/preload/index.ts`.
- When adding a new setting, update **both** the `electron-store` schema in `src/main/settings-store.ts` **and** the `getSettings()` return shape — forgetting either causes silent failures.

## Releases

Releases are cut by the maintainer. The flow is:

1. Bump `version` in `package.json`.
2. Add release notes at `release-notes/vX.Y.Z.md` (follow the existing format).
3. Tag and push: `git tag vX.Y.Z && git push origin vX.Y.Z`.
4. The `.github/workflows/release.yml` workflow builds x64 + ia32, packs with Velopack, and publishes to GitHub Releases automatically.

## License

By contributing to WAVE, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
