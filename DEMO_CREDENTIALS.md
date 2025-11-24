# CuraiHeart Demo Credentials

## Static Login Information

The application currently uses **static authentication** (no backend required).

### Demo Account

**Email:** `clinician@curaiheart.com`
**Password:** `demo123`

---

## How It Works

- All authentication is handled client-side
- Patient data and videos are stored in **localStorage**
- No backend API is required
- Data persists across browser sessions but is local to your browser

---

## Features Available in Demo Mode

✅ **Authentication**
- Login with static credentials
- Session persistence
- Logout functionality

✅ **Patient Management**
- View sample patient data (6 pre-loaded patients)
- Create new patients
- View patient list
- Patient data stored in localStorage

✅ **Video Upload**
- Upload .avi video files
- Videos stored as blob URLs
- Upload progress simulation

✅ **Video Display**
- View uploaded videos
- Switch between different views (A4C, A2C, PLAX, PSAX)
- Display sex-based reference values

## Sample Data

On first login, you'll see **6 sample patients** pre-loaded:
- John Smith (58, Male)
- Sarah Johnson (45, Female)
- Michael Brown (62, Male)
- Emily Davis (51, Female)
- Robert Wilson (48, Male)
- Lisa Anderson (39, Female)

**Note:** Sample patients have no videos. Click any sample patient to see the interface, then add your own patient with a video to test the full upload feature.

---

## Data Storage

All data is stored in your browser's localStorage:
- `authToken` - Authentication token
- `user` - User information
- `mockPatients` - Array of patient records
- `mockVideos` - Array of video metadata

### Clear Data

To reset the application and clear all data, open your browser console and run:
```javascript
localStorage.clear()
```

Then refresh the page.

---

## Notes

- This is a **demo/prototype version** suitable for testing and development
- All data is local to your browser
- Data will be lost if you clear browser data
- Videos are stored as temporary blob URLs
- For production use, integrate with a real backend API (see API_DOCUMENTATION.md)
