require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

// ================== CONFIGURATION ==================
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hallbooking';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here-change-in-production';

// Email configuration
const EMAIL_USER = process.env.EMAIL_USER || 'reservaa.2025@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'your-app-password';
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = process.env.EMAIL_PORT || 587;
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Reservaa Hall Booking System';

// Check if email credentials are properly configured
if (!process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'your-app-password') {
  console.warn('⚠️  EMAIL_PASS not configured! Please set EMAIL_PASS in your .env file');
  console.warn('📧 For Gmail: Use App Password (not regular password)');
  console.warn('🔗 Generate App Password: Google Account > Security > 2-Step Verification > App passwords');
}

// ================== DATABASE CONNECTION ==================
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// ================== INITIALIZE HALLS ==================
const initializeHalls = async () => {
  try {
    const hallsCount = await Hall.countDocuments();
    if (hallsCount === 0) {
      console.log('Initializing halls from JSON file...');
      const hallsData = require('./halls.json');
      
      for (const hallData of hallsData.halls) {
        const hall = new Hall({
          name: hallData.name,
          type: hallData.type,
          capacity: hallData.capacity,
          location: hallData.location,
          description: hallData.description,
          facilities: hallData.facilities,
          amenities: hallData.amenities,
          images: hallData.images,
          bookingRules: hallData.bookingRules
        });
        await hall.save();
      }
      console.log(`Initialized ${hallsData.halls.length} halls`);
    }
  } catch (error) {
    console.error('Error initializing halls:', error);
  }
};

// ================== EMAIL TRANSPORTER ==================
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  tls: {
    // Do not fail on invalid certs
    rejectUnauthorized: false
  }
});

// Verify email configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email configuration error:', error.message);
    console.error('🔧 Common fixes:');
    console.error('   1. Check EMAIL_USER and EMAIL_PASS in .env file');
    console.error('   2. For Gmail: Enable 2FA and use App Password');
    console.error('   3. Check EMAIL_HOST and EMAIL_PORT settings');
    console.error('   4. Ensure less secure app access is enabled (if using regular password)');
  } else {
    console.log('✅ Email server is ready to send messages');
    console.log(`📧 Using: ${EMAIL_USER} via ${EMAIL_HOST}:${EMAIL_PORT}`);
  }
});

// ================== SCHEMAS & MODELS ==================
const facultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String, required: true },
  collegeId: { type: String, required: true, unique: true },
  avatar: { type: String, default: '' },
  resetPasswordToken: { type: String },
  resetPasswordExpiry: { type: Date }
});
const Faculty = mongoose.model('Faculty', facultySchema);

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  hallName: { type: String, required: true },
  hallCapacity: { type: Number, required: true },
  bookingDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  purpose: { type: String, required: true },
  department: { type: String, required: true },
  additionalRequirements: { type: String, default: '' },
  acPreference: { type: String, enum: ['AC', 'Non-AC'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'rescheduled'], default: 'pending' },
  bookingCode: { type: String, unique: true, required: true },
  confirmationSent: { type: Boolean, default: false },
  isPriorityRequest: { type: Boolean, default: false },
  priorityReason: { type: String, default: '' },
  adminNotes: { type: String, default: '' },
  rescheduledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  rescheduledTo: { 
    bookingDate: { type: Date },
    startTime: { type: String },
    endTime: { type: String },
    hallName: { type: String }
  },
  rescheduleReason: { type: String, default: '' },
  rescheduleNotificationSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const Booking = mongoose.model('Booking', bookingSchema);

const workshopSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  createdAt: { type: Date, default: Date.now }
});
const Workshop = mongoose.model('Workshop', workshopSchema);

const hallSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, required: true, default: 'Seminar Hall' },
  capacity: { type: Number, required: true },
  location: { type: String, required: true },
  description: { type: String, default: '' },
  facilities: [{ type: String }],
  amenities: [{ type: String }],
  images: [{ type: String }],
  bookingRules: {
    advanceBookingDays: { type: Number, default: 7 },
    minimumBookingHours: { type: Number, default: 1 },
    maximumBookingHours: { type: Number, default: 4 },
    requiresApproval: { type: Boolean, default: false }
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const Hall = mongoose.model('Hall', hallSchema);

// ================== HELPERS ==================
const generateBookingCode = () => {
  const prefix = 'HB';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

const sendConfirmationEmail = async (userEmail, userName, booking) => {
  // Check if email is properly configured
  if (!EMAIL_PASS || EMAIL_PASS === 'your-app-password') {
    console.error('❌ Cannot send email: EMAIL_PASS not configured');
    return false;
  }

  try {
    const mailOptions = {
      from: `"${EMAIL_FROM_NAME}" <${EMAIL_USER}>`,
      to: userEmail,
      subject: '🎉 Your Hall Booking is Confirmed! 🎉',
      html: `
        <div style="font-family: 'Segoe UI', 'Poppins', Arial, sans-serif; background: linear-gradient(120deg, #e0e7ff 0%, #f0fdfa 100%); padding: 32px 0;">
          <div style="max-width: 520px; margin: auto; background: rgba(255,255,255,0.95); border-radius: 24px; box-shadow: 0 8px 32px 0 rgba(31,38,135,0.12); padding: 32px 40px;">
            <div style="text-align: center;">
              <div style="background: linear-gradient(90deg, #6366f1 0%, #06b6d4 100%); width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                <span style="font-size: 2.5rem; color: #fff;">🏛️</span>
              </div>
              <h1 style="font-size: 2rem; font-weight: 800; color: #3730a3; margin-bottom: 8px; letter-spacing: 1px;">
                Hall Booking Confirmed!
              </h1>
              <p style="font-size: 1.1rem; color: #0e7490; margin-bottom: 24px;">
                Dear <b>${userName}</b>, your booking has been <span style="color: #22c55e; font-weight: 700;">approved</span>.
              </p>
            </div>
            <div style="background: linear-gradient(90deg, #f0fdfa 0%, #e0e7ff 100%); border-radius: 16px; padding: 24px 20px; margin-bottom: 24px;">
              <table style="width: 100%; font-size: 1rem; color: #334155;">
                <tr>
                  <td style="padding: 6px 0;"><b>Booking Code:</b></td>
                  <td style="padding: 6px 0; color: #6366f1; font-weight: 700;">${booking.bookingCode}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0;"><b>Hall:</b></td>
                  <td style="padding: 6px 0;">${booking.hallName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0;"><b>Date:</b></td>
                  <td style="padding: 6px 0;">${new Date(booking.bookingDate).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0;"><b>Time:</b></td>
                  <td style="padding: 6px 0;">${booking.startTime} - ${booking.endTime}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0;"><b>Status:</b></td>
                  <td style="padding: 6px 0; color: #22c55e; font-weight: 700;">APPROVED</td>
                </tr>
              </table>
            </div>
            <div style="text-align: center; margin-bottom: 16px;">
              <a href="mailto:${EMAIL_USER}" style="display: inline-block; background: linear-gradient(90deg, #6366f1 0%, #06b6d4 100%); color: #fff; padding: 12px 32px; border-radius: 999px; font-weight: 600; text-decoration: none; box-shadow: 0 2px 8px #06b6d4; font-size: 1rem;">
                Contact Support
              </a>
            </div>
            <p style="font-size: 0.95rem; color: #64748b; text-align: center;">
              Thank you for using <b>Reserva</b> – Smart Hall Booking System.<br>
              We wish you a successful event!
            </p>
          </div>
          <div style="text-align: center; margin-top: 24px; color: #94a3b8; font-size: 0.9rem;">
            &copy; ${new Date().getFullYear()} College Hall Booking System
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Confirmation email sent successfully:', result.messageId);
    console.log(`📧 Sent to: ${userEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error.message);
    console.error('🔧 Email error details:', {
      code: error.code,
      command: error.command,
      response: error.response
    });
    return false;
  }
};

const sendRescheduleNotificationEmail = async (userEmail, userName, booking, rescheduleInfo) => {
  // Check if email is properly configured
  if (!EMAIL_PASS || EMAIL_PASS === 'your-app-password') {
    console.error('❌ Cannot send email: EMAIL_PASS not configured');
    return false;
  }

  try {
    const mailOptions = {
      from: `"${EMAIL_FROM_NAME}" <${EMAIL_USER}>`,
      to: userEmail,
      subject: '⚠️ Your Hall Booking Has Been Rescheduled',
      html: `
        <div style="font-family: 'Segoe UI', 'Poppins', Arial, sans-serif; background: linear-gradient(120deg, #fef3c7 0%, #fde68a 100%); padding: 32px 0;">
          <div style="max-width: 520px; margin: auto; background: rgba(255,255,255,0.95); border-radius: 24px; box-shadow: 0 8px 32px 0 rgba(31,38,135,0.12); padding: 32px 40px;">
            <div style="text-align: center;">
              <div style="background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%); width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                <span style="font-size: 2.5rem; color: #fff;">📅</span>
              </div>
              <h1 style="font-size: 2rem; font-weight: 800; color: #92400e; margin-bottom: 8px; letter-spacing: 1px;">
                Booking Rescheduled
              </h1>
              <p style="font-size: 1.1rem; color: #b45309; margin-bottom: 24px;">
                Dear <b>${userName}</b>, your booking has been <span style="color: #f59e0b; font-weight: 700;">rescheduled</span> due to a priority request.
              </p>
            </div>
            
            <div style="background: #fef3c7; border-radius: 16px; padding: 24px 20px; margin-bottom: 24px;">
              <h3 style="color: #92400e; font-size: 1.2rem; margin-bottom: 16px; text-align: center;">Original Booking Details</h3>
              <table style="width: 100%; font-size: 1rem; color: #92400e;">
                <tr>
                  <td style="padding: 6px 0;"><b>Booking Code:</b></td>
                  <td style="padding: 6px 0; color: #b45309; font-weight: 700;">${booking.bookingCode}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0;"><b>Hall:</b></td>
                  <td style="padding: 6px 0;">${booking.hallName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0;"><b>Original Date:</b></td>
                  <td style="padding: 6px 0;">${new Date(booking.bookingDate).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0;"><b>Original Time:</b></td>
                  <td style="padding: 6px 0;">${booking.startTime} - ${booking.endTime}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0;"><b>Status:</b></td>
                  <td style="padding: 6px 0; color: #f59e0b; font-weight: 700;">RESCHEDULED</td>
                </tr>
              </table>
            </div>

            ${rescheduleInfo ? `
            <div style="background: linear-gradient(90deg, #dbeafe 0%, #e0e7ff 100%); border-radius: 16px; padding: 24px 20px; margin-bottom: 24px;">
              <h3 style="color: #1e40af; font-size: 1.2rem; margin-bottom: 16px; text-align: center;">New Booking Details</h3>
              <table style="width: 100%; font-size: 1rem; color: #1e40af;">
                <tr>
                  <td style="padding: 6px 0;"><b>New Hall:</b></td>
                  <td style="padding: 6px 0;">${rescheduleInfo.hallName || 'To be determined'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0;"><b>New Date:</b></td>
                  <td style="padding: 6px 0;">${rescheduleInfo.bookingDate ? new Date(rescheduleInfo.bookingDate).toLocaleDateString() : 'To be determined'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0;"><b>New Time:</b></td>
                  <td style="padding: 6px 0;">${rescheduleInfo.startTime || 'TBD'} - ${rescheduleInfo.endTime || 'TBD'}</td>
                </tr>
              </table>
            </div>
            ` : ''}

            <div style="background: #f3f4f6; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
              <h4 style="color: #374151; font-size: 1rem; margin-bottom: 8px;">Reason for Rescheduling:</h4>
              <p style="color: #6b7280; font-size: 0.95rem; margin: 0;">
                ${booking.rescheduleReason || 'A higher priority event has been approved for your original time slot. We apologize for any inconvenience caused.'}
              </p>
            </div>

            <div style="text-align: center; margin-bottom: 16px;">
              <a href="mailto:${EMAIL_USER}" style="display: inline-block; background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%); color: #fff; padding: 12px 32px; border-radius: 999px; font-weight: 600; text-decoration: none; box-shadow: 0 2px 8px #f59e0b; font-size: 1rem;">
                Contact Support
              </a>
            </div>
            <p style="font-size: 0.95rem; color: #64748b; text-align: center;">
              We apologize for any inconvenience. Please contact us if you have any questions or need assistance with rescheduling.
            </p>
          </div>
          <div style="text-align: center; margin-top: 24px; color: #94a3b8; font-size: 0.9rem;">
            &copy; ${new Date().getFullYear()} College Hall Booking System
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Reschedule notification email sent successfully:', result.messageId);
    console.log(`📧 Sent to: ${userEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending reschedule notification email:', error.message);
    console.error('🔧 Email error details:', {
      code: error.code,
      command: error.command,
      response: error.response
    });
    return false;
  }
};

const addEventStatus = (booking) => {
  const today = new Date();
  const bookingDate = new Date(booking.bookingDate);
  const isLive =
    bookingDate.getFullYear() === today.getFullYear() &&
    bookingDate.getMonth() === today.getMonth() &&
    bookingDate.getDate() === today.getDate();
  return {
    ...booking.toObject(),
    eventStatus: isLive ? 'live' : 'upcoming'
  };
};

const findAlternativeSlots = async (hallName, originalDate, originalStartTime, originalEndTime) => {
  try {
    // Look for available slots in the same hall on the same day
    const sameDaySlots = await findAvailableSlotsOnDate(hallName, originalDate, originalStartTime, originalEndTime);
    
    // Look for available slots in the same hall on the next 7 days
    const nextWeekSlots = [];
    for (let i = 1; i <= 7; i++) {
      const checkDate = new Date(originalDate);
      checkDate.setDate(checkDate.getDate() + i);
      const slots = await findAvailableSlotsOnDate(hallName, checkDate, originalStartTime, originalEndTime);
      nextWeekSlots.push(...slots);
    }
    
    return {
      sameDay: sameDaySlots,
      nextWeek: nextWeekSlots
    };
  } catch (error) {
    console.error('Error finding alternative slots:', error);
    return { sameDay: [], nextWeek: [] };
  }
};

const findAvailableSlotsOnDate = async (hallName, date, startTime, endTime) => {
  try {
    const dateOnly = new Date(new Date(date).toDateString());
    
    // Get all bookings for this hall on this date
    const existingBookings = await Booking.find({
      hallName,
      bookingDate: dateOnly,
      status: { $in: ['approved', 'pending'] }
    }).sort({ startTime: 1 });
    
    // Generate time slots (assuming 1-hour slots from 8 AM to 8 PM)
    const timeSlots = [];
    for (let hour = 8; hour < 20; hour++) {
      const slotStart = `${hour.toString().padStart(2, '0')}:00`;
      const slotEnd = `${(hour + 1).toString().padStart(2, '0')}:00`;
      
      // Check if this slot conflicts with existing bookings
      const hasConflict = existingBookings.some(booking => {
        return (slotStart < booking.endTime && slotEnd > booking.startTime);
      });
      
      if (!hasConflict) {
        timeSlots.push({
          startTime: slotStart,
          endTime: slotEnd,
          date: dateOnly,
          hallName
        });
      }
    }
    
    return timeSlots;
  } catch (error) {
    console.error('Error finding available slots on date:', error);
    return [];
  }
};

// ================== MIDDLEWARE ==================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ================== ROUTES ==================

// -------- AUTH --------
app.post('/api/register', async (req, res) => {
  const { name, email, password, department, collegeId } = req.body;
  if (!name || !email || !password || !department || !collegeId) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const existingUser = await Faculty.findOne({ $or: [{ email }, { collegeId }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or College ID already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newFaculty = new Faculty({ name, email, password: hashedPassword, department, collegeId });
    await newFaculty.save();
    res.status(201).json({ message: 'Faculty registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Error registering faculty' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Faculty.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        collegeId: user.collegeId,
        avatar: user.avatar || ''
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login error' });
  }
});

// Admin login endpoint
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Hardcoded admin credentials
  const ADMIN_EMAIL = 'admin@adishankara.ac.in';
  const ADMIN_PASSWORD = 'Admin@123';
  
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign(
      { id: 'admin', email: ADMIN_EMAIL, isAdmin: true },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({
      token,
      user: {
        id: 'admin',
        name: 'System Administrator',
        email: ADMIN_EMAIL,
        isAdmin: true,
        role: 'admin'
      }
    });
  } else {
    res.status(400).json({ message: 'Invalid admin credentials' });
  }
});

app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await Faculty.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { name, department, avatar } = req.body;
    const updates = {};
    if (typeof name === 'string' && name.trim()) updates.name = name.trim();
    if (typeof department === 'string' && department.trim()) updates.department = department.trim();
    if (typeof avatar === 'string') updates.avatar = avatar;

    const updated = await Faculty.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Profile updated', user: updated });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// -------- BOOKINGS --------
app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const { hallName, hallCapacity, bookingDate, startTime, endTime, purpose, department, additionalRequirements, acPreference, isPriorityRequest, priorityReason } = req.body;
    if (!hallName || !hallCapacity || !bookingDate || !startTime || !endTime || !purpose || !department || !acPreference) {
      return res.status(400).json({ message: 'All required fields are missing' });
    }
    const dateOnly = new Date(new Date(bookingDate).toDateString());
    const overlapping = await Booking.find({
      hallName,
      bookingDate: dateOnly,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    }).sort({ createdAt: 1 });
    
    const hasApproved = overlapping.some(b => b.status === 'approved');
    const hasPendingEarlier = overlapping.some(b => b.status === 'pending');
    
    // If there's a collision and user wants to submit priority request
    if ((hasApproved || hasPendingEarlier) && isPriorityRequest) {
      let bookingCode;
      let codeExists = true;
      while (codeExists) {
        bookingCode = generateBookingCode();
        const existingBooking = await Booking.findOne({ bookingCode });
        codeExists = !!existingBooking;
      }
      
      const user = await Faculty.findById(req.user.id);
      const newBooking = new Booking({
        userId: req.user.id,
        hallName,
        hallCapacity,
        bookingDate: dateOnly,
        startTime,
        endTime,
        purpose,
        department,
        additionalRequirements: additionalRequirements || '',
        acPreference,
        status: 'pending',
        isPriorityRequest: true,
        priorityReason: priorityReason || '',
        bookingCode
      });
      
      await newBooking.save();
      
      res.status(201).json({
        message: 'Priority request submitted successfully. Admin will review your request.',
        booking: newBooking,
        bookingCode: bookingCode,
        isPriorityRequest: true,
        conflicts: overlapping.filter(b => b.status === 'approved')
      });
      return;
    }
    
    // If there's a collision and user doesn't want priority request
    if (hasApproved) {
      return res.status(409).json({
        message: 'Clash detected: an approved booking already exists for this time slot.',
        clash: true,
        conflicts: overlapping.filter(b => b.status === 'approved'),
        canRequestPriority: true
      });
    }
    
    if (hasPendingEarlier) {
      return res.status(409).json({
        message: 'Clash detected: an earlier booking request exists for this time slot (first-come-first-serve).',
        clash: true,
        conflicts: overlapping,
        canRequestPriority: true
      });
    }
    
    // No collision - proceed with normal booking
    let bookingCode;
    let codeExists = true;
    while (codeExists) {
      bookingCode = generateBookingCode();
      const existingBooking = await Booking.findOne({ bookingCode });
      codeExists = !!existingBooking;
    }
    const user = await Faculty.findById(req.user.id);
    const newBooking = new Booking({
      userId: req.user.id,
      hallName,
      hallCapacity,
      bookingDate: dateOnly,
      startTime,
      endTime,
      purpose,
      department,
      additionalRequirements: additionalRequirements || '',
      acPreference,
      status: 'approved', // Change to 'pending' if you want approval workflow
      bookingCode
    });
    await newBooking.save();
    const emailSent = await sendConfirmationEmail(user.email, user.name, newBooking);
    if (emailSent) {
      await Booking.findByIdAndUpdate(newBooking._id, { confirmationSent: true });
    }
    res.status(201).json({
      message: 'Booking approved successfully',
      booking: newBooking,
      bookingCode: bookingCode,
      emailSent: emailSent
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Error creating booking' });
  }
});

app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching bookings for user:', req.user.id);
    const bookings = await Booking.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email department');
    
    console.log('Found bookings:', bookings.length);
    const bookingsWithStatus = bookings.map(booking => {
      const bookingWithStatus = addEventStatus(booking);
      // Ensure all new fields have default values for backward compatibility
      return {
        ...bookingWithStatus,
        department: bookingWithStatus.department || 'Not specified',
        additionalRequirements: bookingWithStatus.additionalRequirements || '',
        acPreference: bookingWithStatus.acPreference || 'Not specified'
      };
    });
    res.json({ bookings: bookingsWithStatus });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ 
      message: 'Error fetching bookings',
      error: error.message 
    });
  }
});

app.get('/api/bookings/code/:code', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingCode: req.params.code })
      .populate('userId', 'name email department collegeId');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ booking });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking' });
  }
});

