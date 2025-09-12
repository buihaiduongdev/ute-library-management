
-- Script to insert sample data for the Library Management System (uteLMS)
-- This script is based on the schema from 01_create_tables.sql

-- USE uteLMS;
-- GO

-- =============================================
-- SETUP: Declare a placeholder hashed password
-- =============================================
-- In a real app, this hash is generated when a user registers.
-- This is a sample bcrypt hash for the password "123456".
DECLARE @hashedPassword VARCHAR(255) = '$2b$10$8bRUoqdYILblfQL.u/jATOUxD0lHGetItzV0d4W/vHEvENlBEtV0C';

BEGIN TRANSACTION;

BEGIN TRY

-- =============================================
-- 1. INSERT ACCOUNTS AND PROFILES
-- =============================================
PRINT N'1. Inserting TaiKhoan, Admin, NhanVien, and DocGia...';

-- Admin Account
DECLARE @adminMaTK INT;
INSERT INTO dbo.TaiKhoan (TenDangNhap, MatKhauMaHoa, VaiTro, TrangThai) VALUES (N'admin', @hashedPassword, 0, 1);
SET @adminMaTK = SCOPE_IDENTITY();
INSERT INTO dbo.[Admin] (MaTK, HoTen, Email, SoDienThoai) VALUES (@adminMaTK, N'Nguyễn Văn Admin', N'admin@uteserver.com', '0901112220');

-- Staff Accounts
DECLARE @nv1MaTK INT, @nv2MaTK INT;
INSERT INTO dbo.TaiKhoan (TenDangNhap, MatKhauMaHoa, VaiTro, TrangThai) VALUES (N'nv.thuthu', @hashedPassword, 1, 1);
SET @nv1MaTK = SCOPE_IDENTITY();
INSERT INTO dbo.NhanVien (MaTK, MaNV, HoTen, ChucVu, Email) VALUES (@nv1MaTK, 'NV001', N'Trần Thị Thủ Thư', N'ThủThư', 'thuthu@uteserver.com');

INSERT INTO dbo.TaiKhoan (TenDangNhap, MatKhauMaHoa, VaiTro, TrangThai) VALUES (N'nv.parttime', @hashedPassword, 1, 1);
SET @nv2MaTK = SCOPE_IDENTITY();
INSERT INTO dbo.NhanVien (MaTK, MaNV, HoTen, ChucVu, Email) VALUES (@nv2MaTK, 'NV002', N'Lê Văn PartTime', N'PartTime', 'parttime@uteserver.com');

-- Reader Accounts
DECLARE @dg1MaTK INT, @dg2MaTK INT;
INSERT INTO dbo.TaiKhoan (TenDangNhap, MatKhauMaHoa, VaiTro, TrangThai) VALUES (N'dg.minhanh', @hashedPassword, 2, 1);
SET @dg1MaTK = SCOPE_IDENTITY();
INSERT INTO dbo.DocGia (MaTK, MaDG, HoTen, NgayHetHan, TrangThai, DiaChi, Email) VALUES (@dg1MaTK, 'DG001', N'Phạm Minh Anh', DATEADD(year, 1, GETDATE()), 'ConHan', N'123 Võ Văn Ngân, Thủ Đức', 'minhanh@student.com');

INSERT INTO dbo.TaiKhoan (TenDangNhap, MatKhauMaHoa, VaiTro, TrangThai) VALUES (N'dg.baobao', @hashedPassword, 2, 1);
SET @dg2MaTK = SCOPE_IDENTITY();
INSERT INTO dbo.DocGia (MaTK, MaDG, HoTen, NgayHetHan, TrangThai, DiaChi, Email) VALUES (@dg2MaTK, 'DG002', N'Đặng Bảo Bảo', DATEADD(year, 1, GETDATE()), 'ConHan', N'456 Lê Văn Việt, Quận 9', 'baobao@student.com');

-- =============================================
-- 2. INSERT AUTHORS, GENRES, PUBLISHERS
-- =============================================
PRINT N'2. Inserting TacGia, TheLoai, NhaXuatBan...';

INSERT INTO dbo.TacGia (TenTacGia, QuocTich) VALUES 
(N'Nguyễn Nhật Ánh', N'Việt Nam'),
(N'J.K. Rowling', N'Anh'),
(N'Dale Carnegie', N'Mỹ');

INSERT INTO dbo.TheLoai (TenTheLoai, MoTa) VALUES
(N'Văn học thiếu nhi', N'Sách dành cho trẻ em và thanh thiếu niên.'),
(N'Tiểu thuyết kỳ ảo', N'Câu chuyện có yếu tố phép thuật, siêu nhiên.'),
(N'Phát triển bản thân', N'Sách kỹ năng sống, self-help.');

INSERT INTO dbo.NhaXuatBan (TenNXB, DiaChi, Email) VALUES
(N'Nhà xuất bản Trẻ', N'161B Lý Chính Thắng, Quận 3, TP.HCM', 'hopthu@nxbtre.com.vn'),
(N'Nhà xuất bản Kim Đồng', N'55 Quang Trung, Hai Bà Trưng, Hà Nội', 'info@nxbkimdong.com.vn'),
(N'Alpha Books', N'176 Thái Hà, Đống Đa, Hà Nội', 'contact@alphabooks.vn');

