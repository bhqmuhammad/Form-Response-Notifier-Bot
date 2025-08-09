# Troubleshooting Guide

This guide covers common issues and their solutions for the Form Response Notifier Bot.

## Common Issues

### 1. Not Receiving Telegram Notifications

#### Possible Causes and Solutions:

**❌ Bot token is incorrect or invalid**
- **Solution**: Verify your bot token with BotFather
- **Test**: Run `validateConfiguration()` in Apps Script console
- **Check**: Token should be in format `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`

**❌ Telegram ID is incorrect**
- **Solution**: Get your correct Telegram ID using the bot API
- **Method**: Visit `https://api.telegram.org/botYOUR_TOKEN/getUpdates` after messaging your bot
- **Note**: Use the numeric ID, not the username

**❌ Bot is not started by the user**
- **Solution**: Send `/start` command to your bot in Telegram
- **Required**: Users must start the bot before it can send them messages

**❌ Form trigger is not set up correctly**
- **Solution**: Run `createInstallableTrigger('YOUR_FORM_ID')` again
- **Check**: Verify trigger exists in Apps Script → Triggers section

### 2. Script Errors

#### Error: "Settings sheet not found"
```javascript
// Solution 1: Check sheet name exactly matches
const settingsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Telegram Bot Settings');

// Solution 2: Create the sheet with exact name
if (!settingsSheet) {
  SpreadsheetApp.getActiveSpreadsheet().insertSheet('Telegram Bot Settings');
}
```

#### Error: "Form responses sheet not found"
- **Check**: Verify the sheet name in cell B2 matches your actual form responses sheet
- **Fix**: Update cell B2 with the correct sheet name
- **Verify**: Sheet names are case-sensitive

#### Error: "Telegram ID is required but not provided"
- **Check**: Form must have a question titled exactly "Telegram ID"
- **Fix**: Add this question to your form and make it required
- **Verify**: Test with a form submission

#### Error: "Failed to send Telegram message"
- **Check logs**: View detailed error in Apps Script console
- **Common causes**:
  - Invalid bot token
  - User blocked the bot
  - Network connectivity issues
  - Telegram API rate limits

### 3. Configuration Issues

#### Missing Configuration Values
```javascript
// Debug configuration
function debugConfiguration() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Telegram Bot Settings');
  console.log('B1 (Bot Token):', sheet.getRange('B1').getValue());
  console.log('B2 (Sheet Name):', sheet.getRange('B2').getValue());
  console.log('B3 (Custom Title):', sheet.getRange('B3').getValue());
}
```

#### Wrong Cell References
- **Default cells**: B1 (token), B2 (sheet name), B3 (title)
- **Custom cells**: Modify `CONFIG.DEFAULT_CELLS` in the script
- **Verify**: Check that cells contain the expected values

### 4. Form Integration Issues

#### Trigger Not Firing
```javascript
// Check existing triggers
function listTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    console.log('Function:', trigger.getHandlerFunction());
    console.log('Source:', trigger.getTriggerSource());
    console.log('Event:', trigger.getEventType());
  });
}
```

#### Form ID Issues
- **Get Form ID**: From the form URL between `/forms/d/` and `/edit`
- **Verify**: Form must be linked to the same spreadsheet
- **Check**: Form responses are appearing in the correct sheet

### 5. Message Formatting Issues

#### Special Characters Not Displaying
- **Cause**: Markdown escape issues
- **Solution**: The `escapeMarkdown()` function handles this automatically
- **Test**: Use `testTelegramNotification()` to verify formatting

#### Timestamp Issues
- **Problem**: Incorrect timezone or format
- **Solution**: Verify `Session.getScriptTimeZone()` settings
- **Custom format**: Modify the `Utilities.formatDate()` pattern

### 6. Permission and Authorization Issues

#### Script Authorization Required
1. **Go to**: Apps Script editor
2. **Run**: Any function to trigger authorization
3. **Review**: Permissions carefully
4. **Accept**: Required permissions

#### Insufficient Permissions
- **Required**: 
  - Google Sheets access
  - Google Forms access
  - External URL access (for Telegram API)
  - Trigger management

## Debugging Tools

### 1. Configuration Validator
```javascript
// Run this to check your setup
function validateSetup() {
  console.log('=== Configuration Validation ===');
  const result = validateConfiguration();
  console.log('Success:', result.success);
  console.log('Settings:', result.settings);
  console.log('Warnings:', result.warnings);
  console.log('Errors:', result.errors);
}
```

### 2. Test Notification
```javascript
// Test with your Telegram ID
function runTest() {
  const result = testTelegramNotification('YOUR_TELEGRAM_ID');
  console.log('Test result:', result);
}
```

### 3. Trigger Diagnostics
```javascript
// Check trigger status
function checkTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  console.log('Total triggers:', triggers.length);
  
  triggers.forEach((trigger, index) => {
    console.log(`Trigger ${index + 1}:`);
    console.log('  Function:', trigger.getHandlerFunction());
    console.log('  Source:', trigger.getTriggerSource());
    console.log('  Event:', trigger.getEventType());
    console.log('  ID:', trigger.getUniqueId());
  });
}
```

## Error Codes and Solutions

### Telegram API Error Codes

| Error Code | Description | Solution |
|------------|-------------|----------|
| 400 | Bad Request | Check message format and parameters |
| 401 | Unauthorized | Verify bot token |
| 403 | Forbidden | User blocked bot or bot not started |
| 404 | Not Found | Check chat ID |
| 429 | Too Many Requests | Implement rate limiting |

### Google Apps Script Errors

| Error | Cause | Solution |
|-------|-------|----------|
| ReferenceError | Function/variable not found | Check spelling and scope |
| TypeError | Wrong data type | Validate input types |
| Exception | General script error | Check logs for details |

## Performance Optimization

### 1. Reduce API Calls
- Cache configuration values
- Batch operations when possible
- Use efficient data structures

### 2. Error Handling
- Implement retry logic (already included)
- Log errors appropriately
- Handle edge cases gracefully

### 3. Resource Limits
- **Execution time**: 6 minutes max for Apps Script
- **Trigger quota**: 20 triggers per script
- **API calls**: Rate limited by Telegram

## Getting Help

### Before Opening an Issue

1. **Check this troubleshooting guide**
2. **Run the diagnostic functions** above
3. **Review the Apps Script logs**
4. **Test with the validation functions**

### When Opening an Issue

Include:
- **Error messages** (exact text)
- **Apps Script logs** (relevant parts)
- **Configuration details** (without sensitive data)
- **Steps to reproduce** the issue
- **Expected vs actual behavior**

### Emergency Recovery

If your setup stops working:

1. **Backup your settings** (copy the values)
2. **Remove all triggers**: `removeAllTriggers()`
3. **Re-validate configuration**: `validateConfiguration()`
4. **Recreate trigger**: `createInstallableTrigger('FORM_ID')`
5. **Test setup**: `testTelegramNotification('CHAT_ID')`

---

**Still having issues?** Check the [Setup Guide](SETUP.md) or open an issue on GitHub with detailed information about your problem.