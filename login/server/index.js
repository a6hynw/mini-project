require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Define Faculty schema and model
// const facultySchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true }, // hashed password
// });
const facultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed password
  department: { type: String, required: true },
  collegeId: { type: String, required: true, unique: true }, // assuming unique college ID
});


const Faculty = mongoose.model('Faculty', facultySchema);

// Route: Register new faculty (for testing/demo purposes)
// app.post('/api/register', async (req, res) => {
//   const { name, email, password, department, collegeId } = req.body;

//   // Check if user exists
//   const existingUser  = await Faculty.findOne({ email });
//   if (existingUser ) {
//     return res.status(400).json({ message: 'Email already registered' });
//   }

//   // Hash password
//   const hashedPassword = await bcrypt.hash(password, 10);

//   // Create new faculty user
//   const newFaculty = new Faculty({
//     email,
//     password: hashedPassword,
//   });

//   try {
//     await newFaculty.save();
//     res.status(201).json({ message: 'Faculty registered successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Error registering faculty' });
//   }
// });
app.post('/api/register', async (req, res) => {
  const { name, email, password, department, collegeId } = req.body;
  if (!name || !email || !password || !department || !collegeId) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    // Check if email or collegeId already exists
    const existingUser  = await Faculty.findOne({
      $or: [{ email }, { collegeId }],
    });
    if (existingUser ) {
      return res.status(400).json({ message: 'Email or College ID already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newFaculty = new Faculty({
      name,
      email,
      password: hashedPassword,
      department,
      collegeId,
    });
    await newFaculty.save();
    res.status(201).json({ message: 'Faculty registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Error registering faculty' });
  }
});




// Route: Login faculty
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await Faculty.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  // Create JWT token
  const token = jwt.sign(
    { id: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