// Cancel booking endpoint
app.delete('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'approved') {
      return res.status(400).json({ message: 'Only approved bookings can be cancelled' });
    }

    // Check if booking is in the past
    const bookingDate = new Date(booking.bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      return res.status(400).json({ message: 'Cannot cancel past bookings' });
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ 
      success: true, 
      message: 'Booking cancelled successfully' 
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Error cancelling booking' });
  }
});

app.post('/api/bookings/:id/resend-email', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    const user = await Faculty.findById(req.user.id);
    const emailSent = await sendConfirmationEmail(user.email, user.name, booking);
    if (emailSent) {
      await Booking.findByIdAndUpdate(booking._id, {
        confirmationSent: true,
        updatedAt: new Date()
      });
      res.json({ message: 'Confirmation email resent successfully' });
    } else {
      res.status(500).json({ message: 'Failed to send confirmation email' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error resending confirmation email' });
  }
});

// -------- ADMIN BOOKINGS --------
app.get('/api/admin/bookings', authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email department collegeId')
      .sort({ createdAt: -1 });
    const bookingsWithStatus = bookings.map(addEventStatus);
    res.json({ bookings: bookingsWithStatus });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all bookings' });
  }
});

// Get priority requests for admin review
app.get('/api/admin/priority-requests', authenticateToken, async (req, res) => {
  try {
    const priorityRequests = await Booking.find({ 
      isPriorityRequest: true,
      status: 'pending'
    })
      .populate('userId', 'name email department collegeId')
      .sort({ createdAt: -1 });
    
    const requestsWithStatus = priorityRequests.map(addEventStatus);
    res.json({ requests: requestsWithStatus });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching priority requests' });
  }
});

