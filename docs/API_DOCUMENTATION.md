# YallaCoins API Documentation

Complete REST API for YallaCoins withdrawal system serving both public creator portal and internal admin panel.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All admin endpoints require JWT token in Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Modules & Endpoints

### 1. Authentication Module (`/auth`)

#### Login
- **POST** `/auth/login`
- **Body:**
  ```json
  {
    "email": "admin@yallacoins.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "admin@yallacoins.com",
      "name": "Admin Name",
      "role": "super_admin"
    }
  }
  ```

#### Register User (Admin Only)
- **POST** `/auth/register`
- **Body:**
  ```json
  {
    "name": "New User",
    "email": "user@yallacoins.com",
    "password": "password123",
    "role": "support_agent",
    "phone": "+1234567890"
  }
  ```

#### Get Current User Profile
- **GET** `/auth/me`
- **Auth Required:** Yes

#### Get All Users (Admin Only)
- **GET** `/auth/users`
- **Auth Required:** Yes (Super Admin only)

---

### 2. Withdrawal Requests Module (`/withdrawal-requests`)

#### Submit Withdrawal Request (Public)
- **POST** `/withdrawal-requests`
- **Body:**
  ```json
  {
    "app": "bigo",
    "accountId": "creator123",
    "phoneNumber": "+201234567890",
    "country": "EG",
    "payoutMethod": "Mobile Wallet",
    "payoutInfo": "01234567890",
    "amountInBeans": 50000,
    "proofFileId": "optional-file-uuid"
  }
  ```
- **Response:** Request object with immutable snapshot

#### Get All Requests (Paginated)
- **GET** `/withdrawal-requests?status=pending&app=bigo&country=EG&page=1&limit=20`
- **Auth Required:** No (public)

#### Get Request by ID
- **GET** `/withdrawal-requests/:id`
- **Auth Required:** No (public)

#### Update Request Status (Admin)
- **PATCH** `/withdrawal-requests/:id/status`
- **Auth Required:** Yes (Operations/Finance Admin)
- **Body:**
  ```json
  {
    "status": "approved",
    "notes": "Verified account"
  }
  ```

#### Reject Request (Admin)
- **PATCH** `/withdrawal-requests/:id/reject`
- **Auth Required:** Yes (Operations Admin)
- **Body:**
  ```json
  {
    "reason": "Account verification failed"
  }
  ```

#### Assign Request (Admin)
- **PATCH** `/withdrawal-requests/:id/assign`
- **Auth Required:** Yes (Operations Admin)
- **Body:**
  ```json
  {
    "assignedTo": "user-id"
  }
  ```

#### Get Dashboard Stats
- **GET** `/withdrawal-requests/dashboard/stats`
- **Auth Required:** Yes

---

### 3. Rates Module (`/rates`)

#### Create App Rate (Admin)
- **POST** `/rates`
- **Auth Required:** Yes (Super Admin, Rate Manager)
- **Body:**
  ```json
  {
    "appName": "bigo",
    "conversionUnitLabel": "Beans",
    "conversionLogic": "1000 Beans = 1 USD",
    "publicRate": 0.001,
    "internalRate": 0.0009,
    "feeValue": 5,
    "minimumWithdrawal": 10,
    "etaText": "24-48 hours"
  }
  ```

#### Get All Rates (Public)
- **GET** `/rates`

#### Get Rate by App Name (Public)
- **GET** `/rates/:appName`

#### Update Rate (Admin)
- **PATCH** `/rates/:id`
- **Auth Required:** Yes (Super Admin, Rate Manager)
- **Body:**
  ```json
  {
    "publicRate": 0.0011,
    "feeValue": 6,
    "reason": "Market adjustment"
  }
  ```

#### Get Rate History (Admin)
- **GET** `/rates/:id/history`
- **Auth Required:** Yes

#### Disable Rate (Admin)
- **PATCH** `/rates/:id/disable`
- **Auth Required:** Yes (Super Admin, Rate Manager)

---

### 4. Countries & Payout Methods Module (`/countries`)

#### Create Country (Admin)
- **POST** `/countries`
- **Auth Required:** Yes (Super Admin, Rate Manager)
- **Body:**
  ```json
  {
    "name": "Egypt",
    "code": "EG",
    "currency": "EGP"
  }
  ```

#### Get All Countries (Public)
- **GET** `/countries`

#### Get Country Details (Public)
- **GET** `/countries/:code`

#### Get Country Payout Methods (Public)
- **GET** `/countries/:code/payout-methods`

#### Create Payout Method (Admin)
- **POST** `/countries/:code/payout-methods`
- **Auth Required:** Yes (Super Admin, Rate Manager)
- **Body:**
  ```json
  {
    "name": "Mobile Wallet",
    "feeType": "fixed",
    "feeValue": 1,
    "etaText": "Instant - 1 hour",
    "recommended": true,
    "sortOrder": 0
  }
  ```

#### Update Payout Method (Admin)
- **PATCH** `/countries/payout-methods/:id`
- **Auth Required:** Yes (Super Admin, Rate Manager)

#### Deactivate Payout Method (Admin)
- **PATCH** `/countries/payout-methods/:id/deactivate`
- **Auth Required:** Yes (Super Admin, Rate Manager)

---

### 5. File Upload Module (`/files`)

#### Upload File
- **POST** `/files/upload?requestId=optional-request-id`
- **Auth Required:** No (public)
- **Content-Type:** multipart/form-data
- **Max Size:** 5MB
- **Allowed Types:** JPEG, PNG, PDF, WebP

#### Get File by ID
- **GET** `/files/:id`

