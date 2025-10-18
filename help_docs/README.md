# Hướng dẫn tạo file CHM

## Giới thiệu
Thư mục này chứa các file HTML để tạo file CHM (Compiled HTML Help) hướng dẫn sử dụng chức năng Quản lý độc giả và Gia hạn thẻ.

## Nội dung

### File HTML:
1. **index.html** - Trang chủ
2. **authentication.html** - Đăng ký & Đăng nhập
3. **reader_management.html** - Quản lý thông tin độc giả
4. **card_renewal.html** - Gia hạn thẻ thư viện
5. **profile_update.html** - Cập nhật thông tin cá nhân
6. **card_info.html** - Xem thông tin thẻ
7. **troubleshooting.html** - Xử lý sự cố thường gặp
8. **api_reference.html** - Tài liệu API tham khảo

### File hỗ trợ:
- **style.css** - File CSS chung cho tất cả trang
- **help_project.hhp** - File project để biên dịch CHM
- **help_toc.hhc** - File Table of Contents (mục lục)

## Cách tạo file CHM

### Phương pháp 1: Sử dụng HTML Help Workshop (Windows)

1. **Tải và cài đặt HTML Help Workshop:**
   - Download từ: https://www.microsoft.com/en-us/download/details.aspx?id=21138
   - Cài đặt chương trình

2. **Mở project:**
   - Mở HTML Help Workshop
   - File > Open > Chọn file `help_project.hhp`

3. **Biên dịch:**
   - Click nút "Compile" hoặc File > Compile
   - File CHM sẽ được tạo: `QuanLyDocGia_GiaHanThe.chm`

### Phương pháp 2: Sử dụng Command Line

```cmd
"C:\Program Files (x86)\HTML Help Workshop\hhc.exe" help_project.hhp
```

### Phương pháp 3: Sử dụng script tự động (Windows)

Tạo file `build.bat`:

```batch
@echo off
echo Building CHM file...
"C:\Program Files (x86)\HTML Help Workshop\hhc.exe" help_project.hhp
echo Done! File created: QuanLyDocGia_GiaHanThe.chm
pause
```

Chạy file `build.bat`

## Xem file CHM

1. Mở file `QuanLyDocGia_GiaHanThe.chm`
2. Nếu bị chặn, chuột phải > Properties > Unblock > OK
3. Mở lại file

## Xem trước HTML (không cần biên dịch)

Chỉ cần mở file `index.html` bằng trình duyệt web để xem trước nội dung.

## Chỉnh sửa

1. Sửa các file HTML theo nhu cầu
2. Cập nhật CSS trong `style.css` nếu cần
3. Nếu thêm/bớt file, cập nhật:
   - Section `[FILES]` trong `help_project.hhp`
   - Mục lục trong `help_toc.hhc`
4. Biên dịch lại để tạo file CHM mới

## Cấu trúc mục lục

```
📚 Hướng dẫn sử dụng
├── 🏠 Trang chủ
├── 🔐 Đăng ký & Đăng nhập
├── 📋 Quản lý thông tin độc giả
│   ├── Xem thông tin cá nhân
│   ├── Xem thông tin thẻ thư viện
│   └── Xem tổng quan mượn sách
├── 🎫 Gia hạn thẻ thư viện
│   ├── Kiểm tra thời hạn thẻ
│   └── Quy trình gia hạn thẻ
├── ✏️ Cập nhật thông tin cá nhân
├── ℹ️ Xem thông tin thẻ
├── ⚠️ Xử lý sự cố thường gặp
│   ├── Sự cố xác thực
│   ├── Sự cố về thẻ thư viện
│   └── Sự cố kết nối API
└── 📚 Tài liệu API tham khảo
    ├── POST /api/auth/register
    ├── POST /api/auth/login
    ├── GET /api/readers/:id
    ├── PUT /api/readers/:id
    ├── GET /api/readers/:id/card-info
    └── GET /api/readers/:id/borrow-info
```

## Lưu ý

- File CHM chỉ hoạt động trên Windows
- Nếu muốn sử dụng trên Linux/Mac, nên dùng HTML trực tiếp hoặc chuyển sang PDF
- Đảm bảo tất cả file trong cùng thư mục khi biên dịch

## Hỗ trợ

Nếu gặp vấn đề khi tạo file CHM, vui lòng:
1. Kiểm tra đã cài HTML Help Workshop chưa
2. Kiểm tra tất cả file đều có trong thư mục
3. Kiểm tra đường dẫn trong file .hhp và .hhc

---

**Phiên bản:** 1.0  
**Ngày tạo:** 13/10/2024  
**Người tạo:** AI Assistant


