# Security Notes

## GitHub-safe files
- Commit `backend/.env.example` and `frontend/.env.example`
- Do not commit real `.env` files
- Do not commit local uploads, logs, backups, or maintenance scripts with hardcoded passwords

## Required secrets
- `MONGODB_URI`
- `JWT_SECRET`
- `FRONTEND_URL`
- `CORS_ORIGINS`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`

## Before pushing to GitHub
- Replace any real secrets in local `.env` files with placeholders in example files only
- Confirm `git status` does not show `.env`, uploads, logs, or backup folders
- Avoid pushing one-off reset or seed scripts that contain test users or passwords
- If your current git repo still contains old root-level tracked files, create a fresh GitHub repo and push only the current `backend/`, `frontend/`, `.gitignore`, `SECURITY.md`, and deployment docs

## Before production deploy
- Set `NODE_ENV=production`
- Use a long random `JWT_SECRET`
- Use real SMTP credentials if forgot-password must work
- Rotate any credentials that were ever stored in local files during development

## Recommended policy
- Keep all secrets only in platform environment variables
- Treat uploaded user files as runtime data, not repository data
- Review new scripts before committing if they modify users, passwords, or database records
