# Hall Booking System - Reserva

A smart hall booking system for Adi Shankara Institute of Engineering and Technology built with React and Node.js.

## Features

- **User Authentication**: Login and registration for faculty members
- **Dashboard**: Personalized dashboard showing user information
- **Hall Booking**: Book available halls for events
- **Calendar View**: View hall availability across dates
- **My Bookings**: Manage your booking requests
- **Admin Panel**: Administrative controls (for admin users)

## Project Structure

```
mini-project-main/
├── index.html                 # Main HTML file (standalone version)
├── login/
│   ├── client/               # React frontend
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── login.jsx
│   │   │   │   └── Dashboard.jsx
│   │   │   ├── App.jsx
│   │   │   └── main.jsx
│   │   └── package.json
│   └── server/               # Node.js backend
│       ├── index.js
│       └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd mini-project-main/login/server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start MongoDB (if using local installation):
   ```bash
   # On Windows
   net start MongoDB
   
   # On macOS/Linux
   sudo systemctl start mongod
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd mini-project-main/login/client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The client will run on `http://localhost:5173`

## Usage

### Registration

1. Open the application in your browser
2. Click "Don't have an account? Register here"
3. Fill in the registration form:
   - Full Name
   - Email Address
   - College ID
   - Password
   - Confirm Password
   - Department
4. Click "Create Account"

### Login

1. Enter your email and password
2. Select your role (Faculty Member or Administrator)
3. Click "Sign In to Reserva"

### Dashboard

After successful login, you'll be redirected to the dashboard where you can:
- View your personal information in the header
- See a personalized welcome message
- Navigate through different sections:
  - Dashboard (main view)
  - Book Hall
  - Calendar View
  - My Bookings
  - Available Halls
  - Admin Panel (for admin users)

## Recent Changes Made

### Fixed Issues:

1. **User Data Display**: 
   - Backend now returns user data in login response
   - Frontend stores user data in localStorage
   - Dashboard displays actual user information instead of hardcoded values

2. **Authentication Flow**:
   - Added proper token handling
   - Implemented user data persistence
   - Added loading states for better UX

3. **Routing**:
   - Fixed navigation between login and dashboard
   - Added proper authentication checks
   - Implemented logout functionality

4. **Backend Improvements**:
   - Added JWT middleware for protected routes
   - Added user profile endpoint
   - Improved error handling

### Files Modified:

- `login/client/src/pages/login.jsx` - Updated login handler to store user data
- `login/client/src/pages/Dashboard.jsx` - Added user data display and loading states
- `login/client/src/App.jsx` - Improved authentication flow
- `login/server/index.js` - Added user data to login response and profile endpoint

## API Endpoints

- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile (protected)

## Environment Variables

The server uses the following environment variables (with defaults):
- `PORT=5000`
- `MONGO_URI=mongodb://localhost:27017/hallbooking`
- `JWT_SECRET=your-secret-key-here-change-in-production`

## Troubleshooting

1. **MongoDB Connection Issues**: Ensure MongoDB is running and accessible
2. **CORS Issues**: The server is configured to allow all origins for development
3. **Token Issues**: Clear localStorage if experiencing authentication problems

## Development

To run both frontend and backend simultaneously:

1. Open two terminal windows
2. In one terminal, run the backend:
   ```bash
   cd mini-project-main/login/server
   npm run dev
   ```
3. In another terminal, run the frontend:
   ```bash
   cd mini-project-main/login/client
   npm run dev
   ```

## Production Deployment

For production deployment:

1. Set proper environment variables
2. Build the frontend: `npm run build`
3. Serve the built files with a web server
4. Use a process manager like PM2 for the backend
5. Set up proper MongoDB security and JWT secrets

