import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const inputPath = "C:/Users/mbaff/Downloads/ramsey_lab_world_cup_challenge_v2.xlsx";
const outputDir = "B:/Ramsey Lab World Cup/outputs/world_cup_lab_game";
const outputPath = `${outputDir}/Ramsey_Lab_World_Cup_Live_Competition.xlsx`;

await fs.mkdir(outputDir, { recursive: true });

const source = await SpreadsheetFile.importXlsx(await FileBlob.load(inputPath));
const sourceMatches = source.worksheets.getItem("Matches");
const matchValues = sourceMatches.getRange("A1:N105").values;
const maxMatchRows = 200;
const matchBodyRows = matchValues.slice(1);
while (matchBodyRows.length < maxMatchRows - 1) {
  matchBodyRows.push([null, null, null, null, null, null, null, null, null, null, null, null, null, null]);
}
const expandedMatchValues = [matchValues[0], ...matchBodyRows];
const kickoffValues = matchBodyRows.map((row) => {
  const dateText = String(row[1] ?? "");
  const timeText = String(row[3] ?? "");
  const [year, month, day] = dateText.split("-").map((x) => Number(x));
  const [hour, minute] = timeText.split(":").map((x) => Number(x));
  if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) return [null];
  return [new Date(year, month - 1, day, hour, minute, 0)];
});

const wb = Workbook.create();
const start = wb.worksheets.add("Start Here");
const setup = wb.worksheets.add("Setup");
const matches = wb.worksheets.add("Matches");
const responses = wb.worksheets.add("Form Responses 1");
const scoring = wb.worksheets.add("Scoring");
const leaderboard = wb.worksheets.add("Leaderboard");
const dashboard = wb.worksheets.add("Dashboard");
const awards = wb.worksheets.add("Fun Awards");
const formSetup = wb.worksheets.add("Form Setup");
const participants = wb.worksheets.add("Participants");

const navy = "#17324D";
const teal = "#0F766E";
const coral = "#E76F51";
const yellow = "#F4D35E";
const green = "#2A9D8F";
const blue = "#457B9D";
const light = "#F7FAFC";
const mid = "#E5E7EB";
const ink = "#111827";
const muted = "#6B7280";

function title(sheet, range, text, fill = navy) {
  const r = sheet.getRange(range);
  r.merge();
  r.values = [[text]];
  r.format = {
    fill,
    font: { bold: true, color: "#FFFFFF", size: 18 },
    horizontalAlignment: "center",
    verticalAlignment: "middle",
  };
  r.format.rowHeightPx = 42;
}

function header(range, fill = teal) {
  range.format = {
    fill,
    font: { bold: true, color: "#FFFFFF" },
    horizontalAlignment: "center",
    verticalAlignment: "middle",
    wrapText: true,
    borders: { preset: "all", style: "thin", color: "#CBD5E1" },
  };
}

function body(range) {
  range.format = {
    fill: "#FFFFFF",
    font: { color: ink },
    verticalAlignment: "middle",
    borders: { preset: "all", style: "thin", color: "#E5E7EB" },
    wrapText: true,
  };
}

function note(range) {
  range.format = {
    fill: "#FFF7ED",
    font: { color: "#7C2D12" },
    borders: { preset: "outside", style: "thin", color: "#FDBA74" },
    wrapText: true,
  };
}

for (const s of [start, setup, matches, responses, scoring, leaderboard, dashboard, awards, formSetup, participants]) {
  s.showGridLines = false;
}