// Get alternative slots for rescheduling
app.get('/api/admin/alternative-slots/:hallName/:date/:startTime/:endTime', authenticateToken, async (req, res) => {
  try {
    const { hallName, date, startTime, endTime } = req.params;
    const alternativeSlots = await findAlternativeSlots(hallName, date, startTime, endTime);
    res.json({ alternativeSlots });
  } catch (error) {
    res.status(500).json({ message: 'Error finding alternative slots' });
  }
});

app.put('/api/admin/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const { status, adminNotes, rescheduleInfo } = req.body;
    const updateData = { status, updatedAt: new Date() };
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('userId', 'name email department');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // If approving a priority request, handle rescheduling of conflicting bookings
    if (status === 'approved' && booking.isPriorityRequest) {
      await handlePriorityApproval(booking, rescheduleInfo);
    }
    
    if (status === 'approved' && !booking.confirmationSent) {
      const user = await Faculty.findById(booking.userId);
      const emailSent = await sendConfirmationEmail(user.email, user.name, booking);
      if (emailSent) {
        await Booking.findByIdAndUpdate(booking._id, { confirmationSent: true });
      }
    }
    res.json({ message: 'Booking status updated successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking status' });
  }
});

const handlePriorityApproval = async (priorityBooking, rescheduleInfo) => {
  try {
    // Find conflicting bookings that need to be rescheduled
    const conflictingBookings = await Booking.find({
      hallName: priorityBooking.hallName,
      bookingDate: priorityBooking.bookingDate,
      status: 'approved',
      _id: { $ne: priorityBooking._id },
      $or: [
        { startTime: { $lt: priorityBooking.endTime }, endTime: { $gt: priorityBooking.startTime } }
      ]
    }).populate('userId', 'name email department');

    // Reschedule each conflicting booking
    for (const conflictingBooking of conflictingBookings) {
      // Find alternative slots for rescheduling
      const alternativeSlots = await findAlternativeSlots(
        conflictingBooking.hallName,
        conflictingBooking.bookingDate,
        conflictingBooking.startTime,
        conflictingBooking.endTime
      );

      // Update the conflicting booking to rescheduled status
      const rescheduleData = {
        status: 'rescheduled',
        rescheduledBy: priorityBooking._id,
        rescheduleReason: `Rescheduled due to priority request: ${priorityBooking.priorityReason || 'High priority event'}`,
        updatedAt: new Date()
      };

      // If reschedule info is provided, use it
      if (rescheduleInfo && rescheduleInfo.hallName && rescheduleInfo.bookingDate && rescheduleInfo.startTime && rescheduleInfo.endTime) {
        rescheduleData.rescheduledTo = {
          hallName: rescheduleInfo.hallName,
          bookingDate: new Date(rescheduleInfo.bookingDate),
          startTime: rescheduleInfo.startTime,
          endTime: rescheduleInfo.endTime
        };
      }

      await Booking.findByIdAndUpdate(conflictingBooking._id, rescheduleData);

      // Send reschedule notification email
      const user = await Faculty.findById(conflictingBooking.userId);
      if (user) {
        const emailSent = await sendRescheduleNotificationEmail(
          user.email,
          user.name,
          conflictingBooking,
          rescheduleData.rescheduledTo
        );
        
        if (emailSent) {
          await Booking.findByIdAndUpdate(conflictingBooking._id, { rescheduleNotificationSent: true });
        }
      }
    }

    console.log(`✅ Rescheduled ${conflictingBookings.length} conflicting bookings for priority request ${priorityBooking.bookingCode}`);
  } catch (error) {
    console.error('❌ Error handling priority approval:', error);
  }
};

