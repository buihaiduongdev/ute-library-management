-- =====================================================
-- TẠO DATABASE MỚI CHO TEST CÁC TÍNH NĂNG MỚI
-- =====================================================

-- Tạo database mới (hoặc xóa database cũ)
DROP DATABASE IF EXISTS uteLMS_Test;
CREATE DATABASE uteLMS_Test;
GO

USE uteLMS_Test;
GO

-- =====================================================
-- TẠO CÁC BẢNG CƠ BẢN
-- =====================================================

-- Bảng TaiKhoan
CREATE TABLE TaiKhoan (
    MaTK          INT IDENTITY(1,1) PRIMARY KEY,
    TenDangNhap   VARCHAR(50) NOT NULL UNIQUE,
    MatKhauMaHoa  VARCHAR(255) NOT NULL,
    VaiTro        TINYINT NOT NULL,  -- 0=Admin,1=NV,2=DG
    TrangThai     TINYINT NOT NULL DEFAULT 1, -- 0=Khoá,1=Hoạt động,2=Tạm khoá
    CONSTRAINT CK_TaiKhoan_VaiTro CHECK (VaiTro IN (0,1,2)),
    CONSTRAINT CK_TaiKhoan_TrangThai CHECK (TrangThai IN (0,1,2))
);

-- Bảng Admin
CREATE TABLE Admin (
    MaTK        INT PRIMARY KEY,
    HoTen       NVARCHAR(50) NOT NULL,
    NgaySinh    DATE NULL,
    Email       VARCHAR(50) UNIQUE NULL,
    SoDienThoai VARCHAR(20) UNIQUE NULL,
    CONSTRAINT FK_Admin_TaiKhoan FOREIGN KEY (MaTK) REFERENCES TaiKhoan(MaTK) ON DELETE CASCADE
);

-- Bảng NhanVien
CREATE TABLE NhanVien (
    IdNV        INT IDENTITY(1,1) PRIMARY KEY,
    MaTK        INT NOT NULL UNIQUE,
    MaNV        VARCHAR(50) NULL,
    HoTen       NVARCHAR(50) NOT NULL,
    NgaySinh    DATE NULL,
    Email       VARCHAR(50) UNIQUE NULL,
    SoDienThoai VARCHAR(20) UNIQUE NULL,
    DiaChi      NVARCHAR(255) NULL,
    ChucVu      NVARCHAR(50) NULL,
    CONSTRAINT FK_NhanVien_TaiKhoan FOREIGN KEY (MaTK) REFERENCES TaiKhoan(MaTK) ON DELETE CASCADE
);

-- Bảng DocGia
CREATE TABLE DocGia (
    IdDG        INT IDENTITY(1,1) PRIMARY KEY,
    MaTK        INT NOT NULL UNIQUE,
    MaDG        VARCHAR(50) NULL,
    HoTen       NVARCHAR(50) NOT NULL,
    NgaySinh    DATE NULL,
    DiaChi      NVARCHAR(255) NULL,
    Email       VARCHAR(50) UNIQUE NULL,
    SoDienThoai VARCHAR(20) UNIQUE NULL,
    NgayDangKy  DATE NOT NULL DEFAULT GETDATE(),
    NgayHetHan  DATE NOT NULL,
    TrangThai   VARCHAR(50) NOT NULL, -- ConHan, HetHan, TamKhoa
    CONSTRAINT FK_DocGia_TaiKhoan FOREIGN KEY (MaTK) REFERENCES TaiKhoan(MaTK) ON DELETE CASCADE,
    CONSTRAINT CK_DocGia_TrangThai CHECK (TrangThai IN ('ConHan','HetHan','TamKhoa'))
);

-- Bảng TacGia
CREATE TABLE TacGia (
    MaTG       INT IDENTITY(1,1) PRIMARY KEY,
    TenTacGia  NVARCHAR(100) NOT NULL,
    TieuSu     NVARCHAR(MAX) NULL,
    QuocTich   NVARCHAR(50) NULL
);

-- Bảng TheLoai
CREATE TABLE TheLoai (
    MaTL       INT IDENTITY(1,1) PRIMARY KEY,
    TenTheLoai NVARCHAR(100) NOT NULL UNIQUE,
    MoTa       NVARCHAR(MAX) NULL
);

