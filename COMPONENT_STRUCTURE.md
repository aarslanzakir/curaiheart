# CuraiHeart Frontend - Component Structure

This document provides a visual representation of the application's component hierarchy and data flow.

## Application Structure

```
App.vue (Root Component)
│
├── Navigation Bar (Conditional: authenticated users only)
│   ├── Brand Logo ("CuraiHeart")
│   ├── User Info Display
│   └── Logout Button
│
└── RouterView (Main Content Area)
    │
    ├── Login.vue (Route: /login)
    │   ├── Login Form
    │   │   ├── Email Input
    │   │   ├── Password Input
    │   │   └── Submit Button
    │   └── Error Message Display
    │
    ├── Dashboard.vue (Route: /)
    │   ├── Header
    │   │   ├── Page Title
    │   │   └── "New Patient" Button
    │   │
    │   └── Patient Grid
    │       └── Patient Card(s)
    │           ├── Patient Name
    │           ├── Patient Details (Age, Sex, Height, Weight)
    │           └── View Details Link
    │
    ├── PatientForm.vue (Route: /patient/new)
    │   ├── Form Header
    │   │
    │   ├── Patient Information Section
    │   │   ├── Name Input
    │   │   ├── Age Input
    │   │   ├── Sex Dropdown
    │   │   ├── Height Input
    │   │   └── Weight Input
    │   │
    │   ├── Video Upload Section
    │   │   ├── File Input (.avi)
    │   │   ├── Upload Area (Drag & Drop)
    │   │   ├── File Preview
    │   │   └── Upload Progress Bar
    │   │
    │   └── Form Actions
    │       ├── Cancel Button
    │       └── Save Button
    │
    └── VideoDisplay.vue (Route: /patient/:id/video)
        ├── Patient Header
        │   ├── Back Button
        │   └── Patient Info Bar
        │
        └── Content Grid
            ├── Video Section
            │   ├── Video Controls
            │   │   ├── Section Title
            │   │   └── View Selector Dropdown
            │   │       ├── A4C Option
            │   │       ├── A2C Option
            │   │       ├── PLAX Option
            │   │       └── PSAX Option
            │   │
            │   ├── Video Player
            │   │   └── HTML5 Video Element
            │   │
            │   └── Video Info
            │       ├── Current View Label
            │       └── Upload Date
            │
            └── Reference Panel
                └── ReferenceValues.vue (Component)
                    ├── Reference Header
                    │   ├── Title
                    │   └── Sex Indicator
                    │
                    ├── LV Dimensions Section
                    │   ├── LVEDD
                    │   ├── LVESD
                    │   ├── IVS
                    │   └── PWT
                    │
                    ├── LV Volume Section
                    │   ├── LVEDV
                    │   └── LVESV
                    │
                    ├── LV Function Section
                    │   ├── EF
                    │   └── FS
                    │
                    ├── LA Dimensions Section
                    │   ├── LAD
                    │   └── LAV
                    │
                    ├── ML Placeholder
                    │   └── "Predicted values will be displayed here..."
                    │
                    └── Reference Footer
                        └── ASE Guidelines Note
```

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│                     (Vue Components)                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ User Actions (click, input, submit)
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                    Composables Layer                         │
│                                                               │
│  ┌──────────────┐                                           │
│  │  useAuth.js  │  ← Manages authentication state           │
│  │              │    (login, logout, token, user)           │
│  └──────────────┘                                           │
│                                                               │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ API Calls
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                     Services Layer                           │
│                                                               │
│  ┌──────────────┐                                           │
│  │   api.js     │  ← Axios instance with interceptors       │
│  │              │    Handles all HTTP communications        │
│  └──────────────┘                                           │
│                                                               │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTP Requests (with JWT)
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                   Backend API Server                         │
│                   (To Be Implemented)                        │
│                                                               │
│  • Authentication Endpoints                                  │
│  • Patient Management Endpoints                              │
│  • Video Upload/Retrieval Endpoints                          │
│                                                               │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                       Database                               │
│                 (PostgreSQL/Supabase)                        │
│                                                               │
│  • Users Table                                               │
│  • Patients Table                                            │
│  • Videos Table                                              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. Enter credentials
     ↓
┌────────────────┐
│  Login.vue     │
└────┬───────────┘
     │
     │ 2. Call login()
     ↓
┌────────────────┐
│  useAuth.js    │
└────┬───────────┘
     │
     │ 3. POST /api/auth/login
     ↓
┌────────────────┐
│  api.js        │
└────┬───────────┘
     │
     │ 4. HTTP Request
     ↓
┌────────────────┐
│  Backend API   │
└────┬───────────┘
     │
     │ 5. Validate credentials
     │ 6. Generate JWT token
     ↓
     Response: { token, user }
     │
     ↑ 7. Return to frontend
┌────┴───────────┐
│  useAuth.js    │
│  • Store token in localStorage
│  • Update reactive state
└────┬───────────┘
     │
     │ 8. Redirect to Dashboard
     ↓
┌────────────────┐
│  Dashboard.vue │
└────────────────┘

