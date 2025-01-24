/**
 * Sends a notification to Telegram when a form response is submitted.
 * Configuration is stored in a settings sheet.
 * @param {Object} e - The event object from the trigger.
 * @param {string} spreadsheetId - The ID of the Google Sheets spreadsheet.
 * @param {string} settingsSheetName - The name of the settings sheet.
 * @param {string} formResponsesSheetNameCell - The cell containing the form responses sheet name.
 * @param {string} botApiTokenCell - The cell containing the Telegram Bot API token.
 * @param {string} customTitleCell - The cell containing the custom title for the message.
 */
function sendTelegramNotificationOnFormSubmit(e, spreadsheetId, settingsSheetName, formResponsesSheetNameCell, botApiTokenCell, customTitleCell) {
  console.log("sendTelegramNotificationOnFormSubmit triggered");

  // Log the entire event object for debugging
  console.log("Event object: " + JSON.stringify(e));

  // Get configuration from settings sheet
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(settingsSheetName);
  if (!sheet) {
    console.log("Settings sheet not found.");
    return;
  }

  const botApiToken = sheet.getRange(botApiTokenCell).getValue();
  const formResponsesSheetName = sheet.getRange(formResponsesSheetNameCell).getValue();
  const customTitle = sheet.getRange(customTitleCell).getValue();

  console.log("Bot API Token: " + botApiToken);
  console.log("Form Responses Sheet Name: " + formResponsesSheetName);
  console.log("Custom Title: " + customTitle);

  // Validate settings
  if (!botApiToken || !formResponsesSheetName || !customTitle) {
    console.log("One or more required settings are missing.");
    return;
  }

  // Get form response data
  const responsesSheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(formResponsesSheetName);
  if (!responsesSheet) {
    console.log("Form responses sheet not found.");
    return;
  }

  const headers = responsesSheet.getRange(1, 1, 1, responsesSheet.getLastColumn()).getValues()[0];
  if (!headers || headers.length === 0) {
    console.log("Headers not found.");
    return;
  }
  console.log("Headers: " + headers);

  // Extract the latest response from the event object
  const latestResponse = e.response.getItemResponses().reduce((acc, item) => {
    acc[item.getItem().getTitle()] = item.getResponse();
    return acc;
  }, {});
  if (!latestResponse || Object.keys(latestResponse).length === 0) {
    console.log("Form response data not found.");
    return;
  }
  console.log("Latest Response: " + JSON.stringify(latestResponse));

  const telegramId = latestResponse["Telegram ID"];
  if (!telegramId) {
    console.log("Telegram ID is empty.");
    return;
  }
  console.log("Telegram ID: " + telegramId);

  // Escape special characters for Markdown
  function escapeMarkdown(text) {
    if (typeof text !== 'string') {
      text = String(text);
    }
    return text.replace(/([_*[\]()~`>#+=|{}.!-])/g, '\\$1');
  }

  // Construct message
  let message = '*' + customTitle + '*\n';
  const scriptTimestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  message += '*Timestamp*: ' + scriptTimestamp + '\n\n';

  // Add form response data
  headers.forEach(header => {
    if (latestResponse[header] && latestResponse[header] !== '') {
      if (header === 'Timestamp') {
        const formattedTimestamp = Utilities.formatDate(new Date(latestResponse[header]), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
        message += '*' + escapeMarkdown(header) + '*: ' + formattedTimestamp + '\n';
      } else {
        message += '*' + escapeMarkdown(header) + '*: ' + escapeMarkdown(latestResponse[header].toString()) + '\n';
      }
    }
  });

  console.log("Message to send: " + message);

  // Send Telegram message
  const url = 'https://api.telegram.org/bot' + botApiToken + '/sendMessage';
  const payload = {
    'chat_id': telegramId,
    'text': message,
    'parse_mode': 'Markdown'
  };

  const options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload),
    'muteHttpExceptions': true
  };

  try {
    let response = UrlFetchApp.fetch(url, options);
    let responseData = JSON.parse(response.getContentText());
    console.log("Response data: " + JSON.stringify(responseData));

    // Handle chat migration
    if (responseData.error_code === 400 && responseData.parameters && responseData.parameters.migrate_to_chat_id) {
      telegramId = responseData.parameters.migrate_to_chat_id;
      payload.chat_id = telegramId;
      options.payload = JSON.stringify(payload);
      
      response = UrlFetchApp.fetch(url, options);
      responseData = JSON.parse(response.getContentText());
      console.log("Response data after migration: " + JSON.stringify(responseData));
    }
  } catch (error) {
    console.log("Error: " + error.toString());
  }
}

/**
 * Creates an installable trigger for form submissions.
 * @param {string} formId - The ID of the Google Form.
 */
function createInstallableTrigger(formId) {
  const form = FormApp.openById(formId);
  ScriptApp.newTrigger('sendTelegramNotificationOnFormSubmit')
    .forForm(form)
    .onFormSubmit()
    .create();
}