// -------- WORKSHOPS --------
app.post('/api/workshops', authenticateToken, async (req, res) => {
  try {
    const { title, description, date } = req.body;
    if (!title || !date) {
      return res.status(400).json({ message: 'Title and date are required' });
    }
    const newWorkshop = new Workshop({
      title,
      description,
      date,
      organizer: req.user.id
    });
    await newWorkshop.save();
    res.status(201).json({ message: 'Workshop created', workshop: newWorkshop });
  } catch (error) {
    res.status(500).json({ message: 'Error creating workshop' });
  }
});

app.get('/api/workshops', authenticateToken, async (req, res) => {
  try {
    const workshops = await Workshop.find().populate('organizer', 'name email');
    res.json({ workshops });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workshops' });
  }
});

// ================== PASSWORD MANAGEMENT ==================
// Change password endpoint
app.put('/api/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await Faculty.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await Faculty.findByIdAndUpdate(req.user.id, { password: hashedNewPassword });
    
    res.json({ 
      success: true, 
      message: 'Password changed successfully' 
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
});

// Forgot password endpoint
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await Faculty.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();

    // Send reset email
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"${EMAIL_FROM_NAME}" <${EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: 'Segoe UI', 'Poppins', Arial, sans-serif; background: linear-gradient(120deg, #e0e7ff 0%, #f0fdfa 100%); padding: 32px 0;">
          <div style="max-width: 520px; margin: auto; background: rgba(255,255,255,0.95); border-radius: 24px; box-shadow: 0 8px 32px 0 rgba(31,38,135,0.12); padding: 32px 40px;">
            <div style="text-align: center;">
              <div style="background: linear-gradient(90deg, #6366f1 0%, #06b6d4 100%); width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                <span style="font-size: 2.5rem; color: #fff;">🔐</span>
              </div>
              <h1 style="font-size: 2rem; font-weight: 800; color: #3730a3; margin-bottom: 8px; letter-spacing: 1px;">
                Password Reset Request
              </h1>
              <p style="color: #6b7280; font-size: 1.1rem; margin-bottom: 24px;">
                Hello ${user.name}, you requested a password reset for your account.
              </p>
              <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <p style="color: #374151; margin: 0; font-size: 1rem;">
                  Click the button below to reset your password. This link will expire in 1 hour.
                </p>
              </div>
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(90deg, #6366f1 0%, #06b6d4 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0;">
                Reset Password
              </a>
              <p style="color: #9ca3af; font-size: 0.9rem; margin-top: 24px;">
                If you didn't request this password reset, please ignore this email.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent successfully:', result.messageId);
    console.log(`📧 Sent to: ${email}`);
    res.json({ 
      success: true, 
      message: 'Password reset email sent successfully' 
    });
  } catch (error) {
    console.error('Error sending reset email:', error);
    res.status(500).json({ message: 'Error sending reset email' });
  }
});

