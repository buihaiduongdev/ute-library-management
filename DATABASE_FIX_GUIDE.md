# 🔧 HƯỚNG DẪN SỬA LỖI DATABASE LOADING

## 📋 Các vấn đề đã được phát hiện và sửa:

### ✅ 1. **Sửa lỗi trong ReaderStatsController.js**
- Đã sửa tên model từ `phieuMuonTra` → `ChiTietMuon`
- Đã sửa tên model từ `docGia` → `DocGia`
- Đã sửa logic truy vấn để sử dụng đúng cấu trúc database
- Đã loại bỏ relation `TheDocGia` không tồn tại

### ✅ 2. **Sửa lỗi trong StatsController.js**
- Đã sửa điều kiện truy vấn từ `TrangThai: 'Đang mượn'` → `NgayTra: null`
- Đã sửa điều kiện từ `TrangThai: 'Khóa'` → `TrangThai: 'Khoa'`

### ✅ 3. **Sửa lỗi syntax trong reader-stats.js**
- Đã sửa thiếu dấu phẩy trong response JSON

## 🚀 Các bước để chạy dự án:

### Bước 1: Cài đặt Node.js
```bash
# Tải và cài đặt Node.js từ https://nodejs.org/
# Hoặc sử dụng Chocolatey:
choco install nodejs
```

### Bước 2: Tạo file cấu hình database
```bash
# Chạy script tạo file .env
./fix_database_issues.bat
```

### Bước 3: Cài đặt dependencies
```bash
cd server
npm install
```

### Bước 4: Generate Prisma client
```bash
npx prisma generate
```

### Bước 5: Chạy server
```bash
npm start
```

## 🔍 Kiểm tra kết nối database:

### 1. Kiểm tra file .env
Đảm bảo file `server/.env` có nội dung:
```
DATABASE_URL="sqlserver://localhost:1433;database=UTE_Library;user=sa;password=123456;encrypt=true;trustServerCertificate=true"
PORT=3000
```

### 2. Kiểm tra SQL Server
- Đảm bảo SQL Server đang chạy
- Database `UTE_Library` đã được tạo
- User `sa` có quyền truy cập

### 3. Test API endpoints
```bash
# Test dashboard stats
curl http://localhost:3000/api/stats/dashboard

# Test reader stats
curl http://localhost:3000/api/reader-stats/borrowing-status
```

## 🐛 Troubleshooting:

### Lỗi "Cannot connect to database"
1. Kiểm tra SQL Server đang chạy
2. Kiểm tra connection string trong .env
3. Kiểm tra firewall settings

### Lỗi "Model not found"
1. Chạy `npx prisma generate`
2. Kiểm tra schema.prisma có đúng không

### Lỗi "Node not found"
1. Cài đặt Node.js từ https://nodejs.org/
2. Restart terminal/command prompt

## 📞 Hỗ trợ:
Nếu vẫn gặp vấn đề, hãy kiểm tra:
1. Console logs của server
2. Network tab trong browser DevTools
3. Database connection status

