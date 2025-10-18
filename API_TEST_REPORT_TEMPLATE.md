# BÁO CÁO KIỂM THỬ API
## HỆ THỐNG QUẢN LÝ THƯ VIỆN UTE

---

## 📋 THÔNG TIN CHUNG

| Thông tin | Chi tiết |
|-----------|----------|
| **Người thực hiện** | [Tên của bạn] |
| **Ngày kiểm thử** | [DD/MM/YYYY] |
| **Phiên bản hệ thống** | v1.0 |
| **Môi trường test** | Development/Production |
| **Base URL** | http://localhost:5000 |
| **Tool sử dụng** | Postman |

---

## 📊 TỔNG QUAN KẾT QUẢ

| Chỉ số | Số lượng | Tỷ lệ |
|--------|----------|-------|
| **Tổng số API** | 50 | 100% |
| **API Pass** | 45 | 90% |
| **API Fail** | 5 | 10% |
| **API chưa test** | 0 | 0% |

### Đánh giá Performance
- **Thời gian phản hồi trung bình**: 250ms
- **API nhanh nhất**: 50ms (GET /api/books)
- **API chậm nhất**: 1200ms (POST /api/statistics/report)
- **Số API > 500ms**: 8 (16%)

---

## 🔐 1. MODULE AUTHENTICATION (AUTH)

### 1.1. API: Đăng nhập
**Endpoint:** `POST /api/auth/login`

#### Test Case 1.1.1: Đăng nhập thành công
| Thông tin | Chi tiết |
|-----------|----------|
| **Mô tả** | Đăng nhập với tài khoản hợp lệ |
| **Request Body** | ```json
{
  "username": "admin",
  "password": "123456"
}
``` |
| **Expected Status** | 200 OK |
| **Expected Response** | ```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "ADMIN"
  }
}
``` |
| **Actual Status** | 200 OK |
| **Response Time** | 145ms |
| **Response Size** | 256 bytes |
| **Kết quả** | ✅ PASS |
| **Ghi chú** | Token hợp lệ, thời gian phản hồi tốt |

#### Test Case 1.1.2: Đăng nhập sai mật khẩu
| Thông tin | Chi tiết |
|-----------|----------|
| **Mô tả** | Đăng nhập với mật khẩu sai |
| **Request Body** | ```json
{
  "username": "admin",
  "password": "wrongpass"
}
``` |
| **Expected Status** | 401 Unauthorized |
| **Expected Response** | ```json
{
  "success": false,
  "message": "Mật khẩu không đúng"
}
``` |
| **Actual Status** | 401 Unauthorized |
| **Response Time** | 98ms |
| **Kết quả** | ✅ PASS |

#### Test Case 1.1.3: Đăng nhập với username không tồn tại
| Thông tin | Chi tiết |
|-----------|----------|
| **Mô tả** | Đăng nhập với tài khoản không tồn tại |
| **Request Body** | ```json
{
  "username": "notexist",
  "password": "123456"
}
``` |
| **Expected Status** | 404 Not Found |
| **Actual Status** | 404 Not Found |
| **Response Time** | 87ms |
| **Kết quả** | ✅ PASS |

---

### 1.2. API: Đăng ký
**Endpoint:** `POST /api/auth/register`

#### Test Case 1.2.1: Đăng ký thành công
| Thông tin | Chi tiết |
|-----------|----------|
| **Mô tả** | Đăng ký tài khoản mới hợp lệ |
| **Request Body** | ```json
{
  "username": "newuser",
  "password": "123456",
  "email": "newuser@example.com",
  "fullName": "Nguyen Van A"
}
``` |
| **Expected Status** | 201 Created |
| **Actual Status** | 201 Created |
| **Response Time** | 234ms |
| **Kết quả** | ✅ PASS |

---

## 📚 2. MODULE BOOKS (SÁCH)

### 2.1. API: Lấy danh sách sách
**Endpoint:** `GET /api/books`

