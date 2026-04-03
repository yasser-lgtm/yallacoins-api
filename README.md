# YallaCoins API

Shared backend API for YallaCoins creator and admin portals. Handles withdrawal requests, user authentication, rate management, and more.

## Features

- 🔐 **JWT Authentication** - Secure user authentication
- 💰 **Withdrawal Management** - Process and track withdrawal requests
- 📊 **Rate Management** - Manage app conversion rates and fees
- 🌍 **Country & Payout Methods** - Configure payment methods by country
- 📁 **File Upload** - Secure proof file uploads
- 📝 **Audit Logging** - Complete audit trail of all actions
- 🔄 **Request Snapshots** - Immutable historical data
- 🌐 **CORS Support** - Configured for multiple frontends

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase)
- **ORM**: TypeORM
- **Authentication**: JWT
- **Validation**: class-validator

## Prerequisites

- Node.js 18+
- npm or pnpm
- PostgreSQL 12+ (Supabase)

## Local Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/yallacoins-api.git
cd yallacoins-api
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Configure Environment

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and set:

```env
DATABASE_URL=postgresql://user:password@db.supabase.co:5432/postgres
JWT_SECRET=your-secret-key-min-32-chars
NODE_ENV=development
PORT=3000
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

### 4. Setup Database

```bash
# Run migrations
npm run typeorm migration:run

# Seed initial data
npm run seed
```

### 5. Run Development Server

```bash
npm run start:dev
```

API available at: `http://localhost:3000/api`

## Available Commands

```bash
# Development
npm run start:dev

# Production
npm run start:prod

# Build
npm run build

# Database migrations
npm run typeorm migration:generate -- -n MigrationName
npm run typeorm migration:run

# Seed database
npm run seed

# Tests
npm run test
npm run test:e2e
npm run test:cov
```

## Project Structure

```
src/
├── modules/              # Feature modules
│   ├── auth/            # Authentication
│   ├── withdrawal/      # Withdrawal requests
│   ├── rates/           # App rates
│   ├── countries/       # Countries & payout methods
│   ├── files/           # File uploads
│   └── audit-log/       # Audit logging
├── database/            # Database config and migrations
├── config/              # Configuration
├── common/              # Common utilities
├── main.ts              # Entry point
└── app.module.ts        # Root module
```

## Module Overview

### Auth Module
- User authentication
- JWT token generation
- Password hashing
- Role-based access control

### Withdrawal Module
- Create withdrawal requests
- Update request status
- Retrieve request details
- Track request history

### Rates Module
- Fetch app conversion rates
- Update rates and fees
- Manage rate history

### Countries Module
- Manage supported countries
- Configure payout methods
- Set country-specific fees

### Files Module
- Upload proof files
- Validate file types
- Store file metadata

### Audit Log Module
- Track all system actions
- Log user activities
- Maintain audit trail

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register (admin only)
- `GET /api/auth/me` - Get current user

### Withdrawal Requests
- `GET /api/withdrawal-requests` - List requests
- `GET /api/withdrawal-requests/:id` - Get request details
- `POST /api/withdrawal-requests` - Create request
- `PATCH /api/withdrawal-requests/:id` - Update request
- `DELETE /api/withdrawal-requests/:id` - Delete request

### Rates
- `GET /api/rates` - List all rates
- `GET /api/rates/:id` - Get rate details
- `PATCH /api/rates/:id` - Update rate

### Countries
- `GET /api/countries` - List countries
- `GET /api/countries/:id` - Get country details
- `POST /api/countries` - Create country
- `PATCH /api/countries/:id` - Update country

### Payout Methods
- `GET /api/payout-methods` - List methods
- `GET /api/payout-methods/:id` - Get method details
- `POST /api/payout-methods` - Create method
- `PATCH /api/payout-methods/:id` - Update method

### Files
- `POST /api/files/upload` - Upload file
- `GET /api/files/:id` - Get file details
- `DELETE /api/files/:id` - Delete file

### Audit Log
- `GET /api/audit-log` - List audit entries
- `GET /api/audit-log/:id` - Get entry details

## Database Setup

### Schema Creation

The database schema is defined in `schema.sql`. To create tables:

1. Connect to your Supabase database
2. Run the SQL from `schema.sql`
3. Verify all tables are created

### Seed Data

Run the seed script to populate initial data:

```bash
npm run seed
```

This creates:
- 6 admin users with different roles
- 3 app rates (Bigo, Kiti, Xena)
- 18 MENA countries
- Payout methods per country

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret key for JWT (min 32 chars) |
| `NODE_ENV` | Yes | Environment (development/production) |
| `PORT` | No | Server port (default: 3000) |
| `CORS_ORIGINS` | No | Allowed CORS origins |

## Deployment

### Railway

```bash
# Connect repository
railway link

# Deploy
railway up
```

Set environment variables in Railway dashboard.

### Render

```bash
# Create new service from GitHub
# Select Node.js environment
# Set environment variables
# Deploy
```

### DigitalOcean

```bash
# Create App Platform service
# Connect GitHub repository
# Set environment variables
# Deploy
```

### Docker

```bash
docker build -t yallacoins-api .
docker run -p 3000:3000 \
  -e DATABASE_URL=... \
  -e JWT_SECRET=... \
  yallacoins-api
```

## Security

- Never commit `.env` files with real credentials
- Always use HTTPS in production
- Keep dependencies updated
- Use strong JWT secrets (min 32 characters)
- Validate all inputs
- Use parameterized queries (TypeORM handles this)
- Enable CORS only for known origins
- Implement rate limiting in production

## Troubleshooting

### Database Connection Failed

- Verify `DATABASE_URL` is correct
- Check Supabase project is running
- Verify network connectivity
- Check password doesn't have special characters needing escaping

### JWT Errors

- Verify `JWT_SECRET` is set
- Check token format in Authorization header
- Verify token hasn't expired

### CORS Errors

- Add frontend URLs to `CORS_ORIGINS`
- Verify frontend is making requests to correct API URL
- Check browser console for specific CORS error

### Port Already in Use

```bash
# Use different port
PORT=3001 npm run start:dev
```

## Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit pull request

## License

Proprietary - YallaCoins

## Support

For issues or questions, contact: support@yallacoins.com

## Related Repositories

- [yallacoins-withdrawal](https://github.com/yourusername/yallacoins-withdrawal) - Creator portal
- [yallacoins-admin](https://github.com/yourusername/yallacoins-admin) - Admin portal
# Build timestamp: Fri Apr  3 18:00:59 EDT 2026
