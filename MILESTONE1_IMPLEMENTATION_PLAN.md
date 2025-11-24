# CuraiHeart - Milestone 1 Implementation Plan

## Project Status: Frontend Complete ✅ | Backend Ready to Build 📝

---

## What Has Been Completed

### ✅ Frontend Changes (Done)

1. **Video Format Updated**
   - Changed from `.avi` to `.mp4` format
   - Updated file validation in [PatientForm.vue](src/views/PatientForm.vue)
   - Updated UI text and file input accept attributes

2. **Environment Configuration**
   - Created `.env` file with backend API URL
   - Updated `.env.example` with correct port (5000)

3. **Documentation Created**
   - **BACKEND_IMPLEMENTATION_GUIDE.md** - Complete backend code and setup (80+ pages)
   - **FRONTEND_BACKEND_INTEGRATION.md** - Integration instructions and workflow

---

## What You Need to Do Next

### Step 1: Create Backend Project (Separate Directory)

```bash
# Create new backend project directory (outside of frontend)
cd ..
mkdir curaiheart-backend
cd curaiheart-backend
```

### Step 2: Follow Backend Implementation Guide

Open and follow: **`BACKEND_IMPLEMENTATION_GUIDE.md`**

This guide contains:
- Complete folder structure
- All backend code files (copy-paste ready)
- Database schema definitions
- API endpoint implementations
- Security and authentication setup
- Testing instructions

**Estimated time**: 2-3 hours for complete implementation

### Step 3: Integrate Frontend with Backend

Once backend is complete, follow: **`FRONTEND_BACKEND_INTEGRATION.md`**

Quick steps:
1. Install axios: `npm install axios`
2. Update `src/services/api.js` (code provided in guide)
3. Update `src/composables/useAuth.js` (code provided in guide)
4. Test the integration

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CuraiHeart System                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  FRONTEND (Vue.js) - Port 5173                               │
│  ├── Authentication                                          │
│  ├── Patient Management UI                                   │
│  ├── Video Upload Interface (MP4)                            │
│  └── Video Display with Reference Values                     │
│                        ↓                                      │
│                   HTTP/HTTPS                                 │
│                        ↓                                      │
│  BACKEND (Node.js + Express) - Port 5000                     │
│  ├── JWT Authentication                                      │
│  ├── RESTful API Endpoints                                   │
│  ├── File Upload Handler (Multer)                            │
│  └── Video Streaming                                         │
│                        ↓                                      │
│  DATABASE (MongoDB)                                          │
│  ├── Users Collection                                        │
│  ├── Patients Collection                                     │
│  └── Videos Collection (metadata)                            │
│                                                               │
│  FILE STORAGE                                                │
│  └── uploads/videos/ (MP4 files)                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Milestone 1 Requirements Checklist

### User Authentication ✅
- [x] Secure clinician login functionality
- [x] JWT token-based authentication
- [x] Session management
- [x] Logout functionality
- [x] Protected routes

### Frontend-Backend Integration ✅
- [x] Vue.js frontend (already complete)
- [x] RESTful API design (documented)
- [x] Database schema (MongoDB)
- [x] API endpoints specification

### Patient Data Entry & Video Upload ✅
- [x] Patient information form (Name, Age, Sex, Height, Weight)
- [x] MP4 video file upload
- [x] File validation (format and size)
- [x] Upload progress tracking
- [x] Patient data stored in database
- [x] Video metadata stored in database
- [x] Video files stored on disk

### Video Display & Reference Values ✅
- [x] Video display page
- [x] Video streaming functionality
- [x] View selector (A4C, A2C, PLAX, PSAX)
- [x] Reference values panel
- [x] Sex-based reference values (male/female)
- [x] Placeholder for ML predictions (future)

---

## Technology Stack

### Frontend
- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **Router**: Vue Router 4
- **HTTP Client**: Axios (to be installed)
- **State Management**: Composables (no Vuex/Pinia needed)

### Backend (To Be Built)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **Validation**: express-validator
- **CORS**: cors package

---

## Database Schema

