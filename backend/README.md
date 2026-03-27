# Health App Backend API

A comprehensive health and wellness application backend built with Node.js, Express, and TypeORM.

## Features

- **User Authentication**: Register, login, password reset, email verification
- **Health Tracking**: Record and track vital signs (heart rate, blood pressure, etc.)
- **Nutrition Logging**: Track meals, calories, and macronutrients
- **Fitness Tracking**: Log workouts, exercises, and fitness activities
- **Telehealth**: Book and manage appointments with doctors
- **Analytics**: Health scores, trends, and personalized recommendations
- **ML Integration**: Food recognition, sleep analysis, health risk prediction
- **Notifications**: Email and SMS notifications
- **Subscription Management**: Tiered subscription plans with Stripe integration

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT
- **Validation**: express-validator
- **Logging**: Winston

## Project Structure

```
backend/
├── src/
│   ├── api/
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # Route definitions
│   │   └── validators/      # Input validation
│   ├── config/              # Configuration files
│   ├── middlewares/         # Express middlewares
│   ├── models/              # TypeORM entities
│   ├── services/            # Business logic
│   ├── utils/               # Utility functions
│   ├── app.ts               # Express app setup
│   └── server.ts            # Application entry point
├── .env.example             # Environment variables template
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration

5. Run database migrations:
```bash
npm run migration:run
```

6. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/verify-email` - Verify email address
- `GET /api/auth/me` - Get current user profile

### Health
- `POST /api/health/records` - Create health record
- `GET /api/health/records` - Get health records
- `DELETE /api/health/records/:id` - Delete health record

### Nutrition
- `POST /api/nutrition/logs` - Create nutrition log
- `GET /api/nutrition/logs` - Get nutrition logs
- `GET /api/nutrition/daily-summary` - Get daily nutrition summary

### Fitness
- `POST /api/fitness/logs` - Create fitness log
- `GET /api/fitness/logs` - Get fitness logs
- `GET /api/fitness/stats` - Get fitness statistics

### Telehealth
- `GET /api/doctors` - Get list of doctors
- `POST /api/appointments` - Book appointment
- `GET /api/appointments` - Get user appointments
- `PUT /api/appointments/:id/confirm` - Confirm appointment
- `PUT /api/appointments/:id/cancel` - Cancel appointment

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment | development |
| PORT | Server port | 3000 |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DB_USER | Database user | postgres |
| DB_PASSWORD | Database password | postgres |
| DB_NAME | Database name | health_app |
| JWT_SECRET | JWT secret key | - |
| JWT_EXPIRES_IN | Token expiration | 7d |

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run migration:generate` - Generate new migration
- `npm run migration:run` - Run migrations

## License

MIT
