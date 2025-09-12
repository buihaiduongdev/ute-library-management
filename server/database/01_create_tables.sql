CREATE DATABASE uteLMS
GO

USE uteLMS;
-- 1) TAIKHOAN
CREATE TABLE dbo.TaiKhoan (
    MaTK           INT IDENTITY(1,1) PRIMARY KEY,
    TenDangNhap    VARCHAR(50)  NOT NULL UNIQUE,
    MatKhauMaHoa   VARCHAR(255) NOT NULL,
    VaiTro         TINYINT      NOT NULL,
    TrangThai      TINYINT      NOT NULL CONSTRAINT DF_TaiKhoan_TrangThai DEFAULT (1),
    CONSTRAINT CK_TaiKhoan_VaiTro    CHECK (VaiTro IN (0,1,2)),           -- 0=Admin,1=NV,2=ĐG
    CONSTRAINT CK_TaiKhoan_TrangThai CHECK (TrangThai IN (0,1,2))         -- 0=Khoá,1=Hoạt động,2=Tạm khoá
);
GO

-- 2) ADMIN (quản trị viên)
CREATE TABLE dbo.[Admin] (
    MaTK         INT          NOT NULL PRIMARY KEY,            -- PK đồng thời FK
    HoTen        NVARCHAR(50) NOT NULL,
    NgaySinh     DATE         NULL,
    Email        VARCHAR(50)  NULL,
    SoDienThoai  VARCHAR(20)  NULL,
    CONSTRAINT FK_Admin_TaiKhoan
        FOREIGN KEY (MaTK) REFERENCES dbo.TaiKhoan(MaTK) ON DELETE CASCADE
);
GO
-- Unique nếu không NULL (filtered unique index)
CREATE UNIQUE INDEX UX_Admin_Email       ON dbo.[Admin](Email)       WHERE Email IS NOT NULL;
CREATE UNIQUE INDEX UX_Admin_SoDienThoai ON dbo.[Admin](SoDienThoai) WHERE SoDienThoai IS NOT NULL;
GO

-- 3) NHANVIEN
CREATE TABLE dbo.NhanVien (
    IdNV         INT IDENTITY(1,1) PRIMARY KEY,
    MaTK         INT          NOT NULL UNIQUE,
    MaNV         VARCHAR(50)  NULL,
    HoTen        NVARCHAR(50) NOT NULL,
    NgaySinh     DATE         NULL,
    Email        VARCHAR(50)  NULL,
    SoDienThoai  VARCHAR(20)  NULL,
    ChucVu       NVARCHAR(50) NULL,
    CONSTRAINT FK_NhanVien_TaiKhoan
        FOREIGN KEY (MaTK) REFERENCES dbo.TaiKhoan(MaTK) ON DELETE CASCADE,
    CONSTRAINT CK_NhanVien_ChucVu CHECK (ChucVu IS NULL OR ChucVu IN (N'ThủThư', N'PartTime', N'FullTime'))
);
GO
CREATE UNIQUE INDEX UX_NhanVien_Email       ON dbo.NhanVien(Email)       WHERE Email IS NOT NULL;
CREATE UNIQUE INDEX UX_NhanVien_SoDienThoai ON dbo.NhanVien(SoDienThoai) WHERE SoDienThoai IS NOT NULL;
GO

-- 4) DOCGIA
CREATE TABLE dbo.DocGia (
    IdDG         INT IDENTITY(1,1) PRIMARY KEY,
    MaTK         INT          NOT NULL UNIQUE,
    MaDG         VARCHAR(50)  NULL,
    HoTen        NVARCHAR(50) NOT NULL,
    NgaySinh     DATE         NULL,
    DiaChi       NVARCHAR(255) NULL,
    Email        VARCHAR(50)  NULL,
    SoDienThoai  VARCHAR(20)  NULL,
    NgayDangKy   DATE         NOT NULL CONSTRAINT DF_DocGia_NgayDangKy DEFAULT (GETDATE()),
    NgayHetHan   DATE         NOT NULL,
    TrangThai    VARCHAR(50)  NOT NULL,
    CONSTRAINT FK_DocGia_TaiKhoan
        FOREIGN KEY (MaTK) REFERENCES dbo.TaiKhoan(MaTK) ON DELETE CASCADE,
    CONSTRAINT CK_DocGia_TrangThai CHECK (TrangThai IN ('ConHan','HetHan','TamKhoa'))
);
GO
CREATE UNIQUE INDEX UX_DocGia_Email       ON dbo.DocGia(Email)       WHERE Email IS NOT NULL;
CREATE UNIQUE INDEX UX_DocGia_SoDienThoai ON dbo.DocGia(SoDienThoai) WHERE SoDienThoai IS NOT NULL;
GO

