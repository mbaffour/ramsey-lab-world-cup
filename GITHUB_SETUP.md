# GitHub Setup

Use this after the local folder is ready.

## 1. Create the repository

The repository has been created:

- `https://github.com/mbaffour/ramsey-lab-world-cup`

If you have Git installed locally:

```bash
git init
git add .
git commit -m "Launch Ramsey Lab World Cup Challenge"
git branch -M main
git remote add origin https://github.com/OWNER/REPO.git
git push -u origin main
```

Git for Windows is installed on this machine at `C:\Program Files\Git`.

## 2. Enable Pages

Pages is enabled through GitHub Actions:

- `https://mbaffour.github.io/ramsey-lab-world-cup/`

## 3. Add Actions secrets

Go to `Settings` -> `Secrets and variables` -> `Actions`.

Required secret:

- `LEADERBOARD_CSV_URL`

Optional secrets:

- `AWARDS_CSV_URL`
- `DASHBOARD_CSV_URL`
- `SCORING_CSV_URL`
- `MATCHES_CSV_URL`

Repository variable:

- `FORM_URL`

## 4. Daily updates

The `Update scoreboard data` workflow runs daily at 11:55 PM Central and can also be run manually.