#### Test Case 2.1.1: Lấy tất cả sách (không phân trang)
| Thông tin | Chi tiết |
|-----------|----------|
| **Mô tả** | Lấy danh sách tất cả sách |
| **Headers** | `Authorization: Bearer {token}` |
| **Query Params** | Không có |
| **Expected Status** | 200 OK |
| **Actual Status** | 200 OK |
| **Response Time** | 156ms |
| **Response Size** | 15.2 KB |
| **Số lượng records** | 50 sách |
| **Kết quả** | ✅ PASS |

#### Test Case 2.1.2: Lấy sách có phân trang
| Thông tin | Chi tiết |
|-----------|----------|
| **Mô tả** | Lấy sách với pagination |
| **Query Params** | `?page=1&limit=10` |
| **Expected Status** | 200 OK |
| **Actual Status** | 200 OK |
| **Response Time** | 89ms |
| **Số lượng records** | 10 sách |
| **Kết quả** | ✅ PASS |

#### Test Case 2.1.3: Lấy sách không có token
| Thông tin | Chi tiết |
|-----------|----------|
| **Mô tả** | Gọi API không có Authorization header |
| **Headers** | Không có token |
| **Expected Status** | 401 Unauthorized |
| **Actual Status** | 401 Unauthorized |
| **Response Time** | 12ms |
| **Kết quả** | ✅ PASS |

---

### 2.2. API: Thêm sách mới
**Endpoint:** `POST /api/books`

#### Test Case 2.2.1: Thêm sách thành công
| Thông tin | Chi tiết |
|-----------|----------|
| **Mô tả** | Thêm sách mới với đầy đủ thông tin |
| **Headers** | `Authorization: Bearer {admin_token}` |
| **Request Body** | ```json
{
  "title": "Clean Code",
  "author_id": 1,
  "genre_id": 2,
  "publisher_id": 3,
  "publish_year": 2008,
  "quantity": 10,
  "isbn": "9780132350884"
}
``` |
| **Expected Status** | 201 Created |
| **Actual Status** | 201 Created |
| **Response Time** | 178ms |
| **Kết quả** | ✅ PASS |

#### Test Case 2.2.2: Thêm sách thiếu thông tin bắt buộc
| Thông tin | Chi tiết |
|-----------|----------|
| **Mô tả** | Thêm sách không có title |
| **Request Body** | ```json
{
  "author_id": 1,
  "quantity": 10
}
``` |
| **Expected Status** | 400 Bad Request |
| **Actual Status** | 400 Bad Request |
| **Response Time** | 45ms |
| **Kết quả** | ✅ PASS |

---

## 📖 3. MODULE BORROW (MƯỢN SÁCH)

### 3.1. API: Tạo phiếu mượn
**Endpoint:** `POST /api/borrow`

#### Test Case 3.1.1: Mượn sách thành công
| Thông tin | Chi tiết |
|-----------|----------|
| **Mô tả** | Tạo phiếu mượn sách mới |
| **Request Body** | ```json
{
  "reader_id": 5,
  "book_id": 10,
  "borrow_date": "2024-10-13",
  "due_date": "2024-10-27"
}
``` |
| **Expected Status** | 201 Created |
| **Actual Status** | 201 Created |
| **Response Time** | 234ms |
| **Kết quả** | ✅ PASS |

#### Test Case 3.1.2: Mượn sách đã hết
| Thông tin | Chi tiết |
|-----------|----------|
| **Mô tả** | Mượn sách không còn trong kho |
| **Request Body** | ```json
{
  "reader_id": 5,
  "book_id": 99,
  "borrow_date": "2024-10-13"
}
``` |
| **Expected Status** | 400 Bad Request |
| **Expected Message** | "Sách đã hết" |
| **Actual Status** | 400 Bad Request |
| **Response Time** | 123ms |
| **Kết quả** | ✅ PASS |

---

### 3.2. API: Trả sách
**Endpoint:** `POST /api/borrow/:id/return`

