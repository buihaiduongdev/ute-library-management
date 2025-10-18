# 🚀 HƯỚNG DẪN NHANH - TEST API VỚI POSTMAN

## ⚡ SETUP NHANH (5 PHÚT)

### Bước 1: Import Postman Collection
1. Mở Postman
2. Click **Import** 
3. Chọn file `UTE_Library_API_Collection.postman_collection.json`
4. ✅ Done! Bạn đã có sẵn 20+ API requests

### Bước 2: Tạo Environment
1. Click **Environments** (bên trái)
2. Click **+** để tạo mới
3. Nhập các biến:
   ```
   base_url: http://localhost:5000
   api_prefix: /api
   token: (để trống)
   ```
4. Click **Save**

### Bước 3: Chạy Server
```bash
cd server
npm install
npm start
```

### Bước 4: Test API đầu tiên
1. Mở folder **1. Authentication**
2. Click request **[POST] Login**
3. Click **Send**
4. ✅ Nếu thấy status 200 và có token → Thành công!

---

## 📋 CHECKLIST TEST API

### ✅ Test cơ bản cho mỗi API:

#### 1. **Status Code**
- [ ] 200 OK - Request thành công
- [ ] 201 Created - Tạo mới thành công
- [ ] 400 Bad Request - Dữ liệu không hợp lệ
- [ ] 401 Unauthorized - Chưa đăng nhập/token sai
- [ ] 404 Not Found - Không tìm thấy
- [ ] 500 Internal Server Error - Lỗi server

#### 2. **Response Time**
- [ ] < 100ms - Excellent ⚡
- [ ] 100-300ms - Good ✅
- [ ] 300-500ms - Acceptable ⚠️
- [ ] > 500ms - Slow 🐌 (cần optimize)

#### 3. **Response Data**
- [ ] Có đúng fields cần thiết
- [ ] Data type đúng (string, number, array, object)
- [ ] Không có null/undefined không mong muốn
- [ ] Format đúng (date, email, phone...)

#### 4. **Security**
- [ ] API protected cần token
- [ ] Token sai → 401
- [ ] Token hết hạn → 401
- [ ] Không có sensitive data trong response

---

## 📊 MẪU GHI CHÚ NHANH

### Template cho mỗi API test:

```
📌 API: [Tên API]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📥 REQUEST:
   Method: GET/POST/PUT/DELETE
   URL: /api/...
   Headers: Authorization: Bearer xxx
   Body: { ... }

📤 RESPONSE:
   Status: 200 ✅ / 400 ❌
   Time: 145ms
   Size: 2.5 KB

🧪 TESTS:
   ✅ Status code correct
   ✅ Response time < 300ms
   ✅ Has required fields
   ✅ Data format valid

📝 NOTES:
   - Performance tốt
   - Không có lỗi
   - [Ghi chú đặc biệt nếu có]
```

---

## 🎯 CÁC THÔNG SỐ QUAN TRỌNG CẦN LƯU

### 1. Thông tin Request
```json
{
  "timestamp": "2024-10-13T10:30:00Z",
  "method": "POST",
  "url": "/api/books",
  "headers": {
    "Authorization": "Bearer xxx",
    "Content-Type": "application/json"
  },
  "body": { "title": "..." }
}
```

### 2. Thông tin Response
```json
{
  "statusCode": 200,
  "responseTime": 145,
  "responseSize": 2560,
  "body": { "id": 1, "title": "..." }
}
```

### 3. Thông tin Test Results
```json
{
  "totalTests": 5,
  "passed": 5,
  "failed": 0,
  "tests": [
    "✅ Status code is 200",
    "✅ Response time < 500ms",
    "✅ Has required fields"
  ]
}
```

---

## 📈 XEM PERFORMANCE STATS

### Sau khi test xong, xem thống kê:

#### 1. Thống kê tổng quan
```
GET http://localhost:5000/api/performance/stats
```

**Response:**
```json
{
  "totalRequests": 50,
  "averageTime": "0.234s",
  "minTime": "0.045s",
  "maxTime": "1.200s",
  "slowRequests": 5,
  "slowRequestsPercentage": "10.00%"
}
```

#### 2. Chi tiết logs
```
GET http://localhost:5000/api/performance/logs?limit=50
```

#### 3. Stats theo endpoint
```
GET http://localhost:5000/api/performance/endpoints
```

