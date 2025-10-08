const prisma = require("../models/db");

class BorrowController {
  // [GET] /api/borrow/config - Lấy cấu hình hệ thống
  async getConfig(req, res) {
    try {
      const configs = await prisma.cauHinhHeThong.findMany({
        where: { Nhom: "MuonSach" },
      });

      const configMap = {};
      configs.forEach((config) => {
        configMap[config.TenThamSo] = config.GiaTri;
      });

      res.status(200).json({
        message: "Lấy cấu hình thành công",
        data: {
          maxSachMuon: parseInt(configMap["MaxSachMuon"] || "5"),
          soNgayMuonMacDinh: parseInt(configMap["SoNgayMuonMacDinh"] || "14"),
        },
      });
    } catch (error) {
      console.error("Error getting config:", error);
      res.status(500).json({
        message: "Lỗi khi lấy cấu hình hệ thống",
        error: error.message,
      });
    }
  }

  // [POST] /api/borrow - Tạo phiếu mượn sách
  async createBorrow(req, res) {
    const { idDG, sachMuon } = req.body;
    const idNV = req.user.id;

    if (
      !idDG ||
      !sachMuon ||
      !Array.isArray(sachMuon) ||
      sachMuon.length === 0
    ) {
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ. Cần idDG và danh sách sách mượn.",
      });
    }

    try {
      // 0. Lấy cấu hình số ngày mượn
      const configSoNgay = await prisma.cauHinhHeThong.findFirst({
        where: { Nhom: "MuonSach", TenThamSo: "SoNgayMuonMacDinh" },
      });
      const maxBorrowDays = parseInt(configSoNgay?.GiaTri || "14");

      // Validate ngày hẹn trả không vượt quá giới hạn
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (const sach of sachMuon) {
        const ngayHenTra = new Date(sach.ngayHenTra);
        ngayHenTra.setHours(0, 0, 0, 0);
        
        const diffDays = Math.ceil((ngayHenTra - today) / (1000 * 60 * 60 * 24));
        
        if (diffDays > maxBorrowDays) {
          return res.status(400).json({
            message: `Ngày hẹn trả không được vượt quá ${maxBorrowDays} ngày kể từ hôm nay`,
          });
        }
        
        if (diffDays < 1) {
          return res.status(400).json({
            message: "Ngày hẹn trả phải là ngày trong tương lai",
          });
        }
      }

      // 1. Kiểm tra độc giả
      const docGia = await prisma.docGia.findUnique({
        where: { IdDG: parseInt(idDG) },
        include: {
          TaiKhoan: true,
          PhieuMuon: {
            include: {
              ChiTietMuon: {
                where: { TrangThai: "DangMuon" },
              },
            },
          },
        },
      });

      if (!docGia) {
        return res.status(404).json({ message: "Không tìm thấy độc giả." });
      }

      if (docGia.TrangThai !== "ConHan") {
        return res.status(403).json({
          message: `Độc giả không đủ điều kiện mượn sách. Trạng thái: ${docGia.TrangThai}`,
        });
      }

      // Đếm số sách đang mượn
      const soSachDangMuon = docGia.PhieuMuon.reduce(
        (total, pm) => total + pm.ChiTietMuon.length,
        0
      );
      
      // Lấy giới hạn sách từ cấu hình hệ thống
      const maxSachConfig = await prisma.cauHinhHeThong.findFirst({
        where: { Nhom: 'MuonSach', TenThamSo: 'MaxSachMuon' }
      });
      const MAX_SACH = parseInt(maxSachConfig?.GiaTri || '5');

      if (soSachDangMuon + sachMuon.length > MAX_SACH) {
        return res.status(403).json({
          message: `Vượt quá giới hạn mượn sách. Đang mượn: ${soSachDangMuon}/${MAX_SACH}`,
        });
      }

      // 2. Kiểm tra cuốn sách có sẵn
      const maCuonSachList = sachMuon.map((s) => parseInt(s.maCuonSach));
      const cuonSachs = await prisma.cuonSach.findMany({
        where: {
          MaCuonSach: { in: maCuonSachList },
          TrangThaiCS: "Con",
        },
      });

      if (cuonSachs.length !== sachMuon.length) {
        return res.status(400).json({
          message: "Một số sách không có sẵn hoặc đang được mượn.",
        });
      }

      // 3. Transaction tạo phiếu mượn
      const result = await prisma.$transaction(async (tx) => {
        const phieuMuon = await tx.phieuMuon.create({
          data: {
            IdDG: parseInt(idDG),
            IdNV: idNV,
          },
        });

        const chiTietMuonData = sachMuon.map((s) => ({
          MaPM: phieuMuon.MaPM,
          MaCuonSach: parseInt(s.maCuonSach),
          NgayMuon: new Date(),
          NgayHenTra: new Date(s.ngayHenTra),
          TrangThai: "DangMuon",
        }));

        await tx.chiTietMuon.createMany({
          data: chiTietMuonData,
        });

        await tx.cuonSach.updateMany({
          where: { MaCuonSach: { in: maCuonSachList } },
          data: { TrangThaiCS: "DangMuon" },
        });

        return phieuMuon;
      });

      // 4. Lấy chi tiết phiếu mượn
      const phieuMuonDetail = await prisma.phieuMuon.findUnique({
        where: { MaPM: result.MaPM },
        include: {
          DocGia: { include: { TaiKhoan: true } },
          NhanVien: { include: { TaiKhoan: true } },
          ChiTietMuon: {
            include: {
              CuonSach: { include: { Sach: true } },
            },
          },
        },
      });

      res.status(201).json({
        message: "Tạo phiếu mượn thành công.",
        data: phieuMuonDetail,
      });
    } catch (error) {
      console.error("Error creating borrow:", error);
      res.status(500).json({
        message: "Lỗi hệ thống khi tạo phiếu mượn.",
        error: error.message,
      });
    }
  }

  // [GET] /api/borrow - Danh sách phiếu mượn
  async getBorrows(req, res) {
    try {
      const { page = 1, limit = 10, idDG, trangThai } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const whereConditions = {};
      if (idDG) whereConditions.IdDG = parseInt(idDG);
      if (trangThai) {
        whereConditions.ChiTietMuon = {
          some: { TrangThai: trangThai },
        };
      }

      const [phieuMuons, total] = await Promise.all([
        prisma.phieuMuon.findMany({
          where: whereConditions,
          skip,
          take,
          include: {
            DocGia: {
              select: { HoTen: true, MaDG: true, Email: true },
            },
            NhanVien: {
              select: { HoTen: true, MaNV: true },
            },
            ChiTietMuon: {
              include: {
                CuonSach: {
                  include: {
                    Sach: {
                      select: { TieuDe: true, MaSach: true },
                    },
                  },
                },
              },
            },
          },
          orderBy: { MaPM: "desc" },
        }),
        prisma.phieuMuon.count({ where: whereConditions }),
      ]);

      res.status(200).json({
        message: "Lấy danh sách phiếu mượn thành công.",
        data: phieuMuons,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / take),
        },
      });
    } catch (error) {
      console.error("Error getting borrows:", error);
      res.status(500).json({
        message: "Lỗi khi lấy danh sách phiếu mượn.",
        error: error.message,
      });
    }
  }

  // [GET] /api/borrow/:id - Chi tiết phiếu mượn
  async getBorrowById(req, res) {
    try {
      const { id } = req.params;

      const phieuMuon = await prisma.phieuMuon.findUnique({
        where: { MaPM: parseInt(id) },
        include: {
          DocGia: { include: { TaiKhoan: true } },
          NhanVien: { include: { TaiKhoan: true } },
          ChiTietMuon: {
            include: {
              CuonSach: {
                include: {
                  Sach: { include: { NhaXuatBan: true } },
                },
              },
            },
          },
        },
      });

      if (!phieuMuon) {
        return res.status(404).json({ message: "Không tìm thấy phiếu mượn." });
      }

      // Tính ngày quá hạn
      phieuMuon.ChiTietMuon = phieuMuon.ChiTietMuon.map((ct) => {
        if (
          ct.TrangThai === "DangMuon" &&
          new Date(ct.NgayHenTra) < new Date()
        ) {
          const daysOverdue = Math.floor(
            (new Date() - new Date(ct.NgayHenTra)) / (1000 * 60 * 60 * 24)
          );
          return { ...ct, daysOverdue, isOverdue: true };
        }
        return { ...ct, isOverdue: false };
      });

      res.status(200).json({
        message: "Lấy chi tiết phiếu mượn thành công.",
        data: phieuMuon,
      });
    } catch (error) {
      console.error("Error getting borrow detail:", error);
      res.status(500).json({
        message: "Lỗi khi lấy chi tiết phiếu mượn.",
        error: error.message,
      });
    }
  }

  // [POST] /api/borrow/return - Trả sách
  async returnBooks(req, res) {
    const { maPM, sachTra } = req.body;
    const idNV = req.user.id;

    if (!maPM || !sachTra || !Array.isArray(sachTra) || sachTra.length === 0) {
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ. Cần maPM và danh sách sách trả.",
      });
    }

    try {
      // 1. Kiểm tra phiếu mượn
      const phieuMuon = await prisma.phieuMuon.findUnique({
        where: { MaPM: parseInt(maPM) },
        include: {
          ChiTietMuon: {
            where: {
              MaCuonSach: { in: sachTra.map((s) => parseInt(s.maCuonSach)) },
              TrangThai: "DangMuon",
            },
          },
        },
      });

      if (!phieuMuon || phieuMuon.ChiTietMuon.length === 0) {
        return res.status(404).json({
          message: "Không tìm thấy phiếu mượn hoặc sách không đang mượn.",
        });
      }

      // 2. Lấy cấu hình phạt
      const cauHinhPhat = await prisma.cauHinhHeThong.findMany({
        where: { Nhom: "Phat" },
      });

      const phiTreHanMoiNgay = parseFloat(
        cauHinhPhat.find((c) => c.TenThamSo === "PhiTreHanMoiNgay")?.GiaTri ||
          "5000"
      );
      const phiHuHong = parseFloat(
        cauHinhPhat.find((c) => c.TenThamSo === "PhiHuHong")?.GiaTri || "50000"
      );
      const phiMat = parseFloat(
        cauHinhPhat.find((c) => c.TenThamSo === "PhiMat")?.GiaTri || "200000"
      );

      // 3. Transaction trả sách
      const result = await prisma.$transaction(async (tx) => {
        const traSach = await tx.traSach.create({
          data: {
            MaPM: parseInt(maPM),
            IdNV: idNV,
            NgayTra: new Date(),
            DaThongBao: false,
          },
        });

        const thePhatList = [];

        for (const sach of sachTra) {
          const maCuonSach = parseInt(sach.maCuonSach);
          const chatLuong = sach.chatLuong;

          const chiTiet = phieuMuon.ChiTietMuon.find(
            (ct) => ct.MaCuonSach === maCuonSach
          );

          if (!chiTiet) continue;

          await tx.chiTietTraSach.create({
            data: {
              MaTraSach: traSach.MaTraSach,
              MaCuonSach: maCuonSach,
              ChatLuongSach: chatLuong,
            },
          });

          const ngayTra = new Date();
          const ngayHenTra = new Date(chiTiet.NgayHenTra);
          const trangThaiMoi = ngayTra > ngayHenTra ? "TreHan" : "DaTra";

          await tx.chiTietMuon.update({
            where: {
              MaPM_MaCuonSach: {
                MaPM: parseInt(maPM),
                MaCuonSach: maCuonSach,
              },
            },
            data: {
              NgayTra: ngayTra,
              TrangThai: trangThaiMoi,
            },
          });

          // Tính phí
          let tongPhat = 0;
          let lyDoPhat = null;

          if (ngayTra > ngayHenTra) {
            const soNgayTre = Math.floor(
              (ngayTra - ngayHenTra) / (1000 * 60 * 60 * 24)
            );
            tongPhat += soNgayTre * phiTreHanMoiNgay;
            lyDoPhat = "TreHan";
          }

          if (chatLuong === "HuHong") {
            tongPhat += phiHuHong;
            lyDoPhat = "HuHong";
          } else if (chatLuong === "Mat") {
            tongPhat += phiMat;
            lyDoPhat = "Mat";
          }

          if (tongPhat > 0 && lyDoPhat) {
            const thePhat = await tx.thePhat.create({
              data: {
                MaTraSach: traSach.MaTraSach,
                MaCuonSach: maCuonSach,
                SoTienPhat: tongPhat,
                LyDoPhat: lyDoPhat,
                TrangThaiThanhToan: "ChuaThanhToan",
              },
            });
            thePhatList.push(thePhat);
          }

          // Cập nhật trạng thái cuốn sách
          let trangThaiCS = "Con";
          if (chatLuong === "Mat") trangThaiCS = "Mat";
          else if (chatLuong === "HuHong") trangThaiCS = "Hong";

          await tx.cuonSach.update({
            where: { MaCuonSach: maCuonSach },
            data: { TrangThaiCS: trangThaiCS },
          });
        }

        return { traSach, thePhatList };
      });

      // 4. Lấy chi tiết
      const traSachDetail = await prisma.traSach.findUnique({
        where: { MaTraSach: result.traSach.MaTraSach },
        include: {
          PhieuMuon: { include: { DocGia: true } },
          NhanVien: true,
          ChiTietTraSach: {
            include: {
              CuonSach: { include: { Sach: true } },
            },
          },
          ThePhat: true,
        },
      });

      res.status(201).json({
        message: "Trả sách thành công.",
        data: traSachDetail,
        tongPhat: result.thePhatList.reduce(
          (sum, p) => sum + parseFloat(p.SoTienPhat),
          0
        ),
      });
    } catch (error) {
      console.error("Error returning books:", error);
      res.status(500).json({
        message: "Lỗi khi trả sách.",
        error: error.message,
      });
    }
  }

  // [GET] /api/borrow/overdue - Sách quá hạn
  async getOverdueBooks(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const overdueBooks = await prisma.chiTietMuon.findMany({
        where: {
          TrangThai: "DangMuon",
          NgayHenTra: { lt: today },
        },
        include: {
          PhieuMuon: {
            include: {
              DocGia: {
                select: {
                  HoTen: true,
                  MaDG: true,
                  Email: true,
                  SoDienThoai: true,
                },
              },
            },
          },
          CuonSach: {
            include: {
              Sach: {
                select: { TieuDe: true, MaSach: true },
              },
            },
          },
        },
        orderBy: { NgayHenTra: "asc" },
      });

      const overdueWithDays = overdueBooks.map((item) => {
        const daysOverdue = Math.floor(
          (today - new Date(item.NgayHenTra)) / (1000 * 60 * 60 * 24)
        );
        return { ...item, daysOverdue };
      });

      res.status(200).json({
        message: "Lấy danh sách sách quá hạn thành công.",
        data: overdueWithDays,
        total: overdueWithDays.length,
      });
    } catch (error) {
      console.error("Error getting overdue books:", error);
      res.status(500).json({
        message: "Lỗi khi lấy danh sách sách quá hạn.",
        error: error.message,
      });
    }
  }

  // [GET] /api/borrow/reader/:idDG - Lịch sử mượn
  async getReaderHistory(req, res) {
    try {
      const { idDG } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const [history, total] = await Promise.all([
        prisma.phieuMuon.findMany({
          where: { IdDG: parseInt(idDG) },
          skip,
          take,
          include: {
            NhanVien: { select: { HoTen: true } },
            ChiTietMuon: {
              include: {
                CuonSach: {
                  include: {
                    Sach: {
                      select: { TieuDe: true, MaSach: true },
                    },
                  },
                },
              },
            },
          },
          orderBy: { MaPM: "desc" },
        }),
        prisma.phieuMuon.count({ where: { IdDG: parseInt(idDG) } }),
      ]);

      res.status(200).json({
        message: "Lấy lịch sử mượn sách thành công.",
        data: history,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / take),
        },
      });
    } catch (error) {
      console.error("Error getting reader history:", error);
      res.status(500).json({
        message: "Lỗi khi lấy lịch sử mượn sách.",
        error: error.message,
      });
    }
  }

  // [GET] /api/borrow/available-copies - Lấy danh sách cuốn sách có sẵn
  async getAvailableCopies(req, res) {
    try {
      const cuonSachs = await prisma.cuonSach.findMany({
        where: { TrangThaiCS: "Con" },
        include: {
          Sach: {
            include: {
              Sach_TacGia: { include: { TacGia: true } },
              Sach_TheLoai: { include: { TheLoai: true } },
              NhaXuatBan: true,
            },
          },
        },
        orderBy: { MaCuonSach: "desc" },
      });

      res.status(200).json({
        message: "Lấy danh sách cuốn sách thành công.",
        data: cuonSachs,
      });
    } catch (error) {
      console.error("Error getting available copies:", error);
      res.status(500).json({
        message: "Lỗi khi lấy danh sách cuốn sách.",
        error: error.message,
      });
    }
  }

  // Placeholder methods
  async getStatistics(req, res) {
    res.status(200).json({ message: "Thống kê - chưa implement" });
  }

  // [GET] /api/borrow/fines - Lấy danh sách phạt chưa thanh toán
  async getUnpaidFines(req, res) {
    try {
      const { page = 1, limit = 10, idDG, trangThai } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const whereConditions = {};
      
      // Filter theo độc giả
      if (idDG) {
        whereConditions.TraSach = {
          PhieuMuon: {
            IdDG: parseInt(idDG)
          }
        };
      }
      
      // Filter theo trạng thái thanh toán
      if (trangThai) {
        whereConditions.TrangThaiThanhToan = trangThai;
      }

      const [fines, total] = await Promise.all([
        prisma.thePhat.findMany({
          where: whereConditions,
          skip,
          take,
          include: {
            TraSach: {
              include: {
                PhieuMuon: {
                  include: {
                    DocGia: {
                      select: { HoTen: true, MaDG: true, Email: true, SoDienThoai: true }
                    }
                  }
                },
                NhanVien: {
                  select: { HoTen: true, MaNV: true }
                }
              }
            },
            CuonSach: {
              include: {
                Sach: {
                  select: { TieuDe: true, MaSach: true }
                }
              }
            }
          },
          orderBy: { MaPhat: 'desc' }
        }),
        prisma.thePhat.count({ where: whereConditions })
      ]);

      // Tính tổng tiền phạt
      const tongTienPhat = fines.reduce(
        (sum, fine) => sum + parseFloat(fine.SoTienPhat),
        0
      );

      res.status(200).json({
        message: 'Lấy danh sách phạt thành công',
        data: fines,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / take)
        },
        summary: {
          tongTienPhat,
          soLuongPhat: total
        }
      });

    } catch (error) {
      console.error('Error getting unpaid fines:', error);
      res.status(500).json({
        message: 'Lỗi khi lấy danh sách phạt',
        error: error.message
      });
    }
  }

  // [POST] /api/borrow/pay-fine/:maPhat - Thanh toán phạt
  async payFine(req, res) {
    const { maPhat } = req.params;
    const { ghiChu } = req.body;

    if (!maPhat) {
      return res.status(400).json({
        message: 'Vui lòng cung cấp mã phạt'
      });
    }

    try {
      // 1. Kiểm tra phạt tồn tại
      const thePhat = await prisma.thePhat.findUnique({
        where: { MaPhat: parseInt(maPhat) },
        include: {
          TraSach: {
            include: {
              PhieuMuon: {
                include: {
                  DocGia: {
                    select: { HoTen: true, MaDG: true }
                  }
                }
              }
            }
          },
          CuonSach: {
            include: {
              Sach: {
                select: { TieuDe: true }
              }
            }
          }
        }
      });

      if (!thePhat) {
        return res.status(404).json({
          message: 'Không tìm thấy thông tin phạt'
        });
      }

      // 2. Kiểm tra đã thanh toán chưa
      if (thePhat.TrangThaiThanhToan === 'DaThanhToan') {
        return res.status(400).json({
          message: 'Phạt này đã được thanh toán trước đó',
          ngayThanhToan: thePhat.NgayThanhToan
        });
      }

      // 3. Cập nhật trạng thái thanh toán
      const updatedFine = await prisma.thePhat.update({
        where: { MaPhat: parseInt(maPhat) },
        data: {
          TrangThaiThanhToan: 'DaThanhToan',
          NgayThanhToan: new Date(),
          GhiChu: ghiChu ? ghiChu.trim() : thePhat.GhiChu
        },
        include: {
          TraSach: {
            include: {
              PhieuMuon: {
                include: {
                  DocGia: {
                    select: { HoTen: true, MaDG: true }
                  }
                }
              }
            }
          },
          CuonSach: {
            include: {
              Sach: {
                select: { TieuDe: true }
              }
            }
          }
        }
      });

      res.status(200).json({
        message: 'Thanh toán phạt thành công',
        data: updatedFine
      });

    } catch (error) {
      console.error('Error paying fine:', error);
      res.status(500).json({
        message: 'Lỗi khi thanh toán phạt',
        error: error.message
      });
    }
  }

  // [POST] /api/borrow/extend - Gia hạn sách
  async extendBook(req, res) {
    const { maPM, maCuonSach } = req.body;
    const isReader = req.user.role === 2; // Độc giả
    const userTKId = req.user.id; // MaTK từ token

    if (!maPM || !maCuonSach) {
      return res.status(400).json({
        message: 'Vui lòng cung cấp mã phiếu mượn và mã cuốn sách'
      });
    }

    try {
      // 1. Lấy cấu hình gia hạn
      const cauHinhGiaHan = await prisma.cauHinhHeThong.findMany({
        where: { Nhom: 'GiaHan' }
      });

      const maxLanGiaHan = parseInt(
        cauHinhGiaHan.find(c => c.TenThamSo === 'MaxLanGiaHan')?.GiaTri || '2'
      );
      const soNgayGiaHanMoiLan = parseInt(
        cauHinhGiaHan.find(c => c.TenThamSo === 'SoNgayGiaHanMoiLan')?.GiaTri || '7'
      );
      const phiGiaHan = parseFloat(
        cauHinhGiaHan.find(c => c.TenThamSo === 'PhiGiaHan')?.GiaTri || '0'
      );

      // 2. Kiểm tra chi tiết mượn
      const chiTietMuon = await prisma.chiTietMuon.findUnique({
        where: {
          MaPM_MaCuonSach: {
            MaPM: parseInt(maPM),
            MaCuonSach: parseInt(maCuonSach)
          }
        },
        include: {
          PhieuMuon: {
            include: {
              DocGia: {
                include: { TaiKhoan: true }
              }
            }
          },
          CuonSach: {
            include: { Sach: true }
          }
        }
      });

      if (!chiTietMuon) {
        return res.status(404).json({ message: 'Không tìm thấy thông tin mượn sách' });
      }

      if (chiTietMuon.TrangThai !== 'DangMuon') {
        return res.status(400).json({
          message: `Không thể gia hạn. Trạng thái hiện tại: ${chiTietMuon.TrangThai}`
        });
      }

      // 3. Nếu là độc giả, kiểm tra quyền sở hữu
      if (isReader && chiTietMuon.PhieuMuon.DocGia.MaTK !== userTKId) {
        return res.status(403).json({
          message: 'Bạn không có quyền gia hạn sách này'
        });
      }

      // 4. Kiểm tra số lần gia hạn
      if (chiTietMuon.SoLanGiaHan >= maxLanGiaHan) {
        return res.status(400).json({
          message: `Đã đạt giới hạn gia hạn tối đa (${maxLanGiaHan} lần)`
        });
      }

      // 5. Kiểm tra trạng thái độc giả
      if (chiTietMuon.PhieuMuon.DocGia.TrangThai !== 'ConHan') {
        return res.status(403).json({
          message: `Không thể gia hạn. Trạng thái tài khoản: ${chiTietMuon.PhieuMuon.DocGia.TrangThai}`
        });
      }

      // 6. Kiểm tra có phạt chưa thanh toán không
      const unpaidFines = await prisma.thePhat.findMany({
        where: {
          TraSach: {
            MaPM: chiTietMuon.MaPM
          },
          TrangThaiThanhToan: 'ChuaThanhToan'
        }
      });

      if (unpaidFines.length > 0) {
        return res.status(400).json({
          message: 'Không thể gia hạn khi còn phí phạt chưa thanh toán'
        });
      }

      // 7. Gia hạn trong transaction
      const result = await prisma.$transaction(async (tx) => {
        // Tính ngày hẹn trả mới
        const ngayHenTraCu = new Date(chiTietMuon.NgayHenTra);
        const ngayHenTraMoi = new Date(ngayHenTraCu);
        ngayHenTraMoi.setDate(ngayHenTraCu.getDate() + soNgayGiaHanMoiLan);

        // Cập nhật chi tiết mượn
        const updatedChiTiet = await tx.chiTietMuon.update({
          where: {
            MaPM_MaCuonSach: {
              MaPM: parseInt(maPM),
              MaCuonSach: parseInt(maCuonSach)
            }
          },
          data: {
            NgayHenTra: ngayHenTraMoi,
            SoLanGiaHan: chiTietMuon.SoLanGiaHan + 1
          }
        });

        return {
          ...updatedChiTiet,
          NgayHenTraCu: ngayHenTraCu,
          NgayHenTraMoi: ngayHenTraMoi,
          PhiGiaHan: phiGiaHan
        };
      });

      res.status(200).json({
        message: 'Gia hạn sách thành công',
        data: {
          MaPM: parseInt(maPM),
          MaCuonSach: parseInt(maCuonSach),
          TenSach: chiTietMuon.CuonSach.Sach.TieuDe,
          NgayHenTraCu: result.NgayHenTraCu,
          NgayHenTraMoi: result.NgayHenTraMoi,
          SoLanGiaHan: result.SoLanGiaHan,
          PhiGiaHan: result.PhiGiaHan,
          SoNgayGiaHan: soNgayGiaHanMoiLan
        }
      });

    } catch (error) {
      console.error('Error extending book:', error);
      res.status(500).json({
        message: 'Lỗi khi gia hạn sách',
        error: error.message
      });
    }
  }

  // [GET] /api/borrow/extendable - Lấy danh sách sách có thể gia hạn của độc giả
  async getExtendableBooks(req, res) {
    try {
      const userTKId = req.user.id; // MaTK từ token
      const isReader = req.user.role === 2;

      if (!isReader) {
        return res.status(403).json({ message: 'Chỉ độc giả mới có thể xem danh sách gia hạn' });
      }

      // Tìm độc giả theo MaTK
      const docGia = await prisma.docGia.findUnique({
        where: { MaTK: parseInt(userTKId) }
      });

      if (!docGia) {
        return res.status(404).json({ message: 'Không tìm thấy thông tin độc giả' });
      }

      // Lấy cấu hình
      const maxLanGiaHanConfig = await prisma.cauHinhHeThong.findFirst({
        where: { Nhom: 'GiaHan', TenThamSo: 'MaxLanGiaHan' }
      });
      const maxLanGiaHan = parseInt(maxLanGiaHanConfig?.GiaTri || '2');

      // Lấy danh sách sách đang mượn và có thể gia hạn
      const extendableBooks = await prisma.chiTietMuon.findMany({
        where: {
          PhieuMuon: {
            IdDG: docGia.IdDG
          },
          TrangThai: 'DangMuon',
          SoLanGiaHan: {
            lt: maxLanGiaHan
          }
        },
        include: {
          PhieuMuon: {
            select: { MaPM: true }
          },
          CuonSach: {
            include: {
              Sach: {
                select: {
                  TieuDe: true,
                  MaSach: true,
                  AnhBia: true,
                  Sach_TacGia: {
                    include: { TacGia: true }
                  }
                }
              }
            }
          }
        },
        orderBy: { NgayHenTra: 'asc' }
      });

      // Tính ngày còn lại cho mỗi cuốn
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const booksWithDaysLeft = extendableBooks.map(book => {
        const dueDate = new Date(book.NgayHenTra);
        dueDate.setHours(0, 0, 0, 0);
        const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        
        return {
          ...book,
          DaysLeft: daysLeft,
          IsOverdue: daysLeft < 0,
          CanExtend: book.SoLanGiaHan < maxLanGiaHan
        };
      });

      res.status(200).json({
        message: 'Lấy danh sách sách có thể gia hạn thành công',
        data: booksWithDaysLeft,
        summary: {
          total: booksWithDaysLeft.length,
          overdue: booksWithDaysLeft.filter(b => b.IsOverdue).length,
          maxExtensions: maxLanGiaHan
        }
      });

    } catch (error) {
      console.error('Error getting extendable books:', error);
      res.status(500).json({
        message: 'Lỗi khi lấy danh sách sách gia hạn',
        error: error.message
      });
    }
  }
}

module.exports = new BorrowController();