title(start, "A1:H1", "Ramsey Lab World Cup Challenge");
start.getRange("A3:H3").merge();
start.getRange("A3:H3").values = [["A live Google Sheets game for match predictions, lab trash talk, exact-score bonuses, and a leaderboard that updates as submissions come in."]];
start.getRange("A3:H3").format = { fill: light, font: { color: ink, size: 12 }, wrapText: true };
start.getRange("A5:B12").values = [
  ["What the lab uses", "Share the Google Form. Players submit name, match ID, prediction, and optional exact score."],
  ["What the admin updates", "Enter final scores in Matches columns I:J and knockout advancing teams in column L."],
  ["What updates live", "Scoring, Leaderboard, Dashboard, Participants, and Fun Awards."],
  ["Scoring", "Correct result or advancing team = 3. Wrong eligible prediction = -1. Exact score bonus = 10. Late picks = 0."],
  ["Late rule", "A prediction submitted at or after the local kickoff timestamp scores 0, except Match ID 1 can be submitted anytime."],
  ["Google Forms tab", "Link a form to this spreadsheet. If Google creates a new response tab, rename it to Form Responses 1 or update Scoring formulas."],
  ["Fairness", "Turn off response editing and close each matchday form before kickoff if you want the cleanest game."],
  ["Launch flow", "Upload this workbook to Google Sheets, create/link the form, test one fake response, then share the form with the lab."],
];
header(start.getRange("A5:B5"), blue);
body(start.getRange("A6:B12"));
start.getRange("D5:H12").values = [
  ["Quick admin checklist", null, null, null, null],
  ["1", "Confirm Matches!D:D local kickoff times for your lab time zone.", null, null, null],
  ["2", "Create the Google Form using the exact question names in Form Setup.", null, null, null],
  ["3", "Link the form responses to this spreadsheet.", null, null, null],
  ["4", "Submit one test response and confirm it appears in Scoring and Leaderboard.", null, null, null],
  ["5", "Share the form link with the lab.", null, null, null],
  ["6", "Update final results in Matches after each game.", null, null, null],
  ["7", "Project Dashboard during lab meeting for maximum chaos.", null, null, null],
];
start.getRange("D5:H5").merge();
header(start.getRange("D5:H5"), coral);
body(start.getRange("D6:H12"));
start.getRange("A14:H16").merge();
start.getRange("A14:H16").values = [["Tip: the workbook is script-free. Everything is visible formulas so people can audit the scoring and you can move it between Excel, Google Sheets, and GitHub without code permissions."]];
note(start.getRange("A14:H16"));

setup.getRange("A1:H1").values = [["Participant Name", "Lab Nickname", "Favorite Team", "Notes", "", "Valid Group Outcomes", "Scoring", "Points"]];
setup.getRange("F2:H7").values = [
  ["Home", "Correct result/team advancing", 3],
  ["Draw", "Wrong result/team advancing", -1],
  ["Away", "No prediction", 0],
  ["", "Exact score bonus", 10],
  ["", "No score prediction", 0],
  ["", "Champion reign", "2026-2030"],
];
header(setup.getRange("A1:H1"));
body(setup.getRange("A2:H40"));
setup.freezePanes.freezeRows(1);

matches.getRange(`A1:N${maxMatchRows}`).values = expandedMatchValues;
matches.getRange("O1:Q1").values = [["Match Label", "Kickoff Local Timestamp", "Match Status"]];
matches.getRange("O2").formulas = [["=G2&\" vs \"&H2"]];
matches.getRange(`O2:O${maxMatchRows}`).fillDown();
matches.getRange(`P2:P${maxMatchRows}`).values = kickoffValues;
matches.getRange(`P2:P${maxMatchRows}`).format.numberFormat = "yyyy-mm-dd hh:mm";
matches.getRange("Q2").formulas = [["=IF(K2=\"\",\"Awaiting result\",\"Final\")"]];
matches.getRange(`Q2:Q${maxMatchRows}`).fillDown();
header(matches.getRange("A1:Q1"), navy);
body(matches.getRange(`A2:Q${maxMatchRows}`));
matches.getRange(`B2:B${maxMatchRows}`).format.numberFormat = "yyyy-mm-dd";
matches.getRange(`I2:J${maxMatchRows}`).format = { fill: "#ECFDF5", borders: { preset: "all", style: "thin", color: "#BBF7D0" } };
matches.getRange(`L2:L${maxMatchRows}`).format = { fill: "#EFF6FF", borders: { preset: "all", style: "thin", color: "#BFDBFE" } };
matches.freezePanes.freezeRows(1);

