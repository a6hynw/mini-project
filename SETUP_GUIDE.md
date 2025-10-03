# Hall Booking System - Complete Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git (optional)

### 1. Backend Setup

```bash
# Navigate to server directory
cd mini-project-main/login/server

# Install dependencies
npm install

# Start MongoDB (if using local installation)
# Windows:
net start MongoDB

# macOS/Linux:
sudo systemctl start mongod

# Start the server
npm run dev
```

The backend will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
# Navigate to client directory (in a new terminal)
cd mini-project-main/login/client

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## ✨ New Features Added

### 1. Enhanced Logout Functionality
- **Confirmation Dialog**: Users get a confirmation prompt before logging out
- **Complete Data Cleanup**: Clears both token and user data from localStorage
- **Automatic Redirect**: Redirects to login page after logout

### 2. Complete Hall Booking System
- **Booking Form**: Full-featured form with validation
- **Database Integration**: All bookings are saved to MongoDB
- **Conflict Detection**: Prevents double-booking of the same hall/time slot
- **Status Tracking**: Pending, Approved, Rejected status system

### 3. My Bookings Section
- **Real-time Data**: Shows actual bookings from database
- **Status Indicators**: Color-coded status badges
- **Detailed Information**: Date, time, purpose, and hall details
- **Loading States**: Smooth user experience with loading indicators

## 🎯 How to Test the Complete System

### Step 1: Register a New User
1. Open `http://localhost:5173`
2. Click "Don't have an account? Register here"
3. Fill in the registration form:
   - Full Name: `Dr. John Smith`
   - Email: `john.smith@adishankara.ac.in`
   - College ID: `AS001`
   - Password: `password123`
   - Department: `Computer Science & Engineering`
4. Click "Create Account"

### Step 2: Login
1. Use the credentials from registration
2. Select role as "Faculty Member"
3. Click "Sign In to Reserva"

### Step 3: Test Dashboard Features
1. **User Display**: Verify your name and department appear in the header
2. **Welcome Message**: Check personalized welcome message
3. **Navigation**: Test all navigation tabs

### Step 4: Test Hall Booking
1. Click on "Book Hall" tab
2. Fill in the booking form:
   - Select Hall: `Main Auditorium (200 seats)`
   - Booking Date: Choose a future date
   - Start Time: `10:00`
   - End Time: `12:00`
   - Purpose: `Department Meeting`
3. Click "Submit Booking Request"
4. Verify success message appears

### Step 5: View Your Bookings
1. Click on "My Bookings" tab
2. Verify your booking appears with "Pending" status
3. Check all details are displayed correctly

### Step 6: Test Logout
1. Click the logout button (power icon) in the header
2. Confirm the logout dialog
3. Verify you're redirected to login page
4. Verify user data is cleared

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile (protected)

### Bookings
- `POST /api/bookings` - Create new booking (protected)
- `GET /api/bookings` - Get user's bookings (protected)
- `GET /api/admin/bookings` - Get all bookings (admin)
- `PUT /api/admin/bookings/:id` - Update booking status (admin)

## 📊 Database Schema

### Faculty Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  department: String,
  collegeId: String (unique)
}
```

### Booking Collection
```javascript
{
  userId: ObjectId (ref: Faculty),
  hallName: String,
  hallCapacity: Number,
  bookingDate: Date,
  startTime: String,
  endTime: String,
  purpose: String,
  status: String (pending/approved/rejected),
  createdAt: Date,
  updatedAt: Date
}
```

## 🐛 Troubleshooting

### Frontend Issues
1. **Blank Page**: 
   - Check if all dependencies are installed: `npm install`
   - Check browser console for errors
   - Verify the development server is running

2. **API Connection Issues**:
   - Ensure backend server is running on port 5000
   - Check CORS settings in backend
   - Verify API endpoints are correct

### Backend Issues
1. **MongoDB Connection**:
   - Ensure MongoDB is running
   - Check connection string in server/index.js
   - Verify database permissions

2. **Port Already in Use**:
   - Change PORT in server/index.js
   - Kill existing processes using the port

### Common Solutions
1. **Clear Browser Cache**: Hard refresh (Ctrl+F5)
2. **Restart Servers**: Stop and restart both frontend and backend
3. **Check Console Logs**: Look for error messages in browser console and terminal

## 🎨 Features Overview

### User Interface
- ✅ Responsive design with Tailwind CSS
- ✅ Loading states and error handling
- ✅ Form validation and user feedback
- ✅ Modern, clean interface

### Functionality
- ✅ User registration and authentication
- ✅ JWT token-based security
- ✅ Hall booking with conflict detection
- ✅ Booking management and status tracking
- ✅ Secure logout with confirmation

### Database
- ✅ MongoDB integration
- ✅ Proper data validation
- ✅ Relationship management (User-Bookings)
- ✅ Automatic timestamps

## 🚀 Next Steps

To extend the system further, you could add:
1. **Admin Panel**: Approve/reject bookings
2. **Email Notifications**: Send booking confirmations
3. **Calendar Integration**: Visual calendar view
4. **Recurring Bookings**: Weekly/monthly booking options
5. **File Attachments**: Upload event materials
6. **Reporting**: Generate booking reports

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Check console logs for error messages
4. Ensure both servers are running simultaneously

The system is now fully functional with user authentication, hall booking, and data persistence!