#### Test Case 3.2.1: Trả sách đúng hạn
| Thông tin | Chi tiết |
|-----------|----------|
| **Mô tả** | Trả sách trước hoặc đúng hạn |
| **Path Params** | `id = 123` |
| **Request Body** | ```json
{
  "return_date": "2024-10-25",
  "condition": "GOOD"
}
``` |
| **Expected Status** | 200 OK |
| **Actual Status** | 200 OK |
| **Response Time** | 189ms |
| **Fine Amount** | 0 VNĐ |
| **Kết quả** | ✅ PASS |

#### Test Case 3.2.2: Trả sách quá hạn
| Thông tin | Chi tiết |
|-----------|----------|
| **Mô tả** | Trả sách sau ngày hẹn trả |
| **Request Body** | ```json
{
  "return_date": "2024-11-05",
  "condition": "GOOD"
}
``` |
| **Expected Status** | 200 OK |
| **Days Late** | 9 ngày |
| **Fine Amount** | 45,000 VNĐ (5000/ngày) |
| **Actual Status** | 200 OK |
| **Actual Fine** | 45,000 VNĐ |
| **Response Time** | 267ms |
| **Kết quả** | ✅ PASS |

---

## 📊 4. MODULE STATISTICS (THỐNG KÊ)

### 4.1. API: Thống kê tổng quan
**Endpoint:** `GET /api/statistics/overview`

#### Test Case 4.1.1: Lấy thống kê tổng quan
| Thông tin | Chi tiết |
|-----------|----------|
| **Mô tả** | Lấy số liệu thống kê hệ thống |
| **Headers** | `Authorization: Bearer {admin_token}` |
| **Expected Status** | 200 OK |
| **Actual Status** | 200 OK |
| **Response Time** | 456ms |
| **Response Data** | ```json
{
  "totalBooks": 500,
  "totalReaders": 150,
  "activeBorrows": 45,
  "overdueBooks": 8
}
``` |
| **Kết quả** | ✅ PASS |
| **Ghi chú** | Response time hơi cao, cần optimize |

---

## 🔍 5. MODULE SEARCH (TÌM KIẾM)

### 5.1. API: Tìm kiếm sách
**Endpoint:** `GET /api/booksearch`

#### Test Case 5.1.1: Tìm kiếm theo tên sách
| Thông tin | Chi tiết |
|-----------|----------|
| **Mô tả** | Tìm sách theo từ khóa trong title |
| **Query Params** | `?q=clean&searchBy=title` |
| **Expected Status** | 200 OK |
| **Actual Status** | 200 OK |
| **Response Time** | 134ms |
| **Results Found** | 5 sách |
| **Kết quả** | ✅ PASS |

#### Test Case 5.1.2: Tìm kiếm không có kết quả
| Thông tin | Chi tiết |
|-----------|----------|
| **Mô tả** | Tìm với từ khóa không tồn tại |
| **Query Params** | `?q=xyzabc123` |
| **Expected Status** | 200 OK |
| **Expected Response** | Empty array `[]` |
| **Actual Status** | 200 OK |
| **Results Found** | 0 |
| **Response Time** | 67ms |
| **Kết quả** | ✅ PASS |

---

## ❌ 6. DANH SÁCH LỖI PHÁT HIỆN

### Bug #1: API Thống kê chậm
| Thông tin | Chi tiết |
|-----------|----------|
| **Endpoint** | `GET /api/statistics/report` |
| **Mức độ** | 🟡 Medium |
| **Mô tả** | Response time quá cao (1200ms) |
| **Tái hiện** | Luôn xảy ra khi có > 1000 records |
| **Expected** | < 500ms |
| **Actual** | 1200ms |
| **Đề xuất** | Thêm index vào database, optimize query |

### Bug #2: Validation thiếu cho email
| Thông tin | Chi tiết |
|-----------|----------|
| **Endpoint** | `POST /api/auth/register` |
| **Mức độ** | 🟡 Medium |
| **Mô tả** | API chấp nhận email không đúng format |
| **Request** | `{ "email": "invalid-email" }` |
| **Expected** | 400 Bad Request |
| **Actual** | 201 Created |
| **Đề xuất** | Thêm email validation regex |

