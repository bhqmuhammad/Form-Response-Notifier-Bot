/**
 * Form Response Notifier Bot for Google Apps Script
 * Sends Telegram notifications when Google Form responses are submitted
 * 
 * @author bhqmuhammad
 * @version 1.1.0
 * @license MIT
 */

// Configuration Constants
const CONFIG = {
  DEFAULT_SETTINGS_SHEET: 'Telegram Bot Settings',
  DEFAULT_CELLS: {
    BOT_TOKEN: 'B1',
    SHEET_NAME: 'B2', 
    CUSTOM_TITLE: 'B3'
  },
  TELEGRAM_API_BASE: 'https://api.telegram.org/bot',
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000
};

// Error Messages
const ERRORS = {
  SETTINGS_SHEET_NOT_FOUND: 'Settings sheet not found',
  FORM_RESPONSES_SHEET_NOT_FOUND: 'Form responses sheet not found', 
  MISSING_CONFIGURATION: 'Required configuration settings are missing',
  MISSING_HEADERS: 'Form headers not found',
  NO_FORM_DATA: 'Form response data not found',
  MISSING_TELEGRAM_ID: 'Telegram ID is required but not provided',
  TELEGRAM_API_ERROR: 'Failed to send Telegram message'
};

/**
 * Main function to send Telegram notification when form is submitted.
 * This is the entry point that should be used as the trigger function.
 * 
 * @param {Object} e - The event object from the Google Form trigger
 * @param {string} [spreadsheetId] - Optional spreadsheet ID (defaults to active spreadsheet)
 * @param {string} [settingsSheetName] - Optional settings sheet name (defaults to CONFIG.DEFAULT_SETTINGS_SHEET)
 * @param {string} [formResponsesSheetNameCell] - Optional cell reference for form sheet name (defaults to CONFIG.DEFAULT_CELLS.SHEET_NAME)
 * @param {string} [botApiTokenCell] - Optional cell reference for bot token (defaults to CONFIG.DEFAULT_CELLS.BOT_TOKEN)
 * @param {string} [customTitleCell] - Optional cell reference for custom title (defaults to CONFIG.DEFAULT_CELLS.CUSTOM_TITLE)
 */
function sendTelegramNotificationOnFormSubmit(e, spreadsheetId, settingsSheetName, formResponsesSheetNameCell, botApiTokenCell, customTitleCell) {
  try {
    console.log("Form submission trigger activated");
    console.log("Event object:", JSON.stringify(e));

    // Set default values if parameters are not provided
    const config = {
      spreadsheetId: spreadsheetId || SpreadsheetApp.getActiveSpreadsheet().getId(),
      settingsSheetName: settingsSheetName || CONFIG.DEFAULT_SETTINGS_SHEET,
      formResponsesSheetNameCell: formResponsesSheetNameCell || CONFIG.DEFAULT_CELLS.SHEET_NAME,
      botApiTokenCell: botApiTokenCell || CONFIG.DEFAULT_CELLS.BOT_TOKEN,
      customTitleCell: customTitleCell || CONFIG.DEFAULT_CELLS.CUSTOM_TITLE
    };

    // Load and validate configuration
    const settings = loadConfiguration(config);
    console.log("Configuration loaded successfully");

    // Extract form response data
    const formData = extractFormResponse(e, settings.formResponsesSheetName, config.spreadsheetId);
    console.log("Form data extracted:", JSON.stringify(formData));

    // Build and send notification message
    const message = buildNotificationMessage(formData, settings.customTitle);
    const result = sendTelegramMessage(settings.botApiToken, formData.telegramId, message);
    
    if (result.success) {
      console.log("Notification sent successfully");
    } else {
      console.error("Failed to send notification:", result.error);
    }

  } catch (error) {
    console.error("Critical error in sendTelegramNotificationOnFormSubmit:", error.toString());
    // Optional: Send error notification to admin if configured
    // sendErrorNotification(error);
  }
}

/**
 * Loads and validates configuration settings from the specified sheet.
 * 
 * @param {Object} config - Configuration object containing sheet and cell references
 * @returns {Object} Validated configuration settings
 * @throws {Error} If configuration is invalid or missing
 */
