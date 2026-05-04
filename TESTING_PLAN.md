## TESTING PLAN - STUDY PLANNER API

OVERVIEW
This document provides step-by-step testing instructions 
for all API endpoints using Swagger UI.

BASE URL
Local:      http://localhost:3000
Production: https://study-planner-api.onrender.com

API DOCUMENTATION
Local:      /api-docs
Production: /api-docs

TEST CREDENTIALS
[Admin User]
Email:      admin@example.com
Password:   Admin123!

[Regular User]
Email:      user@example.com
Password:   User123!


1. AUTHENTICATION ENDPOINTS

POST /api/auth/signup
- Access Control: Public
- Success Case: 
    1. Click "Try it out"
    2. Enter valid username, email, and password
    3. Click "Execute"
    4. Expected: 201 Created
- Error Cases:
    * Missing fields: 400 Bad Request
    * Invalid email: 400 Bad Request
    * Duplicate email: 409 Conflict

POST /api/auth/login
- Access Control: Public
- Success Case:
    1. Click "Try it out"
    2. Enter valid email/password
    3. Click "Execute"
    4. Expected: 200 OK with JWT token
    * ACTION: Copy the token for later use.
- Error Cases:
    * Missing fields/Wrong password: 401 Unauthorized
    * User not found: 404 Not Found

PROTECTED ENDPOINT SETUP:
1. Log in with valid credentials.
2. Copy the JWT token from the response.
3. Click the "Authorize" button at the top of Swagger UI.
4. Paste the token and click "Authorize".


2. COURSE ENDPOINTS
- POST /api/courses: (Auth) 201 Created. Errors: 400, 401.
- GET  /api/courses: (Auth) 200 OK. Errors: 401.
- GET  /api/courses/{id}: (Owner) 200 OK. Errors: 400, 401, 403, 404.
- PUT  /api/courses/{id}: (Owner) 200 OK. Errors: 400, 401, 403, 404.
- DEL  /api/courses/{id}: (Owner) 200 OK. Errors: 400, 401, 403, 404.


3. ASSIGNMENT ENDPOINTS
- POST /api/assignments: (Auth/Course Owner) 201 Created.
- GET  /api/assignments: (Auth) 200 OK.
- GET  /api/assignments/{id}: (Owner) 200 OK.
- PUT  /api/assignments/{id}: (Owner) 200 OK.
- DEL  /api/assignments/{id}: (Owner) 200 OK.
* Note: Errors include 400, 401, 403 (if course/item not owned), 404.


4. STUDY SESSION ENDPOINTS
- POST /api/study-sessions: (Auth/Course Owner) 201 Created.
- GET  /api/study-sessions: (Auth) 200 OK.
- GET  /api/study-sessions/{id}: (Owner) 200 OK.
- PUT  /api/study-sessions/{id}: (Owner) 200 OK.
- DEL  /api/study-sessions/{id}: (Owner) 200 OK.


SEEDED DATA REFERENCE
- Use ID 1 (Admin) for valid owner tests.
- Use ID 3 (User) to test standard access.
- Cross-Check: Log in as Regular User and attempt to access
  Admin resources to confirm "403 Forbidden" responses.