# 📚 HƯỚNG DẪN TOÀN DIỆN - TEST API HỆ THỐNG QUẢN LÝ THƯ VIỆN UTE

## 📖 MỤC LỤC

1. [Giới thiệu](#giới-thiệu)
2. [Các thông số cần lưu](#các-thông-số-cần-lưu)
3. [Cách sử dụng Postman](#cách-sử-dụng-postman)
4. [Mẫu báo cáo](#mẫu-báo-cáo)
5. [Tips & Tricks](#tips--tricks)

---

## 🎯 GIỚI THIỆU

Bộ tài liệu này cung cấp đầy đủ hướng dẫn và công cụ để test API của hệ thống quản lý thư viện UTE.

### 📦 Bộ tài liệu bao gồm:

| File | Mô tả | Cách sử dụng |
|------|-------|--------------|
| **QUICK_START_GUIDE.md** | Hướng dẫn nhanh 5 phút | Đọc đầu tiên để setup nhanh |
| **POSTMAN_COLLECTION_GUIDE.md** | Hướng dẫn Postman chi tiết | Tham khảo khi cần viết test scripts |
| **API_TEST_REPORT_TEMPLATE.md** | Mẫu báo cáo hoàn chỉnh | Copy và điền thông tin test |
| **UTE_Library_API_Collection.json** | Postman Collection | Import vào Postman |
| **API_TEST_EXCEL_TEMPLATE.csv** | Template Excel | Mở bằng Excel để ghi kết quả |
| **API_TESTING_GUIDE.md** | File này - Tổng hợp | Đọc để hiểu tổng quan |

---

## 📊 CÁC THÔNG SỐ CẦN LƯU KHI TEST API

### 1️⃣ THÔNG TIN REQUEST

#### Bắt buộc phải có:
```javascript
{
  "timestamp": "2024-10-13T10:30:00Z",      // Thời điểm test
  "method": "POST",                          // HTTP Method
  "url": "/api/books",                       // Endpoint
  "fullUrl": "http://localhost:5000/api/books" // URL đầy đủ
}
```

#### Headers quan trọng:
```javascript
{
  "Authorization": "Bearer eyJhbGc...",     // Token (nếu có)
  "Content-Type": "application/json",       // Loại dữ liệu
  "User-Agent": "Postman/10.18.0"          // Tool sử dụng
}
```

#### Body (nếu có):
```javascript
{
  "title": "Clean Code",
  "author_id": 1,
  "quantity": 10
}
```

#### Query Parameters (nếu có):
```javascript
{
  "page": 1,
  "limit": 10,
  "sortBy": "title"
}
```

---

### 2️⃣ THÔNG TIN RESPONSE

#### Bắt buộc:
```javascript
{
  "statusCode": 200,                        // Mã trạng thái
  "statusText": "OK",                       // Text mô tả
  "responseTime": 145,                      // Thời gian (ms)
  "responseSize": 2560                      // Kích thước (bytes)
}
```

#### Response Body:
```javascript
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Clean Code"
  },
  "message": "Success"
}
```

#### Response Headers:
```javascript
{
  "Content-Type": "application/json",
  "Content-Length": "2560",
  "X-Response-Time": "145ms"
}
```

---

### 3️⃣ KẾT QUẢ TEST

#### Test Cases:
```javascript
{
  "totalTests": 5,
  "passed": 5,
  "failed": 0,
  "skipped": 0,
  "tests": [
    {
      "name": "Status code is 200",
      "result": "PASS",
      "message": "✅ Expected 200, got 200"
    },
    {
      "name": "Response time < 500ms",
      "result": "PASS",
      "message": "✅ 145ms < 500ms"
    },
    {
      "name": "Has required fields",
      "result": "PASS",
      "message": "✅ All fields present"
    }
  ]
}
```

---

### 4️⃣ THÔNG SỐ PERFORMANCE

#### Cơ bản:
```javascript
{
  "responseTime": 145,                      // Thời gian phản hồi (ms)
  "dnsLookup": 5,                          // Thời gian DNS (ms)
  "tcpHandshake": 10,                      // Thời gian TCP (ms)
  "tlsHandshake": 15,                      // Thời gian TLS (ms)
  "firstByte": 120,                        // Time to first byte (ms)
  "download": 10                           // Thời gian download (ms)
}
```

#### Nâng cao (từ server):
```javascript
{
  "dbQueryTime": 45,                       // Thời gian query DB (ms)
  "dbQueryCount": 3,                       // Số lượng queries
  "memoryUsage": 25.5,                     // Bộ nhớ sử dụng (MB)
  "cpuUsage": 12.3                         // CPU sử dụng (%)
}
```

---

### 5️⃣ THÔNG TIN BỔ SUNG

#### Environment:
```javascript
{
  "environment": "development",             // dev/staging/production
  "serverVersion": "1.0.0",                // Phiên bản API
  "databaseVersion": "SQL Server 2019",    // Phiên bản DB
  "nodeVersion": "18.x"                    // Phiên bản Node.js
}
```

#### Tester Info:
```javascript
{
  "testerName": "Nguyen Van A",           // Người test
  "testDate": "2024-10-13",               // Ngày test
  "testTime": "10:30:00",                 // Giờ test
  "testRound": 1                          // Lần test thứ mấy
}
```

#### Notes:
```javascript
{
  "notes": "API hoạt động tốt, không có lỗi",
  "bugs": [],                              // Danh sách bugs phát hiện
  "improvements": [                        // Đề xuất cải thiện
    "Nên thêm pagination",
    "Response time có thể tốt hơn"
  ]
}
```

---

## 🎯 BẢNG CHECKLIST CHO MỖI API

### ✅ Checklist cơ bản:

```
📋 API: [Tên API]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REQUEST INFORMATION:
□ Đã ghi lại Method (GET/POST/PUT/DELETE)
□ Đã ghi lại URL đầy đủ
□ Đã ghi lại Headers (đặc biệt Authorization)
□ Đã ghi lại Body (nếu có)
□ Đã ghi lại Query Params (nếu có)

RESPONSE INFORMATION:
□ Đã ghi lại Status Code
□ Đã ghi lại Response Time
□ Đã ghi lại Response Size
□ Đã ghi lại Response Body
□ Đã chụp screenshot (nếu cần)

TEST CASES:
□ Test với dữ liệu hợp lệ (Happy Path)
□ Test với dữ liệu không hợp lệ (Negative Case)
□ Test với dữ liệu thiếu (Missing Fields)
□ Test với dữ liệu sai format (Invalid Format)
□ Test với dữ liệu edge cases (Boundary)

SECURITY:
□ Test không có token (nếu API protected)
□ Test với token sai
□ Test với token hết hạn
□ Test với quyền không đủ (permissions)

PERFORMANCE:
□ Kiểm tra response time < 500ms
□ Kiểm tra với nhiều records
□ Kiểm tra với pagination
□ Kiểm tra memory usage (nếu có)

DOCUMENTATION:
□ Đã ghi vào Excel/CSV
□ Đã ghi notes quan trọng
□ Đã đánh dấu PASS/FAIL
□ Đã ghi bugs phát hiện (nếu có)
```

---

## 📈 CÁC THÔNG SỐ ĐÁNH GIÁ PERFORMANCE

### 🎯 Response Time Standards:

| Mức độ | Thời gian | Đánh giá | Action |
|--------|-----------|----------|--------|
| **Excellent** | < 100ms | ⚡ Rất tốt | Không cần làm gì |
| **Good** | 100-300ms | ✅ Tốt | Acceptable |
| **Acceptable** | 300-500ms | ⚠️ Chấp nhận được | Nên cải thiện |
| **Slow** | 500-1000ms | 🐌 Chậm | Cần optimize |
| **Very Slow** | > 1000ms | 🔴 Rất chậm | Phải fix ngay |

### 📊 Response Size Standards:

| Loại Response | Size | Đánh giá |
|---------------|------|----------|
| Simple JSON | < 1 KB | ✅ Tốt |
| List (10 items) | < 10 KB | ✅ Tốt |
| List (100 items) | < 100 KB | ⚠️ Nên pagination |
| Large data | > 1 MB | 🔴 Quá lớn, cần optimize |

### 🎯 Success Rate Standards:

| Tỷ lệ thành công | Đánh giá | Action |
|------------------|----------|--------|
| 100% | ⭐⭐⭐⭐⭐ Perfect | Excellent |
| 95-99% | ⭐⭐⭐⭐ Very Good | Minor fixes |
| 90-94% | ⭐⭐⭐ Good | Need improvements |
| 80-89% | ⭐⭐ Fair | Serious issues |
| < 80% | ⭐ Poor | Major problems |

---

## 🚀 WORKFLOW TEST API CHUẨN

### Bước 1: Preparation (Chuẩn bị)
```
1. ✅ Start server
2. ✅ Import Postman Collection
3. ✅ Setup Environment variables
4. ✅ Chuẩn bị test data
5. ✅ Tạo file Excel để ghi kết quả
```

### Bước 2: Authentication (Xác thực)
```
1. ✅ Test Login API
2. ✅ Lưu token vào environment
3. ✅ Verify token hoạt động
4. ✅ Test các trường hợp lỗi (wrong password, etc.)
```

### Bước 3: Test từng Module
```
Với mỗi API:
1. ✅ Test Happy Path (dữ liệu hợp lệ)
2. ✅ Test Negative Cases (dữ liệu không hợp lệ)
3. ✅ Test Edge Cases (boundary values)
4. ✅ Test Security (token, permissions)
5. ✅ Ghi lại kết quả
```

### Bước 4: Performance Testing
```
1. ✅ Chạy tất cả API với Collection Runner
2. ✅ Xem performance stats: GET /api/performance/stats
3. ✅ Xem chi tiết logs: GET /api/performance/logs
4. ✅ Xem stats theo endpoint: GET /api/performance/endpoints
5. ✅ Export data: GET /api/performance/export
```

### Bước 5: Documentation (Báo cáo)
```
1. ✅ Tổng hợp kết quả vào Excel
2. ✅ Viết báo cáo theo template
3. ✅ Chụp screenshots quan trọng
4. ✅ List tất cả bugs phát hiện
5. ✅ Viết đề xuất cải thiện
```

---

## 📝 MẪU GHI CHÚ CHI TIẾT

### Template đầy đủ cho mỗi API test:

```markdown
# API TEST REPORT

## API Information
- **Name**: Get All Books
- **Endpoint**: GET /api/books
- **Module**: Books Management
- **Tested by**: Nguyen Van A
- **Test Date**: 13/10/2024 10:30 AM

## Request Details
```http
GET http://localhost:5000/api/books?page=1&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

## Response Details
- **Status Code**: 200 OK
- **Response Time**: 89ms
- **Response Size**: 3.2 KB
- **Records Returned**: 10 books

## Response Body
```json
[
  {
    "id": 1,
    "title": "Clean Code",
    "author_id": 1,
    "quantity": 10
  }
]
```

## Test Results
✅ **PASSED** (5/5 tests)

1. ✅ Status code is 200
2. ✅ Response time < 300ms (89ms)
3. ✅ Response is an array
4. ✅ Has exactly 10 items
5. ✅ Each item has required fields

## Performance Analysis
- Response Time: 89ms ⚡ **Excellent**
- Response Size: 3.2 KB ✅ **Good**
- Database Queries: 1 query
- Query Time: 45ms

## Notes
- API hoạt động rất tốt
- Performance excellent
- Pagination hoạt động đúng
- Không phát hiện lỗi

## Recommendations
- Không có đề xuất
- API đã tối ưu tốt
```

---

## 🎨 CÁC CÔNG CỤ HỖ TRỢ

### 1. Postman Collection
- File: `UTE_Library_API_Collection.json`
- Chứa 20+ API requests có sẵn
- Có test scripts tự động
- Có pre-request scripts

### 2. Performance Monitoring APIs
```bash
# Xem thống kê tổng quan
GET http://localhost:5000/api/performance/stats

# Xem logs chi tiết
GET http://localhost:5000/api/performance/logs?limit=100

# Xem stats theo endpoint
GET http://localhost:5000/api/performance/endpoints

# Export toàn bộ data
GET http://localhost:5000/api/performance/export
```

### 3. Excel Template
- File: `API_TEST_EXCEL_TEMPLATE.csv`
- Mở bằng Excel
- Đã có sẵn 25 test cases mẫu
- Copy và điền thông tin của bạn

### 4. Report Template
- File: `API_TEST_REPORT_TEMPLATE.md`
- Format markdown chuyên nghiệp
- Có đầy đủ sections
- Copy và điền thông tin

---

## 💡 TIPS & BEST PRACTICES

### ✅ DO (Nên làm):

1. **Test có hệ thống**
   - Chia theo modules
   - Test từng API một cách kỹ lưỡng
   - Ghi chú chi tiết

2. **Test đầy đủ cases**
   - Happy path (success)
   - Negative cases (errors)
   - Edge cases (boundaries)
   - Security cases (auth, permissions)

3. **Ghi lại mọi thứ**
   - Request details
   - Response details
   - Screenshots
   - Notes quan trọng

4. **Kiểm tra performance**
   - Response time
   - Response size
   - Database queries
   - Memory usage

5. **Viết báo cáo tốt**
   - Rõ ràng, chi tiết
   - Có số liệu cụ thể
   - Có screenshots
   - Có đề xuất cải thiện

### ❌ DON'T (Không nên):

1. **Không test ngẫu nhiên**
   - Không có kế hoạch
   - Không có checklist
   - Bỏ qua test cases

2. **Không chỉ test happy path**
   - Bỏ qua error cases
   - Không test edge cases
   - Không test security

3. **Không bỏ qua documentation**
   - Không ghi chú
   - Không chụp screenshots
   - Không viết báo cáo

4. **Không ignore performance**
   - Chỉ quan tâm functional
   - Bỏ qua response time
   - Không optimize

---

## 🆘 TROUBLESHOOTING

### Vấn đề thường gặp:

#### 1. "Could not get response"
**Nguyên nhân:**
- Server chưa chạy
- URL sai
- Firewall block

**Giải pháp:**
```bash
# Kiểm tra server
cd server
npm start

# Kiểm tra URL
echo http://localhost:5000/api/books

# Test bằng curl
curl http://localhost:5000/api/books
```

#### 2. "401 Unauthorized"
**Nguyên nhân:**
- Chưa có token
- Token sai
- Token hết hạn

**Giải pháp:**
```bash
# Chạy lại Login để lấy token mới
POST /api/auth/login

# Copy token vào environment variable
token = eyJhbGc...
```

#### 3. "500 Internal Server Error"
**Nguyên nhân:**
- Lỗi server
- Database connection
- Bug trong code

**Giải pháp:**
```bash
# Xem server logs
tail -f server/error.log

# Xem performance logs
tail -f server/performance.log

# Debug trong code
```

#### 4. Response chậm
**Nguyên nhân:**
- Query không tối ưu
- Thiếu indexes
- Quá nhiều data

**Giải pháp:**
```bash
# Xem performance stats
GET /api/performance/endpoints

# Kiểm tra slow queries
# Thêm indexes vào database
# Implement caching
```

---

## 📚 TÀI LIỆU THAM KHẢO

### Trong project:
1. `QUICK_START_GUIDE.md` - Bắt đầu nhanh
2. `POSTMAN_COLLECTION_GUIDE.md` - Hướng dẫn Postman
3. `API_TEST_REPORT_TEMPLATE.md` - Mẫu báo cáo
4. `API_TEST_EXCEL_TEMPLATE.csv` - Template Excel

### External:
1. [Postman Documentation](https://learning.postman.com/)
2. [HTTP Status Codes](https://httpstatuses.com/)
3. [REST API Best Practices](https://restfulapi.net/)

---

## ✅ FINAL CHECKLIST

Trước khi nộp báo cáo, đảm bảo:

```
□ Đã test tất cả API endpoints
□ Đã test cả success và error cases
□ Đã ghi lại response time cho mỗi API
□ Đã chụp screenshots quan trọng
□ Đã ghi chú các bugs phát hiện
□ Đã tổng hợp vào Excel
□ Đã viết báo cáo theo template
□ Đã export performance data
□ Đã kiểm tra lại tất cả số liệu
□ Đã viết kết luận và đề xuất
□ Đã review lại toàn bộ báo cáo
□ Đã save tất cả files
```

---

## 🎉 KẾT LUẬN

Với bộ tài liệu này, bạn có đầy đủ công cụ và hướng dẫn để:
- ✅ Test API một cách chuyên nghiệp
- ✅ Ghi lại kết quả đầy đủ
- ✅ Viết báo cáo chất lượng cao
- ✅ Phát hiện và report bugs
- ✅ Đánh giá performance
- ✅ Đề xuất cải thiện

**Chúc bạn test thành công! 🚀**

---

**Liên hệ hỗ trợ:**
- Email: [your-email]
- GitHub: [your-github]
- Documentation: [link-to-docs]

**Version:** 1.0  
**Last Updated:** 13/10/2024




