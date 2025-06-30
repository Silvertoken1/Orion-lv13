# Production Deployment Guide

## Prerequisites

1. **Environment Variables Setup**
   - Set all required environment variables in your hosting platform
   - Ensure database connection string is configured
   - Configure email SMTP settings
   - Set up Paystack API keys

2. **Database Setup**
   - Create production database
   - Run migration scripts
   - Initialize admin user and PINs

## Deployment Steps

### 1. Environment Variables
\`\`\`bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourdomain.com

# Payment Gateway
PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
PAYSTACK_SECRET_KEY=sk_live_xxxxx

# Application
NEXT_PUBLIC_APP_URL=https://yourdomain.com
JWT_SECRET=your-super-secret-jwt-key

# Admin Configuration
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure-admin-password
ADMIN_PHONE=+234xxxxxxxxxx
\`\`\`

### 2. Database Initialization
\`\`\`bash
# Run database migrations
npm run db:migrate

# Initialize production database
npm run init:prod
\`\`\`

### 3. Build and Deploy
\`\`\`bash
# Build the application
npm run build

# Start production server
npm start
\`\`\`

## Post-Deployment Checklist

- [ ] Admin login works
- [ ] User registration works
- [ ] Email notifications are sent
- [ ] Payment processing works
- [ ] PIN generation and validation works
- [ ] Matrix calculations are correct
- [ ] All API endpoints respond correctly

## Monitoring

- Monitor application logs
- Check database performance
- Monitor email delivery rates
- Track payment success rates
- Monitor user registration flow

## Security Considerations

- Use strong JWT secrets
- Enable HTTPS
- Secure database connections
- Validate all user inputs
- Implement rate limiting
- Regular security updates
