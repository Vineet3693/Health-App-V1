# Health App Backend API

A comprehensive RESTful API for a Health & Wellness Application built with Node.js, Express, and TypeScript.

## Features

- 🔐 **Authentication & Authorization** - JWT-based auth with refresh tokens
- 👥 **User Management** - Profile management, preferences, and settings
- 📊 **Health Tracking** - Vitals, symptoms, medications, and health records
- 🏃 **Fitness Tracking** - Workouts, activities, and exercise logs
- 🥗 **Nutrition Tracking** - Meal planning, calorie counting, and macro tracking
- 💊 **Telehealth** - Appointment scheduling and video consultations
- 📈 **Analytics** - Health insights and progress tracking
- 📧 **Notifications** - Email and SMS notifications
- ☁️ **File Upload** - S3 integration for file storage
- 📚 **API Documentation** - Swagger/OpenAPI documentation

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM
- **Cache**: Redis
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: class-validator, express-validator
- **Documentation**: Swagger UI
- **Testing**: Jest
- **Logging**: Winston

## Project Structure

```
backend/
├── src/
│   ├── api/
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # Route definitions
│   │   ├── validators/      # Input validation schemas
│   │   └── middlewares/     # Custom middlewares
│   ├── config/              # Configuration files
│   ├── database/
│   │   ├── migrations/      # Database migrations
│   │   └── seeds/           # Database seeders
│   ├── interfaces/          # TypeScript interfaces
│   ├── middlewares/         # Express middlewares
│   ├── models/              # TypeORM entities
│   ├── services/            # Business logic
│   ├── utils/               # Utility functions
│   ├── app.ts               # Express app setup
│   └── server.ts            # Application entry point
├── tests/                   # Test files
├── docs/                    # Documentation
├── uploads/                 # Uploaded files
├── logs/                    # Application logs
├── .env.example             # Environment variables template
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 13 or higher
- Redis 6 or higher
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
npm run migrate
```

6. Seed the database (optional):
```bash
npm run seed
```

7. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:3000/api-docs`
- OpenAPI JSON: `http://localhost:3000/api-docs.json`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run migrate` | Run database migrations |
| `npm run seed` | Seed database with initial data |

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `POST /api/v1/auth/verify-email` - Verify email address

### Users
- `GET /api/v1/users/profile` - Get current user profile
- `PUT /api/v1/users/profile` - Update profile
- `DELETE /api/v1/users/account` - Delete account

### Health
- `GET /api/v1/health/records` - Get health records
- `POST /api/v1/health/records` - Create health record
- `GET /api/v1/health/vitals` - Get vitals history
- `POST /api/v1/health/vitals` - Record vitals

### Fitness
- `GET /api/v1/fitness/workouts` - Get workouts
- `POST /api/v1/fitness/workouts` - Log workout
- `GET /api/v1/fitness/stats` - Get fitness statistics

### Nutrition
- `GET /api/v1/nutrition/meals` - Get meals
- `POST /api/v1/nutrition/meals` - Log meal
- `GET /api/v1/nutrition/daily-summary` - Get daily nutrition summary

### Telehealth
- `GET /api/v1/telehealth/appointments` - Get appointments
- `POST /api/v1/telehealth/appointments` - Book appointment
- `GET /api/v1/telehealth/providers` - Get healthcare providers

## Testing

Run tests:
```bash
npm run test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Deployment

### Docker

Build and run with Docker:
```bash
npm run docker:build
npm run docker:run
```

### Production

1. Build the application:
```bash
npm run build
```

2. Set production environment variables
3. Start the server:
```bash
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@healthapp.com or open an issue in the repository.