#### Get Files by Request ID
- **GET** `/files/request/:requestId`

#### Delete File (Admin)
- **DELETE** `/files/:id`
- **Auth Required:** Yes

#### Download File
- **GET** `/files/download/:filename`

---

### 6. Audit Log Module (`/audit-logs`)

#### Get Audit Logs (Admin Only)
- **GET** `/audit-logs?userId=&action=&entityType=&page=1&limit=50`
- **Auth Required:** Yes (Super Admin, Auditor)

#### Get Entity Audit Trail (Admin Only)
- **GET** `/audit-logs/entity/:entityType/:entityId`
- **Auth Required:** Yes (Super Admin, Auditor)

#### Get User Activity (Admin Only)
- **GET** `/audit-logs/user/:userId?limit=50`
- **Auth Required:** Yes (Super Admin, Auditor)

---

### 7. Dashboard Module (`/dashboard`)

#### Get Dashboard Summary (Admin)
- **GET** `/dashboard/summary`
- **Auth Required:** Yes
- **Response:**
  ```json
  {
    "stats": {
      "totalRequests": 150,
      "pending": 10,
      "underReview": 5,
      "approved": 20,
      "needsCorrection": 2,
      "rejected": 3,
      "paid": 110
    },
    "totalPayoutValue": 5500.50,
    "timestamp": "2024-04-02T10:00:00Z"
  }
  ```

#### Get Requests by App (Admin)
- **GET** `/dashboard/requests-by-app`
- **Auth Required:** Yes

#### Get Requests by Country (Admin)
- **GET** `/dashboard/requests-by-country`
- **Auth Required:** Yes

#### Get Requests by Status (Admin)
- **GET** `/dashboard/requests-by-status`
- **Auth Required:** Yes

#### Get Recent Requests (Admin)
- **GET** `/dashboard/recent-requests?limit=10`
- **Auth Required:** Yes

#### Get App Rates (Admin)
- **GET** `/dashboard/app-rates`
- **Auth Required:** Yes

#### Get Payout Trends (Admin)
- **GET** `/dashboard/payout-trends?days=30`
- **Auth Required:** Yes

---

### 8. Reports Module (`/reports`)

#### Generate Requests Report (Admin)
- **GET** `/reports/requests?startDate=2024-01-01&endDate=2024-04-02&app=bigo&country=EG&status=paid`
- **Auth Required:** Yes (Super Admin, Operations Admin, Finance Admin, Auditor)

#### Generate Payout Report (Admin)
- **GET** `/reports/payouts?startDate=2024-01-01&endDate=2024-04-02`
- **Auth Required:** Yes

#### Generate Revenue Report (Admin)
- **GET** `/reports/revenue?startDate=2024-01-01&endDate=2024-04-02`
- **Auth Required:** Yes

---

## Request Snapshot Structure

Every withdrawal request stores an immutable snapshot containing:

```json
{
  "conversionLogic": {
    "appName": "bigo",
    "conversionUnitLabel": "Beans",
    "beansToUSD": 0.001
  },
  "rateSnapshot": {
    "publicRate": 0.001,
    "internalRate": 0.0009,
    "feeValue": 5,
    "minimumWithdrawal": 10,
    "etaText": "24-48 hours"
  },
  "payoutMethodSnapshot": {
    "name": "Mobile Wallet",
    "feeValue": 1,
    "feeType": "fixed",
    "etaText": "Instant - 1 hour"
  },
  "calculationSnapshot": {
    "beansSubmitted": 50000,
    "conversionRate": 0.001,
    "usdBeforeAppFee": 50,
    "appFeeAmount": 2.5,
    "appFeePercentage": 5,
    "usdAfterAppFee": 47.5,
    "payoutFeeAmount": 1,
    "payoutFeePercentage": 0,
    "estimatedPayout": 46.5,
    "currency": "EGP"
  }
}
```

This ensures historical accuracy - even if rates change, the original calculation is preserved.

---

## User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Super Admin** | Full access to all modules |
| **Operations Admin** | Dashboard, Requests (review/approve/reject), Reports |
| **Finance Admin** | Dashboard, Requests (mark paid), Reports |
| **Rate Manager** | Dashboard, Rates, Countries, Payout Methods |
| **Support Agent** | Dashboard, Requests (view/note), limited Reports |
| **Auditor** | Dashboard, Audit Log, Reports (read-only) |

---

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "BadRequest"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Currently no rate limiting. Implement in production.

## CORS

Configure CORS for:
- Public withdrawal portal: `http://localhost:3001`
- Admin portal: `http://localhost:3002`

---

## Database Schema

### Core Entities
- `users` - Admin users with roles
- `withdrawal_requests` - Withdrawal requests with status tracking
- `request_snapshots` - Immutable snapshots of calculations
- `app_rates` - Conversion rates per app with version history
- `countries` - Supported countries
- `payout_methods` - Payment methods per country
- `file_uploads` - Uploaded files metadata
- `audit_logs` - Complete audit trail

All entities include timestamps (`createdAt`, `updatedAt`) for tracking.

---

## Setup & Deployment

### Local Development
```bash
# Install dependencies
pnpm install

# Create .env file
cp .env.example .env

# Run database migrations
npm run typeorm migration:run

# Seed database
npm run seed

# Start development server
pnpm start:dev
```

### Production Deployment
```bash
# Build
pnpm build

# Run migrations
npm run typeorm migration:run

# Start
pnpm start
```

---

## Environment Variables

```env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=yallacoins_db

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRATION=24h

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# API URLs
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001
ADMIN_URL=http://localhost:3002
```

---

## Support

For API issues or questions, contact the development team.
