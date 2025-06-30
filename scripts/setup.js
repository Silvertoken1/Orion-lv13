const fs = require("fs")
const path = require("path")

// Create data directory
const dataDir = path.join(process.cwd(), "data")
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
  console.log("✅ Created data directory")
}

// Create .env.local if it doesn't exist
const envLocal = path.join(process.cwd(), ".env.local")
const envExample = path.join(process.cwd(), ".env.example")

if (!fs.existsSync(envLocal) && fs.existsSync(envExample)) {
  fs.copyFileSync(envExample, envLocal)
  console.log("✅ Created .env.local from .env.example")
  console.log("⚠️  Please update .env.local with your actual values")
}

console.log("🎉 Setup complete!")
