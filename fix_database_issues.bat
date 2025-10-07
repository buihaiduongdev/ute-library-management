# Database Configuration Script
# Tạo file .env cho server

echo "Tạo file cấu hình database..."

# Tạo file .env
cat > server/.env << 'EOF'
# Database Configuration
DATABASE_URL="sqlserver://localhost:1433;database=UTE_Library;user=sa;password=123456;encrypt=true;trustServerCertificate=true"

# Server Configuration  
PORT=3000

# JWT Secret
JWT_SECRET=your-secret-key-here

# Database Connection Details
DB_USER=sa
DB_PASSWORD=123456
DB_SERVER=localhost
DB_DATABASE=UTE_Library
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=true
EOF

echo "✅ File .env đã được tạo thành công!"
echo "📝 Vui lòng kiểm tra và cập nhật thông tin database trong file server/.env"
echo ""
echo "🔧 Các bước tiếp theo:"
echo "1. Cài đặt Node.js nếu chưa có"
echo "2. Chạy: cd server && npm install"
echo "3. Chạy: npx prisma generate"
echo "4. Chạy: npm start"

