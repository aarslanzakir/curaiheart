# CuraiHeart Frontend - API Documentation

This document outlines the expected backend API endpoints that the CuraiHeart frontend application needs to integrate with.

## Base URL

All API endpoints should be prefixed with the base URL configured in the environment variables:
```
VITE_API_URL=http://localhost:3000/api
```

## Authentication

The API uses JWT (JSON Web Token) for authentication. After successful login, the token should be included in all subsequent requests via the Authorization header:
```
Authorization: Bearer <token>
```

---

## API Endpoints

### Authentication

#### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success Response (200 OK):**
```json
{
  "token": "string (JWT token)",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "string"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "message": "Invalid credentials"
}
```

#### Logout
```http
POST /api/auth/logout
```

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "message": "Logout successful"
}
```

---

### Patient Management

#### Get All Patients
```http
GET /api/patients
```

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
[
  {
    "id": "string",
    "name": "string",
    "age": "number",
    "sex": "male" | "female",
    "height": "number (cm)",
    "weight": "number (kg)",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
  }
]
```

#### Get Patient by ID
```http
GET /api/patients/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "id": "string",
  "name": "string",
  "age": "number",
  "sex": "male" | "female",
  "height": "number (cm)",
  "weight": "number (kg)",
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)"
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "Patient not found"
}
```

#### Create Patient
```http
POST /api/patients
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "string (required)",
  "age": "number (required)",
  "sex": "male" | "female" (required),
  "height": "number (required, in cm)",
  "weight": "number (required, in kg)"
}
```

**Success Response (201 Created):**
```json
{
  "id": "string",
  "name": "string",
  "age": "number",
  "sex": "male" | "female",
  "height": "number",
  "weight": "number",
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)"
}
```

**Error Response (400 Bad Request):**
```json
{
  "message": "Validation error",
  "errors": {
    "field": "error message"
  }
}
```

#### Update Patient
```http
PUT /api/patients/:id
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "string (optional)",
  "age": "number (optional)",
  "sex": "male" | "female" (optional),
  "height": "number (optional)",
  "weight": "number (optional)"
}
```

**Success Response (200 OK):**
```json
{
  "id": "string",
  "name": "string",
  "age": "number",
  "sex": "male" | "female",
  "height": "number",
  "weight": "number",
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)"
}
```

#### Delete Patient
```http
DELETE /api/patients/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "message": "Patient deleted successfully"
}
```

---

### Video Management

#### Upload Video
```http
POST /api/videos/upload
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
```
video: File (required, .avi format)
patientId: string (required)
view: string (optional, one of: a4c, a2c, plax, psax)
```

**Success Response (201 Created):**
```json
{
  "id": "string",
  "patientId": "string",
  "filename": "string",
  "url": "string (video URL)",
  "view": "string",
  "size": "number (bytes)",
  "uploadedAt": "string (ISO date)"
}
```

**Error Response (400 Bad Request):**
```json
{
  "message": "Invalid file format. Only .avi files are allowed"
}
```

**Error Response (413 Payload Too Large):**
```json
{
  "message": "File size exceeds maximum limit"
}
```

#### Get Videos for Patient
```http
GET /api/patients/:patientId/videos
```

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
[
  {
    "id": "string",
    "patientId": "string",
    "filename": "string",
    "url": "string (video URL)",
    "view": "a4c" | "a2c" | "plax" | "psax",
    "size": "number (bytes)",
    "uploadedAt": "string (ISO date)"
  }
]
```

#### Get Video by ID
```http
GET /api/videos/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "id": "string",
  "patientId": "string",
  "filename": "string",
  "url": "string (video URL)",
  "view": "a4c" | "a2c" | "plax" | "psax",
  "size": "number (bytes)",
  "uploadedAt": "string (ISO date)"
}
```

#### Delete Video
```http
DELETE /api/videos/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "message": "Video deleted successfully"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized
```json
{
  "message": "Authentication required" | "Invalid token" | "Token expired"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error",
  "error": "Error details (in development only)"
}
```

---

## Data Validation Rules

### Patient Data
- **name**: String, 1-100 characters, required
- **age**: Number, 0-150, required
- **sex**: Enum ["male", "female"], required
- **height**: Number, 0-300 (cm), required
- **weight**: Number, 0-500 (kg), required

### Video Upload
- **File format**: Only .avi files accepted
- **File size**: Maximum 500MB
- **Filename**: Should be sanitized on backend

---

## CORS Configuration

The backend should be configured to accept requests from the frontend origin:
```
Access-Control-Allow-Origin: http://localhost:5173 (development)
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## Rate Limiting

Recommended rate limits:
- Authentication endpoints: 5 requests per minute per IP
- Upload endpoints: 10 requests per hour per user
- Other endpoints: 100 requests per minute per user

---

## Video Storage

The backend should:
1. Store uploaded video files securely
2. Generate unique filenames to prevent collisions
3. Return accessible URLs for video playback
4. Implement proper access control (authenticated users only)
5. Clean up orphaned files when patients are deleted

---

## Security Considerations

1. **Authentication**: Use secure JWT implementation with appropriate expiration times
2. **File Upload**:
   - Validate file type on both client and server
   - Scan files for malware
   - Store files outside web root
   - Use signed URLs for video access
3. **Input Validation**: Sanitize all user inputs
4. **HTTPS**: Use HTTPS in production
5. **SQL Injection**: Use parameterized queries
6. **XSS Protection**: Sanitize output data

---

## Testing Endpoints

For testing purposes, you can use tools like:
- Postman
- cURL
- Thunder Client (VS Code extension)

Example cURL request for login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"clinician@example.com","password":"password123"}'
```

---

## Future API Extensions (Post-Milestone 1)

The following endpoints may be added in future milestones:

- `POST /api/videos/:id/analyze` - Trigger ML analysis
- `GET /api/videos/:id/measurements` - Get ML measurements
- `POST /api/reports/generate` - Generate PDF report
- `GET /api/patients/:id/history` - Get patient history
- `POST /api/users` - User management (admin)
- `GET /api/analytics` - System analytics
