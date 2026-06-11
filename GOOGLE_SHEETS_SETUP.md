# Google Sheets Setup

## Upload workbook

The workbook has been uploaded and converted to a native Google Sheet:

- `https://docs.google.com/spreadsheets/d/1vjdrxik4JSYj_mYaBYcLvfvzbkPTW_hhXexUzbQn3tE`

The spreadsheet timezone has been set to `America/Chicago`.

## Create the player form

1. In the Google Sheet, open `Extensions` -> `Apps Script`.
2. Paste the contents of `google-apps-script/Code.gs`.
3. Save the project.
4. Reload the Google Sheet.
5. Use `World Cup Admin` -> `Create or refresh prediction form`.
6. Authorize the script when prompted.
7. Submit one fake response to confirm `Form Responses 1`, `Scoring`, and `Leaderboard` update.

## Publish CSV feeds for GitHub

Use `File` -> `Share` -> `Publish to web`.

Publish these tabs as CSV:

- `Leaderboard` required
- `Matches` recommended
- `Fun Awards` recommended
- `Dashboard` optional
- `Scoring` optional

Copy each CSV URL into the matching GitHub Actions secret.

## Adding future matches

1. Add new matches to blank rows in `Matches`.
2. Keep internal Match IDs unique; players will only see match names.
3. Run `World Cup Admin` -> `Create or refresh prediction form`.
4. The public GitHub site updates after the next scheduled workflow run.
