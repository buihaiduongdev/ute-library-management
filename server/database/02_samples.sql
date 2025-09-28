USE uteLMS;
GO
DECLARE @hashedPassword VARCHAR(255) = '$2b$10$8bRUoqdYILblfQL.u/jATOUxD0lHGetItzV0d4W/vHEvENlBEtV0C';
-- 1. Tài Khoản
INSERT INTO TaiKhoan (TenDangNhap, MatKhauMaHoa, VaiTro, TrangThai) VALUES
('admin01', @hashedPassword, 0, 1),
('nv01', @hashedPassword, 1, 1),
('nv02', @hashedPassword, 1, 1),
('dg01', @hashedPassword, 2, 1),
('dg02', @hashedPassword, 2, 1),
('dg03', @hashedPassword, 2, 0);

-- 2. Admin
INSERT INTO Admin (MaTK, HoTen, NgaySinh, Email, SoDienThoai) VALUES
(1, N'Nguyễn Văn A', '1980-01-01', 'admin@utelms.com', '0901111111');

-- 3. Nhân Viên
INSERT INTO NhanVien (MaTK, MaNV, HoTen, NgaySinh, Email, SoDienThoai, DiaChi, ChucVu) VALUES
(2, 'NV001', N'Trần Thị B', '1990-02-02', 'nv1@utelms.com', '0902222222', N'Hà Nội', N'ThuThu'),
(3, 'NV002', N'Lê Văn C', '1992-03-03', 'nv2@utelms.com', '0903333333', N'Hồ Chí Minh', N'FullTime');

-- 4. Độc Giả
INSERT INTO DocGia (MaTK, MaDG, HoTen, NgaySinh, DiaChi, Email, SoDienThoai, NgayDangKy, NgayHetHan, TrangThai) VALUES
(4, 'DG001', N'Phạm Thị D', '2000-04-04', N'Đà Nẵng', 'dg1@utelms.com', '0904444444', GETDATE(), DATEADD(YEAR,1,GETDATE()), 'ConHan'),
(5, 'DG002', N'Hoàng Văn E', '2001-05-05', N'Cần Thơ', 'dg2@utelms.com', '0905555555', GETDATE(), DATEADD(MONTH,6,GETDATE()), 'ConHan'),
(6, 'DG003', N'Đỗ Thị F', '1999-06-06', N'Huế', 'dg3@utelms.com', '0906666666', GETDATE(), DATEADD(MONTH,-1,GETDATE()), 'HetHan');

-- 5. Tác Giả
INSERT INTO TacGia (TenTacGia, TieuSu, QuocTich) VALUES
(N'Nguyễn Nhật Ánh', N'Nhà văn chuyên viết truyện thiếu nhi', N'Việt Nam'),
(N'Haruki Murakami', N'Nhà văn nổi tiếng Nhật Bản', N'Nhật Bản');

-- 6. Thể Loại
INSERT INTO TheLoai (TenTheLoai, MoTa) VALUES
(N'Thiếu nhi', N'Sách cho trẻ em và tuổi học trò'),
(N'Tiểu thuyết', N'Tác phẩm văn học dài'),
(N'Khoa học', N'Sách nghiên cứu, tham khảo');

-- 7. Nhà Xuất Bản
INSERT INTO NhaXuatBan (TenNXB, DiaChi, SoDienThoai, Email) VALUES
(N'NXB Trẻ', N'HCM', '0911111111', 'nxbtre@vn.com'),
(N'NXB Kim Đồng', N'Hà Nội', '0922222222', 'nxbkimdong@vn.com');

-- 8. Sách
INSERT INTO Sach (TieuDe, NamXuatBan, GiaSach, MaNXB, SoLuong, ViTriKe, TrangThai) VALUES
(N'Tôi thấy hoa vàng trên cỏ xanh', 2015, 50000, 1, 10, N'K1', 'Con'),
(N'Kafka bên bờ biển', 2002, 120000, 2, 5, N'K2', 'Con');

-- 9. Cuốn Sách
INSERT INTO CuonSach (MaSach, TrangThaiCS) VALUES
(1, 'Con'),
(1, 'DangMuon'),
(2, 'Con');

-- 10. Sách_Tác Giả
INSERT INTO Sach_TacGia (MaSach, MaTG, VaiTro) VALUES
(1, 1, N'Tác giả chính'),
(2, 2, N'Tác giả chính');

-- 11. Sách_Thể Loại
INSERT INTO Sach_TheLoai (MaSach, MaTL) VALUES
(1, 1),
(1, 2),
(2, 2);

-- 12. Phiếu Mượn
INSERT INTO PhieuMuon (IdDG, IdNV) VALUES
(1, 1),
(2, 2);

-- 13. Chi Tiết Mượn
INSERT INTO ChiTietMuon (MaPM, MaSach, SoLuong, NgayMuon, NgayHenTra, NgayTra, TrangThai) VALUES
(1, 1, 1, GETDATE(), DATEADD(DAY,7,GETDATE()), NULL, 'DangMuon'),
(2, 2, 1, DATEADD(DAY,-10,GETDATE()), DATEADD(DAY,-3,GETDATE()), NULL, 'TreHan');

-- 14. Thẻ Phạt
INSERT INTO ThePhat (MaPM, SoTien, LyDo) VALUES
(2, 50000, N'Trễ hạn 3 ngày');

-- 15. Cấu Hình Hệ Thống
INSERT INTO CauHinhHeThong (TenThamSo, GiaTri, MoTa, NguoiCapNhat) VALUES
(N'SoNgayMuonToiDa', '14', N'Tối đa 14 ngày mượn sách', N'Admin'),
(N'SoSachMuonToiDa', '5', N'Mỗi độc giả được mượn tối đa 5 cuốn', N'Admin');
