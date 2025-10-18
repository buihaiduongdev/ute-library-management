# 📊 DANH SÁCH CÁC THÔNG SỐ CẦN LƯU KHI TEST API

## 🎯 TÓM TẮT NHANH

Khi test API trên Postman, bạn cần lưu lại các thông số sau:

---

## 1️⃣ THÔNG TIN REQUEST (Yêu cầu)

### Bắt buộc:
| Thông số | Ví dụ | Ghi chú |
|----------|-------|---------|
| **Timestamp** | 13/10/2024 10:30:00 | Thời điểm test |
| **Method** | GET, POST, PUT, DELETE | Phương thức HTTP |
| **URL** | /api/books | Đường dẫn endpoint |
| **Full URL** | http://localhost:5000/api/books | URL đầy đủ |

### Headers:
| Header | Ví dụ | Khi nào cần |
|--------|-------|-------------|
| **Authorization** | Bearer eyJhbGc... | API cần đăng nhập |
| **Content-Type** | application/json | POST/PUT requests |

### Body (nếu POST/PUT):
```json
{
  "title": "Clean Code",
  "author_id": 1,
  "quantity": 10
}
```

### Query Params (nếu có):
```
?page=1&limit=10&sortBy=title
```

---

## 2️⃣ THÔNG TIN RESPONSE (Phản hồi)

### Bắt buộc:
| Thông số | Ví dụ | Ý nghĩa |
|----------|-------|---------|
| **Status Code** | 200, 201, 400, 401, 404, 500 | Mã trạng thái |
| **Response Time** | 145ms | Thời gian phản hồi |
| **Response Size** | 2.5 KB | Kích thước dữ liệu |

### Response Body:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Clean Code"
  }
}
```

### Đánh giá Response Time:
| Thời gian | Đánh giá | Ký hiệu |
|-----------|----------|---------|
| < 100ms | Excellent | ⚡ |
| 100-300ms | Good | ✅ |
| 300-500ms | Acceptable | ⚠️ |
| 500-1000ms | Slow | 🐌 |
| > 1000ms | Very Slow | 🔴 |

---

## 3️⃣ KẾT QUẢ TEST

### Test Cases:
| Test | Kết quả | Ghi chú |
|------|---------|---------|
| Status code is 200 | ✅ PASS | Đúng mã trạng thái |
| Response time < 500ms | ✅ PASS | 145ms < 500ms |
| Has required fields | ✅ PASS | Có đủ trường cần thiết |
| Data format valid | ✅ PASS | Format đúng |
| Security check | ✅ PASS | Token hoạt động |

### Tổng kết:
```
Total Tests: 5
Passed: 5
Failed: 0
Success Rate: 100%
```

---

## 4️⃣ THÔNG TIN BỔ SUNG

### Tester Info:
| Thông tin | Giá trị |
|-----------|---------|
| **Người test** | [Tên của bạn] |
| **Ngày test** | 13/10/2024 |
| **Lần test** | 1 |
| **Environment** | Development |

### Notes:
```
- API hoạt động tốt
- Performance excellent
- Không có lỗi
- [Ghi chú đặc biệt khác]
```

---

## 📋 BẢNG TỔNG HỢP MẪU (EXCEL)

| STT | Module | API Name | Method | Endpoint | Status | Time | Size | Result | Note |
|-----|--------|----------|--------|----------|--------|------|------|--------|------|
| 1 | Auth | Login | POST | /api/auth/login | 200 | 145ms | 256B | ✅ PASS | Token OK |
| 2 | Books | Get All | GET | /api/books | 200 | 89ms | 15KB | ✅ PASS | 50 records |
| 3 | Books | Create | POST | /api/books | 201 | 178ms | 234B | ✅ PASS | ID: 123 |
| 4 | Borrow | Create | POST | /api/borrow | 201 | 234ms | 189B | ✅ PASS | |
| 5 | Search | Search | GET | /api/booksearch | 200 | 134ms | 1KB | ✅ PASS | 5 results |

---

## 🎯 CHECKLIST CHO MỖI API

```
□ Đã ghi Method (GET/POST/PUT/DELETE)
□ Đã ghi URL endpoint
□ Đã ghi Headers (Authorization, Content-Type)
□ Đã ghi Body (nếu có)
□ Đã ghi Query Params (nếu có)
□ Đã ghi Status Code
□ Đã ghi Response Time
□ Đã ghi Response Size
□ Đã ghi Response Body
□ Đã chạy Test Cases
□ Đã ghi kết quả PASS/FAIL
□ Đã ghi Notes quan trọng
□ Đã chụp Screenshot (nếu cần)
```

---

## 📊 MẪU GHI CHÚ NHANH

### Template đơn giản:
```
API: Get All Books
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REQUEST:
  Method: GET
  URL: /api/books?page=1&limit=10
  Headers: Authorization: Bearer xxx
  Body: N/A

