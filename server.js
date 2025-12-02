import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import 'dotenv/config';



const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(cors({ origin: '*' }));

// Middleware
app.use(express.json());
app.use(cors());


// require('dotenv').config();

// MongoDB Connection
const MONGODB_URI =process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: function() {
      return this.isNew; // Only required for new users (signup)
    }

  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'agent'],
    default: 'student'
  },
  resetPasswordOTP: String,
  resetPasswordExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Hostel Schema
const hostelSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  school: { 
    type: String, 
    required: true 
  },
  location: { 
    type: String, 
    required: true 
  },
  price: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  contact: {
    phone: { type: String, required: true },
    whatsapp: { type: String },
    email: { type: String, required: true },
    address: { type: String, required: true }
  },
  agent: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  images: [String],
  amenities: [String],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Hostel = mongoose.model('Hostel', hostelSchema);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Create uploads directory if it doesn't exist
import fs from 'fs';
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

// Email configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,      
  }
});



// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    req.user = user;
    next();
  });
};

// Routes

// Signup Route
app.post('/api/signup', async (req, res) => {
  try {
    const { fullName, email, phone, password, confirmPassword, role } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Passwords do not match' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    // Create new user
    const newUser = new User({
      fullName,
      email: email.toLowerCase(),
      phone,
      password,
      role: role || 'student'
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      },
      token
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during signup' 
    });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    // Find user by email (phone is optional)
    const user = await User.findOne({ 
      email: email.toLowerCase()
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      user: { 
        id: user._id, 
        fullName: user.fullName, 
        email: user.email, 
        phone: user.phone, 
        role: user.role 
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// Agent Routes

// Get agent's ads
app.get('/api/agent/ads', authenticateToken, async (req, res) => {
  try {
    const ads = await Hostel.find({ 'agent.userId': req.user.userId }).sort({ createdAt: -1 });
    res.json({ success: true, ads });
  } catch (error) {
    console.error('Get agent ads error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new ad
app.post('/api/agent/ads', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const { name, school, location, price, description, contact, agent, amenities } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const imagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const newHostel = new Hostel({
      name,
      school,
      location,
      price,
      description,
      contact: JSON.parse(contact),
      agent: {
        ...JSON.parse(agent),
        userId: req.user.userId
      },
      amenities: JSON.parse(amenities),
      images: imagePaths
    });

    await newHostel.save();

    res.status(201).json({
      success: true,
      message: 'Ad created successfully',
      ad: newHostel
    });
  } catch (error) {
    console.error('Create ad error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update ad
app.put('/api/agent/ads/:id', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const { name, school, location, price, description, contact, amenities } = req.body;
    
    const ad = await Hostel.findOne({ _id: req.params.id, 'agent.userId': req.user.userId });
    if (!ad) {
      return res.status(404).json({ success: false, message: 'Ad not found' });
    }

    const newImagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    const allImages = [...ad.images, ...newImagePaths].slice(0, 5); // Keep max 5 images

    const updatedAd = await Hostel.findByIdAndUpdate(
      req.params.id,
      {
        name,
        school,
        location,
        price,
        description,
        contact: JSON.parse(contact),
        amenities: JSON.parse(amenities),
        images: allImages
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Ad updated successfully',
      ad: updatedAd
    });
  } catch (error) {
    console.error('Update ad error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete ad
app.delete('/api/agent/ads/:id', authenticateToken, async (req, res) => {
  try {
    const ad = await Hostel.findOne({ _id: req.params.id, 'agent.userId': req.user.userId });
    if (!ad) {
      return res.status(404).json({ success: false, message: 'Ad not found' });
    }

    await Hostel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Ad deleted successfully' });
  } catch (error) {
    console.error('Delete ad error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all hostels for students
app.get('/api/hostels', authenticateToken, async (req, res) => {
  try {
    const hostels = await Hostel.find().sort({ createdAt: -1 });
    res.json({ success: true, hostels });
  } catch (error) {
    console.error('Get hostels error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching hostels' });
  }
});

// Password Reset Routes

// Forgot Password - Send OTP
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found with this email' 
      });
    }

    // Generate OTP (6-digit number)
    const otp = crypto.randomInt(100000, 999999).toString();
    
    // Set OTP and expiration (10 minutes)
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    await user.save();

    // Send email with OTP
    const mailOptions = {
      from: 'Ktaofeek015@gmail.com',
      to: user.email,
      subject: 'Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You have requested to reset your password. Use the OTP below to reset your password:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; margin: 20px 0;">
            <h1 style="margin: 0; color: #333; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'OTP sent to your email successfully'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while sending OTP' 
    });
  }
});

// Verify OTP endpoint
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find user by email and check OTP
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid OTP or OTP has expired' 
      });
    }

    res.json({
      success: true,
      message: 'OTP verified successfully'
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while verifying OTP' 
    });
  }
});

// Verify OTP and Reset Password
app.post('/api/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Find user by email
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid OTP or OTP has expired' 
      });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while resetting password' 
    });
  }
});

// Protected route example
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Serve React build
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all to handle React Router paths
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
  }
  res.status(500).json({
    success: false,
    message: error.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}`);
});


