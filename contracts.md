# AIRA Authentication Integration Contracts

## Overview
Implement Google OAuth authentication using Emergent Auth with session management.

## Backend Implementation

### 1. Database Models

#### User Model (`/app/backend/models.py`)
```python
- id: str (UUID)
- email: str
- name: str
- picture: str (URL)
- created_at: datetime
```

#### UserSession Model
```python
- user_id: str (references User.id)
- session_token: str (from Emergent Auth)
- expires_at: datetime (7 days from creation)
- created_at: datetime
```

### 2. API Endpoints

#### POST /api/auth/session
**Purpose**: Process session_id from Emergent Auth and create user session
**Input**: X-Session-ID header
**Process**:
1. Call Emergent Auth API to get user data
2. Create/update user in database
3. Store session_token in database with 7-day expiry
4. Set httpOnly cookie with session_token
**Output**: User data (id, email, name, picture)

#### GET /api/auth/me
**Purpose**: Get current authenticated user
**Input**: session_token from cookie or Authorization header
**Process**:
1. Validate session_token
2. Check expiry
3. Fetch user data
**Output**: User data or 401 Unauthorized

#### POST /api/auth/logout
**Purpose**: Sign out user
**Input**: session_token from cookie
**Process**:
1. Delete session from database
2. Clear cookie
**Output**: Success message

### 3. Authentication Helper

**Function**: `get_current_user(request)`
- Check for session_token in cookies first
- Fallback to Authorization header
- Validate session and return user
- Return None if invalid/expired

## Frontend Integration

### Current Mock Data (to be removed)
- localStorage usage in App.js
- Mock sign out functionality

### Integration Changes

#### App.js
1. **Remove**: localStorage usage
2. **Update**: handleSignIn - redirect to Emergent Auth
3. **Update**: handleSignOut - call /api/auth/logout endpoint
4. **Update**: processAuth - call /api/auth/session endpoint
5. **Add**: Cookie-based session management

#### API Calls
- All authenticated requests must include credentials: 'include'
- Session validation via /api/auth/me on app load

## Testing Checklist
- [ ] User registration on first login
- [ ] Session creation and storage
- [ ] Cookie setting (httpOnly, secure, sameSite)
- [ ] Dashboard access with authentication
- [ ] Logout functionality
- [ ] Session expiry handling
- [ ] Redirect to login on unauthorized access

## Security Notes
- Use httpOnly cookies for session_token
- Set secure=True and sameSite="none" for cookies
- Use timezone-aware datetime (datetime.now(timezone.utc))
- Session tokens valid for 7 days
- Never expose session tokens in client-side JavaScript
