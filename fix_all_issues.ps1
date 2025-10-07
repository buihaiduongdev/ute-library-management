# PowerShell Script để sửa lỗi database và authentication
# Chạy script này trong PowerShell

Write-Host "🔧 Đang sửa lỗi database và authentication..." -ForegroundColor Green

# 1. Tạo file .env cho server
Write-Host "📝 Tạo file .env..." -ForegroundColor Yellow
$envContent = @"
# Database Configuration
DATABASE_URL="sqlserver://localhost:1433;database=UTE_Library;user=sa;password=123456;encrypt=true;trustServerCertificate=true"

# Server Configuration  
PORT=3000

# JWT Secret
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h

# Database Connection Details
DB_USER=sa
DB_PASSWORD=123456
DB_SERVER=localhost
DB_DATABASE=UTE_Library
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=true
"@

$envContent | Out-File -FilePath "server\.env" -Encoding UTF8
Write-Host "✅ File .env đã được tạo!" -ForegroundColor Green

# 2. Cài đặt dependencies
Write-Host "📦 Cài đặt dependencies..." -ForegroundColor Yellow
Set-Location server
npm install
Write-Host "✅ Dependencies đã được cài đặt!" -ForegroundColor Green

# 3. Generate Prisma client
Write-Host "🔧 Generate Prisma client..." -ForegroundColor Yellow
npx prisma generate
Write-Host "✅ Prisma client đã được generate!" -ForegroundColor Green

# 4. Chạy server
Write-Host "🚀 Khởi động server..." -ForegroundColor Yellow
Write-Host "Server sẽ chạy tại: http://localhost:3000" -ForegroundColor Cyan
npm start