responses.getRange("A1:G1").values = [["Timestamp", "Participant", "Match ID", "Match Label", "Prediction", "Pred Home Goals", "Pred Away Goals"]];
header(responses.getRange("A1:G1"), coral);
body(responses.getRange("A2:G500"));
responses.getRange("I1:M8").values = [
  ["Do not type here after launch", null, null, null, null],
  ["Google Forms should write into columns A:G on this tab.", null, null, null, null],
  ["If Forms creates a different response tab, rename that tab to Form Responses 1.", null, null, null, null],
  ["Recommended form questions:", null, null, null, null],
  ["Participant", "Match ID", "Match Label", "Prediction", "Pred Home Goals"],
  ["Pred Away Goals", "", "", "", ""],
  ["Predicted goals are optional. Blank exact-score fields are not penalized.", null, null, null, null],
  ["Keep response editing off for fairness.", null, null, null, null],
];
responses.getRange("I1:M1").merge();
header(responses.getRange("I1:M1"), navy);
note(responses.getRange("I2:M8"));
responses.freezePanes.freezeRows(1);

scoring.getRange("A1:P1").values = [[
  "Timestamp", "Participant", "Match ID", "Match Label", "Prediction", "Pred Home Goals", "Pred Away Goals", "Stage",
  "Kickoff", "Actual Result", "Team Advanced", "Eligible?", "Result Points", "Exact Score Bonus", "Total Points", "Status / Notes",
]];
header(scoring.getRange("A1:P1"), navy);
body(scoring.getRange("A2:P500"));
scoring.getRange("A2:G2").formulas = [[
  "='Form Responses 1'!A2",
  "='Form Responses 1'!B2",
  "='Form Responses 1'!C2",
  "='Form Responses 1'!D2",
  "='Form Responses 1'!E2",
  "='Form Responses 1'!F2",
  "='Form Responses 1'!G2",
]];
scoring.getRange("A2:G500").fillDown();
scoring.getRange("H2:P2").formulas = [[
  `=IF($C2="","",IFERROR(VLOOKUP($C2,Matches!$A$2:$Q$${maxMatchRows},5,FALSE),"Unknown"))`,
  `=IF($C2="","",IFERROR(VLOOKUP($C2,Matches!$A$2:$Q$${maxMatchRows},16,FALSE),""))`,
  `=IF($C2="","",IFERROR(VLOOKUP($C2,Matches!$A$2:$Q$${maxMatchRows},11,FALSE),""))`,
  `=IF($C2="","",IFERROR(VLOOKUP($C2,Matches!$A$2:$Q$${maxMatchRows},12,FALSE),""))`,
  "=IF($A2=\"\",\"\",IF($C2=1,\"Yes\",IF(OR($I2=\"\",$A2<$I2),\"Yes\",\"Late\")))",
  "=IF($A2=\"\",\"\",IF($L2<>\"Yes\",0,IF($E2=\"\",0,IF($J2=\"\",0,IF($H2=\"Group\",IF($E2=$J2,Setup!$H$2,Setup!$H$3),IF($E2=$K2,Setup!$H$2,Setup!$H$3))))))",
  `=IF($A2="","",IF($L2<>"Yes",0,IF(OR($F2="",$G2=""),0,IF(AND($F2=VLOOKUP($C2,Matches!$A$2:$Q$${maxMatchRows},9,FALSE),$G2=VLOOKUP($C2,Matches!$A$2:$Q$${maxMatchRows},10,FALSE)),Setup!$H$5,0))))`,
  "=IF($A2=\"\",\"\",$M2+$N2)",
  "=IF($A2=\"\",\"\",IF($L2=\"Late\",\"Late - 0 points\",IF($J2=\"\",\"Waiting for result\",IF($O2>0,\"Scored\",IF($O2<0,\"Wrong pick\",\"No points\")))))",
]];
scoring.getRange("H2:P500").fillDown();
scoring.getRange("A2:A500").format.numberFormat = "yyyy-mm-dd hh:mm";
scoring.getRange("I2:I500").format.numberFormat = "yyyy-mm-dd hh:mm";
scoring.getRange("M2:O500").format.numberFormat = "0";
scoring.freezePanes.freezeRows(1);