function loadConfiguration(config) {
  const spreadsheet = SpreadsheetApp.openById(config.spreadsheetId);
  const settingsSheet = spreadsheet.getSheetByName(config.settingsSheetName);
  
  if (!settingsSheet) {
    throw new Error(ERRORS.SETTINGS_SHEET_NOT_FOUND + ": " + config.settingsSheetName);
  }

  const settings = {
    botApiToken: settingsSheet.getRange(config.botApiTokenCell).getValue(),
    formResponsesSheetName: settingsSheet.getRange(config.formResponsesSheetNameCell).getValue(),
    customTitle: settingsSheet.getRange(config.customTitleCell).getValue()
  };

  // Validate required settings
  const missingSettings = [];
  if (!settings.botApiToken) missingSettings.push('Bot API Token');
  if (!settings.formResponsesSheetName) missingSettings.push('Form Responses Sheet Name');
  if (!settings.customTitle) missingSettings.push('Custom Title');

  if (missingSettings.length > 0) {
    throw new Error(ERRORS.MISSING_CONFIGURATION + ": " + missingSettings.join(', '));
  }

  console.log("Settings validated:", {
    hasToken: !!settings.botApiToken,
    sheetName: settings.formResponsesSheetName,
    title: settings.customTitle
  });

  return settings;
}

/**
 * Extracts form response data from the event object and validates it.
 * 
 * @param {Object} e - The event object from the form trigger
 * @param {string} formResponsesSheetName - Name of the responses sheet
 * @param {string} spreadsheetId - ID of the spreadsheet
 * @returns {Object} Extracted and validated form data
 * @throws {Error} If form data is invalid or missing
 */
function extractFormResponse(e, formResponsesSheetName, spreadsheetId) {
  // Validate event object
  if (!e || !e.response) {
    throw new Error(ERRORS.NO_FORM_DATA + ": Invalid event object");
  }

  // Get form headers for validation
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const responsesSheet = spreadsheet.getSheetByName(formResponsesSheetName);
  
  if (!responsesSheet) {
    throw new Error(ERRORS.FORM_RESPONSES_SHEET_NOT_FOUND + ": " + formResponsesSheetName);
  }

  const lastColumn = responsesSheet.getLastColumn();
  if (lastColumn === 0) {
    throw new Error(ERRORS.MISSING_HEADERS + ": Sheet appears to be empty");
  }

  const headers = responsesSheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  if (!headers || headers.length === 0) {
    throw new Error(ERRORS.MISSING_HEADERS);
  }

  // Extract response data from event
  const responseData = {};
  e.response.getItemResponses().forEach(item => {
    responseData[item.getItem().getTitle()] = item.getResponse();
  });

  if (Object.keys(responseData).length === 0) {
    throw new Error(ERRORS.NO_FORM_DATA + ": No responses found in event");
  }

  // Validate Telegram ID
  const telegramId = responseData["Telegram ID"];
  if (!telegramId) {
    throw new Error(ERRORS.MISSING_TELEGRAM_ID);
  }

  return {
    headers: headers,
    responseData: responseData,
    telegramId: telegramId,
    timestamp: new Date()
  };
}

/**
 * Builds a formatted notification message from form data.
 * 
 * @param {Object} formData - Extracted form data
 * @param {string} customTitle - Custom title for the message
 * @returns {string} Formatted message in Markdown
 */
function buildNotificationMessage(formData, customTitle) {
  let message = '*' + escapeMarkdown(customTitle) + '*\n';
  
  // Add timestamp
  const timestamp = Utilities.formatDate(formData.timestamp, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  message += '*Submission Time*: ' + timestamp + '\n\n';

  // Add form response data
  formData.headers.forEach(header => {
    const value = formData.responseData[header];
    if (value && value !== '') {
      if (header === 'Timestamp' && value instanceof Date) {
        const formattedTimestamp = Utilities.formatDate(new Date(value), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
        message += '*' + escapeMarkdown(header) + '*: ' + formattedTimestamp + '\n';
      } else {
        message += '*' + escapeMarkdown(header) + '*: ' + escapeMarkdown(String(value)) + '\n';
      }
    }
  });

  return message;
}

/**
 * Sends a message to Telegram with retry logic and error handling.
 * 
 * @param {string} botToken - Telegram Bot API token
 * @param {string} chatId - Telegram chat ID
 * @param {string} message - Message to send
 * @returns {Object} Result object with success status and optional error
 */
function sendTelegramMessage(botToken, chatId, message) {
  const url = CONFIG.TELEGRAM_API_BASE + botToken + '/sendMessage';
  const payload = {
    'chat_id': chatId,
    'text': message,
    'parse_mode': 'Markdown'
  };

  const options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload),
    'muteHttpExceptions': true
  };

  for (let attempt = 1; attempt <= CONFIG.MAX_RETRY_ATTEMPTS; attempt++) {
    try {
      console.log(`Sending message (attempt ${attempt}/${CONFIG.MAX_RETRY_ATTEMPTS})`);
      
      const response = UrlFetchApp.fetch(url, options);
      const responseData = JSON.parse(response.getContentText());
      
      console.log("Telegram API response:", JSON.stringify(responseData));

      if (responseData.ok) {
        return { success: true, data: responseData };
      }

      // Handle chat migration
      if (responseData.error_code === 400 && responseData.parameters && responseData.parameters.migrate_to_chat_id) {
        console.log("Handling chat migration to:", responseData.parameters.migrate_to_chat_id);
        payload.chat_id = responseData.parameters.migrate_to_chat_id;
        options.payload = JSON.stringify(payload);
        
        const migratedResponse = UrlFetchApp.fetch(url, options);
        const migratedData = JSON.parse(migratedResponse.getContentText());
        
        if (migratedData.ok) {
          return { success: true, data: migratedData };
        }
      }

      // If this is the last attempt, return the error
      if (attempt === CONFIG.MAX_RETRY_ATTEMPTS) {
        return { 
          success: false, 
          error: ERRORS.TELEGRAM_API_ERROR + ": " + (responseData.description || 'Unknown error') 
        };
      }

      // Wait before retry
      Utilities.sleep(CONFIG.RETRY_DELAY_MS);

    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.toString());
      
      if (attempt === CONFIG.MAX_RETRY_ATTEMPTS) {
        return { 
          success: false, 
          error: ERRORS.TELEGRAM_API_ERROR + ": " + error.toString() 
        };
      }

      Utilities.sleep(CONFIG.RETRY_DELAY_MS);
    }
  }
}

