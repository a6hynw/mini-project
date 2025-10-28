# Email Configuration Guide

## 🚨 Email Connection Issues Fixed

The email functionality has been improved with better error handling and configuration validation.

## 📧 Email Setup Instructions

### 1. Create Environment File

Create a `.env` file in the server directory with the following content:

```env
# Server Configuration
PORT=5000
MONGO_URI=mongodb://localhost:27017/hallbooking
JWT_SECRET=your-secret-key-here-change-in-production

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_FROM_NAME=Reservaa Hall Booking System
```

### 2. Gmail Setup (Recommended)

#### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification if not already enabled

#### Step 2: Generate App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Other (Custom name)"
3. Enter "Hall Booking System" as the name
4. Copy the generated 16-character password
5. Use this password as `EMAIL_PASS` in your `.env` file

#### Step 3: Update .env File
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

### 3. Alternative Email Providers

#### Outlook/Hotmail
```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
```

#### Yahoo Mail
```env
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
```

### 4. Test Email Configuration

Run the test script to verify your email setup:

```bash
cd server
node test-email.js
```

This will:
- ✅ Check your configuration
- ✅ Test SMTP connection
- ✅ Send a test email to yourself

### 5. Common Issues & Solutions

#### ❌ Authentication Error (EAUTH)
- **Problem**: Wrong username/password
- **Solution**: Use App Password for Gmail, not regular password
- **Check**: 2-Factor Authentication is enabled

#### ❌ Connection Error (ECONNECTION)
- **Problem**: Network or firewall issues
- **Solution**: Check internet connection and firewall settings
- **Check**: EMAIL_HOST and EMAIL_PORT are correct

#### ❌ "Less secure app access" Error
- **Problem**: Gmail blocking the connection
- **Solution**: Use App Password instead of regular password
- **Note**: "Less secure app access" is deprecated by Google

### 6. Email Features

The system sends emails for:
- ✅ Booking confirmations
- ✅ Password reset requests
- ✅ Booking status updates

### 7. Troubleshooting

If emails are still not working:

1. **Check server logs** for detailed error messages
2. **Run the test script** to isolate the issue
3. **Verify credentials** with your email provider
4. **Check spam folder** for test emails
5. **Try a different email provider** if Gmail doesn't work

### 8. Security Notes

- 🔐 Never commit `.env` files to version control
- 🔐 Use App Passwords instead of regular passwords
- 🔐 Keep your JWT_SECRET secure and unique
- 🔐 Use environment variables in production

## 🎯 Quick Start

1. Copy the `.env` template above
2. Replace `your-email@gmail.com` with your Gmail
3. Generate an App Password for Gmail
4. Replace `your-app-password` with the App Password
5. Run `node test-email.js` to test
6. Start your server with `npm run dev`

Your email functionality should now work perfectly! 🎉