-- Bảng NhaXuatBan
CREATE TABLE NhaXuatBan (
    MaNXB       INT IDENTITY(1,1) PRIMARY KEY,
    TenNXB      NVARCHAR(255) NOT NULL UNIQUE,
    DiaChi      NVARCHAR(255) NULL,
    SoDienThoai VARCHAR(20) NULL,
    Email       VARCHAR(50) NULL
);

-- Bảng Sach
CREATE TABLE Sach (
    MaSach     INT IDENTITY(1,1) PRIMARY KEY,
    TieuDe     NVARCHAR(255) NOT NULL,
    NamXuatBan INT NULL,
    GiaSach    DECIMAL(10,2) NOT NULL DEFAULT 0,
    MaNXB      INT NULL,
    SoLuong    INT NOT NULL DEFAULT 0,
    ViTriKe    NVARCHAR(50) NULL,
    TrangThai  VARCHAR(50) NOT NULL, -- Con, Het
    AnhBia     NVARCHAR(MAX) NULL,
    CONSTRAINT FK_Sach_NXB FOREIGN KEY (MaNXB) REFERENCES NhaXuatBan(MaNXB),
    CONSTRAINT CK_Sach_TrangThai CHECK (TrangThai IN ('Con','Het'))
);

-- Bảng CuonSach
CREATE TABLE CuonSach (
    MaCuonSach INT IDENTITY(1,1) PRIMARY KEY,
    MaSach     INT NOT NULL,
    TrangThaiCS VARCHAR(50) NOT NULL, -- Con, DangMuon, Mat, Hong
    CONSTRAINT FK_CuonSach_Sach FOREIGN KEY (MaSach) REFERENCES Sach(MaSach),
    CONSTRAINT CK_CuonSach_TrangThai CHECK (TrangThaiCS IN ('Con','DangMuon','Mat','Hong'))
);

-- Bảng Sach_TacGia
CREATE TABLE Sach_TacGia (
    MaSach INT NOT NULL,
    MaTG   INT NOT NULL,
    VaiTro NVARCHAR(50) NULL,
    PRIMARY KEY (MaSach, MaTG),
    CONSTRAINT FK_STG_Sach FOREIGN KEY (MaSach) REFERENCES Sach(MaSach),
    CONSTRAINT FK_STG_TacGia FOREIGN KEY (MaTG) REFERENCES TacGia(MaTG)
);

-- Bảng Sach_TheLoai
CREATE TABLE Sach_TheLoai (
    MaSach INT NOT NULL,
    MaTL   INT NOT NULL,
    PRIMARY KEY (MaSach, MaTL),
    CONSTRAINT FK_STL_Sach FOREIGN KEY (MaSach) REFERENCES Sach(MaSach),
    CONSTRAINT FK_STL_TheLoai FOREIGN KEY (MaTL) REFERENCES TheLoai(MaTL)
);

-- Bảng PhieuMuon
CREATE TABLE PhieuMuon (
    MaPM INT IDENTITY(1,1) PRIMARY KEY,
    IdDG INT NOT NULL,
    IdNV INT NOT NULL,
    CONSTRAINT FK_PM_DocGia FOREIGN KEY (IdDG) REFERENCES DocGia(IdDG),
    CONSTRAINT FK_PM_NhanVien FOREIGN KEY (IdNV) REFERENCES NhanVien(IdNV)
);

-- ⭐ Bảng ChiTietMuon (ĐÃ CÓ SoLanGiaHan)
CREATE TABLE ChiTietMuon (
    MaPM         INT NOT NULL,
    MaCuonSach   INT NOT NULL,
    NgayMuon     DATE NOT NULL,
    NgayHenTra   DATE NOT NULL,
    NgayTra      DATE NULL,
    TrangThai    VARCHAR(50) NOT NULL CHECK (TrangThai IN ('DangMuon','DaTra','TreHan')),
    SoLanGiaHan  INT NOT NULL DEFAULT 0, -- ✅ TÍNH NĂNG MỚI: Số lần gia hạn
    PRIMARY KEY (MaPM, MaCuonSach),
    CONSTRAINT FK_CTM_PM FOREIGN KEY (MaPM) REFERENCES PhieuMuon(MaPM),
    CONSTRAINT FK_CTM_CuonSach FOREIGN KEY (MaCuonSach) REFERENCES CuonSach(MaCuonSach)
);

