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
(1, N'Quản trị viên', '1990-01-01', 'admin@test.com', '0901111111');

-- 3. Nhân Viên
INSERT INTO NhanVien (MaTK, MaNV, HoTen, NgaySinh, Email, SoDienThoai, DiaChi, ChucVu)
VALUES (2, 'NV001', N'Nhân viên thư viện', '1995-05-15', 'staff@test.com', '0902222222', N'Hà Nội', N'ThuThu');

-- 4. Độc Giả
INSERT INTO DocGia (MaTK, MaDG, HoTen, NgaySinh, DiaChi, Email, SoDienThoai, NgayDangKy, NgayHetHan, TrangThai)
VALUES
(3, 'DG001', N'Nguyễn Văn A', '2000-03-20', N'123 ABC Street', 'reader1@test.com', '0903333333', GETDATE(), DATEADD(YEAR,1,GETDATE()), 'ConHan'),
(4, 'DG002', N'Trần Thị B', '1999-07-10', N'456 XYZ Street', 'reader2@test.com', '0904444444', GETDATE(), DATEADD(YEAR,1,GETDATE()), 'ConHan');

INSERT INTO TacGia (TenTacGia, TieuSu, QuocTich) VALUES
(N'Nguyễn Nhật Ánh', N'Nhà văn nổi tiếng Việt Nam', N'Việt Nam'),
(N'J.K. Rowling', N'Tác giả Harry Potter', N'Anh'),
(N'Stephen King', N'Vua truyện kinh dị', N'Mỹ');

INSERT INTO TheLoai (TenTheLoai, MoTa) VALUES
(N'Văn học', N'Sách văn học trong nước và ngoài nước'),
(N'Khoa học viễn tưởng', N'Tiểu thuyết khoa học viễn tưởng'),
(N'Kinh dị', N'Truyện kinh dị'),
(N'Thiếu nhi', N'Sách cho trẻ em');

INSERT INTO NhaXuatBan (TenNXB, DiaChi, SoDienThoai, Email) VALUES
(N'NXB Trẻ', N'TP.HCM', '0281234567', 'tre@nxb.vn'),
(N'NXB Kim Đồng', N'Hà Nội', '0241234567', 'kimdong@nxb.vn'),
(N'Bloomsbury', N'London, UK', NULL, 'info@bloomsbury.com');

<<<<<<< HEAD
-- 8. Sách
INSERT INTO Sach (TieuDe, NamXuatBan, GiaSach, MaNXB, SoLuong, ViTriKe, TrangThai) VALUES
(N'Tôi thấy hoa vàng trên cỏ xanh', 2010, 85000, 1, 5, N'A1-001', 'Con'),
(N'Harry Potter và Hòn đá phù thủy', 1997, 150000, 3, 3, N'B2-045', 'Con'),
(N'IT - Gã hề ma quỷ', 1986, 200000, 1, 2, N'C3-012', 'Con'),
(N'Dế Mèn phiêu lưu ký', 1941, 45000, 2, 4, N'D1-008', 'Con');
=======
-- =======================
-- Sách và cuốn sách
-- =======================


-- Cuốn sách cho từng đầu sách
INSERT INTO CuonSach (MaSach, TrangThaiCS)
VALUES (1,'Con'),(1,'Con'),(1,'Con'),(1,'DangMuon'),(1,'Con'),
(2,'Con'),(2,'DangMuon'),(2,'Con'),
(3,'Con'),(3,'Con'),
(4,'Con'),(4,'Con'),(4,'Con'),(4,'Con');

-- Liên kết sách - tác giả
INSERT INTO Sach_TacGia VALUES
(1,1,N'Tác giả chính'),(2,2,N'Tác giả chính'),(3,3,N'Tác giả chính'),(4,1,N'Tác giả chính');
INSERT INTO Sach_TheLoai VALUES (1,1),(1,4),(2,2),(3,3),(4,4);

-- Liên kết sách - thể loại
INSERT INTO Sach_TheLoai (MaSach, MaTL) VALUES
(1, 1), (1, 2),
(2, 2),
(3, 2);

-- =======================
-- Phiếu mượn & chi tiết mượn
-- Giả sử DocGia.IdDG = 1, NhanVien.IdNV = 1 đã tồn tại
-- =======================
INSERT INTO PhieuMuon (IdDG, IdNV) VALUES (1, 1); -- Độc giả 1 mượn sách từ nhân viên 1

-- Mượn 2 cuốn: Mắt Biếc (cuốn 1), Harry Potter (cuốn 4)
INSERT INTO ChiTietMuon (MaPM, MaCuonSach, NgayMuon, NgayHenTra, TrangThai, SoLanGiaHan) VALUES
(1, 4, GETDATE(), DATEADD(DAY, 14, GETDATE()), 'DangMuon', 0), -- Cuốn "Tôi thấy hoa vàng trên cỏ xanh" số 4
(1, 7, GETDATE(), DATEADD(DAY, 14, GETDATE()), 'DangMuon', 1); -- Cuốn "Harry Potter" số 7 (đã gia hạn 1 lần)

--Yêu cầu mượn 
INSERT INTO YeuCauMuon (IdDG, MaCuonSach, NgayHenTra, TrangThai, GhiChu) VALUES
(1, 9, DATEADD(DAY, 10, GETDATE()), 'ChoXuLy', N'Muốn mượn sách IT để đọc cuối tuần'), -- Độc giả 1 yêu cầu mượn cuốn IT số 9
(2, 11, DATEADD(DAY, 7, GETDATE()), 'ChoXuLy', N'Mượn cho con đọc');                  -- Độc giả 2 yêu cầu mượn Dế Mèn số 11

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


-- Cấu hình về mượn sách
INSERT INTO CauHinhHeThong (Nhom, TenThamSo, GiaTri, KieuDuLieu, MoTa, NguoiCapNhat)
VALUES 
-- Cấu hình mượn sách cơ bản
('MuonSach', 'MaxSachMuon', '5', 'INT', N'Số sách tối đa một độc giả có thể mượn cùng lúc', 'System'),
('MuonSach', 'SoNgayMuonMacDinh', '14', 'INT', N'Số ngày mượn mặc định', 'System'),
-- CẤU HÌNH GIA HẠN
('GiaHan', 'MaxLanGiaHan', '2', 'INT', N'Số lần gia hạn tối đa cho mỗi cuốn sách', 'System'),
('GiaHan', 'SoNgayGiaHanMoiLan', '7', 'INT', N'Số ngày gia hạn mỗi lần', 'System'),
('GiaHan', 'PhiGiaHan', '5000', 'DECIMAL', N'Phí gia hạn mỗi lần (VNĐ)', 'System'),
-- CẤU HÌNH YÊU CẦU MƯỢN('YeuCauMuon', 'MaxYeuCauChoXuLy', '5', 'INT', N'Số yêu cầu tối đa đang chờ xử lý của một độc giả', 'System'),
('YeuCauMuon', 'TuDongDuyetYeuCau', '0', 'BIT', N'Tự động duyệt yêu cầu (0=Không, 1=Có)', 'System'),
--Cấu hình phạt
('Phat', 'PhiTreHanMoiNgay', '5000', 'DECIMAL', N'Phí phạt trễ hạn mỗi ngày (VNĐ)', 'System'),
('Phat', 'PhiHuHong', '50000', 'DECIMAL', N'Phí phạt sách hư hỏng (VNĐ)', 'System'),
('Phat', 'PhiMat', '200000', 'DECIMAL', N'Phí phạt sách mất (VNĐ)', 'System');