title(leaderboard, "A1:I1", "Ramsey Lab World Cup Leaderboard", teal);
leaderboard.getRange("A3:I3").values = [["Rank", "Participant", "Total Points", "Correct Picks", "Exact Scores", "Wrong Picks", "Predictions Made", "Late Picks", "Title"]];
header(leaderboard.getRange("A3:I3"), navy);
body(leaderboard.getRange("A4:I103"));
leaderboard.getRange("B4").formulas = [["=IFERROR(SORT(UNIQUE(FILTER(Scoring!$B$2:$B$500,Scoring!$B$2:$B$500<>\"\"))),\"\")"]];
leaderboard.getRange("C4").formulas = [["=IF($B4=\"\",\"\",SUMIF(Scoring!$B$2:$B$500,$B4,Scoring!$O$2:$O$500))"]];
leaderboard.getRange("D4").formulas = [["=IF($B4=\"\",\"\",COUNTIFS(Scoring!$B$2:$B$500,$B4,Scoring!$M$2:$M$500,Setup!$H$2))"]];
leaderboard.getRange("E4").formulas = [["=IF($B4=\"\",\"\",COUNTIFS(Scoring!$B$2:$B$500,$B4,Scoring!$N$2:$N$500,Setup!$H$5))"]];
leaderboard.getRange("F4").formulas = [["=IF($B4=\"\",\"\",COUNTIFS(Scoring!$B$2:$B$500,$B4,Scoring!$M$2:$M$500,Setup!$H$3))"]];
leaderboard.getRange("G4").formulas = [["=IF($B4=\"\",\"\",COUNTIFS(Scoring!$B$2:$B$500,$B4,Scoring!$L$2:$L$500,\"Yes\"))"]];
leaderboard.getRange("H4").formulas = [["=IF($B4=\"\",\"\",COUNTIFS(Scoring!$B$2:$B$500,$B4,Scoring!$L$2:$L$500,\"Late\"))"]];
leaderboard.getRange("A4").formulas = [["=IF($B4=\"\",\"\",RANK($C4,$C$4:$C$103,0)+COUNTIFS($C$4:$C4,$C4)-1)"]];
leaderboard.getRange("I4").formulas = [["=IF($B4=\"\",\"\",IF(A4=1,\"Current Champion\",IF(E4=MAX($E$4:$E$103),\"Score Sniper\",IF(F4=MAX($F$4:$F$103),\"VAR Victim\",\"Contender\"))))"]];
leaderboard.getRange("A4:A103").fillDown();
leaderboard.getRange("C4:I103").fillDown();
leaderboard.getRange("A4:I103").conditionalFormats.add("colorScale", {
  thresholds: ["min", "50%", "max"],
  colors: ["#FEE2E2", "#FEF3C7", "#DCFCE7"],
});
leaderboard.freezePanes.freezeRows(3);