-- ⭐ Bảng YeuCauMuon (TÍNH NĂNG MỚI)
CREATE TABLE YeuCauMuon (
    MaYeuCau    INT IDENTITY(1,1) PRIMARY KEY,
    IdDG        INT NOT NULL,         -- FK -> DocGia.IdDG
    MaCuonSach  INT NOT NULL,         -- FK -> CuonSach.MaCuonSach  
    NgayYeuCau  DATETIME NOT NULL DEFAULT GETDATE(),
    NgayHenTra  DATE NOT NULL,
    TrangThai   VARCHAR(20) NOT NULL CHECK (TrangThai IN ('ChoXuLy', 'DaDuyet', 'TuChoi')),
    LyDoTuChoi  NVARCHAR(255) NULL,
    IdNVXuLy    INT NULL,             -- FK -> NhanVien.IdNV (nullable)
    NgayXuLy    DATETIME NULL,
    GhiChu      NVARCHAR(255) NULL,
    
    CONSTRAINT FK_YeuCauMuon_DocGia FOREIGN KEY (IdDG) REFERENCES DocGia(IdDG),
    CONSTRAINT FK_YeuCauMuon_CuonSach FOREIGN KEY (MaCuonSach) REFERENCES CuonSach(MaCuonSach),
    CONSTRAINT FK_YeuCauMuon_NhanVien FOREIGN KEY (IdNVXuLy) REFERENCES NhanVien(IdNV)
);

-- Bảng TraSach
CREATE TABLE TraSach (
    MaTraSach INT PRIMARY KEY IDENTITY(1,1),
    MaPM INT NOT NULL,   
    IdNV INT NULL,       
    NgayTra DATE NOT NULL,   
    GhiChu NVARCHAR(255) NULL,
    DaThongBao BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_TraSach_PM FOREIGN KEY (MaPM) REFERENCES PhieuMuon(MaPM) ON DELETE CASCADE,
    CONSTRAINT FK_TraSach_NV FOREIGN KEY (IdNV) REFERENCES NhanVien(IdNV)
);

-- Bảng ChiTietTraSach
CREATE TABLE ChiTietTraSach (
    MaTraSach INT NOT NULL,
    MaCuonSach INT NOT NULL,
    ChatLuongSach VARCHAR(20) NOT NULL CHECK (ChatLuongSach IN ('Tot','HuHong','Mat')),
    PRIMARY KEY (MaTraSach, MaCuonSach),
    CONSTRAINT FK_CTTra_TraSach FOREIGN KEY (MaTraSach) REFERENCES TraSach(MaTraSach) ON DELETE CASCADE,
    CONSTRAINT FK_CTTra_CuonSach FOREIGN KEY (MaCuonSach) REFERENCES CuonSach(MaCuonSach) ON DELETE CASCADE
);

-- Bảng ThePhat
CREATE TABLE ThePhat (
    MaPhat INT PRIMARY KEY IDENTITY(1,1),
    MaTraSach INT NOT NULL,
    MaCuonSach INT NOT NULL,
    SoTienPhat DECIMAL(10,2) NOT NULL CHECK (SoTienPhat >= 0),
    LyDoPhat NVARCHAR(20) NOT NULL CHECK (LyDoPhat IN ('TreHan','HuHong','Mat')),
    TrangThaiThanhToan VARCHAR(20) NOT NULL CHECK (TrangThaiThanhToan IN ('DaThanhToan','ChuaThanhToan','MienPhi')),
    NgayThanhToan DATE NULL,
    GhiChu NVARCHAR(255) NULL,
    CONSTRAINT FK_ThePhat_TraSach FOREIGN KEY (MaTraSach) REFERENCES TraSach(MaTraSach) ON DELETE CASCADE,
    CONSTRAINT FK_ThePhat_CuonSach FOREIGN KEY (MaCuonSach) REFERENCES CuonSach(MaCuonSach) ON DELETE CASCADE
);

