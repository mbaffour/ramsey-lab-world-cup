# Google Apps Script Helper

Paste `Code.gs` into the Google Sheet's Apps Script editor after uploading the workbook.

## What it does

- Adds a `World Cup Admin` menu to the Google Sheet.
- Creates a Google Form for lab submissions.
- Links that form to the same spreadsheet.
- Refreshes the Match ID and Match Label choices from the `Matches` sheet.

## When to run it

- Run `World Cup Admin` -> `Create or refresh prediction form` after first upload.
- Run it again whenever you add future matches to `Matches`.

The first run asks for Google authorization because the script creates and edits a form.