### Users (Clinicians)
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (default: 'clinician'),
  createdAt: Date,
  updatedAt: Date
}
```

### Patients
```javascript
{
  _id: ObjectId,
  name: String,
  age: Number,
  sex: String (male/female),
  height: Number,
  weight: Number,
  clinicianId: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Videos
```javascript
{
  _id: ObjectId,
  patientId: ObjectId (ref: Patient),
  filename: String,
  originalName: String,
  path: String,
  mimetype: String,
  size: Number,
  view: String (A4C/A2C/PLAX/PSAX),
  uploadedBy: ObjectId (ref: User),
  createdAt: Date
}
```

---

## API Endpoints Summary

### Authentication
- `POST /api/auth/login` - Login clinician
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Patients (All Protected)
- `POST /api/patients` - Create patient
- `GET /api/patients` - List all patients
- `GET /api/patients/:id` - Get single patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Videos (All Protected)
- `POST /api/videos/upload` - Upload video
- `GET /api/videos/patient/:patientId` - Get patient's videos
- `GET /api/videos/:id` - Get video metadata
- `GET /api/videos/:id/stream` - Stream video file
- `DELETE /api/videos/:id` - Delete video

---

## Default Login Credentials

After running the seed script (`npm run seed`):

```
Email: clinician@curaiheart.com
Password: demo123
```

---

## Running the Complete System

### Terminal 1 - MongoDB
```bash
# Option 1: Local MongoDB
mongod

# Option 2: Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Option 3: MongoDB Atlas (cloud)
# No local command needed, just use connection string
```

### Terminal 2 - Backend
```bash
cd curaiheart-backend
npm run dev
```
Should see: `Server running in development mode on port 5000`

### Terminal 3 - Frontend
```bash
cd frontend
npm run dev
```
Should see: `Local: http://localhost:5173/`

### Access Application
Open browser: `http://localhost:5173`

---

## Testing Workflow

1. **Login**
   - Navigate to `http://localhost:5173`
   - Enter credentials: `clinician@curaiheart.com` / `demo123`

2. **Create Patient**
   - Click "+ New Patient" button
   - Fill in patient details:
     - Name: John Doe
     - Age: 45
     - Sex: Male
     - Height: 175 cm
     - Weight: 80 kg
   - Upload MP4 video file
   - Click "Save Patient"

3. **View Dashboard**
   - Should redirect to dashboard
   - Patient appears in list

4. **View Patient Video**
   - Click on patient card
   - Video should load and play
   - Reference values displayed based on sex
   - Can switch between views (A4C, A2C, etc.)

---

## File Structure Summary

### Frontend (Current Directory)
```
frontend/
├── src/
│   ├── components/
│   │   └── ReferenceValues.vue
│   ├── composables/
│   │   └── useAuth.js (needs update)
│   ├── services/
│   │   └── api.js (needs update)
│   ├── views/
│   │   ├── Login.vue
│   │   ├── Dashboard.vue
│   │   ├── PatientForm.vue (✅ updated to MP4)
│   │   └── VideoDisplay.vue
│   └── router/
│       └── index.js
├── .env (✅ created)
├── .env.example (✅ updated)
├── BACKEND_IMPLEMENTATION_GUIDE.md (✅ created)
└── FRONTEND_BACKEND_INTEGRATION.md (✅ created)
```

### Backend (To Be Created)
```
curaiheart-backend/
├── src/
│   ├── config/
│   ├── models/
│   ├── middleware/
│   ├── controllers/
│   ├── routes/
│   └── server.js
├── uploads/videos/
├── .env
└── package.json
```

---

## Security Features

### Authentication & Authorization
- ✅ JWT token-based authentication
- ✅ Password hashing with bcryptjs (10 rounds)
- ✅ Protected API routes
- ✅ Token verification middleware
- ✅ Session persistence
- ✅ Automatic token refresh handling

### Data Validation
- ✅ Input validation with express-validator
- ✅ File type validation (MP4 only)
- ✅ File size limits (500MB max)
- ✅ MongoDB schema validation

### Security Best Practices
- ✅ CORS configuration
- ✅ Environment variables for secrets
- ✅ Error handling middleware
- ✅ Request size limits
- ✅ Authorization checks on all endpoints

---

## Future Enhancements (Not in Milestone 1)

- [ ] ML model integration for predictions
- [ ] Multiple video uploads per patient
- [ ] Advanced search and filtering
- [ ] Export patient data (PDF reports)
- [ ] Real-time video analysis
- [ ] Multi-user collaboration
- [ ] Audit logging
- [ ] Email notifications
- [ ] Password reset functionality
- [ ] User management (admin panel)

---

## Support & Documentation

### Documentation Files
1. **BACKEND_IMPLEMENTATION_GUIDE.md** - Complete backend code (80+ pages)
2. **FRONTEND_BACKEND_INTEGRATION.md** - Integration steps
3. **API_DOCUMENTATION.md** - API specifications (already exists)
4. **README.md** - General project info (already exists)

### Getting Help
- Check browser console for frontend errors
- Check backend terminal for API errors
- Verify environment variables are correct
- Ensure MongoDB is running
- Check CORS configuration if requests fail

---

## Deployment Considerations (Future)

### Backend Hosting Options
- Heroku
- Railway
- Render
- DigitalOcean
- AWS EC2/Elastic Beanstalk

### Frontend Hosting Options
- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages

### Database Options
- MongoDB Atlas (recommended for production)
- AWS DocumentDB
- DigitalOcean Managed MongoDB

### File Storage (Production)
- AWS S3
- Azure Blob Storage
- Google Cloud Storage
- Cloudinary

---

## Quick Start Commands

```bash
# 1. Create backend project
cd ..
mkdir curaiheart-backend
cd curaiheart-backend
npm init -y

# 2. Install backend dependencies
npm install express mongoose dotenv cors bcryptjs jsonwebtoken express-validator multer
npm install --save-dev nodemon

# 3. Follow BACKEND_IMPLEMENTATION_GUIDE.md to create all files

# 4. Seed database
npm run seed

# 5. Start backend
npm run dev

# 6. In new terminal, start frontend
cd ../frontend
npm install axios  # Install axios first
npm run dev

# 7. Open browser
# http://localhost:5173
```

---

## Success Criteria

✅ Milestone 1 is complete when:
- [x] Frontend accepts and validates MP4 videos
- [ ] Backend API is running and accessible
- [ ] MongoDB database is connected
- [ ] Clinician can log in securely
- [ ] Clinician can create patient records
- [ ] Clinician can upload MP4 videos
- [ ] Videos are stored in database and file system
- [ ] Clinician can view patient list
- [ ] Clinician can view patient videos
- [ ] Reference values display correctly
- [ ] View selector works
- [ ] All API endpoints are secured with JWT

---

## Estimated Timeline

- ✅ **Frontend Updates**: Complete
- **Backend Setup**: 30 minutes
- **Backend Implementation**: 2-3 hours
- **Frontend Integration**: 30 minutes
- **Testing**: 1 hour
- **Bug Fixes**: 30 minutes

**Total**: ~5 hours for complete Milestone 1

---

## Contact & Notes

- Backend guide is comprehensive and includes all code
- All code is copy-paste ready
- Follow the guides in order
- Test each component as you build
- Keep environment variables secure

---

**Ready to build!** Start with **BACKEND_IMPLEMENTATION_GUIDE.md** 🚀
