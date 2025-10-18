# 📮 HƯỚNG DẪN SỬ DỤNG POSTMAN ĐỂ TEST API

## 🎯 MỤC ĐÍCH
Hướng dẫn chi tiết cách sử dụng Postman để test API của hệ thống quản lý thư viện UTE.

---

## 📥 BƯỚC 1: CÀI ĐẶT VÀ SETUP

### 1.1. Download Postman
- Truy cập: https://www.postman.com/downloads/
- Tải phiên bản phù hợp với hệ điều hành
- Cài đặt và đăng ký tài khoản (miễn phí)

### 1.2. Import Collection
Tôi sẽ tạo file collection JSON cho bạn. Sau khi có file:
1. Mở Postman
2. Click **Import** ở góc trên bên trái
3. Chọn file `UTE_Library_API_Collection.json`
4. Click **Import**

---

## 🔧 BƯỚC 2: SETUP ENVIRONMENT

### 2.1. Tạo Environment
1. Click biểu tượng **⚙️ Settings** > **Environments**
2. Click **+ Create Environment**
3. Đặt tên: `UTE Library - Development`

### 2.2. Thêm Variables
Thêm các biến sau:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `http://localhost:5000` | `http://localhost:5000` |
| `api_prefix` | `/api` | `/api` |
| `token` | (để trống) | (để trống) |
| `admin_token` | (để trống) | (để trống) |
| `reader_id` | `1` | `1` |
| `book_id` | `1` | `1` |

### 2.3. Sử dụng Variables
Trong request, dùng cú pháp: `{{variable_name}}`

Ví dụ:
```
{{base_url}}{{api_prefix}}/books
→ http://localhost:5000/api/books
```

---

## 🚀 BƯỚC 3: TEST API TỪNG BƯỚC

### 3.1. Test API Login (Lấy Token)

#### Request
```
POST {{base_url}}{{api_prefix}}/auth/login
```

#### Headers
```
Content-Type: application/json
```

#### Body (raw JSON)
```json
{
  "username": "admin",
  "password": "123456"
}
```

#### Tests Script (Tab Tests)
```javascript
// Kiểm tra status code
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Kiểm tra response có token
pm.test("Response has token", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('token');
});

// Lưu token vào environment
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
    console.log("Token saved:", jsonData.token);
}

// Kiểm tra response time
pm.test("Response time is less than 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});
```

#### Kết quả mong đợi
- ✅ Status: 200 OK
- ✅ Response time: < 500ms
- ✅ Response body có `token`, `user`
- ✅ Token được lưu vào environment

---

### 3.2. Test API Get Books (Sử dụng Token)

#### Request
```
GET {{base_url}}{{api_prefix}}/books
```

#### Headers
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

#### Tests Script
```javascript
// Kiểm tra status code
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Kiểm tra response là array
pm.test("Response is an array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.be.an('array');
});

// Kiểm tra có data
pm.test("Has at least one book", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.length).to.be.above(0);
});

// Kiểm tra structure của book
pm.test("Book has required fields", function () {
    var jsonData = pm.response.json();
    var book = jsonData[0];
    pm.expect(book).to.have.property('id');
    pm.expect(book).to.have.property('title');
    pm.expect(book).to.have.property('author_id');
});

// Lưu book_id đầu tiên
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    if (jsonData.length > 0) {
        pm.environment.set("book_id", jsonData[0].id);
    }
}
```

---

### 3.3. Test API Create Book

#### Request
```
POST {{base_url}}{{api_prefix}}/books
```

#### Headers
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

#### Body
```json
{
  "title": "Test Book {{$timestamp}}",
  "author_id": 1,
  "genre_id": 1,
  "publisher_id": 1,
  "publish_year": 2024,
  "quantity": 10,
  "isbn": "TEST{{$randomInt}}"
}
```

**Lưu ý:** `{{$timestamp}}` và `{{$randomInt}}` là dynamic variables của Postman

