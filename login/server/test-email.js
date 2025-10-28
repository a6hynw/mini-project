// Email Test Script
// Run this with: node test-email.js

require('dotenv').config();
const nodemailer = require('nodemailer');

// Email configuration
const EMAIL_USER = process.env.EMAIL_USER || 'reservaa.2025@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'your-app-password';
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = process.env.EMAIL_PORT || 587;
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Reservaa Hall Booking System';

console.log('🧪 Testing Email Configuration...\n');

// Check configuration
console.log('📋 Configuration:');
console.log(`   EMAIL_USER: ${EMAIL_USER}`);
console.log(`   EMAIL_HOST: ${EMAIL_HOST}`);
console.log(`   EMAIL_PORT: ${EMAIL_PORT}`);
console.log(`   EMAIL_PASS: ${EMAIL_PASS ? '***configured***' : '❌ NOT SET'}\n`);

if (!EMAIL_PASS || EMAIL_PASS === 'your-app-password') {
  console.error('❌ EMAIL_PASS is not configured!');
  console.error('📝 Please create a .env file with:');
  console.error('   EMAIL_USER=your-email@gmail.com');
  console.error('   EMAIL_PASS=your-app-password');
  console.error('   EMAIL_HOST=smtp.gmail.com');
  console.error('   EMAIL_PORT=587\n');
  console.error('🔐 For Gmail, you need to:');
  console.error('   1. Enable 2-Factor Authentication');
  console.error('   2. Generate an App Password');
  console.error('   3. Use the App Password (not your regular password)');
  process.exit(1);
}

// Create transporter
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Test connection
console.log('🔌 Testing SMTP connection...');
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Connection Failed:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    
    if (error.code === 'EAUTH') {
      console.error('\n🔧 Authentication Error - Common fixes:');
      console.error('   1. Check EMAIL_USER and EMAIL_PASS');
      console.error('   2. For Gmail: Use App Password (not regular password)');
      console.error('   3. Enable 2-Factor Authentication first');
    } else if (error.code === 'ECONNECTION') {
      console.error('\n🔧 Connection Error - Common fixes:');
      console.error('   1. Check EMAIL_HOST and EMAIL_PORT');
      console.error('   2. Check internet connection');
      console.error('   3. Check firewall settings');
    }
  } else {
    console.log('✅ SMTP Connection Successful!');
    console.log('📧 Ready to send emails');
    
    // Send test email
    console.log('\n📤 Sending test email...');
    const testEmail = {
      from: `"${EMAIL_FROM_NAME}" <${EMAIL_USER}>`,
      to: EMAIL_USER, // Send to self for testing
      subject: '🧪 Email Test - Hall Booking System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">✅ Email Test Successful!</h2>
          <p>This is a test email from your Hall Booking System.</p>
          <p><strong>Configuration:</strong></p>
          <ul>
            <li>SMTP Host: ${EMAIL_HOST}</li>
            <li>Port: ${EMAIL_PORT}</li>
            <li>From: ${EMAIL_USER}</li>
            <li>Timestamp: ${new Date().toISOString()}</li>
          </ul>
          <p style="color: #666; font-size: 14px;">
            If you received this email, your email configuration is working correctly!
          </p>
        </div>
      `
    };
    
    transporter.sendMail(testEmail, (error, info) => {
      if (error) {
        console.error('❌ Test email failed:', error.message);
      } else {
        console.log('✅ Test email sent successfully!');
        console.log(`   Message ID: ${info.messageId}`);
        console.log(`   Sent to: ${testEmail.to}`);
      }
    });
  }
});