Subsequent Requests:
┌────────────────┐
│  Any Component │
└────┬───────────┘
     │
     │ API call
     ↓
┌────────────────┐
│  api.js        │
│  (Interceptor adds token)
│  Authorization: Bearer <token>
└────┬───────────┘
     │
     ↓
┌────────────────┐
│  Backend API   │
│  (Validates token)
└────────────────┘
```

---

## Patient Creation Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. Click "New Patient"
     ↓
┌────────────────────┐
│  Dashboard.vue     │
│  router.push('/patient/new')
└────┬───────────────┘
     │
     ↓
┌────────────────────┐
│  PatientForm.vue   │
└────┬───────────────┘
     │
     │ 2. Fill form & select video
     │ 3. Click "Save Patient"
     ↓
┌────────────────────┐
│  handleSubmit()    │
└────┬───────────────┘
     │
     │ 4. Create patient record
     │    POST /api/patients
     ↓
┌────────────────────┐
│  api.js            │
└────┬───────────────┘
     │
     ↓
┌────────────────────┐
│  Backend API       │
│  • Validate data
│  • Save to database
│  • Return patient.id
└────┬───────────────┘
     │
     ↑ Response: { id, ...patientData }
     │
     │ 5. Upload video
     │    POST /api/videos/upload
     │    FormData: { video, patientId }
     ↓
┌────────────────────┐
│  api.js            │
│  • Track progress
│  • Show progress bar
└────┬───────────────┘
     │
     ↓
┌────────────────────┐
│  Backend API       │
│  • Validate .avi file
│  • Store video file
│  • Save metadata to DB
└────┬───────────────┘
     │
     ↑ Response: { id, url, ... }
     │
     │ 6. Redirect to video page
     │    router.push(`/patient/${id}/video`)
     ↓
┌────────────────────┐
│  VideoDisplay.vue  │
│  • Show video
│  • Display reference values
└────────────────────┘
```

---

## Video Display & Reference Values Flow

```
┌────────────────────┐
│  User clicks       │
│  patient card      │
└────┬───────────────┘
     │
     ↓
┌────────────────────────────────────────┐
│  VideoDisplay.vue                      │
│  (Route: /patient/:id/video)           │
└────┬───────────────────────────────────┘
     │
     │ onMounted()
     │
     ├─────────────┬──────────────┐
     │             │              │
     │ 1. Fetch    │ 2. Fetch    │
     │    patient  │    videos   │
     ↓             ↓              │
┌──────────┐  ┌──────────┐      │
│GET /api/ │  │GET /api/ │      │
│patients/ │  │patients/ │      │
│:id       │  │:id/videos│      │
└────┬─────┘  └────┬─────┘      │
     │             │              │
     ↓             ↓              │
┌────────────────────────────────┴──┐
│  Component State                  │
│  • patient = { name, age, sex,... }│
│  • videos = [{ id, url, view,... }]│
└────┬──────────────────────────────┘
     │
     │ Pass data to child
     ↓
┌─────────────────────────────────────┐
│  <ReferenceValues                   │
│    :sex="patient.sex"               │
│    :predicted-values="predictedVals"│
│  />                                 │
└─────┬───────────────────────────────┘
      │
      │ Compute reference ranges
      │ based on sex prop
      ↓
┌─────────────────────────────────────┐
│  Display sex-specific ranges:       │
│                                      │
│  If sex === 'male':                 │
│    LVEDD: 42-58 mm                  │
│  If sex === 'female':               │
│    LVEDD: 38-52 mm                  │
│  ...                                │
└─────────────────────────────────────┘

User Changes View:
┌─────────────────────┐
│  Select view: A2C   │
└─────┬───────────────┘
      │
      │ watch(selectedView)
      ↓
┌─────────────────────┐
│  Update videoUrl    │
│  computed property  │
└─────┬───────────────┘
      │
      │ Filter videos array
      ↓
┌─────────────────────┐
│  Display new video  │
│  <video :src="url"> │
└─────────────────────┘
```

---

## State Management Pattern