#### Tests Script
```javascript
// Kiểm tra status code
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

// Kiểm tra response có id
pm.test("Response has book id", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
});

// Lưu book_id mới tạo
if (pm.response.code === 201) {
    var jsonData = pm.response.json();
    pm.environment.set("new_book_id", jsonData.id);
}

// Kiểm tra response time
pm.test("Response time is less than 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});
```

---

### 3.4. Test API với Query Parameters

#### Request
```
GET {{base_url}}{{api_prefix}}/books?page=1&limit=10&sortBy=title
```

#### Tests Script
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Returns exactly 10 items or less", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.length).to.be.at.most(10);
});

pm.test("Response time is acceptable", function () {
    pm.expect(pm.response.responseTime).to.be.below(300);
});
```

---

## 📊 BƯỚC 4: GHI LẠI KẾT QUẢ TEST

### 4.1. Xem Test Results
Sau khi chạy request:
1. Xem tab **Test Results** bên dưới
2. Kiểm tra số test PASSED/FAILED
3. Xem chi tiết từng test case

### 4.2. Xuất Test Results
1. Click **Runner** (biểu tượng ▶️)
2. Chọn Collection muốn chạy
3. Click **Run UTE Library API**
4. Sau khi chạy xong, click **Export Results**
5. Chọn format: JSON hoặc CSV

### 4.3. Ghi vào Excel
Tạo bảng Excel với các cột:

| STT | API Name | Method | Endpoint | Status | Response Time | Result | Note |
|-----|----------|--------|----------|--------|---------------|--------|------|
| 1 | Login | POST | /api/auth/login | 200 | 145ms | PASS | Token OK |
| 2 | Get Books | GET | /api/books | 200 | 89ms | PASS | 50 records |
| 3 | Create Book | POST | /api/books | 201 | 178ms | PASS | ID: 123 |

---

## 🎨 BƯỚC 5: TỔ CHỨC COLLECTION

### 5.1. Cấu trúc Folders
```
📁 UTE Library API Collection
  📁 1. Authentication
    ├─ Login
    ├─ Register
    └─ Logout
  📁 2. Books Management
    ├─ Get All Books
    ├─ Get Book by ID
    ├─ Create Book
    ├─ Update Book
    └─ Delete Book
  📁 3. Borrow Management
    ├─ Create Borrow
    ├─ Get Borrows
    ├─ Return Book
    └─ Get Overdue Books
  📁 4. Readers Management
  📁 5. Statistics
  📁 6. Search
```

### 5.2. Đặt tên Request rõ ràng
✅ Tốt: `[GET] Get All Books`
✅ Tốt: `[POST] Create New Book`
❌ Tránh: `Request 1`, `Test API`

---

## 🔄 BƯỚC 6: CHẠY COLLECTION RUNNER

### 6.1. Setup Runner
1. Click **Runner** (⚡)
2. Chọn Collection
3. Chọn Environment
4. Cấu hình:
   - **Iterations**: 1 (hoặc nhiều lần để test load)
   - **Delay**: 0ms (hoặc thêm delay giữa các request)
   - **Data File**: (optional) file CSV/JSON với test data

### 6.2. Chạy và Xem Kết quả
1. Click **Run UTE Library API**
2. Xem real-time results
3. Kiểm tra:
   - Total Requests
   - Passed/Failed Tests
   - Average Response Time
   - Total Time

### 6.3. Export Report
1. Click **Export Results**
2. Chọn format JSON
3. Lưu file: `test_results_2024-10-13.json`

---

## 📝 BƯỚC 7: GHI CHÚ QUAN TRỌNG

### 7.1. Các thông số cần ghi lại
Khi test mỗi API, ghi lại:

✅ **Request Info:**
- Method (GET/POST/PUT/DELETE)
- URL đầy đủ
- Headers (đặc biệt là Authorization)
- Body (nếu có)
- Query params (nếu có)

✅ **Response Info:**
- Status Code (200, 201, 400, 401, 404, 500...)
- Response Time (ms)
- Response Size (bytes/KB)
- Response Body (JSON)

✅ **Test Results:**
- Số test passed/failed
- Chi tiết từng assertion
- Screenshot (nếu cần)

✅ **Notes:**
- Lỗi gặp phải
- Hành vi bất thường
- Đề xuất cải thiện

### 7.2. Mẫu ghi chú cho mỗi test
```
API: Get Books
Date: 13/10/2024 10:30 AM
Tester: [Tên bạn]

