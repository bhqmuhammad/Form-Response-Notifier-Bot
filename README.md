# Form Response Notifier Bot

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?logo=google&logoColor=white)](https://script.google.com/)
[![Telegram Bot API](https://img.shields.io/badge/Telegram%20Bot%20API-26A5E4?logo=telegram&logoColor=white)](https://core.telegram.org/bots/api)

A powerful and flexible Google Apps Script bot that automatically sends Telegram notifications when Google Form responses are submitted. Perfect for real-time form monitoring, event registrations, feedback collection, and more.

## ✨ Features

- **🚀 Automated Notifications**: Instantly receive Telegram messages when forms are submitted
- **⚙️ Flexible Configuration**: Easy setup through Google Sheets settings
- **📝 Rich Formatting**: Markdown-formatted messages with customizable titles
- **🔄 Retry Logic**: Built-in error handling and automatic retry mechanisms
- **🛡️ Robust Validation**: Comprehensive input validation and error reporting
- **📊 Multi-Form Support**: Handle multiple forms with different configurations
- **⏰ Timestamp Tracking**: Automatic timestamp inclusion in notifications
- **🔧 Developer-Friendly**: Well-documented API and debugging tools

## 🚀 Quick Start

### 1. Get Your Telegram Bot Token
1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Create a new bot with `/newbot`
3. Save the provided token

### 2. Set Up Google Sheets
1. Create a new Google Sheets document
2. Add a sheet named `Telegram Bot Settings`
3. Configure your settings:

| Cell | Setting | Example |
|------|---------|---------|
| B1 | Bot Token | `123456789:ABCdefGHIjklMNOpqrsTUVwxyz` |
| B2 | Form Sheet Name | `Form Responses 1` |
| B3 | Custom Title | `New Form Submission` |
| B4 | Conditions (Optional) | `Department: Sales` |

### 3. Install the Script
1. Open **Extensions** → **Apps Script** in your Google Sheets
2. Replace the default code with the contents of [`Code.gs`](Code.gs)
3. Save the project

### 4. Create Form Trigger
Run this in the Apps Script console:
```javascript
createInstallableTrigger('YOUR_GOOGLE_FORM_ID');
```

### 5. Test Your Setup
```javascript
testTelegramNotification('YOUR_TELEGRAM_CHAT_ID');
```

## 📖 Documentation

- **[📋 Setup Guide](docs/SETUP.md)** - Detailed step-by-step installation instructions
- **[🔧 API Documentation](docs/API.md)** - Complete function reference and examples
- **[🛠️ Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[📝 Contributing](CONTRIBUTING.md)** - How to contribute to this project

## 🏗️ Architecture

The bot is built with a modular architecture for better maintainability:

```
Code.gs
├── Configuration Management
│   ├── loadConfiguration()
│   └── validateConfiguration()
├── Form Data Processing
│   ├── extractFormResponse()
│   └── buildNotificationMessage()
├── Telegram Integration
│   ├── sendTelegramMessage()
│   └── escapeMarkdown()
└── Utility Functions
    ├── createInstallableTrigger()
    ├── removeAllTriggers()
    └── testTelegramNotification()
```

## 🎯 Use Cases

- **Event Registration**: Notify organizers of new registrations
- **Customer Feedback**: Alert teams to new feedback submissions
- **Lead Generation**: Instant notifications for new leads
- **Survey Responses**: Real-time survey completion alerts
- **Support Requests**: Immediate notification of support tickets
- **Contest Entries**: Track competition submissions
- **Volunteer Sign-ups**: Coordinate volunteer activities
- **RSVP Management**: Event attendance tracking

## ⚡ Advanced Features

### Conditional Notifications
You can configure the bot to only send notifications when specific conditions are met. This is useful for filtering responses or routing notifications.

In cell **B4** of your settings sheet, enter conditions in the format `Field Name: Value`. You can add multiple conditions (one per line). The notification will only be sent if **all** conditions are met.

Example:
```text
Department: Sales
Priority: High
```
In this example, a notification will only be sent if the "Department" answer is "Sales" AND the "Priority" answer is "High". If cell B4 is empty, notifications will be sent for all submissions.

### Custom Message Formatting
Customize message appearance by modifying the `buildNotificationMessage()` function:

```javascript
function buildNotificationMessage(formData, customTitle) {
  let message = `🎉 *${customTitle}*\n`;
  message += `📅 *Time*: ${formatTimestamp(formData.timestamp)}\n\n`;
  
  // Add custom emoji mapping
  const emojiMap = {
    'Name': '👤',
    'Email': '📧',
    'Phone': '📱'
  };
  
  // Custom formatting logic here
  return message;
}
```

### Multiple Forms Support
Handle different forms with separate configurations:

```javascript
// Form 1: Registration Form
sendTelegramNotificationOnFormSubmit(e, spreadsheetId, 'Registration Settings');

// Form 2: Feedback Form  
sendTelegramNotificationOnFormSubmit(e, spreadsheetId, 'Feedback Settings');
```

### Error Notification Setup
Get notified when errors occur:

```javascript
function sendErrorNotification(error) {
  const adminChatId = 'ADMIN_TELEGRAM_ID';
  const errorMessage = `🚨 *Bot Error*\n\`${error.toString()}\``;
  // Send to admin
}
```

## 🔒 Security Best Practices

- **🔐 Token Security**: Never commit bot tokens to public repositories
- **✅ Input Validation**: All user inputs are validated and sanitized
- **🛡️ Error Handling**: Comprehensive error handling prevents information leakage
- **📝 Audit Logging**: All actions are logged for monitoring
- **🔄 Token Rotation**: Regularly rotate bot tokens for security

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Standards
- Follow existing code style and formatting
- Add comprehensive JSDoc comments
- Include error handling for all external calls
- Write meaningful commit messages

## 📊 Project Stats

- **Language**: Google Apps Script (JavaScript)
- **Dependencies**: None (uses built-in Google Apps Script services)
- **API Integrations**: Google Forms, Google Sheets, Telegram Bot API
- **License**: MIT
- **Maintenance**: Active

## 🆘 Support

- **📋 Issues**: [GitHub Issues](https://github.com/bhqmuhammad/Form-Response-Notifier-Bot/issues)
- **📖 Docs**: Check the [documentation](docs/) first
- **🛠️ Troubleshooting**: See [troubleshooting guide](docs/TROUBLESHOOTING.md)
- **💬 Discussions**: Use GitHub Discussions for questions

## 📈 Roadmap

- [ ] **Multi-language support** for notification messages
- [ ] **Template system** for custom message formats
- [ ] **Webhook integration** for external services
- [ ] **Analytics dashboard** for form submission tracking
- [x] **Conditional notifications** based on form responses
- [ ] **File attachment support** for form uploads
- [ ] **Group chat support** for team notifications

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Apps Script team for the excellent platform
- Telegram Bot API for simple and powerful messaging
- The open source community for inspiration and feedback

---

<div align="center">

**[⭐ Star this repo](https://github.com/bhqmuhammad/Form-Response-Notifier-Bot)** if you find it useful!

Made with ❤️ by [bhqmuhammad](https://github.com/bhqmuhammad)

</div>
