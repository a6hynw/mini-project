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
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = process.env.EMAIL_PORT || 587;

// ================== DATABASE CONNECTION ==================
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// ================== EMAIL TRANSPORTER ==================
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Email configuration error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// ================== SCHEMAS & MODELS ==================
const facultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String, required: true },
  collegeId: { type: String, required: true, unique: true },
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
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  bookingCode: { type: String, unique: true, required: true },
  confirmationSent: { type: Boolean, default: false },
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

// ================== HELPERS ==================
const generateBookingCode = () => {
  const prefix = 'HB';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

const sendConfirmationEmail = async (userEmail, userName, booking) => {
  try {
    const mailOptions = {
      from: `"College Hall Booking System" <${EMAIL_USER}>`,
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
    console.log('Confirmation email sent:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
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
        collegeId: user.collegeId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login error' });
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

// -------- BOOKINGS --------
app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const { hallName, hallCapacity, bookingDate, startTime, endTime, purpose } = req.body;
    if (!hallName || !hallCapacity || !bookingDate || !startTime || !endTime || !purpose) {
      return res.status(400).json({ message: 'All fields are required' });
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
    if (hasApproved) {
      return res.status(409).json({
        message: 'Clash detected: an approved booking already exists for this time slot.',
        clash: true,
        conflicts: overlapping.filter(b => b.status === 'approved')
      });
    }
    const hasPendingEarlier = overlapping.some(b => b.status === 'pending');
    if (hasPendingEarlier) {
      return res.status(409).json({
        message: 'Clash detected: an earlier booking request exists for this time slot (first-come-first-serve).',
        clash: true,
        conflicts: overlapping
      });
    }
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
    const bookings = await Booking.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email department');
    const bookingsWithStatus = bookings.map(addEventStatus);
    res.json({ bookings: bookingsWithStatus });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings' });
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

app.put('/api/admin/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    ).populate('userId', 'name email department');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
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

// ================== SERVER START ==================
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

// Handle token expiration on the client side
// if (error.response?.data?.message === 'Invalid or expired token') {
//   localStorage.removeItem('token');
//   localStorage.removeItem('userData');
//   window.location.href = '/';
// }