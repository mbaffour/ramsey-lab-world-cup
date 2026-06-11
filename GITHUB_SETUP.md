# GitHub Setup

Use this after the local folder is ready.

## 1. Create the repository

Create a new GitHub repo, then upload/push this folder.

If you have Git installed locally:

```bash
git init
git add .
git commit -m "Launch Ramsey Lab World Cup Challenge"
git branch -M main
git remote add origin https://github.com/OWNER/REPO.git
git push -u origin main
```

This machine did not expose a working `git` executable during setup, so uploading the folder through GitHub's web UI is also fine.

## 2. Enable Pages

1. Go to `Settings` -> `Pages`.
2. Set source to `GitHub Actions`.
3. Run `Actions` -> `Deploy GitHub Pages` -> `Run workflow`.

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