// Reset password endpoint
app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await Faculty.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.json({ 
      success: true, 
      message: 'Password reset successfully' 
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

// ================== HALL MANAGEMENT ==================
// Get all halls
app.get('/api/halls', async (req, res) => {
  try {
    const halls = await Hall.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ halls });
  } catch (error) {
    console.error('Error fetching halls:', error);
    res.status(500).json({ message: 'Error fetching halls' });
  }
});

// Add new hall
app.post('/api/halls', authenticateToken, async (req, res) => {
  try {
    const { name, type, capacity, location, description, facilities, amenities, images, bookingRules } = req.body;
    
    // Validate required fields
    if (!name || !capacity || !location) {
      return res.status(400).json({ message: 'Name, capacity, and location are required' });
    }

    // Check if hall with same name already exists
    const existingHall = await Hall.findOne({ name });
    if (existingHall) {
      return res.status(400).json({ message: 'Hall with this name already exists' });
    }

    // Create new hall
    const newHall = new Hall({
      name,
      type: type || 'Seminar Hall',
      capacity: parseInt(capacity),
      location,
      description: description || '',
      facilities: facilities || [],
      amenities: amenities || [],
      images: images || [],
      bookingRules: {
        advanceBookingDays: bookingRules?.advanceBookingDays || 7,
        minimumBookingHours: bookingRules?.minimumBookingHours || 1,
        maximumBookingHours: bookingRules?.maximumBookingHours || 4,
        requiresApproval: bookingRules?.requiresApproval || false
      }
    });

    await newHall.save();
    res.status(201).json({ 
      message: 'Hall created successfully', 
      hall: newHall 
    });
  } catch (error) {
    console.error('Error creating hall:', error);
    res.status(500).json({ message: 'Error creating hall' });
  }
});

