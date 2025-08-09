# Setup Guide - Form Response Notifier Bot

This comprehensive guide will walk you through setting up the Form Response Notifier Bot step by step.

## Prerequisites

Before you begin, make sure you have:
- A Google account with access to Google Forms and Google Sheets
- A Telegram bot token (see [Creating a Telegram Bot](#creating-a-telegram-bot))
- Basic familiarity with Google Apps Script

## Step 1: Creating a Telegram Bot

1. **Open Telegram** and search for `@BotFather`
2. **Start a conversation** with BotFather by clicking "Start"
3. **Create a new bot** by sending the command: `/newbot`
4. **Choose a name** for your bot (e.g., "My Form Notifier")
5. **Choose a username** for your bot (must end in 'bot', e.g., "myformnotifier_bot")
6. **Save the bot token** - BotFather will provide you with a token like `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`

### Getting Your Telegram Chat ID

To receive notifications, you need your Telegram chat ID:

1. **Start a conversation** with your bot by searching for its username
2. **Send any message** to your bot
3. **Open this URL** in your browser (replace `YOUR_BOT_TOKEN` with your actual token):
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```
4. **Find your chat ID** in the response - look for `"id":` in the `"chat"` section
5. **Save this number** - this is your Telegram chat ID

## Step 2: Setting Up Google Sheets

1. **Create a new Google Sheets** document or open an existing one
2. **Create a settings sheet** named exactly `Telegram Bot Settings`
3. **Add the following configuration** in the specified cells:

| Cell | Setting | Value |
|------|---------|-------|
| B1 | Telegram Bot API Token | Your bot token from Step 1 |
| B2 | Form Responses Sheet Name | The name of your form responses sheet |
| B3 | Custom Title | Custom title for notifications (e.g., "New Form Submission") |

### Example Configuration:
```
A1: Settings
B1: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz
B2: Form Responses 1
B3: New Registration Form
```

## Step 3: Setting Up Your Google Form

1. **Create or edit your Google Form**
2. **Add a required question** for "Telegram ID" 
   - Question type: "Short answer"
   - Make it required
   - Add description: "Enter your Telegram chat ID to receive notifications"
3. **Link your form** to the Google Sheets document from Step 2
4. **Note the form ID** from the URL (e.g., in `https://docs.google.com/forms/d/FORM_ID/edit`, the ID is the `FORM_ID` part)

## Step 4: Setting Up Google Apps Script

1. **Open your Google Sheets** document
2. **Go to Extensions** → **Apps Script**
3. **Delete the default code** in the editor
4. **Copy and paste** the entire content of `Code.gs` from this repository
5. **Save the project** (Ctrl+S or Cmd+S)
6. **Give your project a name** (e.g., "Form Response Notifier")

## Step 5: Creating the Form Trigger

1. **In the Apps Script editor**, find the `createInstallableTrigger` function
2. **Run the function** by:
   - Selecting `createInstallableTrigger` from the function dropdown
   - Clicking the "Run" button
   - When prompted, enter your Google Form ID
3. **Authorize the script** when Google asks for permissions
4. **Check the logs** to confirm the trigger was created successfully

### Alternative Method (Using Script):
```javascript
// Run this in the Apps Script console
createInstallableTrigger('YOUR_FORM_ID_HERE');
```

## Step 6: Testing Your Setup

1. **Validate your configuration**:
   ```javascript
   // Run this in the Apps Script console
   validateConfiguration();
   ```

2. **Send a test notification**:
   ```javascript
   // Run this in the Apps Script console (replace with your Telegram ID)
   testTelegramNotification('YOUR_TELEGRAM_ID');
   ```

3. **Submit a test form response** with your Telegram ID
4. **Check if you receive** the notification in Telegram

## Step 7: Customizing Your Setup

### Custom Message Format
You can modify the message format by editing the `buildNotificationMessage` function in the script.

### Additional Settings
You can add more configuration options by:
1. Adding new cells to your settings sheet
2. Modifying the `loadConfiguration` function
3. Using the new settings in your message formatting

### Multiple Forms
To use the same bot for multiple forms:
1. Create separate settings sheets for each form
2. Create separate triggers for each form
3. Use different custom titles to distinguish notifications

## Troubleshooting

If you encounter issues, see the [Troubleshooting Guide](TROUBLESHOOTING.md) for common problems and solutions.

## Security Best Practices

- **Never share** your bot token publicly
- **Use environment variables** or secure storage for sensitive data
- **Regularly rotate** your bot token if compromised
- **Validate all inputs** from form submissions
- **Monitor your bot** for unusual activity

## Advanced Configuration

### Custom Cell References
You can use different cell references by modifying the `CONFIG.DEFAULT_CELLS` constants in the script.

### Error Notifications
Uncomment the `sendErrorNotification(error)` line in the main function to receive error notifications.

### Rate Limiting
The script includes built-in retry logic, but for high-volume forms, consider implementing additional rate limiting.

## Support

If you need help:
1. Check the [Troubleshooting Guide](TROUBLESHOOTING.md)
2. Review the [API Documentation](API.md)
3. Open an issue on GitHub with detailed information about your problem

---

**Next Steps**: Once your setup is working, consider reading the [User Guide](USER_GUIDE.md) for advanced usage tips and best practices.