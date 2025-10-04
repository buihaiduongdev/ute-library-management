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

INSERT INTO TacGia (TenTacGia, TieuSu, QuocTich) VALUES
(N'Nguyễn Nhật Ánh', N'Nhà văn viết truyện tuổi học trò', N'Việt Nam'),
(N'J. K. Rowling', N'Tác giả Harry Potter', N'Anh'),
(N'Haruki Murakami', N'Tác giả nổi tiếng Nhật Bản', N'Nhật Bản');

INSERT INTO TheLoai (TenTheLoai, MoTa) VALUES
(N'Thiếu nhi', N'Sách cho lứa tuổi thiếu nhi'),
(N'Tiểu thuyết', N'Truyện dài, nhiều tập'),
(N'Khoa học', N'Tài liệu nghiên cứu khoa học');

INSERT INTO NhaXuatBan (TenNXB, DiaChi, SoDienThoai, Email) VALUES
(N'NXB Trẻ', N'TP.HCM', '0123456789', 'contact@nxbtre.vn'),
(N'Bloomsbury Publishing', N'London, UK', NULL, 'info@bloomsbury.com'),
(N'Shinchosha', N'Tokyo, Japan', NULL, NULL);

<<<<<<< HEAD
-- 8. Sách
INSERT INTO Sach (TieuDe, NamXuatBan, GiaSach, MaNXB, SoLuong, ViTriKe, AnhBia, TrangThai) VALUES
(N'Book Title 1', 2020, 100000, 1, 5, N'A1', NULL, 'Con');
(N'Kafka bên bờ biển', 2002, 120000, 2, 5, N'K2', NULL, 'Con');
=======
-- =======================
-- Sách và cuốn sách
-- =======================
INSERT INTO Sach (TieuDe, NamXuatBan, GiaSach, MaNXB, SoLuong, ViTriKe, TrangThai) VALUES
(N'Mắt Biếc', 1990, 55000, 1, 3, N'Kệ A1', 'Con'),
(N'Harry Potter and the Philosopher''s Stone', 1997, 150000, 2, 5, N'Kệ B2', 'Con'),
(N'Norwegian Wood', 1987, 120000, 3, 2, N'Kệ C3', 'Con');


-- Cuốn sách cho từng đầu sách
INSERT INTO CuonSach (MaSach, TrangThaiCS) VALUES
(1, 'Con'), (1, 'Con'), (1, 'Con'),
(2, 'Con'), (2, 'Con'), (2, 'Con'), (2, 'Con'), (2, 'Con'),
(3, 'Con'), (3, 'Con');

-- Liên kết sách - tác giả
INSERT INTO Sach_TacGia (MaSach, MaTG, VaiTro) VALUES
(1, 1, N'Tác giả chính'),
(2, 2, N'Tác giả chính'),
(3, 3, N'Tác giả chính');

-- Liên kết sách - thể loại
INSERT INTO Sach_TheLoai (MaSach, MaTL) VALUES
(1, 1), (1, 2),
(2, 2),
(3, 2);

-- =======================
-- Phiếu mượn & chi tiết mượn
-- Giả sử DocGia.IdDG = 1, NhanVien.IdNV = 1 đã tồn tại
-- =======================
INSERT INTO PhieuMuon (IdDG, IdNV) VALUES
(1, 1);

-- Mượn 2 cuốn: Mắt Biếc (cuốn 1), Harry Potter (cuốn 4)
INSERT INTO ChiTietMuon (MaPM, MaCuonSach, NgayMuon, NgayHenTra, TrangThai) VALUES
(1, 1, '2025-09-20', '2025-09-30', 'DangMuon'),
(1, 4, '2025-09-20', '2025-09-30', 'DangMuon');

-- =======================
-- Trả sách
-- =======================
INSERT INTO TraSach (MaPM, IdNV, NgayTra, GhiChu, DaThongBao) VALUES
(1, 1, '2025-09-25', N'Trái hẹn 1 cuốn', 1);

-- Trả 2 cuốn, 1 tốt, 1 hư hỏng
INSERT INTO ChiTietTraSach (MaTraSach, MaCuonSach, ChatLuongSach) VALUES
(1, 1, 'Tot'),
(1, 4, 'HuHong');

-- =======================
-- Thẻ phạt (cho cuốn bị hư hỏng)
-- =======================
INSERT INTO ThePhat (MaTraSach, MaCuonSach, SoTienPhat, LyDoPhat, TrangThaiThanhToan, GhiChu) VALUES
(1, 4, 50000, N'HuHong', 'ChuaThanhToan', N'Bìa sách bị rách');
-- Cấu hình về phạt
INSERT INTO CauHinhHeThong (Nhom, TenThamSo, GiaTri, KieuDuLieu, MoTa, NguoiCapNhat)
VALUES 
('Phat', 'PhiTreHanMoiNgay', '5000', 'DECIMAL', N'Phí phạt trễ hạn mỗi ngày (VNĐ)', 'System'),
('Phat', 'PhiHuHong', '50000', 'DECIMAL', N'Phí phạt sách hư hỏng (VNĐ)', 'System'),
('Phat', 'PhiMat', '200000', 'DECIMAL', N'Phí phạt sách mất (VNĐ)', 'System');


-- Cấu hình về mượn sách
INSERT INTO CauHinhHeThong (Nhom, TenThamSo, GiaTri, KieuDuLieu, MoTa, NguoiCapNhat)
VALUES 
('MuonSach', 'MaxSachMuon', '5', 'INT', N'Số sách tối đa một độc giả có thể mượn cùng lúc', 'System'),
('MuonSach', 'SoNgayMuonMacDinh', '14', 'INT', N'Số ngày mượn mặc định', 'System');
