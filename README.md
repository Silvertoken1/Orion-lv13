# 🌟 Bright Orion MLM Platform

A complete Multi-Level Marketing platform with user management, stockist network, commission tracking, and admin panel.

## ✨ Features

- 🔐 **Complete Authentication System**
- 👥 **User Dashboard & Profile Management**
- 🏪 **Stockist Network & Inventory Management**
- 💰 **Commission Tracking & Payments**
- 🛠️ **Admin Panel with Full Control**
- 📧 **Email Notifications**
- 📱 **Mobile Responsive Design**
- 🎨 **Beautiful Animations & UI**

## 🚀 Quick Start

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Setup Environment
\`\`\`bash
# Copy environment file
cp .env.example .env.local

# Edit .env.local with your values
\`\`\`

### 3. Initialize Database
\`\`\`bash
npm run dev
# Visit: http://localhost:3000/api/init
\`\`\`

### 4. Login as Admin
- **Email**: admin@brightorian.com
- **Password**: admin123

## 📁 Project Structure

\`\`\`
bright-orion-mlm/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin panel pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── stockist/          # Stockist pages
│   └── api/               # API routes
├── components/            # Reusable components
├── lib/                   # Utilities & database
├── data/                  # File-based database
└── public/               # Static assets
\`\`\`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `JWT_SECRET` | Secret key for JWT tokens | ✅ |
| `ADMIN_EMAIL` | Admin email address | ✅ |
| `ADMIN_PASSWORD` | Admin password | ✅ |
| `SMTP_HOST` | Email server host | ❌ |
| `SMTP_USER` | Email username | ❌ |
| `SMTP_PASS` | Email password | ❌ |
| `PAYSTACK_PUBLIC_KEY` | Paystack public key | ❌ |
| `PAYSTACK_SECRET_KEY` | Paystack secret key | ❌ |

## 🏗️ Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy!

### Other Platforms
- Railway
- Netlify
- DigitalOcean App Platform
- AWS Amplify

## 📊 Business Model

- **Package Price**: ₦36,000
- **Stockist Wholesale**: ₦30,000
- **Stockist Commission**: 10%
- **Referral Commissions**: Multi-level structure

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Input validation
- XSS protection

## 📱 Mobile Support

- Fully responsive design
- Touch-friendly interface
- Progressive Web App ready
- Offline capability

## 🎨 Design System

- Tailwind CSS
- Radix UI components
- Custom animations
- Glass morphism effects
- Gradient backgrounds

## 📞 Support

For support and questions:
- Email: support@brightorian.com
- Documentation: [Link to docs]
- GitHub Issues: [Link to issues]

## 📄 License

This project is proprietary software. All rights reserved.

---

Made with ❤️ by the Bright Orion Team
