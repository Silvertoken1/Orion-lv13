export const productionConfig = {
  database: {
    url: process.env.DATABASE_URL || "",
    ssl: process.env.NODE_ENV === "production",
  },
  email: {
    host: process.env.SMTP_HOST || "",
    port: Number.parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
    },
    from: process.env.FROM_EMAIL || "",
  },
  payment: {
    paystack: {
      publicKey: process.env.PAYSTACK_PUBLIC_KEY || "",
      secretKey: process.env.PAYSTACK_SECRET_KEY || "",
    },
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000",
    jwtSecret: process.env.JWT_SECRET || "your-secret-key",
  },
  admin: {
    email: process.env.ADMIN_EMAIL || "",
    password: process.env.ADMIN_PASSWORD || "",
    phone: process.env.ADMIN_PHONE || "",
  },
}

export const validateProductionConfig = () => {
  const requiredEnvVars = [
    "DATABASE_URL",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "FROM_EMAIL",
    "PAYSTACK_PUBLIC_KEY",
    "PAYSTACK_SECRET_KEY",
    "NEXT_PUBLIC_APP_URL",
    "JWT_SECRET",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD",
    "ADMIN_PHONE",
  ]

  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
  }
}