-- Bảng CauHinhHeThong
CREATE TABLE CauHinhHeThong (
    MaCH         INT IDENTITY(1,1) PRIMARY KEY,
    Nhom         NVARCHAR(50) NOT NULL,
    TenThamSo    NVARCHAR(100) NOT NULL,
    GiaTri       NVARCHAR(255) NOT NULL,
    KieuDuLieu   NVARCHAR(50) NOT NULL,
    MoTa         NVARCHAR(255) NULL,
    NgayCapNhat  DATETIME NOT NULL DEFAULT GETDATE(),
    NguoiCapNhat NVARCHAR(50) NULL,
    CONSTRAINT UQ_CauHinh UNIQUE (Nhom, TenThamSo)
);

-- =====================================================
-- CHÈN DỮ LIỆU MẪU
-- =====================================================

-- Mật khẩu mã hóa: admin và 123456
DECLARE @hashedPassword VARCHAR(255) = '$2b$10$8bRUoqdYILblfQL.u/jATOUxD0lHGetItzV0d4W/vHEvENlBEtV0C';

-- 1. Tài khoản
INSERT INTO TaiKhoan (TenDangNhap, MatKhauMaHoa, VaiTro, TrangThai) VALUES
('admin01', @hashedPassword, 0, 1),
('staff01', @hashedPassword, 1, 1), 
('reader01', @hashedPassword, 2, 1),
('reader02', @hashedPassword, 2, 1);

-- 2. Admin
INSERT INTO Admin (MaTK, HoTen, NgaySinh, Email, SoDienThoai) VALUES
(1, N'Quản trị viên', '1990-01-01', 'admin@test.com', '0901111111');

-- 3. Nhân viên
INSERT INTO NhanVien (MaTK, MaNV, HoTen, NgaySinh, Email, SoDienThoai, DiaChi, ChucVu) VALUES
(2, 'NV001', N'Nhân viên thư viện', '1995-05-15', 'staff@test.com', '0902222222', N'Hà Nội', N'ThuThu');

-- 4. Độc giả
INSERT INTO DocGia (MaTK, MaDG, HoTen, NgaySinh, DiaChi, Email, SoDienThoai, NgayDangKy, NgayHetHan, TrangThai) VALUES
(3, 'DG001', N'Nguyễn Văn A', '2000-03-20', N'123 ABC Street', 'reader1@test.com', '0903333333', GETDATE(), DATEADD(YEAR,1,GETDATE()), 'ConHan'),
(4, 'DG002', N'Trần Thị B', '1999-07-10', N'456 XYZ Street', 'reader2@test.com', '0904444444', GETDATE(), DATEADD(YEAR,1,GETDATE()), 'ConHan');

-- 5. Tác giả
INSERT INTO TacGia (TenTacGia, TieuSu, QuocTich) VALUES
(N'Nguyễn Nhật Ánh', N'Nhà văn nổi tiếng Việt Nam', N'Việt Nam'),
(N'J.K. Rowling', N'Tác giả Harry Potter', N'Anh'),
(N'Stephen King', N'Vua truyện kinh dị', N'Mỹ');

-- 6. Thể loại
INSERT INTO TheLoai (TenTheLoai, MoTa) VALUES
(N'Văn học', N'Sách văn học trong nước và ngoài nước'),
(N'Khoa học viễn tưởng', N'Tiểu thuyết khoa học viễn tưởng'),
(N'Kinh dị', N'Truyện kinh dị, ma quỷ'),
(N'Thiếu nhi', N'Sách dành cho trẻ em');

-- 7. Nhà xuất bản
INSERT INTO NhaXuatBan (TenNXB, DiaChi, SoDienThoai, Email) VALUES
(N'NXB Trẻ', N'TP.HCM', '0281234567', 'tre@nxb.vn'),
(N'NXB Kim Đồng', N'Hà Nội', '0241234567', 'kimdong@nxb.vn'),
(N'Bloomsbury', N'London, UK', NULL, 'info@bloomsbury.com');

-- 8. Sách
INSERT INTO Sach (TieuDe, NamXuatBan, GiaSach, MaNXB, SoLuong, ViTriKe, TrangThai) VALUES
(N'Tôi thấy hoa vàng trên cỏ xanh', 2010, 85000, 1, 5, N'A1-001', 'Con'),
(N'Harry Potter và Hòn đá phù thủy', 1997, 150000, 3, 3, N'B2-045', 'Con'),
(N'IT - Gã hề ma quỷ', 1986, 200000, 1, 2, N'C3-012', 'Con'),
(N'Dế Mèn phiêu lưu ký', 1941, 45000, 2, 4, N'D1-008', 'Con');

