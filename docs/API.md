# API Documentation

This document provides detailed documentation for all functions and configurations in the Form Response Notifier Bot.

## Table of Contents
- [Configuration](#configuration)
- [Core Functions](#core-functions)
- [Utility Functions](#utility-functions)
- [Constants](#constants)
- [Error Handling](#error-handling)

## Configuration

### Settings Sheet Structure

The bot requires a settings sheet named `Telegram Bot Settings` with the following configuration:

| Cell | Setting | Type | Required | Description |
|------|---------|------|----------|-------------|
| B1 | Bot API Token | String | Yes | Telegram Bot API token from BotFather |
| B2 | Form Responses Sheet Name | String | Yes | Name of the sheet containing form responses |
| B3 | Custom Title | String | Yes | Custom title for notification messages |

### Default Configuration

```javascript
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
```

## Core Functions

### sendTelegramNotificationOnFormSubmit()

Main function that handles form submission events and sends Telegram notifications.

**Signature:**
```javascript
function sendTelegramNotificationOnFormSubmit(e, spreadsheetId, settingsSheetName, formResponsesSheetNameCell, botApiTokenCell, customTitleCell)
```

**Parameters:**
- `e` (Object, required): Event object from Google Form trigger
- `spreadsheetId` (String, optional): Spreadsheet ID (defaults to active spreadsheet)
- `settingsSheetName` (String, optional): Settings sheet name (defaults to 'Telegram Bot Settings')
- `formResponsesSheetNameCell` (String, optional): Cell reference for form sheet name (defaults to 'B2')
- `botApiTokenCell` (String, optional): Cell reference for bot token (defaults to 'B1')
- `customTitleCell` (String, optional): Cell reference for custom title (defaults to 'B3')

**Returns:** None (void function)

**Example:**
```javascript
// Called automatically by form trigger
// Can also be called manually for testing
sendTelegramNotificationOnFormSubmit(eventObject);
```

### loadConfiguration()

Loads and validates configuration settings from the settings sheet.

**Signature:**
```javascript
function loadConfiguration(config)
```

**Parameters:**
- `config` (Object, required): Configuration object with sheet and cell references

**Returns:**
- `Object`: Validated configuration settings
  - `botApiToken` (String): Telegram bot token
  - `formResponsesSheetName` (String): Form responses sheet name
  - `customTitle` (String): Custom title for messages

**Throws:**
- `Error`: If settings sheet not found or required settings missing

**Example:**
```javascript
const config = {
  spreadsheetId: 'your-spreadsheet-id',
  settingsSheetName: 'Telegram Bot Settings',
  botApiTokenCell: 'B1',
  formResponsesSheetNameCell: 'B2',
  customTitleCell: 'B3'
};

const settings = loadConfiguration(config);
```

### extractFormResponse()

Extracts and validates form response data from the event object.

**Signature:**
```javascript
function extractFormResponse(e, formResponsesSheetName, spreadsheetId)
```

**Parameters:**
- `e` (Object, required): Event object from form trigger
- `formResponsesSheetName` (String, required): Name of form responses sheet
- `spreadsheetId` (String, required): Spreadsheet ID

**Returns:**
- `Object`: Extracted form data
  - `headers` (Array): Form column headers
  - `responseData` (Object): Form response data as key-value pairs
  - `telegramId` (String): Telegram chat ID from form
  - `timestamp` (Date): Submission timestamp

**Throws:**
- `Error`: If form data is invalid or Telegram ID missing

### buildNotificationMessage()

Builds a formatted notification message from form data.

**Signature:**
```javascript
function buildNotificationMessage(formData, customTitle)
```

**Parameters:**
- `formData` (Object, required): Extracted form data
- `customTitle` (String, required): Custom title for message

**Returns:**
- `String`: Formatted message in Markdown format

**Example:**
```javascript
const message = buildNotificationMessage(formData, 'New Registration');
// Returns: "*New Registration*\n*Submission Time*: 2025-01-09 15:30:00\n\n*Name*: John Doe\n..."
```

### sendTelegramMessage()

Sends a message to Telegram with retry logic and error handling.

**Signature:**
```javascript
function sendTelegramMessage(botToken, chatId, message)
```

**Parameters:**
- `botToken` (String, required): Telegram Bot API token
- `chatId` (String, required): Telegram chat ID
- `message` (String, required): Message to send

**Returns:**
- `Object`: Result object
  - `success` (Boolean): Whether message was sent successfully
  - `data` (Object, optional): Telegram API response data
  - `error` (String, optional): Error message if failed

**Example:**
```javascript
const result = sendTelegramMessage('123456:ABC...', '987654321', 'Hello World');
if (result.success) {
  console.log('Message sent successfully');
} else {
  console.error('Failed to send:', result.error);
}
```

## Utility Functions

### createInstallableTrigger()

Creates an installable trigger for form submissions.

**Signature:**
```javascript
function createInstallableTrigger(formId, functionName)
```

**Parameters:**
- `formId` (String, required): Google Form ID
- `functionName` (String, optional): Target function name (defaults to 'sendTelegramNotificationOnFormSubmit')

**Returns:**
- `Object`: Result object
  - `success` (Boolean): Whether trigger was created
  - `message` (String): Status message
  - `triggerId` (String, optional): Unique trigger ID
  - `formTitle` (String, optional): Form title

**Example:**
```javascript
const result = createInstallableTrigger('1mF8q..._form_id_...xyz');
console.log(result.message);
```

### removeAllTriggers()

Removes all triggers for the specified function.

**Signature:**
```javascript
function removeAllTriggers(functionName)
```

**Parameters:**
- `functionName` (String, optional): Function name (defaults to 'sendTelegramNotificationOnFormSubmit')

**Returns:**
- `Object`: Result object
  - `success` (Boolean): Whether operation succeeded
  - `message` (String): Status message
  - `removedCount` (Number): Number of triggers removed

### validateConfiguration()

Validates the configuration setup in the settings sheet.

**Signature:**
```javascript
function validateConfiguration(spreadsheetId, settingsSheetName)
```

**Parameters:**
- `spreadsheetId` (String, optional): Spreadsheet ID (defaults to active spreadsheet)
- `settingsSheetName` (String, optional): Settings sheet name (defaults to CONFIG.DEFAULT_SETTINGS_SHEET)

**Returns:**
- `Object`: Validation result
  - `success` (Boolean): Overall validation status
  - `settings` (Object): Configuration settings with validation flags
  - `warnings` (Array): Non-critical issues
  - `errors` (Array): Critical errors

**Example:**
```javascript
const validation = validateConfiguration();
if (!validation.success) {
  console.log('Errors:', validation.errors);
}
```

### testTelegramNotification()

Sends a test notification to verify the setup.

**Signature:**
```javascript
function testTelegramNotification(telegramId, spreadsheetId, settingsSheetName)
```

**Parameters:**
- `telegramId` (String, required): Test Telegram chat ID
- `spreadsheetId` (String, optional): Spreadsheet ID (defaults to active spreadsheet)
- `settingsSheetName` (String, optional): Settings sheet name

**Returns:**
- `Object`: Test result
  - `success` (Boolean): Whether test succeeded
  - `message` (String): Status message
  - `telegramId` (String, optional): Used Telegram ID
  - `error` (String, optional): Error message if failed

### escapeMarkdown()

Escapes special characters for Markdown formatting.

**Signature:**
```javascript
function escapeMarkdown(text)
```

**Parameters:**
- `text` (String, required): Text to escape

**Returns:**
- `String`: Escaped text safe for Markdown

**Example:**
```javascript
const escaped = escapeMarkdown('Text with *special* characters');
// Returns: "Text with \\*special\\* characters"
```

## Constants

### CONFIG Object

Global configuration constants used throughout the script.

```javascript
const CONFIG = {
  DEFAULT_SETTINGS_SHEET: 'Telegram Bot Settings',  // Default settings sheet name
  DEFAULT_CELLS: {
    BOT_TOKEN: 'B1',      // Default cell for bot token
    SHEET_NAME: 'B2',     // Default cell for sheet name
    CUSTOM_TITLE: 'B3'    // Default cell for custom title
  },
  TELEGRAM_API_BASE: 'https://api.telegram.org/bot',  // Telegram API base URL
  MAX_RETRY_ATTEMPTS: 3,    // Maximum retry attempts for failed API calls
  RETRY_DELAY_MS: 1000      // Delay between retry attempts (milliseconds)
};
```

### ERRORS Object

Error message constants for consistent error handling.

```javascript
const ERRORS = {
  SETTINGS_SHEET_NOT_FOUND: 'Settings sheet not found',
  FORM_RESPONSES_SHEET_NOT_FOUND: 'Form responses sheet not found',
  MISSING_CONFIGURATION: 'Required configuration settings are missing',
  MISSING_HEADERS: 'Form headers not found',
  NO_FORM_DATA: 'Form response data not found',
  MISSING_TELEGRAM_ID: 'Telegram ID is required but not provided',
  TELEGRAM_API_ERROR: 'Failed to send Telegram message'
};
```

## Error Handling

### Error Types

The script handles several types of errors:

1. **Configuration Errors**: Missing or invalid settings
2. **Form Data Errors**: Invalid or missing form responses
3. **Telegram API Errors**: Network or API-related issues
4. **Permission Errors**: Google Apps Script authorization issues

### Error Response Format

All functions that can fail return consistent error objects:

```javascript
{
  success: false,
  error: "Detailed error message",
  // Additional context-specific properties
}
```

### Retry Logic

The `sendTelegramMessage()` function includes automatic retry logic:
- Maximum 3 attempts (configurable via `CONFIG.MAX_RETRY_ATTEMPTS`)
- 1 second delay between attempts (configurable via `CONFIG.RETRY_DELAY_MS`)
- Handles chat migration automatically
- Logs all retry attempts

### Error Logging

All errors are logged to the Google Apps Script console with:
- Timestamp
- Function context
- Detailed error message
- Relevant configuration data (sanitized)

## Rate Limiting and Quotas

### Google Apps Script Limits
- **Execution time**: 6 minutes maximum per execution
- **Triggers**: 20 installable triggers per script
- **URL fetches**: 20,000 per day
- **Email/external requests**: Subject to daily quotas

### Telegram API Limits
- **Message rate**: 30 messages per second to different chats
- **Same chat**: 1 message per second
- **Bot limitations**: 100 requests per second

### Best Practices
- Use the built-in retry logic
- Monitor quota usage in Google Cloud Console
- Implement additional delays for high-volume forms
- Cache configuration to reduce sheet access

---

For more information, see the [Setup Guide](SETUP.md) and [Troubleshooting Guide](TROUBLESHOOTING.md).