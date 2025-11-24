# CuraiHeart - Quick Start Guide

Get up and running with CuraiHeart in under 2 minutes!

## Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Access the Application

Open your browser and go to: **http://localhost:5173**

## Login

Use these credentials:
- **Email**: `clinician@curaiheart.com`
- **Password**: `demo123`

## Quick Tour

### 1. Dashboard
After login, you'll see the patient dashboard with **6 sample patients** already loaded:
- John Smith (58, Male)
- Sarah Johnson (45, Female)
- Michael Brown (62, Male)
- Emily Davis (51, Female)
- Robert Wilson (48, Male)
- Lisa Anderson (39, Female)

**Note:** These are sample patients with no videos. You can explore their details, but to test video upload, you'll need to add a new patient.

### 2. Add a Patient
1. Click the **"+ New Patient"** button
2. Fill in the patient information:
   - Name: e.g., "John Doe"
   - Age: e.g., 45
   - Sex: Select Male or Female
   - Height: e.g., 175 (cm)
   - Weight: e.g., 75 (kg)
3. Upload a video file (.avi format only)
4. Click **"Save Patient"**

### 3. View Patient Video
- You'll be automatically redirected to the video display page
- The video will play with controls
- Reference values are displayed on the right based on patient's sex
- Switch between views using the dropdown (A4C, A2C, PLAX, PSAX)

**Note:** Sample patients won't have videos. Only patients you create will have videos.

### 4. Return to Dashboard
- Click the **"← Back to Dashboard"** button
- You'll see your patient card
- Click on any patient card to view their details

### 5. Logout
- Click the **"Logout"** button in the top navigation bar

## Features to Try

✅ Create multiple patients
✅ Upload different videos
✅ Switch between video views
✅ Check reference values for male vs female patients
✅ Logout and login again (data persists!)

## Tips

- **Data Storage**: All data is saved in your browser's localStorage
- **Video Format**: Only .avi files are accepted (max 500MB)
- **Data Persistence**: Your data will persist across browser sessions
- **Reset Data**: Open browser console and run `localStorage.clear()` then refresh

## Troubleshooting

**Can't login?**
- Make sure you're using: `clinician@curaiheart.com` / `demo123`

**Video not playing?**
- Ensure the file is in .avi format
- Check file size is under 500MB
- Try a different browser (Chrome recommended)

**Lost data?**
- Data is stored in browser localStorage
- Clearing browser data will delete all patients and videos
- Each browser has separate storage (Chrome data ≠ Firefox data)

## What's Next?

This is a static demo version. For production use:
- Integrate with backend API (see [API_DOCUMENTATION.md](API_DOCUMENTATION.md))
- Add ML model for automatic measurements
- Implement user management system
- Add report generation

## Need Help?

- See [README.md](README.md) for detailed documentation
- See [DEMO_CREDENTIALS.md](DEMO_CREDENTIALS.md) for credential info
- See [COMPONENT_STRUCTURE.md](COMPONENT_STRUCTURE.md) for architecture details

---

**Enjoy using CuraiHeart! 💙**
