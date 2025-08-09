# Examples

This directory contains practical examples of how to use and customize the Form Response Notifier Bot for different scenarios.

## Basic Examples

### Example 1: Simple Event Registration
```javascript
// Configuration for event registration form
function setupEventRegistration() {
  const formId = 'YOUR_FORM_ID';
  const result = createInstallableTrigger(formId);
  console.log('Event registration trigger:', result.message);
}

// Custom message formatting for events
function buildEventNotificationMessage(formData, customTitle) {
  let message = `🎉 *${escapeMarkdown(customTitle)}*\n`;
  message += `📅 *Registration Time*: ${Utilities.formatDate(formData.timestamp, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss')}\n\n`;
  
  // Add event-specific formatting
  const eventFields = {
    'Full Name': '👤',
    'Email': '📧',
    'Phone Number': '📱',
    'Dietary Restrictions': '🍽️',
    'T-Shirt Size': '👕'
  };
  
  formData.headers.forEach(header => {
    const value = formData.responseData[header];
    if (value && value !== '') {
      const emoji = eventFields[header] || '📝';
      message += `${emoji} *${escapeMarkdown(header)}*: ${escapeMarkdown(String(value))}\n`;
    }
  });
  
  return message;
}
```

### Example 2: Customer Feedback Collection
```javascript
// Configuration for feedback form
const FEEDBACK_CONFIG = {
  ADMIN_CHAT_ID: 'ADMIN_TELEGRAM_ID',
  URGENT_KEYWORDS: ['urgent', 'critical', 'bug', 'broken'],
  RATING_THRESHOLD: 3 // Notify for ratings below this
};

function buildFeedbackNotificationMessage(formData, customTitle) {
  const rating = parseInt(formData.responseData['Rating']) || 0;
  const feedback = String(formData.responseData['Feedback'] || '').toLowerCase();
  
  // Determine urgency
  const isUrgent = rating < FEEDBACK_CONFIG.RATING_THRESHOLD || 
                   FEEDBACK_CONFIG.URGENT_KEYWORDS.some(keyword => feedback.includes(keyword));
  
  let message = isUrgent ? '🚨 *URGENT FEEDBACK*\n' : '📝 *New Feedback*\n';
  message += `⭐ *Rating*: ${rating}/5\n`;
  message += `📅 *Time*: ${Utilities.formatDate(formData.timestamp, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss')}\n\n`;
  
  // Add feedback details
  formData.headers.forEach(header => {
    const value = formData.responseData[header];
    if (value && value !== '' && header !== 'Rating') {
      message += `*${escapeMarkdown(header)}*: ${escapeMarkdown(String(value))}\n`;
    }
  });
  
  if (isUrgent) {
    message += '\n⚠️ *This feedback requires immediate attention!*';
  }
  
  return message;
}
```

## Advanced Examples

### Example 3: Multi-Language Support
```javascript
// Language configuration
const LANGUAGES = {
  'en': {
    title: 'New Form Submission',
    time: 'Submission Time',
    fields: {
      'Name': 'Name',
      'Email': 'Email'
    }
  },
  'es': {
    title: 'Nueva Respuesta de Formulario',
    time: 'Hora de Envío',
    fields: {
      'Name': 'Nombre',
      'Email': 'Correo Electrónico'
    }
  }
};

function buildMultiLanguageMessage(formData, customTitle, language = 'en') {
  const lang = LANGUAGES[language] || LANGUAGES['en'];
  
  let message = `*${escapeMarkdown(lang.title)}*\n`;
  message += `*${lang.time}*: ${Utilities.formatDate(formData.timestamp, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss')}\n\n`;
  
  formData.headers.forEach(header => {
    const value = formData.responseData[header];
    if (value && value !== '') {
      const translatedHeader = lang.fields[header] || header;
      message += `*${escapeMarkdown(translatedHeader)}*: ${escapeMarkdown(String(value))}\n`;
    }
  });
  
  return message;
}
```

### Example 4: Conditional Notifications
```javascript
// Send different notifications based on form responses
function sendConditionalNotification(e, spreadsheetId, settingsSheetName) {
  try {
    const config = {
      spreadsheetId: spreadsheetId || SpreadsheetApp.getActiveSpreadsheet().getId(),
      settingsSheetName: settingsSheetName || 'Telegram Bot Settings',
      formResponsesSheetNameCell: 'B2',
      botApiTokenCell: 'B1',
      customTitleCell: 'B3'
    };

    const settings = loadConfiguration(config);
    const formData = extractFormResponse(e, settings.formResponsesSheetName, config.spreadsheetId);
    
    // Determine notification type based on responses
    const notificationType = determineNotificationType(formData.responseData);
    
    let message;
    switch (notificationType) {
      case 'vip':
        message = buildVIPNotificationMessage(formData, 'VIP Registration');
        break;
      case 'urgent':
        message = buildUrgentNotificationMessage(formData, 'Urgent Request');
        break;
      default:
        message = buildNotificationMessage(formData, settings.customTitle);
    }
    
    const result = sendTelegramMessage(settings.botApiToken, formData.telegramId, message);
    
    // Send to different groups based on type
    if (notificationType === 'vip') {
      sendTelegramMessage(settings.botApiToken, 'VIP_TEAM_CHAT_ID', message);
    }
    
  } catch (error) {
    console.error('Conditional notification error:', error.toString());
  }
}

function determineNotificationType(responseData) {
  // VIP customers
  if (responseData['Membership Level'] === 'VIP' || responseData['Annual Revenue'] > 100000) {
    return 'vip';
  }
  
  // Urgent requests
  if (responseData['Priority'] === 'High' || String(responseData['Description']).toLowerCase().includes('urgent')) {
    return 'urgent';
  }
  
  return 'standard';
}
```

### Example 5: File Upload Handling
```javascript
// Handle forms with file uploads (Google Drive links)
function buildFileUploadNotificationMessage(formData, customTitle) {
  let message = `📎 *${escapeMarkdown(customTitle)}*\n`;
  message += `📅 *Time*: ${Utilities.formatDate(formData.timestamp, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss')}\n\n`;
  
  formData.headers.forEach(header => {
    const value = formData.responseData[header];
    if (value && value !== '') {
      if (header.toLowerCase().includes('file') || header.toLowerCase().includes('upload')) {
        // Handle file upload fields (Google Drive links)
        const fileUrls = String(value).split(',').map(url => url.trim());
        message += `📁 *${escapeMarkdown(header)}*:\n`;
        fileUrls.forEach((url, index) => {
          if (url.includes('drive.google.com')) {
            message += `   ${index + 1}. [File ${index + 1}](${url})\n`;
          } else {
            message += `   ${index + 1}. ${escapeMarkdown(url)}\n`;
          }
        });
      } else {
        message += `*${escapeMarkdown(header)}*: ${escapeMarkdown(String(value))}\n`;
      }
    }
  });
  
  return message;
}
```

## Configuration Examples

### Example 6: Multiple Forms Configuration
```javascript
// Setup for multiple forms with different configurations
function setupMultipleForms() {
  const forms = [
    {
      formId: 'REGISTRATION_FORM_ID',
      settingsSheet: 'Registration Settings',
      functionName: 'handleRegistrationForm'
    },
    {
      formId: 'FEEDBACK_FORM_ID', 
      settingsSheet: 'Feedback Settings',
      functionName: 'handleFeedbackForm'
    },
    {
      formId: 'SUPPORT_FORM_ID',
      settingsSheet: 'Support Settings', 
      functionName: 'handleSupportForm'
    }
  ];
  
  forms.forEach(form => {
    const result = createInstallableTrigger(form.formId, form.functionName);
    console.log(`${form.functionName}: ${result.message}`);
  });
}

// Specific handlers for different form types
function handleRegistrationForm(e) {
  sendTelegramNotificationOnFormSubmit(e, null, 'Registration Settings');
}

function handleFeedbackForm(e) {
  sendTelegramNotificationOnFormSubmit(e, null, 'Feedback Settings');
}

function handleSupportForm(e) {
  sendTelegramNotificationOnFormSubmit(e, null, 'Support Settings');
}
```

### Example 7: Error Notification System
```javascript
// Enhanced error handling with admin notifications
function sendTelegramNotificationWithErrorHandling(e, spreadsheetId, settingsSheetName) {
  try {
    sendTelegramNotificationOnFormSubmit(e, spreadsheetId, settingsSheetName);
  } catch (error) {
    console.error('Form notification error:', error.toString());
    
    // Send error notification to admin
    sendErrorNotificationToAdmin(error, e);
  }
}

function sendErrorNotificationToAdmin(error, originalEvent) {
  try {
    const adminSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Admin Settings');
    if (!adminSheet) return;
    
    const adminChatId = adminSheet.getRange('B1').getValue();
    const botToken = adminSheet.getRange('B2').getValue();
    
    if (!adminChatId || !botToken) return;
    
    const errorMessage = `🚨 *Bot Error Alert*\n\n` +
      `*Time*: ${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss')}\n` +
      `*Error*: \`${escapeMarkdown(error.toString())}\`\n` +
      `*Form ID*: ${originalEvent?.source?.getId() || 'Unknown'}\n` +
      `*Event Type*: ${originalEvent?.type || 'Unknown'}`;
    
    sendTelegramMessage(botToken, adminChatId, errorMessage);
    
  } catch (adminError) {
    console.error('Failed to send admin notification:', adminError.toString());
  }
}
```

## Testing Examples

### Example 8: Comprehensive Testing Suite
```javascript
// Testing utilities
function runAllTests() {
  console.log('=== Form Response Notifier Bot - Test Suite ===');
  
  testConfigurationValidation();
  testMessageFormatting();
  testErrorHandling();
  testTriggerManagement();
  
  console.log('=== Test Suite Complete ===');
}

function testConfigurationValidation() {
  console.log('\n--- Testing Configuration Validation ---');
  
  try {
    const result = validateConfiguration();
    console.log('Configuration validation:', result.success ? 'PASS' : 'FAIL');
    if (!result.success) {
      console.log('Errors:', result.errors);
    }
  } catch (error) {
    console.log('Configuration test FAILED:', error.toString());
  }
}

function testMessageFormatting() {
  console.log('\n--- Testing Message Formatting ---');
  
  const testData = {
    headers: ['Name', 'Email', 'Message'],
    responseData: {
      'Name': 'Test User',
      'Email': 'test@example.com',
      'Message': 'This is a test message with *special* characters!'
    },
    telegramId: '123456789',
    timestamp: new Date()
  };
  
  try {
    const message = buildNotificationMessage(testData, 'Test Notification');
    console.log('Message formatting: PASS');
    console.log('Sample message:', message);
  } catch (error) {
    console.log('Message formatting FAILED:', error.toString());
  }
}

function testErrorHandling() {
  console.log('\n--- Testing Error Handling ---');
  
  try {
    // Test with invalid configuration
    loadConfiguration({
      spreadsheetId: 'invalid',
      settingsSheetName: 'NonExistent',
      botApiTokenCell: 'A1',
      formResponsesSheetNameCell: 'A2',
      customTitleCell: 'A3'
    });
    console.log('Error handling: FAIL (should have thrown error)');
  } catch (error) {
    console.log('Error handling: PASS (correctly caught error)');
  }
}

function testTriggerManagement() {
  console.log('\n--- Testing Trigger Management ---');
  
  try {
    const triggers = ScriptApp.getProjectTriggers();
    console.log(`Current triggers: ${triggers.length}`);
    console.log('Trigger management: PASS');
  } catch (error) {
    console.log('Trigger management FAILED:', error.toString());
  }
}
```

## Usage Tips

1. **Copy the examples** that match your use case
2. **Modify the configuration** for your specific needs
3. **Test thoroughly** before deploying to production
4. **Monitor the logs** for any issues
5. **Customize the message formatting** as needed

For more information, see the [API Documentation](../docs/API.md) and [Setup Guide](../docs/SETUP.md).