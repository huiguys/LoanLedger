# LoanLeger Authentication Server

A secure authentication system with mobile OTP verification and password-based login.

## Features

- 📱 Mobile number + OTP verification
- 🔐 Mobile number + password login
- 🛡️ JWT token authentication with refresh tokens
- ⚡ Rate limiting for security
- 🔒 Password hashing with bcrypt
- ✅ Input validation and sanitization
- 📊 Session management
- 🔄 Secure password reset flow

## API Endpoints

### Authentication Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user with mobile number |
| POST | `/api/auth/send-otp` | Send OTP to mobile number |
| POST | `/api/auth/verify-otp` | Verify OTP and complete registration |
| POST | `/api/auth/login` | Login with mobile number and password |
| POST | `/api/auth/set-password` | Set password after OTP verification |
| POST | `/api/auth/reset-password` | Reset password using OTP |
| POST | `/api/auth/refresh-token` | Refresh access token |
| POST | `/api/auth/logout` | Logout and invalidate tokens |
| GET | `/api/auth/profile` | Get user profile (protected) |

## Installation

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the server:**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Database Schema

The system uses SQLite with the following tables:

- **users**: User accounts with mobile numbers and passwords
- **otps**: OTP verification codes with expiry
- **sessions**: JWT refresh token sessions

## Security Features

### Rate Limiting
- OTP requests: 3 per 15 minutes per IP+mobile
- Login attempts: 5 per 15 minutes per IP
- Registration: 3 per hour per IP
- General API: 100 per 15 minutes per IP

### Password Security
- Minimum 6 characters
- Must contain uppercase, lowercase, and number
- Hashed with bcrypt (12 salt rounds)

### Token Security
- Access tokens: 15 minutes expiry
- Refresh tokens: 7 days expiry
- Secure token storage in database

### Input Validation
- Mobile number format validation
- OTP format validation
- Password strength requirements
- SQL injection prevention

## Usage Examples

### 1. Register New User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber": "9876543210"}'
```

### 2. Verify OTP
```bash
curl -X POST http://localhost:3001/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber": "9876543210", "otp": "123456"}'
```

### 3. Set Password
```bash
curl -X POST http://localhost:3001/api/auth/set-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"password": "SecurePass123"}'
```

### 4. Login with Password
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber": "9876543210", "password": "SecurePass123"}'
```

## Response Format

All API responses follow this structure:

```json
{
  "success": true|false,
  "message": "Response message",
  "data": {
    // Response data
  },
  "errors": [
    // Validation errors (if any)
  ]
}
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict (user already exists)
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error

## Production Deployment

1. **Environment Variables:**
   - Set strong JWT secrets (min 32 characters)
   - Configure SMS service credentials
   - Set appropriate CORS origins

2. **Database:**
   - Consider PostgreSQL/MySQL for production
   - Set up database backups
   - Configure connection pooling

3. **Security:**
   - Use HTTPS in production
   - Set up proper firewall rules
   - Monitor for suspicious activity
   - Regular security updates

4. **SMS Integration:**
   - Integrate with Twilio, AWS SNS, or similar
   - Handle SMS delivery failures
   - Monitor SMS costs and usage

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

## License

MIT License