-- 5) TACGIA
CREATE TABLE dbo.TacGia (
    MaTG       INT IDENTITY(1,1) PRIMARY KEY,
    TenTacGia  NVARCHAR(100) NOT NULL,
    TieuSu     NVARCHAR(MAX) NULL,
    QuocTich   NVARCHAR(50)  NULL
);
GO

-- 6) THELOAI
CREATE TABLE dbo.TheLoai (
    MaTL        INT IDENTITY(1,1) PRIMARY KEY,
    TenTheLoai  NVARCHAR(100) NOT NULL UNIQUE,
    MoTa        NVARCHAR(MAX) NULL
);
GO

-- 7) NHAXUATBAN
CREATE TABLE dbo.NhaXuatBan (
    MaNXB       INT IDENTITY(1,1) PRIMARY KEY,
    TenNXB      NVARCHAR(255) NOT NULL UNIQUE,
    DiaChi      NVARCHAR(255) NULL,
    SoDienThoai VARCHAR(20)   NULL,
    Email       VARCHAR(50)   NULL
);
GO

-- 8) SACH
CREATE TABLE dbo.Sach (
    MaSach      INT IDENTITY(1,1) PRIMARY KEY,
    TieuDe      NVARCHAR(255) NOT NULL,
    NamXuatBan  INT           NULL,
    GiaSach     FLOAT         NOT NULL CONSTRAINT DF_Sach_GiaSach DEFAULT (0),
    MaNXB       INT           NULL,
    SoLuong     INT           NOT NULL CONSTRAINT DF_Sach_SoLuong DEFAULT (0),
    ViTriKe     NVARCHAR(50)  NULL,
    TrangThai   VARCHAR(50)   NULL,
    CONSTRAINT FK_Sach_NXB FOREIGN KEY (MaNXB) REFERENCES dbo.NhaXuatBan(MaNXB),
    CONSTRAINT CK_Sach_GiaSach   CHECK (GiaSach >= 0),
    CONSTRAINT CK_Sach_SoLuong   CHECK (SoLuong >= 0),
    CONSTRAINT CK_Sach_TrangThai CHECK (TrangThai IS NULL OR TrangThai IN ('Con','Het'))
);
GO

-- 9) SACH_TACGIA (n-n)
CREATE TABLE dbo.Sach_TacGia (
    MaSach  INT NOT NULL,
    MaTG    INT NOT NULL,
    VaiTro  NVARCHAR(50) NULL,
    CONSTRAINT PK_Sach_TacGia PRIMARY KEY (MaSach, MaTG),
    CONSTRAINT FK_Sach_TacGia_Sach   FOREIGN KEY (MaSach) REFERENCES dbo.Sach(MaSach)   ON DELETE CASCADE,
    CONSTRAINT FK_Sach_TacGia_TacGia FOREIGN KEY (MaTG)   REFERENCES dbo.TacGia(MaTG)   ON DELETE CASCADE
);
GO

-- 10) SACH_THELOAI (n-n)
CREATE TABLE dbo.Sach_TheLoai (
    MaSach INT NOT NULL,
    MaTL   INT NOT NULL,
    CONSTRAINT PK_Sach_TheLoai PRIMARY KEY (MaSach, MaTL),
    CONSTRAINT FK_Sach_TheLoai_Sach    FOREIGN KEY (MaSach) REFERENCES dbo.Sach(MaSach)  ON DELETE CASCADE,
    CONSTRAINT FK_Sach_TheLoai_TheLoai FOREIGN KEY (MaTL)   REFERENCES dbo.TheLoai(MaTL) ON DELETE CASCADE
);
GO

