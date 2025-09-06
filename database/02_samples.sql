-- Admin - mk: admin
INSERT INTO TaiKhoan (TenDangNhap, MatKhauMaHoa, VaiTro, TrangThai)
VALUES ('admin1', '$2b$10$msxhn8f8h7U1MnNq1GyVq.pxEWREURfGrZrxPmlG90XQKIV91ehIm', 0, 1);

-- Nhân viên - mk: staff
INSERT INTO TaiKhoan (TenDangNhap, MatKhauMaHoa, VaiTro, TrangThai)
VALUES ('nhanvien1', '$2b$10$KBHMxEL4kufAmMjvOHEG5ew9/s43FwR3KLhcUqaDb.yrhYiu77m9.', 1, 1);

-- Độc giả - mk: reader
INSERT INTO TaiKhoan (TenDangNhap, MatKhauMaHoa, VaiTro, TrangThai)
VALUES ('docgia1', '$2b$10$X9Ynu1Dq9p0rC4k1zBubheBA5ImuESIkrMvGxAubXmrflWSzB2v3a', 2, 1);

-- Admin profile
INSERT INTO Admin (MaTK, HoTen, NgaySinh, Email, SoDienThoai)
VALUES (1, N'Nguyễn Văn Admin', '1980-05-12', 'admin@ute.vn', '0909000001');

-- Nhân viên profile
INSERT INTO NhanVien (MaTK, MaNV, HoTen, NgaySinh, Email, SoDienThoai, ChucVu)
VALUES (2, 'NV001', N'Trần Thị Nhân Viên', '1995-08-20', 'nhanvien@ute.vn', '0909000002', 'ThuThu');

-- Độc giả profile
INSERT INTO DocGia (MaTK, MaDG, HoTen, NgaySinh, DiaChi, Email, SoDienThoai, NgayDangKy, NgayHetHan, TrangThai)
VALUES (3, 'DG001', N'Lê Văn Độc Giả', '2000-02-10', N'123 Lê Văn Việt, Thủ Đức', 'docgia@ute.vn', '0909000003', GETDATE(), DATEADD(YEAR, 1, GETDATE()), 'ConHan');