REQUEST:
- Method: GET
- URL: http://localhost:5000/api/books?page=1&limit=10
- Headers: Authorization: Bearer eyJhbGc...
- Body: N/A

RESPONSE:
- Status: 200 OK
- Time: 89ms
- Size: 2.5 KB
- Records: 10 books

TESTS:
✅ Status code is 200
✅ Response is array
✅ Has 10 items
✅ Response time < 300ms

RESULT: PASS ✅

NOTES:
- Performance tốt
- Data đúng format
- Không có lỗi
```

---

## 🎯 BƯỚC 8: TIPS & TRICKS

### 8.1. Pre-request Script để auto login
Thêm vào Collection level:

```javascript
// Kiểm tra nếu chưa có token hoặc token hết hạn
if (!pm.environment.get("token")) {
    pm.sendRequest({
        url: pm.environment.get("base_url") + "/api/auth/login",
        method: 'POST',
        header: {
            'Content-Type': 'application/json',
        },
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                username: "admin",
                password: "123456"
            })
        }
    }, function (err, res) {
        if (!err) {
            var jsonData = res.json();
            pm.environment.set("token", jsonData.token);
            console.log("Auto login successful");
        }
    });
}
```

### 8.2. Snippets hữu ích

#### Kiểm tra status code
```javascript
pm.test("Status code is 200", () => {
    pm.response.to.have.status(200);
});
```

#### Kiểm tra response time
```javascript
pm.test("Response time < 500ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(500);
});
```

#### Kiểm tra JSON structure
```javascript
pm.test("Has required fields", () => {
    const json = pm.response.json();
    pm.expect(json).to.have.property('id');
    pm.expect(json).to.have.property('title');
});
```

#### Kiểm tra array không rỗng
```javascript
pm.test("Array is not empty", () => {
    const json = pm.response.json();
    pm.expect(json).to.be.an('array').that.is.not.empty;
});
```

### 8.3. Variables động
- `{{$guid}}` - UUID ngẫu nhiên
- `{{$timestamp}}` - Unix timestamp
- `{{$randomInt}}` - Số ngẫu nhiên
- `{{$randomEmail}}` - Email ngẫu nhiên
- `{{$randomFirstName}}` - Tên ngẫu nhiên

---

## 📊 BƯỚC 9: TẠO BÁO CÁO

### 9.1. Chụp Screenshots
Chụp màn hình các phần:
- Request details
- Response body
- Test results
- Response time

### 9.2. Tổng hợp vào Excel
Sử dụng template `API_TEST_REPORT_TEMPLATE.md` để điền thông tin.

### 9.3. Export Postman Documentation
1. Click Collection > **View Documentation**
2. Click **Publish** (nếu muốn share)
3. Hoặc **Export** để lưu HTML

---

## ✅ CHECKLIST TRƯỚC KHI NỘP BÁO CÁO

- [ ] Đã test tất cả API endpoints
- [ ] Đã test các trường hợp: success, fail, edge cases
- [ ] Đã ghi lại response time cho mỗi API
- [ ] Đã chụp screenshots quan trọng
- [ ] Đã ghi chú các bugs phát hiện
- [ ] Đã tổng hợp vào file báo cáo
- [ ] Đã kiểm tra lại số liệu
- [ ] Đã viết kết luận và đề xuất

---

## 🆘 TROUBLESHOOTING

### Lỗi: "Could not get response"
- Kiểm tra server đã chạy chưa
- Kiểm tra URL đúng chưa
- Kiểm tra firewall/antivirus

### Lỗi: 401 Unauthorized
- Token hết hạn → Login lại
- Token sai format → Kiểm tra header
- Chưa có token → Chạy Login trước

### Lỗi: 500 Internal Server Error
- Kiểm tra server logs
- Kiểm tra database connection
- Kiểm tra request body format

---

**Chúc bạn test thành công! 🚀**