```
┌─────────────────────────────────────────────────────────┐
│                    Global State                         │
│                                                          │
│  useAuth() Composable (shared across components):      │
│  ┌──────────────────────────────────────────┐          │
│  │ • token (ref)                             │          │
│  │ • user (ref)                              │          │
│  │ • isAuthenticated (computed)              │          │
│  │ • login(credentials) → Promise            │          │
│  │ • logout() → void                         │          │
│  │ • getToken() → string                     │          │
│  └──────────────────────────────────────────┘          │
│                                                          │
│  Storage: localStorage                                  │
│  • 'authToken': JWT string                             │
│  • 'user': JSON stringified user object                │
│                                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   Component State                        │
│                   (Local to each component)              │
│                                                          │
│  PatientForm.vue:                                       │
│  • patientData (ref) - form fields                     │
│  • selectedFile (ref) - uploaded file                  │
│  • uploadProgress (ref) - 0-100                        │
│                                                          │
│  VideoDisplay.vue:                                      │
│  • patient (ref) - patient details                     │
│  • videos (ref) - array of video objects               │
│  • selectedView (ref) - current view (a4c, a2c, etc)  │
│  • videoUrl (computed) - URL for selected view         │
│                                                          │
│  Dashboard.vue:                                         │
│  • patients (ref) - array of patient objects           │
│  • loading (ref) - boolean                             │
│  • error (ref) - error message string                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Router Configuration

```
┌──────────────────────────────────────────────────────────┐
│                     Vue Router                           │
│                                                           │
│  Routes:                                                 │
│  ┌────────────────────────────────────────────┐         │
│  │ /login                                      │         │
│  │   Component: Login.vue                      │         │
│  │   Meta: { requiresGuest: true }            │         │
│  └────────────────────────────────────────────┘         │
│                                                           │
│  ┌────────────────────────────────────────────┐         │
│  │ /                                           │         │
│  │   Component: Dashboard.vue                  │         │
│  │   Meta: { requiresAuth: true }             │         │
│  └────────────────────────────────────────────┘         │
│                                                           │
│  ┌────────────────────────────────────────────┐         │
│  │ /patient/new                                │         │
│  │   Component: PatientForm.vue                │         │
│  │   Meta: { requiresAuth: true }             │         │
│  └────────────────────────────────────────────┘         │
│                                                           │
│  ┌────────────────────────────────────────────┐         │
│  │ /patient/:id/video                          │         │
│  │   Component: VideoDisplay.vue               │         │
│  │   Meta: { requiresAuth: true }             │         │
│  └────────────────────────────────────────────┘         │
│                                                           │
│  Navigation Guard:                                       │
│  beforeEach((to, from, next) => {                       │
│    if (to.meta.requiresAuth && !isAuthenticated) {     │
│      next('/login')                                     │
│    } else if (to.meta.requiresGuest && isAuthenticated) {│
│      next('/')                                          │
│    } else {                                             │
│      next()                                             │
│    }                                                    │
│  })                                                     │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## Component Communication

```
Parent → Child (Props):
┌────────────────────┐
│ VideoDisplay.vue   │
└─────┬──────────────┘
      │ :sex="patient.sex"
      │ :predicted-values="{}"
      ↓
┌────────────────────┐
│ ReferenceValues.vue│
└────────────────────┘


Child → Parent (Events):
Not used in current implementation
(Could be added for future features)


Sibling Communication:
Via Router Navigation
┌────────────────┐    router.push()    ┌────────────────┐
│ PatientForm    │ ─────────────────→  │ VideoDisplay   │
└────────────────┘                      └────────────────┘


Global State:
┌──────────────┐
│  useAuth()   │ ← Shared composable
└──────┬───────┘
       │
       ├─→ Login.vue
       ├─→ App.vue
       ├─→ Dashboard.vue
       └─→ All protected routes
```

---

## File Organization Best Practices

```
src/
│
├── components/           ← Reusable UI components
│   └── ReferenceValues.vue
│
├── composables/          ← Shared reactive state/logic
│   └── useAuth.js
│
├── views/                ← Page-level components (routes)
│   ├── Login.vue
│   ├── Dashboard.vue
│   ├── PatientForm.vue
│   └── VideoDisplay.vue
│
├── router/               ← Route configuration
│   └── index.js
│
├── services/             ← External integrations
│   └── api.js
│
├── App.vue              ← Root component
├── main.js              ← Application entry
└── style.css            ← Global styles
```

---

## Styling Architecture

```
┌────────────────────────────────────────────┐
│         Global Styles (style.css)          │
│                                             │
│  • CSS Variables (colors, spacing, etc)   │
│  • Reset styles                            │
│  • Utility classes                         │
│  • Base typography                         │
│  • Scrollbar customization                 │
│                                             │
└─────────────────┬──────────────────────────┘
                  │
                  ↓
┌────────────────────────────────────────────┐
│        App.vue (Global Styles)             │
│                                             │
│  • Layout structure                        │
│  • Navbar styles                           │
│  • Main content area                       │
│                                             │
└─────────────────┬──────────────────────────┘
                  │
                  ↓
┌────────────────────────────────────────────┐
│     Component Scoped Styles                │
│                                             │
│  <style scoped>                            │
│    Component-specific styles               │
│    (isolated, no conflicts)                │
│  </style>                                  │
│                                             │
└────────────────────────────────────────────┘
```

---

## Future Component Additions

When extending the application, consider adding:

```
components/
├── PatientCard.vue         ← Extract from Dashboard
├── VideoPlayer.vue         ← Extract video logic
├── FileUploader.vue        ← Reusable file upload
├── LoadingSpinner.vue      ← Loading indicator
├── ErrorMessage.vue        ← Error display
├── Modal.vue               ← Dialog/modal component
└── ConfirmDialog.vue       ← Confirmation dialogs

views/
├── PatientEdit.vue         ← Edit patient info
├── PatientHistory.vue      ← Patient history view
├── Reports.vue             ← Generate reports
└── Settings.vue            ← User settings

composables/
├── usePatients.js          ← Patient data management
├── useVideos.js            ← Video management
└── useNotifications.js     ← Toast notifications
```

This modular structure supports scalability and maintainability as the application grows.