/**
 * Escapes special characters for Markdown formatting.
 * 
 * @param {string} text - Text to escape
 * @returns {string} Escaped text safe for Markdown
 */
function escapeMarkdown(text) {
  if (typeof text !== 'string') {
    text = String(text);
  }
  return text.replace(/([_*[\]()~`>#+=|{}.!-])/g, '\\$1');
}

/**
 * Creates an installable trigger for form submissions.
 * This function should be run once to set up the trigger for the form.
 * 
 * @param {string} formId - The ID of the Google Form
 * @param {string} [functionName] - Optional custom function name (defaults to 'sendTelegramNotificationOnFormSubmit')
 * @returns {Object} Result object with success status and trigger info
 */
function createInstallableTrigger(formId, functionName) {
  try {
    if (!formId) {
      throw new Error("Form ID is required");
    }

    const targetFunction = functionName || 'sendTelegramNotificationOnFormSubmit';
    
    // Check if trigger already exists
    const existingTriggers = ScriptApp.getProjectTriggers();
    const existingTrigger = existingTriggers.find(trigger => 
      trigger.getHandlerFunction() === targetFunction && 
      trigger.getTriggerSource() === ScriptApp.TriggerSource.FORMS
    );

    if (existingTrigger) {
      console.log("Trigger already exists for function:", targetFunction);
      return { 
        success: true, 
        message: "Trigger already exists",
        triggerId: existingTrigger.getUniqueId()
      };
    }

    // Create new trigger
    const form = FormApp.openById(formId);
    const trigger = ScriptApp.newTrigger(targetFunction)
      .forForm(form)
      .onFormSubmit()
      .create();

    console.log("Trigger created successfully:", trigger.getUniqueId());
    
    return { 
      success: true, 
      message: "Trigger created successfully",
      triggerId: trigger.getUniqueId(),
      formTitle: form.getTitle()
    };

  } catch (error) {
    console.error("Failed to create trigger:", error.toString());
    return { 
      success: false, 
      error: error.toString() 
    };
  }
}

/**
 * Removes all triggers for the specified function.
 * Useful for cleanup or when reconfiguring triggers.
 * 
 * @param {string} [functionName] - Function name (defaults to 'sendTelegramNotificationOnFormSubmit')
 * @returns {Object} Result object with success status and cleanup info
 */
function removeAllTriggers(functionName) {
  try {
    const targetFunction = functionName || 'sendTelegramNotificationOnFormSubmit';
    const triggers = ScriptApp.getProjectTriggers();
    
    let removedCount = 0;
    triggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === targetFunction) {
        ScriptApp.deleteTrigger(trigger);
        removedCount++;
        console.log("Removed trigger:", trigger.getUniqueId());
      }
    });

    return { 
      success: true, 
      message: `Removed ${removedCount} trigger(s) for function: ${targetFunction}`,
      removedCount: removedCount
    };

  } catch (error) {
    console.error("Failed to remove triggers:", error.toString());
    return { 
      success: false, 
      error: error.toString() 
    };
  }
}

/**
 * Validates the configuration setup in the settings sheet.
 * Useful for testing and troubleshooting the setup.
 * 
 * @param {string} [spreadsheetId] - Optional spreadsheet ID (defaults to active spreadsheet)
 * @param {string} [settingsSheetName] - Optional settings sheet name (defaults to CONFIG.DEFAULT_SETTINGS_SHEET)
 * @returns {Object} Validation result with detailed status
 */
function validateConfiguration(spreadsheetId, settingsSheetName) {
  try {
    const config = {
      spreadsheetId: spreadsheetId || SpreadsheetApp.getActiveSpreadsheet().getId(),
      settingsSheetName: settingsSheetName || CONFIG.DEFAULT_SETTINGS_SHEET,
      formResponsesSheetNameCell: CONFIG.DEFAULT_CELLS.SHEET_NAME,
      botApiTokenCell: CONFIG.DEFAULT_CELLS.BOT_TOKEN,
      customTitleCell: CONFIG.DEFAULT_CELLS.CUSTOM_TITLE
    };

    console.log("Validating configuration with:", config);

    // Load configuration
    const settings = loadConfiguration(config);
    
    // Additional validations
    const validationResults = {
      success: true,
      settings: {
        hasValidToken: settings.botApiToken && settings.botApiToken.length > 20,
        sheetName: settings.formResponsesSheetName,
        customTitle: settings.customTitle
      },
      warnings: [],
      errors: []
    };

    // Check if form responses sheet exists
    const spreadsheet = SpreadsheetApp.openById(config.spreadsheetId);
    const responsesSheet = spreadsheet.getSheetByName(settings.formResponsesSheetName);
    
    if (!responsesSheet) {
      validationResults.errors.push(`Form responses sheet "${settings.formResponsesSheetName}" not found`);
      validationResults.success = false;
    } else {
      // Check for required headers
      const headers = responsesSheet.getRange(1, 1, 1, responsesSheet.getLastColumn()).getValues()[0];
      const hasTelegramIdColumn = headers.some(header => 
        header && header.toString().toLowerCase().includes('telegram')
      );
      
      if (!hasTelegramIdColumn) {
        validationResults.warnings.push('No "Telegram ID" column found in form responses sheet');
      }
    }

    // Validate bot token format (basic check)
    if (!settings.botApiToken.match(/^\d+:.+/)) {
      validationResults.warnings.push('Bot token format appears invalid (should be number:string)');
    }

    console.log("Configuration validation completed:", validationResults);
    return validationResults;

  } catch (error) {
    console.error("Configuration validation failed:", error.toString());
    return { 
      success: false, 
      error: error.toString(),
      settings: null,
      warnings: [],
      errors: [error.toString()]
    };
  }
}

/**
 * Test function to send a sample notification.
 * Useful for testing the Telegram integration without submitting a real form.
 * 
 * @param {string} telegramId - Test Telegram chat ID
 * @param {string} [spreadsheetId] - Optional spreadsheet ID (defaults to active spreadsheet)
 * @param {string} [settingsSheetName] - Optional settings sheet name
 * @returns {Object} Test result
 */
function testTelegramNotification(telegramId, spreadsheetId, settingsSheetName) {
  try {
    if (!telegramId) {
      throw new Error("Telegram ID is required for testing");
    }

    const config = {
      spreadsheetId: spreadsheetId || SpreadsheetApp.getActiveSpreadsheet().getId(),
      settingsSheetName: settingsSheetName || CONFIG.DEFAULT_SETTINGS_SHEET,
      formResponsesSheetNameCell: CONFIG.DEFAULT_CELLS.SHEET_NAME,
      botApiTokenCell: CONFIG.DEFAULT_CELLS.BOT_TOKEN,
      customTitleCell: CONFIG.DEFAULT_CELLS.CUSTOM_TITLE
    };

    // Load configuration
    const settings = loadConfiguration(config);

    // Create test message
    const testMessage = `*Test Notification*\n` +
      `*Test Time*: ${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss')}\n\n` +
      `*Test Field*: This is a test message\n` +
      `*Status*: Configuration validation successful\n` +
      `*Bot*: Form Response Notifier Bot`;

    // Send test message
    const result = sendTelegramMessage(settings.botApiToken, telegramId, testMessage);

    if (result.success) {
      console.log("Test notification sent successfully");
      return { 
        success: true, 
        message: "Test notification sent successfully",
        telegramId: telegramId
      };
    } else {
      return { 
        success: false, 
        error: "Failed to send test notification: " + result.error
      };
    }

  } catch (error) {
    console.error("Test notification failed:", error.toString());
    return { 
      success: false, 
      error: error.toString() 
    };
  }
}