title(dashboard, "A1:L1", "Ramsey Lab World Cup Dashboard", blue);
dashboard.getRange("A3:B6").values = [
  ["Current Leader", ""],
  ["Leader Points", ""],
  ["Total Submissions", ""],
  ["Matches Final", ""],
];
dashboard.getRange("B3:B6").formulas = [
  ["=IFERROR(INDEX(SORT(FILTER(Leaderboard!B4:C103,Leaderboard!B4:B103<>\"\"),2,FALSE),1,1),\"No entries yet\")"],
  ["=IFERROR(INDEX(SORT(FILTER(Leaderboard!B4:C103,Leaderboard!B4:B103<>\"\"),2,FALSE),1,2),0)"],
  ["=COUNTA('Form Responses 1'!B2:B500)"],
  ["=COUNTIF(Matches!Q2:Q105,\"Final\")"],
];
header(dashboard.getRange("A3:A6"), navy);
body(dashboard.getRange("B3:B6"));
dashboard.getRange("D3:L3").values = [["Top 10"]];
dashboard.getRange("D3:L3").merge();
header(dashboard.getRange("D3:L3"), coral);
dashboard.getRange("D4:L14").formulas = [["=IFERROR(SORT(FILTER(Leaderboard!A3:I103,Leaderboard!B3:B103<>\"\"),3,FALSE),\"\")"]];
body(dashboard.getRange("D4:L14"));
dashboard.getRange("A8:B13").values = [
  ["Game health", ""],
  ["On-time picks", ""],
  ["Late picks", ""],
  ["Exact scores", ""],
  ["Wrong picks", ""],
  ["Active players", ""],
];
dashboard.getRange("B9:B13").formulas = [
  ["=COUNTIF(Scoring!L2:L500,\"Yes\")"],
  ["=COUNTIF(Scoring!L2:L500,\"Late\")"],
  ["=COUNTIF(Scoring!N2:N500,Setup!H5)"],
  ["=COUNTIF(Scoring!M2:M500,Setup!H3)"],
  ["=COUNTIF(Leaderboard!B4:B103,\"?*\")"],
];
header(dashboard.getRange("A8:B8"), teal);
body(dashboard.getRange("A9:B13"));

title(awards, "A1:C1", "Fun Awards", coral);
awards.getRange("A3:C10").values = [
  ["Award", "Winner", "What it means"],
  ["Current Champion", "", "Most eligible total points"],
  ["Score Sniper", "", "Most exact scores"],
  ["Result Merchant", "", "Most correct results"],
  ["VAR Victim", "", "Most wrong eligible picks"],
  ["Dedicated Predictor", "", "Most on-time predictions submitted"],
  ["Deadline Disaster", "", "Most late picks"],
  ["Signed Up, Stayed Silent", "", "Signed up but no eligible picks yet"],
];
awards.getRange("B4:B10").formulas = [
  ["=IFERROR(INDEX(SORT(FILTER(Leaderboard!B4:C103,Leaderboard!B4:B103<>\"\"),2,FALSE),1,1),\"\")"],
  ["=IFERROR(INDEX(SORT(FILTER(Leaderboard!B4:E103,Leaderboard!B4:B103<>\"\"),4,FALSE),1,1),\"\")"],
  ["=IFERROR(INDEX(SORT(FILTER(Leaderboard!B4:D103,Leaderboard!B4:B103<>\"\"),3,FALSE),1,1),\"\")"],
  ["=IFERROR(INDEX(SORT(FILTER(Leaderboard!B4:F103,Leaderboard!B4:B103<>\"\"),5,FALSE),1,1),\"\")"],
  ["=IFERROR(INDEX(SORT(FILTER(Leaderboard!B4:G103,Leaderboard!B4:B103<>\"\"),6,FALSE),1,1),\"\")"],
  ["=IFERROR(INDEX(SORT(FILTER(Leaderboard!B4:H103,Leaderboard!B4:B103<>\"\"),7,FALSE),1,1),\"\")"],
  ["=IFERROR(INDEX(FILTER(Participants!A4:A103,Participants!D4:D103=0),1),\"\")"],
];
header(awards.getRange("A3:C3"), navy);
body(awards.getRange("A4:C10"));

