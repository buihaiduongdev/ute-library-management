CREATE DATABASE uteLMS;
GO
USE uteLMS;
GO

-- =======================
-- 1. Bảng Tài Khoản (Bảng 4-2)
-- =======================
CREATE TABLE TaiKhoan (
    MaTK          INT IDENTITY(1,1) PRIMARY KEY,
    TenDangNhap   VARCHAR(50) NOT NULL UNIQUE,
    MatKhauMaHoa  VARCHAR(255) NOT NULL,
    VaiTro        TINYINT NOT NULL,  -- 0=Admin,1=NV,2=DG
    TrangThai     TINYINT NOT NULL DEFAULT 1, -- 0=Khoá,1=Hoạt động,2=Tạm khoá
    CONSTRAINT CK_TaiKhoan_VaiTro CHECK (VaiTro IN (0,1,2)),
    CONSTRAINT CK_TaiKhoan_TrangThai CHECK (TrangThai IN (0,1,2))
);

-- =======================
-- 2. Bảng Admin (Bảng 4-3)
-- =======================
CREATE TABLE Admin (
    MaTK        INT PRIMARY KEY,
    HoTen       NVARCHAR(50) NOT NULL,
    NgaySinh    DATE NULL,
    Email       VARCHAR(50) UNIQUE NULL,
    SoDienThoai VARCHAR(20) UNIQUE NULL,
    CONSTRAINT FK_Admin_TaiKhoan FOREIGN KEY (MaTK) REFERENCES TaiKhoan(MaTK) ON DELETE CASCADE
);

-- =======================
-- 3. Bảng Nhân Viên (Bảng 4-4)
-- =======================
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
    CONSTRAINT FK_NhanVien_TaiKhoan FOREIGN KEY (MaTK) REFERENCES TaiKhoan(MaTK) ON DELETE CASCADE,
    CONSTRAINT CK_NhanVien_ChucVu CHECK (ChucVu IS NULL OR ChucVu IN (N'ThuThu', N'PartTime', N'FullTime'))
);

-- =======================
-- 4. Bảng Độc Giả (Bảng 4-5)
-- =======================
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

-- =======================
-- 5. Bảng Tác Giả (Bảng 4-6)
-- =======================
CREATE TABLE TacGia (
    MaTG       INT IDENTITY(1,1) PRIMARY KEY,
    TenTacGia  NVARCHAR(100) NOT NULL,
    TieuSu     NVARCHAR(MAX) NULL,
    QuocTich   NVARCHAR(50) NULL
);

-- =======================
-- 6. Bảng Thể Loại (Bảng 4-7)
-- =======================
CREATE TABLE TheLoai (
    MaTL       INT IDENTITY(1,1) PRIMARY KEY,
    TenTheLoai NVARCHAR(100) NOT NULL UNIQUE,
    MoTa       NVARCHAR(MAX) NULL
);

-- =======================
-- 7. Bảng Nhà Xuất Bản (Bảng 4-8)
-- =======================
CREATE TABLE NhaXuatBan (
    MaNXB       INT IDENTITY(1,1) PRIMARY KEY,
    TenNXB      NVARCHAR(255) NOT NULL UNIQUE,
    DiaChi      NVARCHAR(255) NULL,
    SoDienThoai VARCHAR(20) NULL,
    Email       VARCHAR(50) NULL
);

-- =======================
-- 8. Bảng Sách (Bảng 4-9)
-- =======================
CREATE TABLE Sach (
    MaSach     INT IDENTITY(1,1) PRIMARY KEY,
    TieuDe     NVARCHAR(255) NOT NULL,
    NamXuatBan INT NULL,
    GiaSach    FLOAT NOT NULL DEFAULT 0,
    MaNXB      INT NULL,
    SoLuong    INT NOT NULL DEFAULT 0,
    ViTriKe    NVARCHAR(50) NULL,
    TrangThai  VARCHAR(50) NOT NULL, -- Con, Het
    CONSTRAINT FK_Sach_NXB FOREIGN KEY (MaNXB) REFERENCES NhaXuatBan(MaNXB),
    CONSTRAINT CK_Sach_Gia CHECK (GiaSach >= 0),
    CONSTRAINT CK_Sach_TrangThai CHECK (TrangThai IN ('Con','Het'))
);

