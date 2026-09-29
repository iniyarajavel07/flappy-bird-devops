# Git Branching Strategy & Workflow Guide

## Branch Structure

This project follows a structured Git branching strategy to enforce quality standards and zero secret leakage.

- `main`: Production-ready code. Commits here represent live cluster deployments.
- `develop`: Primary integration branch for upcoming releases.
- `feature/*`: Feature development branches created off `develop` (e.g., `feature/game-ui`, `feature/docker`, `feature/kubernetes`).
- `bugfix/*`: Fixes created off `develop` to resolve issues discovered during testing.
- `release/*`: Release candidate branches for pre-production validation.

## Pull Request & Merge Workflow

1. Create a feature branch:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/game-high-score
   ```
2. Commit changes with clear messages and push:
   ```bash
   git commit -m "feat(game): add LocalStorage high score persistence logic"
   git push origin feature/game-high-score
   ```
3. Open a Pull Request targeting `develop`.
4. Automated Jenkins webhook triggers test validation stage on PR creation.
5. Require at least 1 peer code review approval before merging.
6. Merge using **Squash and Merge** strategy to maintain clean commit history.

## Security Rules
- NEVER commit secrets, API tokens, AWS Access Keys, or Docker passwords.
- Ensure `.gitignore` ignores all local state (`.tfstate`, `.env`, `node_modules`).
