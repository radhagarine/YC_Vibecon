# Business Profile Feature Contracts

## Overview
Add profile management functionality for small business users to configure their business details for AIRA voice agent.

## Backend Implementation

### 1. Database Model - BusinessProfile

```python
- user_id: str (references User.id)
- business_name: str
- business_type: str (from predefined list)
- custom_services: List[str] (array of custom service names)
- business_phone: str
- created_at: datetime
- updated_at: datetime
```

### 2. Predefined Business Types
- Restaurant / Cafe
- Retail Store
- Medical / Dental Office
- Legal Services
- Salon / Spa
- Fitness Center / Gym
- Real Estate
- Accounting / Financial Services
- Consulting
- Home Services (Plumbing, Electrical, etc.)
- Other

### 3. API Endpoints

#### GET /api/profile
**Purpose**: Get current user's business profile
**Auth**: Required (session token)
**Output**: BusinessProfile object or 404 if not exists

#### POST /api/profile
**Purpose**: Create business profile for current user
**Auth**: Required
**Input**: 
```json
{
  "business_name": "string",
  "business_type": "string",
  "custom_services": ["string"],
  "business_phone": "string"
}
```
**Output**: Created BusinessProfile

#### PUT /api/profile
**Purpose**: Update existing business profile
**Auth**: Required
**Input**: Same as POST
**Output**: Updated BusinessProfile

## Frontend Implementation

### 1. Profile Page Component (`/app/frontend/src/pages/Profile.jsx`)

**Features**:
- Form with business name input
- Dropdown for business type selection
- Dynamic list for adding/removing custom services
- Phone number input with validation
- Save button
- Success/error notifications

**Layout**:
- Header with user info
- Card-based form layout
- Responsive design matching Dashboard style

### 2. Dashboard Navigation Update

**Changes to Dashboard.jsx**:
- Add "Profile" navigation link
- Use React Router for navigation between Dashboard home and Profile page

### 3. Form Validation
- Business name: required, min 2 characters
- Business type: required, must be from predefined list
- Phone number: required, phone format validation
- Custom services: optional, can add multiple

## User Flow

1. User logs in → Dashboard
2. Click "Profile" in navigation
3. If no profile exists: Show empty form
4. If profile exists: Load and display existing data
5. User fills/updates form
6. Click "Save Profile"
7. Show success message
8. Profile data saved to database

## Testing Checklist
- [ ] Profile creation for new user
- [ ] Profile retrieval for existing user
- [ ] Profile update functionality
- [ ] Form validation working
- [ ] Custom services add/remove
- [ ] Phone number validation
- [ ] Navigation between Dashboard and Profile
- [ ] Auth protection (must be logged in)
