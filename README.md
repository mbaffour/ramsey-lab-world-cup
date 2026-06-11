# Ramsey Lab World Cup Challenge

This folder contains a ready-to-upload live competition workbook, a Google Apps Script helper for the player submission form, and a GitHub Pages scoreboard that refreshes from Google Sheets every night.

## Main file

- `outputs/world_cup_lab_game/Ramsey_Lab_World_Cup_Live_Competition.xlsx`
- `docs/index.html`
- `.github/workflows/update-scoreboard.yml`
- `.github/workflows/deploy-pages.yml`
- `google-apps-script/Code.gs`
- `LIVE_LINKS.md`

## Google Sheets launch

1. Open the uploaded native Google Sheet listed in `LIVE_LINKS.md`.
2. Confirm the spreadsheet timezone is `America/Chicago`.
3. In the Sheet, open `Extensions` -> `Apps Script`.
4. Paste in `google-apps-script/Code.gs`.
5. Save, reload the Sheet, and run `World Cup Admin` -> `Create or refresh prediction form`.
6. If Google creates a new responses tab with another name, rename it to `Form Responses 1`.
7. Submit one test response and check `Scoring`, `Leaderboard`, and `Dashboard`.
8. Share the form link with the lab.

## GitHub Pages launch

1. Create a GitHub repository for this folder.
2. Push this folder to GitHub.
3. In the repository, go to `Settings` -> `Pages`.
4. Set the source to `GitHub Actions`.
5. Push to `main` or `master`.
6. The `Deploy GitHub Pages` workflow publishes the `/docs` site.

## Daily update setup

The public GitHub site is static, so submissions should go into Google Forms/Sheets. GitHub Actions then refreshes `docs/data/site-data.json` once per day.

In Google Sheets:

1. Open the live workbook as a native Google Sheet.
2. Publish the `Leaderboard` tab as CSV.
3. Optional: publish `Fun Awards`, `Dashboard`, `Scoring`, and `Matches` as CSV if you want richer public stats and upcoming-match display.

In GitHub:

1. Go to `Settings` -> `Secrets and variables` -> `Actions`.
2. Add repository secret `LEADERBOARD_CSV_URL` with the published CSV URL for the `Leaderboard` tab.
3. Optional secrets:
   - `AWARDS_CSV_URL`
   - `DASHBOARD_CSV_URL`
   - `SCORING_CSV_URL`
   - `MATCHES_CSV_URL`
4. Add repository variable `FORM_URL` with the public Google Form link.
5. The workflow runs daily at `11:55 PM Central` during the World Cup schedule.
6. You can also run it immediately from `Actions` -> `Update scoreboard data` -> `Run workflow`.

## Admin workflow

- Before launch, confirm `Matches` column `P` has the correct local kickoff timestamps.
- After each match, enter final scores in `Matches` columns `I:J`.
- For knockout matches, enter the advancing team in `Matches` column `L`.
- The scoring, leaderboard, dashboard, player list, and fun awards update from formulas.

## Adding future matches

1. Add each future match to the next blank row in `Matches`.
2. Use a new unique `Match ID`.
3. Fill `Date`, `Local Time`, `Stage`, `Group`, `Team 1 / Home`, `Team 2 / Away`, `Venue`, and `City`.
4. Leave final-score columns blank until the match is played.
5. Run `World Cup Admin` -> `Create or refresh prediction form` so the Google Form gets the new Match IDs.
6. Run the GitHub workflow manually or wait for the daily refresh.

## Submission flow

- Lab members submit predictions through the Google Form.
- The Google Sheet scores everything.
- GitHub Actions pulls the published leaderboard CSV at the end of each day.
- The GitHub Pages site updates all visible scores at once.

## Scoring

- Correct group-stage result or knockout advancing team: `3`
- Wrong eligible prediction: `-1`
- Exact score bonus: `10`
- No prediction: `0`
- Late prediction: `0`
- First game exception: `Match ID 1` can be submitted anytime and still scores normally.

The workbook and public site are script-free in the browser, so no GitHub write token or Google credential is exposed to lab members.
