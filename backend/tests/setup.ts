import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock external dependencies
jest.mock('@sendgrid/mail');
jest.mock('twilio');
jest.mock('aws-sdk');

// Set test timeout
jest.setTimeout(10000);

// Global test setup
beforeAll(async () => {
  // Initialize test database connection if needed
});

afterAll(async () => {
  // Clean up test resources
});