title(formSetup, "A1:C1", "Google Form Setup Guide", green);
formSetup.getRange("A3:C12").values = [
  ["Form question", "Type", "Notes"],
  ["Participant", "Short answer or dropdown", "Use consistent names for cleaner ranking."],
  ["Match ID", "Dropdown", "Use the IDs listed on Matches. Rows are reserved through Match ID 199 for future additions."],
  ["Match Label", "Dropdown or short answer", "Optional for humans; scoring uses Match ID."],
  ["Prediction", "Short answer", "Group games: Home, Draw, Away. Knockouts: the advancing team name."],
  ["Pred Home Goals", "Number", "Optional. Leave blank if they only want result points."],
  ["Pred Away Goals", "Number", "Optional. Exact score bonus needs both goal fields."],
  ["Settings", "Disable response editing", "Makes timestamps fairer."],
  ["Response destination", "Apps Script helper", "Paste google-apps-script/Code.gs into Extensions > Apps Script, then use the World Cup Admin menu."],
  ["If a new tab appears", "Rename it", "Use the exact tab name Form Responses 1."],
];
header(formSetup.getRange("A3:C3"), navy);
body(formSetup.getRange("A4:C12"));
formSetup.getRange("A14:C19").values = [
  ["Suggested announcement copy", null, null],
  ["Ramsey Lab World Cup Challenge is live. Submit predictions through the form before kickoff. For Match ID 1 only, submissions can come in anytime. Correct result or advancing team is 3 points, wrong eligible pick is -1, exact score is +10, and other late submissions are 0. Dashboard and leaderboard update live.", null, null],
  ["Admin rhythm", null, null],
  ["Before each matchday: check the form questions and close/reopen as needed.", null, null],
  ["After each game: enter final goals in Matches columns I:J and the leaderboard updates.", null, null],
  ["For knockouts: enter the advancing team in Matches column L.", null, null],
];
formSetup.getRange("A14:C14").merge();
formSetup.getRange("A16:C16").merge();
note(formSetup.getRange("A14:C19"));

title(participants, "A1:F1", "Players", teal);
participants.getRange("A3:F3").values = [["Participant", "Nickname", "Favorite Team", "Predictions Made", "Total Points", "Status"]];
header(participants.getRange("A3:F3"), navy);
body(participants.getRange("A4:F103"));
participants.getRange("A4").formulas = [["=Leaderboard!B4"]];
participants.getRange("A4:A103").fillDown();
participants.getRange("D4").formulas = [["=IF($A4=\"\",\"\",COUNTIF(Scoring!$B$2:$B$500,$A4))"]];
participants.getRange("E4").formulas = [["=IF($A4=\"\",\"\",SUMIF(Scoring!$B$2:$B$500,$A4,Scoring!$O$2:$O$500))"]];
participants.getRange("F4").formulas = [["=IF($A4=\"\",\"\",IF($D4=0,\"Signed up, stayed silent\",IF($E4=MAX($E$4:$E$103),\"In the title race\",\"Active\")))"]];
participants.getRange("D4:F103").fillDown();

for (const [sheet, widths] of [
  [start, [150, 520, 20, 60, 360, 120, 120, 120]],
  [setup, [160, 160, 150, 240, 20, 180, 240, 110]],
  [matches, [78, 110, 85, 90, 95, 80, 170, 170, 85, 85, 120, 160, 180, 145, 230, 150, 120]],
  [responses, [150, 160, 90, 230, 150, 115, 115, 20, 180, 180, 180, 180, 180]],
  [scoring, [150, 160, 80, 230, 150, 105, 105, 95, 150, 120, 160, 90, 105, 120, 105, 180]],
  [leaderboard, [70, 180, 110, 110, 110, 100, 130, 100, 160]],
  [dashboard, [150, 160, 24, 70, 180, 110, 110, 110, 100, 130, 100, 160]],
  [awards, [210, 190, 360]],
  [formSetup, [190, 220, 520]],
  [participants, [180, 160, 160, 130, 120, 190]],
]) {
  widths.forEach((w, i) => {
    sheet.getCell(0, i).format.columnWidthPx = w;
  });
}

const preview = await wb.render({ sheetName: "Dashboard", autoCrop: "all", scale: 1, format: "png" });
await fs.writeFile(`${outputDir}/dashboard_preview.png`, new Uint8Array(await preview.arrayBuffer()));

const errors = await wb.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
});
console.log(errors.ndjson);

const summary = await wb.inspect({
  kind: "table",
  range: "Start Here!A1:H16",
  include: "values,formulas",
  tableMaxRows: 20,
  tableMaxCols: 12,
  maxChars: 8000,
});
console.log(summary.ndjson);

const out = await SpreadsheetFile.exportXlsx(wb);
await out.save(outputPath);
console.log(outputPath);