-- =======================
-- 9. Bảng Cuốn Sách (Bảng 4-10)
-- =======================
CREATE TABLE CuonSach (
    MaCuonSach INT IDENTITY(1,1) PRIMARY KEY,
    MaSach     INT NOT NULL,
    TrangThaiCS VARCHAR(50) NOT NULL, -- Con, DangMuon, Mat, Hong
    CONSTRAINT FK_CuonSach_Sach FOREIGN KEY (MaSach) REFERENCES Sach(MaSach),
    CONSTRAINT CK_CuonSach_TrangThai CHECK (TrangThaiCS IN ('Con','DangMuon','Mat','Hong'))
);

-- =======================
-- 10. Bảng Sách_Tác Giả (Bảng 4-11)
-- =======================
CREATE TABLE Sach_TacGia (
    MaSach INT NOT NULL,
    MaTG   INT NOT NULL,
    VaiTro NVARCHAR(50) NULL,
    PRIMARY KEY (MaSach, MaTG),
    CONSTRAINT FK_STG_Sach FOREIGN KEY (MaSach) REFERENCES Sach(MaSach),
    CONSTRAINT FK_STG_TacGia FOREIGN KEY (MaTG) REFERENCES TacGia(MaTG)
);

-- =======================
-- 11. Bảng Sách_Thể Loại (Bảng 4-12)
-- =======================
CREATE TABLE Sach_TheLoai (
    MaSach INT NOT NULL,
    MaTL   INT NOT NULL,
    PRIMARY KEY (MaSach, MaTL),
    CONSTRAINT FK_STL_Sach FOREIGN KEY (MaSach) REFERENCES Sach(MaSach),
    CONSTRAINT FK_STL_TheLoai FOREIGN KEY (MaTL) REFERENCES TheLoai(MaTL)
);

-- =======================
-- 12. Bảng Phiếu Mượn (Bảng 4-13)
-- =======================
CREATE TABLE PhieuMuon (
    MaPM INT IDENTITY(1,1) PRIMARY KEY,
    IdDG INT NOT NULL,
    IdNV INT NOT NULL,
    CONSTRAINT FK_PM_DocGia FOREIGN KEY (IdDG) REFERENCES DocGia(IdDG),
    CONSTRAINT FK_PM_NhanVien FOREIGN KEY (IdNV) REFERENCES NhanVien(IdNV)
);

-- =======================
-- 13. Bảng Chi Tiết Mượn (Bảng 4-14)
-- =======================
CREATE TABLE ChiTietMuon (
    MaPM       INT NOT NULL,
    MaSach     INT NOT NULL,
    SoLuong    INT NOT NULL,
    NgayMuon   DATE NOT NULL,
    NgayHenTra DATE NOT NULL,
    NgayTra    DATE NULL,
    TrangThai  VARCHAR(50) NOT NULL, -- DangMuon, DaTra, TreHan
    PRIMARY KEY (MaPM, MaSach),
    CONSTRAINT FK_CTM_PM FOREIGN KEY (MaPM) REFERENCES PhieuMuon(MaPM),
    CONSTRAINT FK_CTM_Sach FOREIGN KEY (MaSach) REFERENCES Sach(MaSach),
    CONSTRAINT CK_CTM_TrangThai CHECK (TrangThai IN ('DangMuon','DaTra','TreHan'))
);

