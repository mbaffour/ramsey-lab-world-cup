import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "C:/Users/mbaff/Downloads/ramsey_lab_world_cup_challenge_v2.xlsx";
const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);

const overview = await workbook.inspect({
  kind: "workbook,sheet,table",
  maxChars: 12000,
  tableMaxRows: 12,
  tableMaxCols: 14,
  tableMaxCellChars: 120,
});
console.log("=== OVERVIEW ===");
console.log(overview.ndjson);

const sheets = await workbook.inspect({
  kind: "sheet",
  include: "id,name",
  maxChars: 4000,
});
console.log("=== SHEETS ===");
console.log(sheets.ndjson);

const formulaScan = await workbook.inspect({
  kind: "formula",
  options: { maxResults: 200 },
  maxChars: 12000,
});
console.log("=== FORMULAS ===");
console.log(formulaScan.ndjson);
