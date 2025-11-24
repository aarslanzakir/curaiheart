# Sample Data Overview

## Pre-loaded Patient Data

The CuraiHeart application comes with **6 sample patients** pre-loaded to demonstrate the interface and features immediately upon login.

---

## Sample Patients

### 1. John Smith
- **Age**: 58 years
- **Sex**: Male
- **Height**: 178 cm
- **Weight**: 82 kg
- **Created**: January 10, 2025
- **Badge**: Sample

### 2. Sarah Johnson
- **Age**: 45 years
- **Sex**: Female
- **Height**: 165 cm
- **Weight**: 68 kg
- **Created**: January 12, 2025
- **Badge**: Sample

### 3. Michael Brown
- **Age**: 62 years
- **Sex**: Male
- **Height**: 182 cm
- **Weight**: 90 kg
- **Created**: January 13, 2025
- **Badge**: Sample

### 4. Emily Davis
- **Age**: 51 years
- **Sex**: Female
- **Height**: 160 cm
- **Weight**: 62 kg
- **Created**: January 14, 2025
- **Badge**: Sample

### 5. Robert Wilson
- **Age**: 48 years
- **Sex**: Male
- **Height**: 175 cm
- **Weight**: 78 kg
- **Created**: January 15, 2025
- **Badge**: Sample

### 6. Lisa Anderson
- **Age**: 39 years
- **Sex**: Female
- **Height**: 168 cm
- **Weight**: 65 kg
- **Created**: January 15, 2025
- **Badge**: Sample

---

## Visual Indicators

### Dashboard Display
- **Sample Badge**: Each sample patient has a purple gradient "SAMPLE" badge next to their name
- **Info Banner**: A blue banner at the top explains that you're viewing sample data
- **Patient Cards**: All 6 patients displayed in a responsive grid layout

### Dashboard Banner Text
```
Demo Mode: Showing sample patient data. Click "+ New Patient" to add your own,
or click any patient card to explore features.

(Note: Sample patients have no videos. Add new patients to upload videos.)
```

---

## Features with Sample Data

### ✅ What You Can Do
- View all 6 sample patients on dashboard
- Click any patient card to view their details
- See the video display interface (no video will play)
- View reference values based on patient's sex
- Understand the UI/UX flow
- Navigate between pages

### ⚠️ Limitations
- **No Videos**: Sample patients don't have associated videos
- **Cannot Edit**: Sample patients are read-only
- **Cannot Delete**: Sample patients persist until localStorage is cleared

---

## Adding Your Own Patients

To test the full functionality with videos:

1. **Click "+ New Patient"** button
2. **Fill in patient details**
3. **Upload a .avi video file**
4. **Save the patient**
5. **View the video on the video display page**

Your patients will appear alongside sample patients on the dashboard.

---

## Sample vs Real Patients

| Feature | Sample Patients | Your Patients |
|---------|----------------|---------------|
| Visible on Dashboard | ✅ Yes | ✅ Yes |
| Has "Sample" Badge | ✅ Yes | ❌ No |
| Has Videos | ❌ No | ✅ Yes (after upload) |
| Can be Edited | ❌ No | ✅ Yes |
| Can be Deleted | ❌ No | ✅ Yes |
| Reference Values | ✅ Shown | ✅ Shown |

---

## Data Management

### How Sample Data Works
```javascript
// Sample data is initialized on first load
// If localStorage is empty:
localStorage.setItem('mockPatients', JSON.stringify(SAMPLE_PATIENTS))

// If localStorage already has data:
// Sample data is NOT added again
```

### Clearing Sample Data
To remove all data including samples:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Run: `localStorage.clear()`
4. Refresh the page
5. Login again
6. Sample data will reload

---

## Reference Values Display

### Male Patients (John Smith, Michael Brown, Robert Wilson)
When you click a male patient, reference values show:
- **LVEDD**: 42-58 mm
- **LVESD**: 25-40 mm
- **IVS**: 6-10 mm
- **PWT**: 6-10 mm
- **EF**: 52-72%
- And more...

### Female Patients (Sarah Johnson, Emily Davis, Lisa Anderson)
When you click a female patient, reference values show:
- **LVEDD**: 38-52 mm
- **LVESD**: 22-35 mm
- **IVS**: 6-9 mm
- **PWT**: 6-9 mm
- **EF**: 54-74%
- And more...

---

## Why Sample Data?

### Benefits
✅ **Immediate Visualization** - See populated dashboard right away
✅ **No Setup Required** - Start exploring features immediately
✅ **UI/UX Testing** - Understand the layout and design
✅ **Demo Ready** - Perfect for presentations and demos
✅ **Learn by Example** - See how data should be structured

### Use Cases
- **Stakeholder Demos** - Show features without setup
- **UI Testing** - Validate responsive design
- **Development** - Test layouts with realistic data
- **Onboarding** - Help new users understand the system

---

## Customizing Sample Data

If you want to modify the sample patients:

**Location**: `src/services/api.js`

```javascript
const SAMPLE_PATIENTS = [
  {
    id: 'sample-1',
    name: 'Your Patient Name',
    age: 50,
    sex: 'male', // or 'female'
    height: 170,
    weight: 75,
    createdAt: '2025-01-15T10:00:00.000Z',
    updatedAt: '2025-01-15T10:00:00.000Z'
  },
  // Add more patients...
]
```

Then rebuild: `npm run build`

---

## Sample Data in Production

### Recommendation
For production deployment:
1. **Keep sample data** for demo accounts
2. **Remove sample data** for real clinical use
3. **Add flag** to enable/disable samples based on user type

### Implementation Ideas
```javascript
// Option 1: Environment-based
const ENABLE_SAMPLES = import.meta.env.VITE_ENABLE_SAMPLE_DATA === 'true'

// Option 2: User-based
const ENABLE_SAMPLES = user.role === 'demo'

// Option 3: First-time only
const ENABLE_SAMPLES = !localStorage.getItem('hasVisitedBefore')
```

---

## FAQ

**Q: Can I delete sample patients?**
A: Not directly in the UI. You need to clear localStorage to remove them.

**Q: Will sample data interfere with real data?**
A: No, sample patients and your patients coexist peacefully.

**Q: Can I add videos to sample patients?**
A: No, sample patients are designed to be view-only.

**Q: How do I disable sample data?**
A: Edit `src/services/api.js` and set `SAMPLE_PATIENTS = []`

**Q: Do sample patients count toward storage limits?**
A: Yes, but they use minimal space (~1 KB total).

---

## Summary

Sample data provides an excellent way to:
- ✅ See the application populated with realistic data
- ✅ Test UI/UX without manual setup
- ✅ Demonstrate features in presentations
- ✅ Understand data structure and layout

Simply login and start exploring! Add your own patients to test the full video upload functionality.

---

**Enjoy exploring CuraiHeart with sample data! 💙**