-- =======================
CREATE TABLE TraSach (
    MaTraSach INT PRIMARY KEY IDENTITY(1,1),
    MaPM INT NOT NULL,   -- Gắn với Phiếu Mượn
    IdNV INT NULL,       -- Nhân viên thực hiện
    NgayTra DATE NOT NULL,   -- Ngày thực hiện trả
    GhiChu NVARCHAR(255) NULL,
    DaThongBao BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_TraSach_PM FOREIGN KEY (MaPM) REFERENCES PhieuMuon(MaPM) ON DELETE CASCADE,
    CONSTRAINT FK_TraSach_NV FOREIGN KEY (IdNV) REFERENCES NhanVien(IdNV) ON DELETE SET NULL
);

-- =======================
-- Bảng Chi Tiết Trả Sách
-- =======================
CREATE TABLE ChiTietTraSach (
    MaTraSach INT NOT NULL,
    MaSach INT NOT NULL,
    SoLuongTra INT NOT NULL CHECK (SoLuongTra > 0),
    ChatLuongSach VARCHAR(20) NOT NULL CHECK (ChatLuongSach IN ('Tot','HuHong','Mat')),
    PRIMARY KEY (MaTraSach, MaSach),
    CONSTRAINT FK_CTTra_TraSach FOREIGN KEY (MaTraSach) REFERENCES TraSach(MaTraSach) ON DELETE CASCADE,
    CONSTRAINT FK_CTTra_Sach FOREIGN KEY (MaSach) REFERENCES Sach(MaSach) ON DELETE CASCADE
);

-- =======================
-- Bảng Thẻ Phạt
-- =======================
CREATE TABLE ThePhat (
    MaPhat INT PRIMARY KEY IDENTITY(1,1),
    MaTraSach INT NOT NULL,
    MaSach INT NOT NULL,
    SoTienPhat DECIMAL(10,2) NOT NULL CHECK (SoTienPhat >= 0),
    LyDoPhat NVARCHAR(100) NOT NULL,
    TrangThaiThanhToan VARCHAR(20) NOT NULL 
        CHECK (TrangThaiThanhToan IN ('DaThanhToan','ChuaThanhToan','MienPhi')),
    NgayThanhToan DATE NULL,
    GhiChu NVARCHAR(255) NULL,
    CONSTRAINT FK_ThePhat_TraSach FOREIGN KEY (MaTraSach) REFERENCES TraSach(MaTraSach) ON DELETE CASCADE,
    CONSTRAINT FK_ThePhat_Sach FOREIGN KEY (MaSach) REFERENCES Sach(MaSach) ON DELETE CASCADE
);

-- =======================
-- 15. Bảng Cấu Hình Hệ Thống (Bảng 4-16)
-- =======================
CREATE TABLE CauHinhHeThong (
    MaCH         INT IDENTITY(1,1) PRIMARY KEY,      -- Mã tham số
    Nhom         NVARCHAR(50) NOT NULL,              -- Nhóm cấu hình (VD: 'Phat', 'HeThong')
    TenThamSo    NVARCHAR(100) NOT NULL,             -- Tên tham số
    GiaTri       NVARCHAR(255) NOT NULL,             -- Giá trị (dạng chuỗi, CAST khi cần)
    KieuDuLieu   NVARCHAR(50) NOT NULL,              -- Kiểu dữ liệu gốc (INT, DECIMAL, BIT…)
    MoTa         NVARCHAR(255) NULL,                 -- Mô tả thêm
    NgayCapNhat  DATETIME NOT NULL DEFAULT GETDATE(),
    NguoiCapNhat NVARCHAR(50) NULL,
    CONSTRAINT UQ_CauHinh UNIQUE (Nhom, TenThamSo)   -- Không cho trùng trong cùng 1 nhóm
)

-- 14. Bảng Phiếu Phạt (Bảng 4-15)
-- =======================
CREATE TABLE ThePhat (
    MaPhat        INT IDENTITY(1,1) PRIMARY KEY,
    MaPM          INT NOT NULL,
    SoTien        DECIMAL(10,2) NOT NULL,
    LyDo          NVARCHAR(255) NULL,
    NgayPhat      DATE NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_ThePhat_PM FOREIGN KEY (MaPM) REFERENCES PhieuMuon(MaPM)
);