RESPONSE:
  Status: 200 OK ✅
  Time: 89ms ⚡
  Size: 3.2 KB
  Data: 10 books

TESTS:
  ✅ Status code correct
  ✅ Response time good
  ✅ Data format valid
  ✅ Has required fields

RESULT: PASS ✅

NOTES:
  - Performance excellent
  - Pagination works well
  - No errors found
```

---

## 🎨 CÁC TRƯỜNG HỢP CẦN TEST

### 1. Success Case (Happy Path)
```
✅ Dữ liệu hợp lệ
✅ Token đúng
✅ Permissions đủ
→ Expect: 200/201
```

### 2. Error Cases (Negative)
```
❌ Dữ liệu không hợp lệ → Expect: 400
❌ Token sai/hết hạn → Expect: 401
❌ Không tìm thấy → Expect: 404
❌ Lỗi server → Expect: 500
```

### 3. Edge Cases (Boundary)
```
⚠️ Dữ liệu rỗng
⚠️ Dữ liệu quá lớn
⚠️ Ký tự đặc biệt
⚠️ Giá trị biên (min/max)
```

### 4. Security Cases
```
🔒 Không có token
🔒 Token sai format
🔒 Token của user khác
🔒 Permissions không đủ
```

---

## 📈 THÔNG SỐ PERFORMANCE

### Từ Postman:
```
Response Time: 145ms
Response Size: 2.5 KB
DNS Lookup: 5ms
TCP Handshake: 10ms
First Byte: 120ms
```

### Từ Server (GET /api/performance/stats):
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

---

## 🔍 CÁCH LẤY THÔNG SỐ TRONG POSTMAN

### 1. Status Code:
```
Xem ở góc trên bên phải response
Ví dụ: 200 OK, 201 Created, 400 Bad Request
```

### 2. Response Time:
```
Xem ở tab "Body" bên dưới
Ví dụ: Time: 145 ms
```

### 3. Response Size:
```
Xem ở tab "Body" bên dưới
Ví dụ: Size: 2.5 KB
```

### 4. Response Body:
```
Xem ở tab "Body"
Copy toàn bộ JSON response
```

### 5. Test Results:
```
Xem ở tab "Test Results"
Số tests passed/failed
Chi tiết từng test case
```

---

## 💾 CÁCH LƯU DỮ LIỆU

### Option 1: Excel/CSV
```
1. Mở file: API_TEST_EXCEL_TEMPLATE.csv
2. Điền từng dòng cho mỗi API test
3. Save file
```

### Option 2: Postman Export
```
1. Chạy Collection Runner
2. Click "Export Results"
3. Chọn format JSON/CSV
4. Save file
```

### Option 3: Performance API
```
GET /api/performance/export
→ Download file JSON với tất cả data
```

### Option 4: Viết báo cáo
```
1. Copy template: API_TEST_REPORT_TEMPLATE.md
2. Điền thông tin vào từng section
3. Save file
```

---

## ✅ TÓM TẮT - 5 THÔNG SỐ QUAN TRỌNG NHẤT

Nếu bạn chỉ có thể lưu 5 thông số, hãy lưu:

1. **Method + URL** → Biết API nào đang test
2. **Status Code** → Biết kết quả success/fail
3. **Response Time** → Đánh giá performance
4. **Test Result** → PASS hay FAIL
5. **Notes** → Ghi chú quan trọng

---

## 📞 XEM THÊM

- **Hướng dẫn nhanh**: QUICK_START_GUIDE.md
- **Hướng dẫn đầy đủ**: API_TESTING_GUIDE.md
- **Mẫu báo cáo**: API_TEST_REPORT_TEMPLATE.md
- **Template Excel**: API_TEST_EXCEL_TEMPLATE.csv

---

**Chúc bạn test thành công! 🚀**




