const WORLD_CUP_FORM_TITLE = 'Ramsey Lab World Cup Predictions';
const WORLD_CUP_MATCHES_SHEET = 'Matches';

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('World Cup Admin')
    .addItem('Create or refresh prediction form', 'createOrRefreshPredictionForm')
    .addItem('Show form URL', 'showPredictionFormUrl')
    .addToUi();
}

function createOrRefreshPredictionForm() {
  const spreadsheet = SpreadsheetApp.getActive();
  const props = PropertiesService.getDocumentProperties();
  let formId = props.getProperty('WORLD_CUP_FORM_ID');
  let form = formId ? FormApp.openById(formId) : FormApp.create(WORLD_CUP_FORM_TITLE);

  form.setTitle(WORLD_CUP_FORM_TITLE);
  form.setDescription(
    'Submit Ramsey Lab World Cup predictions. Match ID 1 can be submitted anytime; other matches should be submitted before kickoff.'
  );
  form.setAllowResponseEdits(false);
  form.setCollectEmail(false);
  form.setDestination(FormApp.DestinationType.SPREADSHEET, spreadsheet.getId());

  rebuildFormItems_(form, getOpenMatches_());
  props.setProperty('WORLD_CUP_FORM_ID', form.getId());
  props.setProperty('WORLD_CUP_FORM_URL', form.getPublishedUrl());

  SpreadsheetApp.getUi().alert('Prediction form is ready:\n\n' + form.getPublishedUrl());
}

function showPredictionFormUrl() {
  const url = PropertiesService.getDocumentProperties().getProperty('WORLD_CUP_FORM_URL');
  SpreadsheetApp.getUi().alert(url || 'No form URL saved yet. Run "Create or refresh prediction form" first.');
}

function rebuildFormItems_(form, matches) {
  const existing = form.getItems();
  for (let index = existing.length - 1; index >= 0; index--) {
    form.deleteItem(existing[index]);
  }

  form.addTextItem()
    .setTitle('Participant')
    .setRequired(true);

  form.addListItem()
    .setTitle('Match ID')
    .setChoiceValues(matches.map(match => String(match.id)))
    .setRequired(true);

  form.addListItem()
    .setTitle('Match Label')
    .setChoiceValues(matches.map(match => match.label))
    .setRequired(false);

  form.addTextItem()
    .setTitle('Prediction')
    .setHelpText('Group matches: Home, Draw, or Away. Knockout matches: type the advancing team name exactly as it appears in Matches.')
    .setRequired(true);

  form.addTextItem()
    .setTitle('Pred Home Goals')
    .setHelpText('Optional exact-score prediction.');

  form.addTextItem()
    .setTitle('Pred Away Goals')
    .setHelpText('Optional exact-score prediction.');
}

function getOpenMatches_() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(WORLD_CUP_MATCHES_SHEET);
  if (!sheet) throw new Error('Missing Matches sheet.');

  const values = sheet.getDataRange().getDisplayValues();
  const header = values.shift();
  const col = name => header.indexOf(name);
  const matchIdCol = col('Match ID');
  const teamOneCol = col('Team 1 / Home');
  const teamTwoCol = col('Team 2 / Away');
  const statusCol = col('Match Status');
  const actualCol = col('Actual Result');
  const dateCol = col('Date');
  const timeCol = col('Local Time');

  return values
    .filter(row => row[matchIdCol] && row[teamOneCol] && row[teamTwoCol])
    .filter(row => row[statusCol] !== 'Final' && !row[actualCol])
    .map(row => ({
      id: row[matchIdCol],
      label: `${row[matchIdCol]} - ${row[teamOneCol]} vs ${row[teamTwoCol]} (${row[dateCol]} ${row[timeCol]})`,
    }));
}