**Response:**
```json
[
  {
    "endpoint": "GET /api/books",
    "count": 10,
    "averageTime": "0.089s",
    "minTime": "0.067s",
    "maxTime": "0.156s"
  }
]
```

#### 4. Export toàn bộ dữ liệu
```
GET http://localhost:5000/api/performance/export
```
→ Tải về file JSON với tất cả dữ liệu

---

## 🎨 MẪU BẢNG EXCEL ĐƠN GIẢN

### Sheet 1: Tổng quan

| Chỉ số | Giá trị |
|--------|---------|
| Tổng số API test | 50 |
| API Pass | 45 |
| API Fail | 5 |
| Tỷ lệ Pass | 90% |
| Thời gian TB | 234ms |

### Sheet 2: Chi tiết từng API

| STT | Module | API Name | Method | Endpoint | Status | Time (ms) | Result | Note |
|-----|--------|----------|--------|----------|--------|-----------|--------|------|
| 1 | Auth | Login | POST | /api/auth/login | 200 | 145 | ✅ PASS | Token OK |
| 2 | Auth | Register | POST | /api/auth/register | 201 | 234 | ✅ PASS | |
| 3 | Books | Get All | GET | /api/books | 200 | 89 | ✅ PASS | 50 records |
| 4 | Books | Create | POST | /api/books | 201 | 178 | ✅ PASS | |
| 5 | Books | Update | PUT | /api/books/1 | 200 | 123 | ✅ PASS | |

### Sheet 3: Bugs phát hiện

| Bug ID | Module | API | Mô tả | Mức độ | Status |
|--------|--------|-----|-------|--------|--------|
| BUG-001 | Statistics | GET /api/statistics/report | Response time > 1s | Medium | Open |
| BUG-002 | Auth | POST /api/auth/register | Không validate email | Medium | Open |

---

## 🔥 TIPS PRO

### 1. Sử dụng Collection Runner
- Chạy tất cả API cùng lúc
- Xem tổng quan kết quả
- Export report tự động

### 2. Sử dụng Environment Variables
- Không cần nhập lại token
- Dễ dàng switch giữa dev/prod
- Tự động lưu IDs

### 3. Viết Test Scripts
- Tự động validate response
- Không cần check thủ công
- Phát hiện lỗi nhanh hơn

### 4. Sử dụng Pre-request Scripts
- Auto login khi token hết hạn
- Generate test data tự động
- Setup data trước khi test

### 5. Organize Collection
- Chia thành folders theo module
- Đặt tên rõ ràng
- Thêm description cho mỗi request

---

## ⚠️ LƯU Ý QUAN TRỌNG

### ❌ Tránh:
- Test không có kế hoạch
- Không ghi lại kết quả
- Chỉ test happy path
- Bỏ qua edge cases
- Không kiểm tra performance

### ✅ Nên:
- Test cả success và error cases
- Ghi chú chi tiết
- Kiểm tra response time
- Test với nhiều data khác nhau
- Verify security (token, permissions)

---

## 📞 HỖ TRỢ

### Nếu gặp lỗi:

#### 1. "Could not get response"
→ Kiểm tra server đã chạy chưa

#### 2. "401 Unauthorized"
→ Chạy lại Login để lấy token mới

#### 3. "500 Internal Server Error"
→ Xem server logs để debug

#### 4. Response chậm
→ Xem `performance.log` để phân tích

---

## 📚 TÀI LIỆU THAM KHẢO

1. **API_TEST_REPORT_TEMPLATE.md** - Mẫu báo cáo chi tiết
2. **POSTMAN_COLLECTION_GUIDE.md** - Hướng dẫn Postman đầy đủ
3. **UTE_Library_API_Collection.json** - Collection import vào Postman
4. **performance.log** - Logs tự động của server

---

## ✅ WORKFLOW CHUẨN

```
1. Start Server
   ↓
2. Import Collection vào Postman
   ↓
3. Setup Environment
   ↓
4. Test Login → Lấy token
   ↓
5. Test từng module:
   - Books
   - Borrow
   - Search
   - Statistics
   ↓
6. Ghi lại kết quả vào Excel
   ↓
7. Export performance data
   ↓
8. Viết báo cáo tổng hợp
   ↓
9. ✅ Done!
```

---

**Chúc bạn test thành công! 🎉**

Nếu có thắc mắc, hãy xem các file hướng dẫn chi tiết khác.