// Update hall
app.put('/api/halls/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, capacity, location, description, facilities, amenities, images, bookingRules } = req.body;
    
    // Validate required fields
    if (!name || !capacity || !location) {
      return res.status(400).json({ message: 'Name, capacity, and location are required' });
    }

    // Check if hall exists
    const existingHall = await Hall.findById(id);
    if (!existingHall) {
      return res.status(404).json({ message: 'Hall not found' });
    }

    // Check if another hall with same name exists (excluding current hall)
    const duplicateHall = await Hall.findOne({ name, _id: { $ne: id } });
    if (duplicateHall) {
      return res.status(400).json({ message: 'Hall with this name already exists' });
    }

    // Update hall
    const updatedHall = await Hall.findByIdAndUpdate(
      id,
      {
        name,
        type: type || 'Seminar Hall',
        capacity: parseInt(capacity),
        location,
        description: description || '',
        facilities: facilities || [],
        amenities: amenities || [],
        images: images || [],
        bookingRules: {
          advanceBookingDays: bookingRules?.advanceBookingDays || 7,
          minimumBookingHours: bookingRules?.minimumBookingHours || 1,
          maximumBookingHours: bookingRules?.maximumBookingHours || 4,
          requiresApproval: bookingRules?.requiresApproval || false
        },
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    res.json({ 
      message: 'Hall updated successfully', 
      hall: updatedHall 
    });
  } catch (error) {
    console.error('Error updating hall:', error);
    res.status(500).json({ message: 'Error updating hall' });
  }
});

