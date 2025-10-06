# 🚨 HƯỚNG DẪN SỬA LỖI 401 UNAUTHORIZED VÀ DATABASE LOADING

## 📋 **Tóm tắt vấn đề:**
Từ hình ảnh console, tôi thấy bạn đang gặp lỗi **401 Unauthorized** khi gọi API `/api/readers`. Điều này có nghĩa là:
1. Server chưa chạy hoặc không thể kết nối database
2. Thiếu file cấu hình `.env`
3. Chưa đăng nhập hoặc token đã hết hạn

## 🔧 **CÁC BƯỚC SỬA LỖI:**

### **Bước 1: Cài đặt Node.js (nếu chưa có)**
```bash
# Tải từ: https://nodejs.org/
# Hoặc dùng Chocolatey:
choco install nodejs
```

### **Bước 2: Chạy script PowerShell để sửa tất cả vấn đề**
```powershell
# Mở PowerShell với quyền Administrator
# Chạy script:
.\fix_all_issues.ps1
```

### **Bước 3: Hoặc làm thủ công**

#### 3.1. Tạo file .env cho server:
```bash
# Tạo file server/.env với nội dung:
DATABASE_URL="sqlserver://localhost:1433;database=UTE_Library;user=sa;password=123456;encrypt=true;trustServerCertificate=true"
PORT=3000
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
DB_USER=sa
DB_PASSWORD=123456
DB_SERVER=localhost
DB_DATABASE=UTE_Library
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=true
```

#### 3.2. Cài đặt dependencies:
```bash
cd server
npm install
```

#### 3.3. Generate Prisma client:
```bash
npx prisma generate
```

#### 3.4. Chạy server:
```bash
npm start
```

### **Bước 4: Kiểm tra kết nối**
- Server sẽ chạy tại: `http://localhost:3000`
- Kiểm tra console không có lỗi database connection

### **Bước 5: Đăng nhập vào hệ thống**
1. Mở trình duyệt: `http://localhost:3000`
2. Đăng nhập với tài khoản admin/staff
3. Kiểm tra localStorage có token không

## 🔍 **KIỂM TRA VẤN ĐỀ:**

### **1. Kiểm tra Server Status:**
```bash
# Test API endpoint
curl http://localhost:3000/api/stats/dashboard
```

### **2. Kiểm tra Database Connection:**
- Đảm bảo SQL Server đang chạy
- Database `UTE_Library` đã được tạo
- User `sa` có quyền truy cập

### **3. Kiểm tra Authentication:**
- Mở DevTools → Application → Local Storage
- Kiểm tra có `token` không
- Nếu không có token → cần đăng nhập lại

## 🐛 **TROUBLESHOOTING:**

### **Lỗi "Cannot connect to database":**
1. Kiểm tra SQL Server đang chạy
2. Kiểm tra connection string trong .env
3. Kiểm tra firewall settings

### **Lỗi "401 Unauthorized":**
1. Kiểm tra có token trong localStorage không
2. Nếu không có → đăng nhập lại
3. Nếu có → kiểm tra token có hợp lệ không

### **Lỗi "Node not found":**
1. Cài đặt Node.js từ https://nodejs.org/
2. Restart terminal/command prompt

### **Lỗi PowerShell "&& not valid":**
```powershell
# Thay vì: cd server && npm start
# Dùng: 
cd server
npm start
```

## ✅ **SAU KHI SỬA XONG:**

1. **Server chạy thành công** tại `http://localhost:3000`
2. **Đăng nhập** với tài khoản admin/staff
3. **Kiểm tra** trang "Quản lý Độc giả" load được dữ liệu
4. **Không còn lỗi 401** trong console

## 📞 **HỖ TRỢ:**
Nếu vẫn gặp vấn đề:
1. Kiểm tra console logs của server
2. Kiểm tra Network tab trong browser DevTools  
3. Kiểm tra database connection status
4. Đảm bảo đã đăng nhập với token hợp lệ