-- 9. Cuốn sách
INSERT INTO CuonSach (MaSach, TrangThaiCS) VALUES
-- Tôi thấy hoa vàng trên cỏ xanh (5 cuốn)
(1, 'Con'), (1, 'Con'), (1, 'Con'), (1, 'DangMuon'), (1, 'Con'),
-- Harry Potter (3 cuốn) 
(2, 'Con'), (2, 'DangMuon'), (2, 'Con'),
-- IT (2 cuốn)
(3, 'Con'), (3, 'Con'),
-- Dế Mèn (4 cuốn)
(4, 'Con'), (4, 'Con'), (4, 'Con'), (4, 'Con');

-- 10. Liên kết sách - tác giả
INSERT INTO Sach_TacGia (MaSach, MaTG, VaiTro) VALUES
(1, 1, N'Tác giả chính'),
(2, 2, N'Tác giả chính'), 
(3, 3, N'Tác giả chính'),
(4, 1, N'Tác giả chính');

-- 11. Liên kết sách - thể loại
INSERT INTO Sach_TheLoai (MaSach, MaTL) VALUES
(1, 1), (1, 4), -- Văn học + Thiếu nhi
(2, 2),         -- Khoa học viễn tưởng
(3, 3),         -- Kinh dị  
(4, 4);         -- Thiếu nhi

-- 12. ⭐ CẤU HÌNH HỆ THỐNG (BAO GỒM CÁC TÍNH NĂNG MỚI)
INSERT INTO CauHinhHeThong (Nhom, TenThamSo, GiaTri, KieuDuLieu, MoTa, NguoiCapNhat)
VALUES 
-- Cấu hình mượn sách cơ bản
('MuonSach', 'MaxSachMuon', '5', 'INT', N'Số sách tối đa một độc giả có thể mượn cùng lúc', 'System'),
('MuonSach', 'SoNgayMuonMacDinh', '14', 'INT', N'Số ngày mượn mặc định', 'System'),

-- ⭐ CẤU HÌNH GIA HẠN (TÍNH NĂNG MỚI)
('GiaHan', 'MaxLanGiaHan', '2', 'INT', N'Số lần gia hạn tối đa cho mỗi cuốn sách', 'System'),
('GiaHan', 'SoNgayGiaHanMoiLan', '7', 'INT', N'Số ngày gia hạn mỗi lần', 'System'),
('GiaHan', 'PhiGiaHan', '5000', 'DECIMAL', N'Phí gia hạn mỗi lần (VNĐ)', 'System'),

-- ⭐ CẤU HÌNH YÊU CẦU MƯỢN (TÍNH NĂNG MỚI)
('YeuCauMuon', 'MaxYeuCauChoXuLy', '5', 'INT', N'Số yêu cầu tối đa đang chờ xử lý của một độc giả', 'System'),
('YeuCauMuon', 'TuDongDuyetYeuCau', '0', 'BIT', N'Tự động duyệt yêu cầu (0=Không, 1=Có)', 'System'),

-- Cấu hình phạt (tất cả phí phạt đều lấy từ config)
('Phat', 'PhiTreHanMoiNgay', '5000', 'DECIMAL', N'Phí phạt trễ hạn mỗi ngày (VNĐ)', 'System'),
('Phat', 'PhiHuHong', '50000', 'DECIMAL', N'Phí phạt sách hư hỏng (VNĐ)', 'System'),
('Phat', 'PhiMat', '200000', 'DECIMAL', N'Phí phạt sách mất (VNĐ)', 'System');

-- 13. ⭐ DỮ LIỆU MẪU: Tạo 1 phiếu mượn để test gia hạn
INSERT INTO PhieuMuon (IdDG, IdNV) VALUES (1, 1); -- Độc giả 1 mượn sách từ nhân viên 1

INSERT INTO ChiTietMuon (MaPM, MaCuonSach, NgayMuon, NgayHenTra, TrangThai, SoLanGiaHan) VALUES
(1, 4, GETDATE(), DATEADD(DAY, 14, GETDATE()), 'DangMuon', 0), -- Cuốn "Tôi thấy hoa vàng trên cỏ xanh" số 4
(1, 7, GETDATE(), DATEADD(DAY, 14, GETDATE()), 'DangMuon', 1); -- Cuốn "Harry Potter" số 7 (đã gia hạn 1 lần)