-- =============================================
-- 3. INSERT BOOKS AND LINK THEM
-- =============================================
PRINT N'3. Inserting Sach, Sach_TacGia, Sach_TheLoai...';

DECLARE @nnaId INT = (SELECT MaTG FROM dbo.TacGia WHERE TenTacGia = N'Nguyễn Nhật Ánh');
DECLARE @jkrId INT = (SELECT MaTG FROM dbo.TacGia WHERE TenTacGia = N'J.K. Rowling');
DECLARE @dcId  INT = (SELECT MaTG FROM dbo.TacGia WHERE TenTacGia = N'Dale Carnegie');

DECLARE @thieunhiId INT = (SELECT MaTL FROM dbo.TheLoai WHERE TenTheLoai = N'Văn học thiếu nhi');
DECLARE @kyaoId     INT = (SELECT MaTL FROM dbo.TheLoai WHERE TenTheLoai = N'Tiểu thuyết kỳ ảo');
DECLARE @ptbtId     INT = (SELECT MaTL FROM dbo.TheLoai WHERE TenTheLoai = N'Phát triển bản thân');

DECLARE @nxbTreId INT = (SELECT MaNXB FROM dbo.NhaXuatBan WHERE TenNXB = N'Nhà xuất bản Trẻ');
DECLARE @alphaId  INT = (SELECT MaNXB FROM dbo.NhaXuatBan WHERE TenNXB = N'Alpha Books');

-- Book 1
DECLARE @sach1Id INT;
INSERT INTO dbo.Sach (TieuDe, NamXuatBan, GiaSach, MaNXB, SoLuong, ViTriKe, TrangThai) VALUES (N'Cho tôi xin một vé đi tuổi thơ', 2008, 80000, @nxbTreId, 10, N'A1-01', 'Con');
SET @sach1Id = SCOPE_IDENTITY();
INSERT INTO dbo.Sach_TacGia(MaSach, MaTG) VALUES (@sach1Id, @nnaId);
INSERT INTO dbo.Sach_TheLoai(MaSach, MaTL) VALUES (@sach1Id, @thieunhiId);

-- Book 2
DECLARE @sach2Id INT;
INSERT INTO dbo.Sach (TieuDe, NamXuatBan, GiaSach, MaNXB, SoLuong, ViTriKe, TrangThai) VALUES (N'Harry Potter và Hòn đá Phù thủy', 1997, 150000, @nxbTreId, 5, N'B2-05', 'Con');
SET @sach2Id = SCOPE_IDENTITY();
INSERT INTO dbo.Sach_TacGia(MaSach, MaTG) VALUES (@sach2Id, @jkrId);
INSERT INTO dbo.Sach_TheLoai(MaSach, MaTL) VALUES (@sach2Id, @kyaoId);

-- Book 3
DECLARE @sach3Id INT;
INSERT INTO dbo.Sach (TieuDe, NamXuatBan, GiaSach, MaNXB, SoLuong, ViTriKe, TrangThai) VALUES (N'Đắc Nhân Tâm', 1936, 120000, @alphaId, 20, N'C3-10', 'Con');
SET @sach3Id = SCOPE_IDENTITY();
INSERT INTO dbo.Sach_TacGia(MaSach, MaTG) VALUES (@sach3Id, @dcId);
INSERT INTO dbo.Sach_TheLoai(MaSach, MaTL) VALUES (@sach3Id, @ptbtId);

-- =============================================
-- 4. INSERT LOAN SLIPS (PhieuMuon)
-- =============================================
PRINT N'4. Inserting PhieuMuon and ChiTietMuon...';

DECLARE @dgMinhAnhId INT = (SELECT IdDG FROM dbo.DocGia WHERE MaDG = 'DG001');
DECLARE @nvThuThuId INT = (SELECT IdNV FROM dbo.NhanVien WHERE MaNV = 'NV001');

DECLARE @pm1Id INT;
DECLARE @ngayMuon DATE = GETDATE();

-- Minh Anh borrows 2 books, facilitated by staff Thu Thu
INSERT INTO dbo.PhieuMuon (IdDG, IdNV, NgayMuon, TrangThai) VALUES (@dgMinhAnhId, @nvThuThuId, @ngayMuon, 'DangMuon');
SET @pm1Id = SCOPE_IDENTITY();

-- Detail for Loan Slip 1
INSERT INTO dbo.ChiTietMuon (MaPM, MaSach, SoLuong, NgayMuon, NgayHenTra, TrangThai)
VALUES 
    (@pm1Id, @sach1Id, 1, @ngayMuon, DATEADD(day, 14, @ngayMuon), 'DangMuon'),
    (@pm1Id, @sach3Id, 1, @ngayMuon, DATEADD(day, 14, @ngayMuon), 'DangMuon');

-- Update book quantities
UPDATE dbo.Sach SET SoLuong = SoLuong - 1 WHERE MaSach IN (@sach1Id, @sach3Id);


    COMMIT TRANSACTION;
    PRINT N'Sample data insertion was successful.';

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    -- Raiserror will pass the error up to the application
    DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
    DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
    DECLARE @ErrorState INT = ERROR_STATE();

    PRINT N'Error occurred, rolling back transaction.';
    RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
END CATCH

GO
