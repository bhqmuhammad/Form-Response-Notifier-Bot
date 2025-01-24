# Telegram Form Notifications

This repository contains a Google Apps Script that sends a notification to a Telegram chat whenever a Google Form response is submitted. The configuration for the Telegram Bot API token, form responses sheet name, and custom title are stored in a Google Sheets settings sheet.

## Features

- **Automated Notifications**: Automatically sends a Telegram message when a form response is submitted.
- **Customizable Settings**: Configure the bot API token, form responses sheet name, and custom title via a settings sheet.
- **Markdown Support**: Messages are sent in Markdown format, allowing for rich text formatting.
- **Timestamping**: Includes a timestamp of the form submission in the notification message.
- **Error Handling**: Logs errors and handles chat migrations if necessary.

## Usage

1. **Configuration**: 
   - Open the Google Sheets document and navigate to the 'Telegram Bot Settings' sheet.
   - Enter the Telegram Bot API token, form responses sheet name, and custom title in the specified cells.

2. **Deploy the Script**:
   - Open the script editor in Google Sheets (`Extensions` > `Apps Script`).
   - Copy and paste the code from `Code.js` into the script editor.
   - Save and deploy the script as a web app.

3. **Set Up Triggers**:
   - Create an installable trigger for form submissions by running the `createInstallableTrigger` function in the script editor.

## Functions

- `sendTelegramNotificationOnFormSubmit(e)`: Sends a notification to Telegram when a form response is submitted.
- `createInstallableTrigger()`: Creates an installable trigger for form submissions.

## Example Configuration Sheet

| Setting Name                | Value                        |
|-----------------------------|------------------------------|
| Telegram Bot API Token (B1) | YOUR_TELEGRAM_BOT_API_TOKEN  |
| Form Responses Sheet Name (B2) | Form Responses Sheet |
| Custom Title (B3)           | New Form Submission          |

## License

This repository is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
