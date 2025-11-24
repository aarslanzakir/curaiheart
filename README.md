# CuraiHeart Frontend - Milestone 1

A Vue.js-based frontend application for CuraiHeart, a cardiac health monitoring system for clinicians to manage patient data, upload echocardiogram videos, and view reference values.

## Features (Milestone 1)

### 1. User Authentication
- Secure clinician login and logout functionality
- JWT-based session management
- Protected routes with authentication guards
- Persistent authentication state

### 2. Patient Data Management
- Create new patient records with comprehensive information:
  - Full Name
  - Age
  - Sex (Male/Female)
  - Height (cm)
  - Weight (kg)
- Dashboard view to see all patients
- Patient information displayed on video pages

### 3. Video Upload
- Upload echocardiogram videos (.avi format only)
- File validation (extension and size checks)
- Upload progress tracking
- Automatic association with patient records

### 4. Video Display & Analysis
- Dedicated video display page for each patient
- Multiple view options:
  - A4C (Apical 4-Chamber)
  - A2C (Apical 2-Chamber)
  - PLAX (Parasternal Long Axis)
  - PSAX (Parasternal Short Axis)
- Video playback controls
- View switching capability

### 5. Reference Values
- Sex-specific reference values based on ASE guidelines
- Display of normal ranges for:
  - Left Ventricular Dimensions (LVEDD, LVESD, IVS, PWT)
  - Left Ventricular Volume (LVEDV, LVESV)
  - Left Ventricular Function (EF, FS)
  - Left Atrial Dimensions (LAD, LAV)
- Placeholder for ML-predicted values (to be integrated later)

## Tech Stack

- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **Routing**: Vue Router 4
- **Storage**: localStorage (static/demo mode)
- **Styling**: CSS3 with modern features (CSS Variables, Grid, Flexbox)

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable Vue components
│   │   └── ReferenceValues.vue
│   ├── composables/         # Vue composables (state management)
│   │   └── useAuth.js
│   ├── router/              # Vue Router configuration
│   │   └── index.js
│   ├── services/            # API service layer
│   │   └── api.js
│   ├── views/               # Page components
│   │   ├── Login.vue
│   │   ├── Dashboard.vue
│   │   ├── PatientForm.vue
│   │   └── VideoDisplay.vue
│   ├── App.vue              # Root component
│   ├── main.js              # Application entry point
│   └── style.css            # Global styles
├── .env.example             # Environment variables template
├── package.json
├── vite.config.js
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Demo Credentials

The application uses **static authentication** (no backend required):

**Email:** `clinician@curaiheart.com`
**Password:** `demo123`

All patient data and videos are stored in your browser's localStorage.

For more details, see [DEMO_CREDENTIALS.md](DEMO_CREDENTIALS.md)

### Build for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Current Implementation - Static/Demo Mode

The application currently runs in **static mode** without requiring a backend:

- **Authentication**: Static credentials validated client-side
- **Data Storage**: localStorage (browser-based)
- **Patient Records**: Stored locally in browser
- **Videos**: Stored as blob URLs in browser memory

### Data Persistence

All data persists in your browser's localStorage:
- `authToken` - Authentication token
- `user` - User information
- `mockPatients` - Patient records
- `mockVideos` - Video metadata

To reset/clear all data:
```javascript
// Run in browser console
localStorage.clear()
```

## Future Backend Integration

For production use with a real backend API, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for the expected endpoints.

## Key Features Implementation Details

### Authentication Flow (Static Mode)
1. User enters credentials on login page
2. Frontend validates against static credentials (clinician@curaiheart.com / demo123)
3. Mock token is generated and stored in localStorage
4. User is redirected to dashboard
5. Navigation guards protect authenticated routes

### File Upload (Static Mode)
1. User selects .avi file from file input
2. Frontend validates file extension and size
3. File is converted to blob URL for storage
4. Upload progress is simulated
5. Video metadata saved to localStorage
6. User is redirected to video display page

### Video Display
1. Patient data loaded from localStorage
2. User can switch between different echocardiogram views
3. Reference values displayed based on patient's sex
4. Video player shows the selected video via blob URL

## Future Enhancements (Beyond Milestone 1)

- ML model integration for automatic measurements
- Real-time analysis of echocardiogram videos
- Report generation and export
- Multi-user role management
- Video annotation tools
- Historical data comparison
- Advanced search and filtering

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Notes

### Code Style
- Uses Vue 3 Composition API with `<script setup>`
- Follows Vue.js style guide recommendations
- CSS uses modern features (CSS Variables, Grid, Flexbox)

### Security Considerations
- All authenticated routes are protected
- JWT tokens are validated on backend
- File uploads are validated client-side and should be validated server-side
- XSS protection via Vue's template escaping

## License

Proprietary - CuraiHeart Project

## Support

For issues, questions, or contributions, please contact the development team.