-- 11) PHIEUMUON (header)
CREATE TABLE dbo.PhieuMuon (
    MaPM      INT IDENTITY(1,1) PRIMARY KEY,
    IdDG      INT NOT NULL,
    IdNV      INT NULL,
    NgayMuon  DATE NOT NULL CONSTRAINT DF_PhieuMuon_NgayMuon DEFAULT (GETDATE()),
    TrangThai VARCHAR(20) NOT NULL CONSTRAINT DF_PhieuMuon_TrangThai DEFAULT ('DangMuon'),
    CONSTRAINT FK_PhieuMuon_DocGia  FOREIGN KEY (IdDG) REFERENCES dbo.DocGia(IdDG),
    CONSTRAINT FK_PhieuMuon_NhanVien FOREIGN KEY (IdNV) REFERENCES dbo.NhanVien(IdNV),
    CONSTRAINT CK_PhieuMuon_TrangThai CHECK (TrangThai IN ('DangMuon','DaTraMotPhan','DaTraHet','Huy'))
);
GO

-- 12) CHITIETMUON (detail)
CREATE TABLE dbo.ChiTietMuon (
    MaPM        INT NOT NULL,
    MaSach      INT NOT NULL,
    SoLuong     INT NOT NULL CONSTRAINT DF_ChiTietMuon_SoLuong DEFAULT (1),
    NgayMuon    DATE NOT NULL,
    NgayHenTra  DATE NOT NULL,
    NgayTra     DATE NULL,
    TrangThai   VARCHAR(50) NOT NULL CONSTRAINT DF_ChiTietMuon_TrangThai DEFAULT ('DangMuon'),
    CONSTRAINT PK_ChiTietMuon PRIMARY KEY (MaPM, MaSach),
    CONSTRAINT FK_ChiTietMuon_PM   FOREIGN KEY (MaPM)   REFERENCES dbo.PhieuMuon(MaPM) ON DELETE CASCADE,
    CONSTRAINT FK_ChiTietMuon_Sach FOREIGN KEY (MaSach) REFERENCES dbo.Sach(MaSach),
    CONSTRAINT CK_ChiTietMuon_SoLuong   CHECK (SoLuong > 0),
    CONSTRAINT CK_ChiTietMuon_NgayHenTra CHECK (NgayHenTra >= NgayMuon),
    CONSTRAINT CK_ChiTietMuon_NgayTra    CHECK (NgayTra IS NULL OR NgayTra >= NgayMuon),
    CONSTRAINT CK_ChiTietMuon_TrangThai  CHECK (TrangThai IN ('DangMuon','DaTra','TreHan'))
);
GO
CREATE INDEX IX_ChiTietMuon_MaSach ON dbo.ChiTietMuon(MaSach);
GO

-- 13) PHIEUPHAT
CREATE TABLE dbo.PhieuPhat (
    MaPhat              INT IDENTITY(1,1) PRIMARY KEY,
    MaPM                INT           NOT NULL,
    SoTienPhat          DECIMAL(12,2) NOT NULL,
    LyDoPhat            NVARCHAR(255) NULL,
    TrangThaiThanhToan  TINYINT       NOT NULL CONSTRAINT DF_PhieuPhat_TTTT DEFAULT (0), -- 0=Chưa TT,1=Đã TT
    NgayPhat            DATE          NOT NULL CONSTRAINT DF_PhieuPhat_NgayPhat DEFAULT (GETDATE()),
    NgayThanhToan       DATE          NULL,
    GhiChu              NVARCHAR(255) NULL,
    CONSTRAINT FK_PhieuPhat_PM FOREIGN KEY (MaPM) REFERENCES dbo.PhieuMuon(MaPM),
    CONSTRAINT CK_PhieuPhat_SoTien CHECK (SoTienPhat >= 0),
    CONSTRAINT CK_PhieuPhat_TTTT CHECK (TrangThaiThanhToan IN (0,1)),
    CONSTRAINT CK_PhieuPhat_NgayTT CHECK (NgayThanhToan IS NULL OR NgayThanhToan >= NgayPhat)
);
GO
