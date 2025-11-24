# CuraiHeart Backend Implementation Guide

## Complete Node.js + Express + MongoDB Backend for Milestone 1

This guide provides complete implementation details for building the backend API that integrates with the existing CuraiHeart Vue.js frontend.

---

## Table of Contents

1. [Project Setup](#project-setup)
2. [Folder Structure](#folder-structure)
3. [Dependencies](#dependencies)
4. [Environment Configuration](#environment-configuration)
5. [Database Models](#database-models)
6. [Middleware Implementation](#middleware-implementation)
7. [Controllers](#controllers)
8. [Routes](#routes)
9. [Server Entry Point](#server-entry-point)
10. [Seed Script](#seed-script)
11. [Frontend Integration Changes](#frontend-integration-changes)
12. [Testing Guide](#testing-guide)
13. [Deployment Notes](#deployment-notes)

---

## 1. Project Setup

### Initialize New Backend Project

```bash
# Create new directory for backend (separate from frontend)
mkdir curaiheart-backend
cd curaiheart-backend

# Initialize Node.js project
npm init -y
```

---

## 2. Folder Structure

Create the following folder structure:

```
curaiheart-backend/
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── multer.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Patient.js
│   │   └── Video.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── patientController.js
│   │   └── videoController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── patients.js
│   │   └── videos.js
│   ├── utils/
│   │   └── helpers.js
│   └── server.js
├── uploads/
│   └── videos/
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

Create folders:
```bash
mkdir -p src/config src/models src/middleware src/controllers src/routes src/utils uploads/videos
```

---

## 3. Dependencies

### Install Production Dependencies

```bash
npm install express mongoose dotenv cors bcryptjs jsonwebtoken express-validator multer
```

### Install Development Dependencies

```bash
npm install --save-dev nodemon
```

### Update package.json Scripts

Edit `package.json`:

```json
{
  "name": "curaiheart-backend",
  "version": "1.0.0",
  "description": "Backend API for CuraiHeart patient management system",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "seed": "node src/utils/seed.js"
  },
  "keywords": ["healthcare", "echocardiogram", "patient-management"],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "express-validator": "^7.0.1",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

---

## 4. Environment Configuration

### Create `.env` File

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/curaiheart
# For MongoDB Atlas, use: mongodb+srv://username:password@cluster.mongodb.net/curaiheart

# JWT Secret (generate a random secret)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=24h

# CORS
FRONTEND_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=524288000
# 524288000 bytes = 500MB
```

### Create `.env.example`

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/curaiheart
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=24h
FRONTEND_URL=http://localhost:5173
MAX_FILE_SIZE=524288000
```

### Create `.gitignore`

```
node_modules/
.env
uploads/
*.log
.DS_Store
```

---

## 5. Database Models

### 5.1 User Model (`src/models/User.js`)

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['clinician', 'admin'],
    default: 'clinician'
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

### 5.2 Patient Model (`src/models/Patient.js`)

```javascript
const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide patient name'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Please provide patient age'],
    min: [0, 'Age cannot be negative'],
    max: [150, 'Age seems invalid']
  },
  sex: {
    type: String,
    required: [true, 'Please provide patient sex'],
    enum: ['male', 'female'],
    lowercase: true
  },
  height: {
    type: Number,
    required: [true, 'Please provide patient height'],
    min: [0, 'Height cannot be negative']
  },
  weight: {
    type: Number,
    required: [true, 'Please provide patient weight'],
    min: [0, 'Weight cannot be negative']
  },
  clinicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Add index for faster queries
patientSchema.index({ clinicianId: 1, createdAt: -1 });

module.exports = mongoose.model('Patient', patientSchema);
```

### 5.3 Video Model (`src/models/Video.js`)

```javascript
const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  view: {
    type: String,
    enum: ['A4C', 'A2C', 'PLAX', 'PSAX', null],
    default: null
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Add indexes
videoSchema.index({ patientId: 1 });
videoSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model('Video', videoSchema);
```

---

## 6. Middleware Implementation

### 6.1 Database Configuration (`src/config/db.js`)

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options are no longer needed in Mongoose 6+
      // but included for compatibility
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### 6.2 Multer Configuration (`src/config/multer.js`)

```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/videos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for MP4 only
const fileFilter = (req, file, cb) => {
  // Accept MP4 files only
  if (file.mimetype === 'video/mp4' || path.extname(file.originalname).toLowerCase() === '.mp4') {
    cb(null, true);
  } else {
    cb(new Error('Only MP4 video files are allowed'), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 524288000 // 500MB default
  }
});

module.exports = upload;
```

### 6.3 Authentication Middleware (`src/middleware/auth.js`)

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

module.exports = { protect };
```

### 6.4 Error Handler Middleware (`src/middleware/errorHandler.js`)

```javascript
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = { message: 'File size too large. Maximum 500MB allowed.', statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
```

### 6.5 Validation Middleware (`src/middleware/validate.js`)

```javascript
const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }

  next();
};

module.exports = validate;
```

---

## 7. Controllers

### 7.1 Auth Controller (`src/controllers/authController.js`)

```javascript
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user (include password for comparison)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  // JWT is stateless, logout handled on client side
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};
```

### 7.2 Patient Controller (`src/controllers/patientController.js`)

```javascript
const Patient = require('../models/Patient');
const Video = require('../models/Video');
const fs = require('fs').promises;
const path = require('path');

// @desc    Create new patient
// @route   POST /api/patients
// @access  Private
exports.createPatient = async (req, res, next) => {
  try {
    const { name, age, sex, height, weight } = req.body;

    const patient = await Patient.create({
      name,
      age,
      sex,
      height,
      weight,
      clinicianId: req.user.id
    });

    res.status(201).json({
      success: true,
      data: patient
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all patients for logged-in clinician
// @route   GET /api/patients
// @access  Private
exports.getPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find({ clinicianId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private
exports.getPatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Make sure user owns the patient
    if (patient.clinicianId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this patient'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private
exports.updatePatient = async (req, res, next) => {
  try {
    let patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Make sure user owns the patient
    if (patient.clinicianId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this patient'
      });
    }

    const { name, age, sex, height, weight } = req.body;

    patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { name, age, sex, height, weight },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private
exports.deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Make sure user owns the patient
    if (patient.clinicianId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this patient'
      });
    }

    // Delete all associated videos and files
    const videos = await Video.find({ patientId: req.params.id });
    for (const video of videos) {
      try {
        await fs.unlink(video.path);
      } catch (err) {
        console.error(`Error deleting file: ${video.path}`, err);
      }
      await Video.findByIdAndDelete(video._id);
    }

    await Patient.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Patient and associated videos deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
```

### 7.3 Video Controller (`src/controllers/videoController.js`)

```javascript
const Video = require('../models/Video');
const Patient = require('../models/Patient');
const fs = require('fs').promises;
const path = require('path');

// @desc    Upload video
// @route   POST /api/videos/upload
// @access  Private
exports.uploadVideo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a video file'
      });
    }

    const { patientId, view } = req.body;

    // Check if patient exists and belongs to user
    const patient = await Patient.findById(patientId);
    if (!patient) {
      // Delete uploaded file if patient not found
      await fs.unlink(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    if (patient.clinicianId.toString() !== req.user.id) {
      await fs.unlink(req.file.path);
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload video for this patient'
      });
    }

    const video = await Video.create({
      patientId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      view: view || null,
      uploadedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: video
    });
  } catch (error) {
    // If error occurs, delete the uploaded file
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }
    next(error);
  }
};

// @desc    Get videos for a patient
// @route   GET /api/videos/patient/:patientId
// @access  Private
exports.getPatientVideos = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    // Check if patient exists and belongs to user
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    if (patient.clinicianId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this patient\'s videos'
      });
    }

    const videos = await Video.find({ patientId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single video
// @route   GET /api/videos/:id
// @access  Private
exports.getVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id).populate('patientId');

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check authorization
    if (video.patientId.clinicianId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this video'
      });
    }

    res.status(200).json({
      success: true,
      data: video
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Stream video file
// @route   GET /api/videos/:id/stream
// @access  Private
exports.streamVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id).populate('patientId');

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check authorization
    if (video.patientId.clinicianId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this video'
      });
    }

    const videoPath = path.resolve(video.path);
    const stat = await fs.stat(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Partial content request (video streaming)
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const readStream = require('fs').createReadStream(videoPath, { start, end });

      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': video.mimetype,
      };

      res.writeHead(206, head);
      readStream.pipe(res);
    } else {
      // Full file request
      const head = {
        'Content-Length': fileSize,
        'Content-Type': video.mimetype,
      };
      res.writeHead(200, head);
      require('fs').createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete video
// @route   DELETE /api/videos/:id
// @access  Private
exports.deleteVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id).populate('patientId');

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check authorization
    if (video.patientId.clinicianId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this video'
      });
    }

    // Delete file from disk
    try {
      await fs.unlink(video.path);
    } catch (err) {
      console.error('Error deleting file:', err);
    }

    await Video.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
```

---

## 8. Routes

### 8.1 Auth Routes (`src/routes/auth.js`)

```javascript
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { login, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validation rules
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Routes
router.post('/login', loginValidation, validate, login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
```

### 8.2 Patient Routes (`src/routes/patients.js`)

```javascript
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createPatient,
  getPatients,
  getPatient,
  updatePatient,
  deletePatient
} = require('../controllers/patientController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validation rules
const patientValidation = [
  body('name').trim().notEmpty().withMessage('Patient name is required'),
  body('age').isInt({ min: 0, max: 150 }).withMessage('Age must be between 0 and 150'),
  body('sex').isIn(['male', 'female']).withMessage('Sex must be either male or female'),
  body('height').isFloat({ min: 0 }).withMessage('Height must be a positive number'),
  body('weight').isFloat({ min: 0 }).withMessage('Weight must be a positive number')
];

// Routes
router.route('/')
  .post(protect, patientValidation, validate, createPatient)
  .get(protect, getPatients);

router.route('/:id')
  .get(protect, getPatient)
  .put(protect, patientValidation, validate, updatePatient)
  .delete(protect, deletePatient);

module.exports = router;
```

### 8.3 Video Routes (`src/routes/videos.js`)

```javascript
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  uploadVideo,
  getPatientVideos,
  getVideo,
  streamVideo,
  deleteVideo
} = require('../controllers/videoController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../config/multer');

// Validation rules
const uploadValidation = [
  body('patientId').isMongoId().withMessage('Invalid patient ID'),
  body('view').optional().isIn(['A4C', 'A2C', 'PLAX', 'PSAX']).withMessage('Invalid view type')
];

// Routes
router.post('/upload', protect, upload.single('video'), uploadValidation, validate, uploadVideo);
router.get('/patient/:patientId', protect, getPatientVideos);
router.get('/:id', protect, getVideo);
router.get('/:id/stream', protect, streamVideo);
router.delete('/:id', protect, deleteVideo);

module.exports = router;
```

---

## 9. Server Entry Point

### Create `src/server.js`

```javascript
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Static folder for video files (optional - for direct access)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/videos', require('./routes/videos'));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CuraiHeart API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
```

---

## 10. Seed Script

### Create `src/utils/seed.js`

```javascript
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const connectDB = require('../config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const seedUsers = async () => {
  try {
    // Clear existing users (optional - be careful in production!)
    await User.deleteMany();

    // Create default clinician
    const clinician = await User.create({
      name: 'Dr. Demo Clinician',
      email: 'clinician@curaiheart.com',
      password: 'demo123',
      role: 'clinician'
    });

    console.log('✅ Seed data created successfully');
    console.log('📧 Email: clinician@curaiheart.com');
    console.log('🔑 Password: demo123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedUsers();
```

---

## 11. Frontend Integration Changes

### 11.1 Install Axios in Frontend

```bash
cd frontend
npm install axios
```

### 11.2 Create Frontend `.env` File

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 11.3 Update `src/services/api.js`

Replace the entire file with real API calls:

```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default {
  // Authentication
  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  async getMe() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  async logout() {
    const response = await apiClient.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return response.data;
  },

  // Patients
  async createPatient(patientData) {
    const response = await apiClient.post('/patients', patientData);
    return response.data;
  },

  async getPatients() {
    const response = await apiClient.get('/patients');
    return response.data;
  },

  async getPatient(id) {
    const response = await apiClient.get(`/patients/${id}`);
    return response.data;
  },

  async updatePatient(id, patientData) {
    const response = await apiClient.put(`/patients/${id}`, patientData);
    return response.data;
  },

  async deletePatient(id) {
    const response = await apiClient.delete(`/patients/${id}`);
    return response.data;
  },

  // Videos
  async uploadVideo(patientId, file, view, onProgress) {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('patientId', patientId);
    if (view) {
      formData.append('view', view);
    }

    const response = await apiClient.post('/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      }
    });

    return response.data;
  },

  async getVideos(patientId) {
    const response = await apiClient.get(`/videos/patient/${patientId}`);
    return response.data;
  },

  async getVideo(id) {
    const response = await apiClient.get(`/videos/${id}`);
    return response.data;
  },

  getVideoStreamUrl(id) {
    const token = localStorage.getItem('token');
    return `${API_URL}/videos/${id}/stream?token=${token}`;
  },

  async deleteVideo(id) {
    const response = await apiClient.delete(`/videos/${id}`);
    return response.data;
  }
};
```

### 11.4 Update `src/composables/useAuth.js`

```javascript
import { ref, computed } from 'vue';
import apiService from '../services/api';

const user = ref(null);
const token = ref(null);

// Initialize from localStorage
const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('token');

if (storedUser && storedToken) {
  user.value = JSON.parse(storedUser);
  token.value = storedToken;
}

export function useAuth() {
  const isAuthenticated = computed(() => !!user.value && !!token.value);

  const login = async (credentials) => {
    try {
      const response = await apiService.login(credentials);

      if (response.success) {
        user.value = response.user;
        token.value = response.token;

        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);

        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed. Please try again.'
      };
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      user.value = null;
      token.value = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  const getToken = () => token.value;

  return {
    user,
    isAuthenticated,
    login,
    logout,
    getToken
  };
}
```

### 11.5 Update `src/views/PatientForm.vue` - Change .avi to .mp4

Find the file validation section and update:

```javascript
// Change this line (around line 70):
const allowedTypes = ['.avi'];

// To:
const allowedTypes = ['.mp4'];

// Also update the accept attribute in the file input (around line 150):
accept=".mp4"
```

### 11.6 Update `src/views/VideoDisplay.vue` - Use Stream URL

Update the video source to use the streaming endpoint:

```javascript
// In the script section, update the video URL computation:
const videoUrl = computed(() => {
  if (currentVideo.value) {
    return apiService.getVideoStreamUrl(currentVideo.value.id);
  }
  return '';
});
```

---

## 12. Testing Guide

### 12.1 Setup Database

**Option 1: Local MongoDB**
```bash
# Install MongoDB locally
# Start MongoDB service
mongod

# Or using Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option 2: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `.env` with connection string

### 12.2 Start Backend

```bash
cd curaiheart-backend

# Seed database with default user
npm run seed

# Start development server
npm run dev
```

You should see:
```
MongoDB Connected: localhost
Server running in development mode on port 5000
```

### 12.3 Test API Endpoints

Use Postman, Thunder Client, or curl:

**1. Health Check**
```bash
curl http://localhost:5000/api/health
```

**2. Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"clinician@curaiheart.com","password":"demo123"}'
```

Save the returned token for next requests.

**3. Create Patient**
```bash
curl -X POST http://localhost:5000/api/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "John Doe",
    "age": 45,
    "sex": "male",
    "height": 175,
    "weight": 80
  }'
```

**4. Upload Video**
```bash
curl -X POST http://localhost:5000/api/videos/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "video=@/path/to/video.mp4" \
  -F "patientId=PATIENT_ID_HERE" \
  -F "view=A4C"
```

### 12.4 Test Full Integration

```bash
# Terminal 1 - Backend
cd curaiheart-backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Test flow:
1. Open http://localhost:5173
2. Login with: `clinician@curaiheart.com` / `demo123`
3. Create a new patient
4. Upload an MP4 video
5. View patient list
6. Click on patient to view video
7. Verify video plays and reference values display

---

## 13. Deployment Notes

### 13.1 Production Checklist

- [ ] Generate strong JWT_SECRET
- [ ] Set NODE_ENV=production
- [ ] Use MongoDB Atlas or production database
- [ ] Configure proper CORS origins
- [ ] Set up file storage (AWS S3, Azure Blob, etc.)
- [ ] Add rate limiting
- [ ] Add request logging
- [ ] Set up SSL/HTTPS
- [ ] Configure environment variables on server
- [ ] Set up database backups
- [ ] Add monitoring and error tracking

### 13.2 Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/curaiheart
JWT_SECRET=your_super_secure_random_string_here
JWT_EXPIRE=24h
FRONTEND_URL=https://yourdomain.com
MAX_FILE_SIZE=524288000
```

### 13.3 Recommended Hosting Options

**Backend:**
- Heroku
- Railway
- Render
- DigitalOcean App Platform
- AWS EC2/Elastic Beanstalk

**Database:**
- MongoDB Atlas (recommended)
- AWS DocumentDB
- DigitalOcean Managed MongoDB

**File Storage (for production):**
- AWS S3
- Azure Blob Storage
- Google Cloud Storage
- Cloudinary (for videos)

---

## 14. API Endpoints Summary

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Login clinician | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/logout` | Logout user | Yes |

### Patients
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/patients` | Create patient | Yes |
| GET | `/api/patients` | Get all patients | Yes |
| GET | `/api/patients/:id` | Get single patient | Yes |
| PUT | `/api/patients/:id` | Update patient | Yes |
| DELETE | `/api/patients/:id` | Delete patient | Yes |

### Videos
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/videos/upload` | Upload video | Yes |
| GET | `/api/videos/patient/:patientId` | Get patient videos | Yes |
| GET | `/api/videos/:id` | Get video metadata | Yes |
| GET | `/api/videos/:id/stream` | Stream video file | Yes |
| DELETE | `/api/videos/:id` | Delete video | Yes |

---

## 15. Common Issues & Solutions

### Issue: CORS Error
**Solution:** Check that FRONTEND_URL in backend .env matches your frontend URL

### Issue: File Upload Fails
**Solution:**
- Check file size (max 500MB)
- Ensure file is MP4 format
- Verify uploads/videos directory exists and has write permissions

### Issue: JWT Token Invalid
**Solution:**
- Check JWT_SECRET is set in .env
- Verify token is being sent in Authorization header
- Check token hasn't expired

### Issue: MongoDB Connection Failed
**Solution:**
- Verify MongoDB is running
- Check MONGODB_URI in .env
- For Atlas, whitelist your IP address

---

## Support

For issues or questions:
1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check MongoDB connection
5. Verify file permissions for uploads directory

---

**End of Implementation Guide**

This guide provides everything needed to build and integrate the complete backend for CuraiHeart Milestone 1.