### Bug #3: Token hết hạn không trả về message rõ ràng
| Thông tin | Chi tiết |
|-----------|----------|
| **Endpoint** | Tất cả protected routes |
| **Mức độ** | 🔴 High |
| **Mô tả** | Khi token expired, chỉ trả về 401 không có message |
| **Expected** | `{ "message": "Token đã hết hạn" }` |
| **Actual** | `{ "message": "Unauthorized" }` |
| **Đề xuất** | Cải thiện error handling cho JWT |

---

## 📈 7. PHÂN TÍCH PERFORMANCE

### 7.1. Thống kê theo Module

| Module | Số API | Avg Response Time | Đánh giá |
|--------|--------|-------------------|----------|
| Auth | 5 | 125ms | ✅ Tốt |
| Books | 12 | 178ms | ✅ Tốt |
| Borrow | 8 | 234ms | ✅ Tốt |
| Statistics | 6 | 567ms | ⚠️ Cần cải thiện |
| Search | 4 | 145ms | ✅ Tốt |
| Readers | 8 | 189ms | ✅ Tốt |
| Publishers | 3 | 98ms | ✅ Tốt |
| Authors | 4 | 112ms | ✅ Tốt |

### 7.2. Top 5 API chậm nhất

| Rank | Endpoint | Response Time | Đề xuất |
|------|----------|---------------|---------|
| 1 | `GET /api/statistics/report` | 1200ms | Optimize query, add caching |
| 2 | `GET /api/statistics/overview` | 567ms | Add database indexes |
| 3 | `POST /api/borrow` | 345ms | Optimize transaction |
| 4 | `GET /api/books?include=all` | 298ms | Implement pagination |
| 5 | `POST /api/readers` | 267ms | Optimize validation |

### 7.3. Phân bố Response Time

```
0-100ms:    ████████████████████ 40% (20 APIs)
100-200ms:  ████████████████     32% (16 APIs)
200-500ms:  ████████             16% (8 APIs)
500-1000ms: ████                 8% (4 APIs)
>1000ms:    ██                   4% (2 APIs)
```

---

## ✅ 8. KẾT LUẬN VÀ KHUYẾN NGHỊ

### 8.1. Đánh giá chung
- ✅ **Điểm mạnh:**
  - Hầu hết API hoạt động ổn định
  - Response time trung bình tốt (< 250ms)
  - Error handling cơ bản đầy đủ
  - Authentication & Authorization hoạt động đúng

- ⚠️ **Điểm cần cải thiện:**
  - Module Statistics có performance kém
  - Thiếu validation cho một số trường
  - Error messages chưa rõ ràng
  - Chưa có rate limiting

### 8.2. Khuyến nghị
1. **Ưu tiên cao** 🔴
   - Fix bug #3: Cải thiện JWT error handling
   - Optimize API Statistics (thêm caching)
   - Thêm email validation

2. **Ưu tiên trung bình** 🟡
   - Thêm rate limiting để tránh abuse
   - Implement API versioning
   - Thêm request/response logging

3. **Ưu tiên thấp** 🟢
   - Cải thiện API documentation
   - Thêm health check endpoint
   - Implement API monitoring

### 8.3. Kế hoạch tiếp theo
- [ ] Fix tất cả bugs ưu tiên cao trong sprint tiếp theo
- [ ] Optimize performance cho module Statistics
- [ ] Viết thêm test cases cho edge cases
- [ ] Setup CI/CD để tự động test API

---

## 📎 PHỤ LỤC

### A. Environment Variables
```
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=1433
DB_NAME=LibraryDB
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
```

### B. Test Data
- **Admin Account**: username: `admin`, password: `123456`
- **Reader Account**: username: `reader1`, password: `123456`
- **Staff Account**: username: `staff1`, password: `123456`

### C. Tools & Versions
- Postman: v10.18.0
- Node.js: v18.x
- SQL Server: 2019

---

**Người lập báo cáo:** [Tên của bạn]  
**Ngày:** [DD/MM/YYYY]  
**Chữ ký:** _______________