-- 14. ⭐ DỮ LIỆU MẪU: Tạo 1 yêu cầu mượn để test
INSERT INTO YeuCauMuon (IdDG, MaCuonSach, NgayHenTra, TrangThai, GhiChu) VALUES
(1, 9, DATEADD(DAY, 10, GETDATE()), 'ChoXuLy', N'Muốn mượn sách IT để đọc cuối tuần'), -- Độc giả 1 yêu cầu mượn cuốn IT số 9
(2, 11, DATEADD(DAY, 7, GETDATE()), 'ChoXuLy', N'Mượn cho con đọc');                  -- Độc giả 2 yêu cầu mượn Dế Mèn số 11

-- =====================================================
-- KIỂM TRA DỮ LIỆU
-- =====================================================

SELECT 'Tổng quan' as [Thông tin];
SELECT 'Tài khoản' as [Bảng], COUNT(*) as [Số dòng] FROM TaiKhoan
UNION ALL
SELECT 'Sách', COUNT(*) FROM Sach  
UNION ALL
SELECT 'Cuốn sách', COUNT(*) FROM CuonSach
UNION ALL
SELECT 'Độc giả', COUNT(*) FROM DocGia
UNION ALL  
SELECT 'Phiếu mượn', COUNT(*) FROM PhieuMuon
UNION ALL
SELECT 'Chi tiết mượn', COUNT(*) FROM ChiTietMuon
UNION ALL
SELECT '⭐ Yêu cầu mượn', COUNT(*) FROM YeuCauMuon
UNION ALL
SELECT 'Cấu hình hệ thống', COUNT(*) FROM CauHinhHeThong;

-- Hiển thị yêu cầu mượn
SELECT 
    yc.MaYeuCau,
    dg.HoTen as [Độc giả],
    s.TieuDe as [Sách yêu cầu],
    yc.TrangThai,
    yc.NgayYeuCau,
    yc.GhiChu
FROM YeuCauMuon yc
JOIN DocGia dg ON yc.IdDG = dg.IdDG
JOIN CuonSach cs ON yc.MaCuonSach = cs.MaCuonSach  
JOIN Sach s ON cs.MaSach = s.MaSach;

-- Hiển thị chi tiết mượn có thể gia hạn
SELECT 
    pm.MaPM,
    dg.HoTen as [Độc giả], 
    s.TieuDe as [Sách đang mượn],
    ctm.NgayHenTra,
    ctm.SoLanGiaHan,
    CASE WHEN ctm.SoLanGiaHan < 2 THEN N'Có thể gia hạn' ELSE N'Hết lượt gia hạn' END as [Trạng thái gia hạn]
FROM ChiTietMuon ctm
JOIN PhieuMuon pm ON ctm.MaPM = pm.MaPM
JOIN DocGia dg ON pm.IdDG = dg.IdDG
JOIN CuonSach cs ON ctm.MaCuonSach = cs.MaCuonSach
JOIN Sach s ON cs.MaSach = s.MaSach
WHERE ctm.TrangThai = 'DangMuon';

PRINT N'✅ Database test đã được tạo thành công!';
PRINT N'✅ Có thể test các API sau:';
PRINT N'   - POST /api/requests (Tạo yêu cầu mượn)';  
PRINT N'   - GET /api/requests (Xem yêu cầu mượn)';
PRINT N'   - PUT /api/requests/:id/approve (Duyệt yêu cầu)';
PRINT N'   - POST /api/borrow/extend (Gia hạn sách)';
PRINT N'   - GET /api/borrow/extendable (Xem sách có thể gia hạn)';

-- =====================================================
-- THÔNG TIN ĐĂNG NHẬP TEST
-- =====================================================
PRINT N'';
PRINT N'🔐 THÔNG TIN ĐĂNG NHẬP:';
PRINT N'   Admin: admin01 / admin';  
PRINT N'   Staff: staff01 / 123456';
PRINT N'   Reader1: reader01 / 123456 (có sách đang mượn)';
PRINT N'   Reader2: reader02 / 123456 (chưa mượn sách nào)';