// Delete hall
app.delete('/api/halls/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if hall exists
    const existingHall = await Hall.findById(id);
    if (!existingHall) {
      return res.status(404).json({ message: 'Hall not found' });
    }

    // Check if hall has any active bookings
    const activeBookings = await Booking.find({ 
      hallName: existingHall.name, 
      bookingDate: { $gte: new Date() },
      status: { $in: ['pending', 'approved'] }
    });

    if (activeBookings.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete hall with active bookings. Please cancel or complete all bookings first.' 
      });
    }

    // Soft delete by setting isActive to false
    await Hall.findByIdAndUpdate(id, { isActive: false, updatedAt: new Date() });
    
    res.json({ 
      message: 'Hall deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting hall:', error);
    res.status(500).json({ message: 'Error deleting hall' });
  }
});

// ================== HEALTH CHECK ==================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// ================== CLEANUP FUNCTION ==================
// Function to delete old events that are over
const cleanupOldEvents = async () => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Delete bookings that ended before today
    const result = await Booking.deleteMany({
      bookingDate: { $lt: today },
      status: { $in: ['approved', 'rejected'] }
    });
    
    console.log(`Cleaned up ${result.deletedCount} old events`);
  } catch (error) {
    console.error('Error cleaning up old events:', error);
  }
};

// Run cleanup on server start and then every 24 hours
cleanupOldEvents();
setInterval(cleanupOldEvents, 24 * 60 * 60 * 1000); // 24 hours

// ================== SERVER START ==================
app.listen(PORT, async () => {
  console.log(`Server running on port http://localhost:${PORT}`);
  // Initialize halls after server starts
  await initializeHalls();
});

// Handle token expiration on the client side
// if (error.response?.data?.message === 'Invalid or expired token') {
//   localStorage.removeItem('token');
//   localStorage.removeItem('userData');
//   window.location.href = '/';
// }