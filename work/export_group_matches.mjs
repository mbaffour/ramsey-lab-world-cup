import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const workbookPath = "B:/Ramsey Lab World Cup/outputs/world_cup_lab_game/Ramsey_Lab_World_Cup_Live_Competition.xlsx";
const outputPath = "B:/Ramsey Lab World Cup/docs/data/site-data.json";

const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));
const matches = workbook.worksheets.getItem("Matches").getRange("A1:Q200").values;
const [header, ...rows] = matches;
const index = Object.fromEntries(header.map((name, i) => [name, i]));

const groupMatches = rows
  .filter((row) => row[index["Stage"]] === "Group")
  .filter((row) => row[index["Match ID"]] && row[index["Team 1 / Home"]] && row[index["Team 2 / Away"]])
  .map((row) => ({
    matchId: row[index["Match ID"]],
    date: row[index["Date"]],
    localTime: row[index["Local Time"]],
    stage: `Group ${row[index["Group"]]}`,
    label: `${row[index["Team 1 / Home"]]} vs ${row[index["Team 2 / Away"]]}`,
    status: row[index["Match Status"]] || "Awaiting result",
  }));

const raw = await fs.readFile(outputPath, "utf8");
const data = JSON.parse(raw);
data.groupMatches = groupMatches;
data.upcomingMatches = groupMatches.slice(0, 16);
data.stats = {
  ...data.stats,
  groupStageGames: groupMatches.length,
};
await fs.writeFile(outputPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
console.log(`Wrote ${groupMatches.length} group-stage games to ${outputPath}`);
