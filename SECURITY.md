# Security Policy

## Supported Versions

We release security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.1.x   | :white_check_mark: |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it by emailing the maintainers directly. **Do not create a public GitHub issue for security vulnerabilities.**

### What to Include

Please include the following information in your report:

- A clear description of the vulnerability
- Steps to reproduce the issue
- Potential impact of the vulnerability
- Any suggested fixes or mitigations
- Your contact information for follow-up

### Response Timeline

- **Initial Response**: Within 48 hours
- **Investigation**: Within 1 week  
- **Fix and Release**: Within 2 weeks (depending on severity)
- **Public Disclosure**: After fix is released

## Security Best Practices

### For Users

1. **Bot Token Security**
   - Never share your bot token publicly
   - Use environment variables or secure storage
   - Rotate tokens regularly
   - Monitor for unauthorized usage

2. **Input Validation**
   - Validate all form inputs
   - Sanitize data before processing
   - Use the built-in escaping functions

3. **Access Control**
   - Restrict Google Apps Script access appropriately
   - Use principle of least privilege
   - Monitor script execution logs

4. **Data Protection**
   - Don't include sensitive data in notifications
   - Be mindful of privacy regulations (GDPR, etc.)
   - Consider data retention policies

### For Developers

1. **Code Security**
   - Validate all inputs and parameters
   - Use proper error handling
   - Avoid logging sensitive information
   - Follow secure coding practices

2. **API Security**
   - Implement proper rate limiting
   - Use HTTPS for all API calls
   - Validate API responses
   - Handle API errors gracefully

3. **Testing**
   - Test with malicious inputs
   - Verify error handling
   - Check for information leakage
   - Test with edge cases

## Known Security Considerations

### Google Apps Script
- Scripts run with user permissions
- External URL access is logged
- Execution time limits apply
- Quota limits provide natural rate limiting

### Telegram Bot API
- Bot tokens provide full API access
- Messages are not end-to-end encrypted
- API calls are rate limited
- Bot usernames are public

### Form Data
- Form responses may contain sensitive data
- Consider data minimization principles
- Implement proper data handling procedures
- Be aware of regulatory requirements

## Changelog of Security Updates

### Version 1.1.0
- Enhanced input validation and sanitization
- Improved error handling to prevent information leakage
- Added comprehensive logging for security monitoring
- Implemented retry logic with exponential backoff

### Version 1.0.0
- Initial release with basic security measures
- Telegram API integration with token validation
- Form data validation and escaping

## Contact

For security-related questions or concerns, please contact the maintainers through GitHub or email.

---

Thank you for helping keep our project secure!