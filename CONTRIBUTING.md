# Contributing to Daredevil

Thank you for your interest in contributing to **Daredevil** — the AI-Powered Security Surveillance & Forensic Analysis Platform.

## Getting Started

1. **Fork and clone** the repository.
2. **Install dependencies:**
   ```bash
   npm install
   npm run setup-visualization   # optional: for UFDR 3D visualization
   ```
3. **Set up environment:** Copy `.env.example` to `.env.local` and add your API keys (see README). Never commit `.env.local`.
4. **Run the dev server:**
   ```bash
   npm run dev
   ```

## Development

- **Code style:** TypeScript/React in `app/` and `components/`. Python scripts in `scripts/` (use type hints and docstrings).
- **Linting:** Use ESLint and Prettier for frontend code.
- **Testing:** Ensure existing flows (surveillance, forensic analysis, 3D viz) still work after changes.

## Pull Requests

1. Create a **branch** from `main`: `git checkout -b feature/your-feature-name`.
2. Make your changes and **commit** with clear messages (e.g. `feat: add X`, `fix: resolve Y`, `docs: update Z`).
3. **Push** your branch: `git push -u origin feature/your-feature-name`.
4. Open a **Pull Request** on GitHub with a short description of what changed and why.
5. Address any review feedback. Once approved, a maintainer will merge.

## Areas You Can Help

- **Documentation:** README, API docs, inline comments.
- **UI/UX:** Improvements to surveillance dashboard, 3D visualizer, or NLP query interface.
- **Scripts:** Python UFDR/GNN scripts — performance, error handling, or new visualizations.
- **Tests:** Unit or integration tests for critical paths.

## Questions?

Open an issue for bugs, feature ideas, or questions. We’re happy to help.

Thanks for contributing.
