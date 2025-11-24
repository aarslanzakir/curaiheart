# Frontend-Backend Integration Guide

## Overview

This document provides a quick guide for integrating the CuraiHeart Vue.js frontend with the Node.js backend you'll create using the [BACKEND_IMPLEMENTATION_GUIDE.md](./BACKEND_IMPLEMENTATION_GUIDE.md).

---

## Current Frontend Status

Your Vue.js frontend is already **fully functional** with mock data. It includes:
- ✅ User authentication (mock)
- ✅ Patient data entry form
- ✅ Video upload interface (now accepts MP4)
- ✅ Video display page with reference values
- ✅ Dashboard with patient list
- ✅ Complete UI/UX

---

## Changes Made to Frontend

### 1. Video Format Updated
- **File**: [src/views/PatientForm.vue](src/views/PatientForm.vue)
- **Change**: Accepts `.mp4` files instead of `.avi`
- **Lines changed**:
  - Label text (line 94)
  - File input accept attribute (line 100)
  - Upload prompt text (line 114)
  - Validation logic (line 209)

### 2. Environment Configuration
- **File Created**: `.env`
- **Content**: `VITE_API_URL=http://localhost:5000/api`
- **File Updated**: `.env.example` (updated port to 5000)

---

## What Still Needs to Be Done

### Step 1: Install Axios (HTTP Client)

```bash
npm install axios
```

### Step 2: Update API Service

