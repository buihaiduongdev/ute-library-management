CREATE DATABASE uteLMS
GO

USE uteLMS;
-- =========================
-- Bảng tài khoản (login chung cho tất cả)
-- =========================
CREATE TABLE TaiKhoan(
    MaTK INT PRIMARY KEY IDENTITY(1, 1),
    TenDangNhap VARCHAR(50) NOT NULL UNIQUE,
    MatKhauMaHoa VARCHAR(255) NOT NULL,
    VaiTro TINYINT NOT NULL CHECK (VaiTro IN (0,1,2)), 
        -- 0 = Admin, 1 = Nhân viên, 2 = Độc giả
    TrangThai TINYINT NOT NULL DEFAULT 1 CHECK (TrangThai IN (0,1,2))
        -- 0 = Khóa vĩnh viễn, 1 = Hoạt động, 2 = Tạm khóa
);

-- =========================
-- Admin profile
-- =========================
CREATE TABLE Admin(
    MaTK INT PRIMARY KEY REFERENCES TaiKhoan(MaTK) ON DELETE CASCADE,
    HoTen NVARCHAR(50) NOT NULL,
    NgaySinh DATE,
    Email VARCHAR(50) NULL,
    SoDienThoai VARCHAR(20) NULL
);

CREATE UNIQUE INDEX UQ_Admin_Email ON Admin(Email) WHERE Email IS NOT NULL;
CREATE UNIQUE INDEX UQ_Admin_SDT ON Admin(SoDienThoai) WHERE SoDienThoai IS NOT NULL;

-- =========================
-- Nhân viên profile
-- =========================
CREATE TABLE NhanVien(
    IdNV INT PRIMARY KEY IDENTITY(1, 1),
    MaTK INT UNIQUE REFERENCES TaiKhoan(MaTK) ON DELETE CASCADE,
    MaNV VARCHAR(50) NULL,
    HoTen NVARCHAR(50) NOT NULL,
    NgaySinh DATE,
    Email VARCHAR(50) NULL,
    SoDienThoai VARCHAR(20) NULL,
    ChucVu NVARCHAR(50) NOT NULL CHECK (ChucVu IN ('ThuThu', 'NhanVienPartTime', 'NhanVienFullTime'))
);

CREATE UNIQUE INDEX UQ_NV_Email ON NhanVien(Email) WHERE Email IS NOT NULL;
CREATE UNIQUE INDEX UQ_NV_SDT ON NhanVien(SoDienThoai) WHERE SoDienThoai IS NOT NULL;

-- =========================
-- Độc giả profile
-- =========================
CREATE TABLE DocGia(
    IdDG INT PRIMARY KEY IDENTITY(1, 1),
    MaTK INT UNIQUE REFERENCES TaiKhoan(MaTK) ON DELETE CASCADE,
    MaDG VARCHAR(50) NULL,
    HoTen NVARCHAR(50) NOT NULL,
    NgaySinh DATE,
    DiaChi NVARCHAR(255),
    Email VARCHAR(50) NULL,
    SoDienThoai VARCHAR(20) NULL,
    NgayDangKy DATE NOT NULL DEFAULT GETDATE(),
    NgayHetHan DATE NOT NULL,
    TrangThai VARCHAR(50) NOT NULL CHECK(TrangThai IN ('ConHan', 'HetHan', 'TamKhoa'))
);

CREATE UNIQUE INDEX UQ_DG_Email ON DocGia(Email) WHERE Email IS NOT NULL;
CREATE UNIQUE INDEX UQ_DG_SDT ON DocGia(SoDienThoai) WHERE SoDienThoai IS NOT NULL;