Replace the entire content of `src/services/api.js` with the real API implementation provided in [BACKEND_IMPLEMENTATION_GUIDE.md Section 11.3](./BACKEND_IMPLEMENTATION_GUIDE.md#113-update-srcservicesapijs).

**Current State**: Uses localStorage for mock data
**After Update**: Will make real HTTP requests to backend

### Step 3: Update Auth Composable

Replace the content of `src/composables/useAuth.js` with the real auth implementation provided in [BACKEND_IMPLEMENTATION_GUIDE.md Section 11.4](./BACKEND_IMPLEMENTATION_GUIDE.md#114-update-srccomposablesuseauthjs).

**Current State**: Mock JWT token generation
**After Update**: Real JWT tokens from backend

### Step 4: Update VideoDisplay Component (Optional Enhancement)

If you want to use video streaming from the backend, update `src/views/VideoDisplay.vue` to use the streaming URL as shown in [BACKEND_IMPLEMENTATION_GUIDE.md Section 11.6](./BACKEND_IMPLEMENTATION_GUIDE.md#116-update-srcviewsvideodisplayvue---use-stream-url).

---

## Integration Workflow

### Before Integration (Current State)
```
Frontend (Vue.js)
    ↓
Mock API Service (api.js)
    ↓
localStorage (demo data)
```

### After Integration
```
Frontend (Vue.js)
    ↓
Real API Service with Axios (api.js)
    ↓
Backend API (Node.js + Express)
    ↓
MongoDB Database
    ↓
File System (uploads/videos/)
```

---

## Testing the Integration

### 1. Start Backend Server
```bash
cd ../curaiheart-backend  # Your backend project
npm run dev
```
Backend should run on: `http://localhost:5000`

### 2. Start Frontend Server
```bash
cd frontend
npm run dev
```
Frontend should run on: `http://localhost:5173`

### 3. Test Complete Flow

1. **Login**
   - Email: `clinician@curaiheart.com`
   - Password: `demo123`

2. **Create Patient**
   - Go to "New Patient" (+ icon)
   - Fill in patient details
   - Upload an MP4 video
   - Submit

3. **View Patient**
   - Should see patient in dashboard
   - Click to view patient details and video

4. **Verify Video Playback**
   - Video should stream from backend
   - Reference values should display based on patient sex
   - View selector (A4C, A2C, etc.) should work

---

## API Endpoints Used by Frontend

### Authentication
| Frontend Function | Backend Endpoint | Method |
|------------------|------------------|--------|
| `login()` | `/api/auth/login` | POST |
| `logout()` | `/api/auth/logout` | POST |
| `getMe()` | `/api/auth/me` | GET |

### Patients
| Frontend Function | Backend Endpoint | Method |
|------------------|------------------|--------|
| `createPatient()` | `/api/patients` | POST |
| `getPatients()` | `/api/patients` | GET |
| `getPatient(id)` | `/api/patients/:id` | GET |
| `updatePatient(id)` | `/api/patients/:id` | PUT |
| `deletePatient(id)` | `/api/patients/:id` | DELETE |

### Videos
| Frontend Function | Backend Endpoint | Method |
|------------------|------------------|--------|
| `uploadVideo()` | `/api/videos/upload` | POST |
| `getVideos(patientId)` | `/api/videos/patient/:patientId` | GET |
| `getVideo(id)` | `/api/videos/:id` | GET |
| `getVideoStreamUrl(id)` | `/api/videos/:id/stream` | GET |
| `deleteVideo(id)` | `/api/videos/:id` | DELETE |

---

## Environment Variables

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
```

### Backend `.env`
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/curaiheart
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=24h
FRONTEND_URL=http://localhost:5173
MAX_FILE_SIZE=524288000
```

---

## Authentication Flow

### 1. Login Process
```
User enters credentials
    ↓
Frontend calls apiService.login()
    ↓
Backend validates credentials
    ↓
Backend returns JWT token + user info
    ↓
Frontend stores token in localStorage
    ↓
Axios interceptor adds token to all requests
```

### 2. Protected Requests
```
User makes request (e.g., create patient)
    ↓
Axios interceptor adds: Authorization: Bearer <token>
    ↓
Backend auth middleware verifies token
    ↓
Backend processes request
    ↓
Response returned to frontend
```

### 3. Token Expiry Handling
```
Request with expired token
    ↓
Backend returns 401 Unauthorized
    ↓
Axios interceptor catches 401
    ↓
Removes token from localStorage
    ↓
Redirects to login page
```

---

## File Upload Flow

### Patient Creation with Video Upload

```javascript
// Step 1: Create patient record
const patientResponse = await apiService.createPatient({
  name: "John Doe",
  age: 45,
  sex: "male",
  height: 175,
  weight: 80
});

const patientId = patientResponse.data._id;

// Step 2: Upload video with progress tracking
await apiService.uploadVideo(
  patientId,
  videoFile,  // File object from input
  'A4C',      // View type (optional)
  (progress) => {
    console.log(`Upload progress: ${progress}%`);
  }
);
```

---

## Video Streaming

The backend supports HTTP range requests for efficient video streaming:

```javascript
// Get streaming URL
const streamUrl = apiService.getVideoStreamUrl(videoId);

// Use in video element
<video :src="streamUrl" controls></video>
```

This allows:
- Partial content loading (206 responses)
- Seeking within video
- Bandwidth-efficient streaming

---

## Troubleshooting

### Issue: CORS Error
**Symptom**: Browser console shows CORS policy error
**Solution**: Ensure backend `.env` has `FRONTEND_URL=http://localhost:5173`

### Issue: 401 Unauthorized
**Symptom**: All requests fail with 401
**Solution**:
- Check if user is logged in
- Verify token exists in localStorage
- Check token hasn't expired

### Issue: Video Upload Fails
**Symptom**: Upload returns 400 or 500 error
**Solution**:
- Ensure file is MP4 format
- Check file size is under 500MB
- Verify patient exists
- Check backend `uploads/videos/` directory exists

### Issue: Video Won't Play
**Symptom**: Video player shows error
**Solution**:
- Verify video file exists on backend
- Check browser console for network errors
- Ensure streaming URL is correct
- Try opening stream URL directly in browser

---

## Demo Data Migration

### Current Mock Data
The frontend currently has 6 sample patients in localStorage. After integration:

1. This data will **NOT** automatically transfer
2. You'll start with a clean database
3. You can:
   - Manually re-create test patients via UI
   - Or create a migration script to seed the backend

### Sample Patient Format
```javascript
{
  name: "John Doe",
  age: 45,
  sex: "male",
  height: 175,
  weight: 80
}
```

---

## Next Steps

1. ✅ **Frontend Updates Complete** (already done)
   - MP4 support added
   - Environment configured

2. 📝 **Create Backend** (follow BACKEND_IMPLEMENTATION_GUIDE.md)
   - Set up Node.js project
   - Implement all backend code
   - Configure MongoDB

3. 🔗 **Integrate Frontend**
   - Install axios
   - Update api.js
   - Update useAuth.js

4. ✅ **Test Integration**
   - Start both servers
   - Test complete workflow
   - Verify all features

5. 🚀 **Deploy** (optional)
   - Deploy backend to hosting service
   - Deploy frontend to hosting service
   - Update environment variables

---

## Support Files

- **Backend Guide**: [BACKEND_IMPLEMENTATION_GUIDE.md](./BACKEND_IMPLEMENTATION_GUIDE.md)
- **API Documentation**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Frontend README**: [README.md](./README.md)
- **Demo Credentials**: [DEMO_CREDENTIALS.md](./DEMO_CREDENTIALS.md)

---

**Ready to integrate?** Follow the BACKEND_IMPLEMENTATION_GUIDE.md to create your backend, then come back here for the frontend integration steps!
