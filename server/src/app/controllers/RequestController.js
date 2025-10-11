const prisma = require('../models/db.js');

class RequestController {
  // [POST] /api/requests - Độc giả tạo yêu cầu mượn sách
  async createRequest(req, res) {
    const { maCuonSach, ngayHenTra, ghiChu } = req.body;
    const idDG = req.user.id; // Lấy từ token JWT

    if (!maCuonSach || !ngayHenTra) {
      return res.status(400).json({
        message: 'Vui lòng cung cấp đầy đủ thông tin'
      });
    }

    try {
      // 1. Kiểm tra độc giả hợp lệ
      const docGia = await prisma.docGia.findUnique({
        where: { MaTK: parseInt(idDG) }, // Tìm theo MaTK từ token
        include: {
          PhieuMuon: {
            include: {
              ChiTietMuon: {
                where: { TrangThai: 'DangMuon' }
              }
            }
          }
        }
      });

      if (!docGia) {
        return res.status(404).json({ message: 'Không tìm thấy thông tin độc giả' });
      }

      if (docGia.TrangThai !== 'ConHan') {
        return res.status(403).json({
          message: `Tài khoản không đủ điều kiện mượn sách. Trạng thái: ${docGia.TrangThai}`
        });
      }

      // 2. Kiểm tra giới hạn sách đang mượn
      const soSachDangMuon = docGia.PhieuMuon.reduce(
        (total, pm) => total + pm.ChiTietMuon.length, 0
      );

      const maxSachConfig = await prisma.cauHinhHeThong.findFirst({
        where: { Nhom: 'MuonSach', TenThamSo: 'MaxSachMuon' }
      });
      const maxSach = parseInt(maxSachConfig?.GiaTri || '5');

      if (soSachDangMuon >= maxSach) {
        return res.status(403).json({
          message: `Bạn đã mượn ${soSachDangMuon}/${maxSach} sách. Không thể mượn thêm.`
        });
      }

      // 3. Kiểm tra cuốn sách có sẵn
      const cuonSach = await prisma.cuonSach.findUnique({
        where: { MaCuonSach: parseInt(maCuonSach) },
        include: { Sach: true }
      });

      if (!cuonSach) {
        return res.status(404).json({ message: 'Không tìm thấy cuốn sách' });
      }

      if (cuonSach.TrangThaiCS !== 'Con') {
        return res.status(400).json({ 
          message: `Cuốn sách không có sẵn. Trạng thái: ${cuonSach.TrangThaiCS}` 
        });
      }

      // 4. Kiểm tra xem đã có yêu cầu cho cuốn sách này chưa
      const existingRequest = await prisma.yeuCauMuon.findFirst({
        where: {
          IdDG: docGia.IdDG,
          MaCuonSach: parseInt(maCuonSach),
          TrangThai: 'ChoXuLy'
        }
      });

      if (existingRequest) {
        return res.status(400).json({
          message: 'Bạn đã có yêu cầu mượn cuốn sách này đang chờ xử lý'
        });
      }

      // 5. Validate ngày hẹn trả
      const maxDaysConfig = await prisma.cauHinhHeThong.findFirst({
        where: { Nhom: 'MuonSach', TenThamSo: 'SoNgayMuonMacDinh' }
      });
      const maxDays = parseInt(maxDaysConfig?.GiaTri || '14');

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(ngayHenTra);
      selectedDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.ceil((selectedDate - today) / (1000 * 60 * 60 * 24));
      
      if (diffDays > maxDays || diffDays < 1) {
        return res.status(400).json({
          message: `Ngày hẹn trả phải trong khoảng 1-${maxDays} ngày kể từ hôm nay`
        });
      }

      // 6. Tạo yêu cầu mượn
      const yeuCau = await prisma.yeuCauMuon.create({
        data: {
          IdDG: docGia.IdDG,
          MaCuonSach: parseInt(maCuonSach),
          NgayHenTra: selectedDate,
          TrangThai: 'ChoXuLy',
          GhiChu: ghiChu || null
        },
        include: {
          DocGia: { select: { HoTen: true, MaDG: true } },
          CuonSach: { 
            include: { 
              Sach: { 
                select: { TieuDe: true, MaSach: true }
              }
            }
          }
        }
      });

      res.status(201).json({
        message: 'Tạo yêu cầu mượn sách thành công',
        data: yeuCau
      });

    } catch (error) {
      console.error('Error creating request:', error);
      res.status(500).json({
        message: 'Lỗi hệ thống khi tạo yêu cầu',
        error: error.message
      });
    }
  }

  // [GET] /api/requests - Lấy danh sách yêu cầu (với filter)
  async getRequests(req, res) {
    try {
      const { page = 1, limit = 10, trangThai, idDG } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const whereConditions = {};
      if (trangThai) whereConditions.TrangThai = trangThai;
      if (idDG) whereConditions.IdDG = parseInt(idDG);

      const [yeuCauList, total] = await Promise.all([
        prisma.yeuCauMuon.findMany({
          where: whereConditions,
          skip,
          take,
          include: {
            DocGia: { select: { HoTen: true, MaDG: true, Email: true } },
            CuonSach: {
              include: {
                Sach: { select: { TieuDe: true, MaSach: true } }
              }
            },
            NhanVien: { select: { HoTen: true, MaNV: true } }
          },
          orderBy: { NgayYeuCau: 'desc' }
        }),
        prisma.yeuCauMuon.count({ where: whereConditions })
      ]);

      res.status(200).json({
        message: 'Lấy danh sách yêu cầu thành công',
        data: yeuCauList,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / take)
        }
      });

    } catch (error) {
      console.error('Error getting requests:', error);
      res.status(500).json({
        message: 'Lỗi khi lấy danh sách yêu cầu',
        error: error.message
      });
    }
  }

  // [GET] /api/requests/:id - Chi tiết yêu cầu
  async getRequestById(req, res) {
    try {
      const { id } = req.params;

      const yeuCau = await prisma.yeuCauMuon.findUnique({
        where: { MaYeuCau: parseInt(id) },
        include: {
          DocGia: { 
            include: { 
              TaiKhoan: { select: { TenDangNhap: true } }
            }
          },
          CuonSach: {
            include: {
              Sach: {
                include: {
                  NhaXuatBan: true,
                  Sach_TacGia: { include: { TacGia: true } },
                  Sach_TheLoai: { include: { TheLoai: true } }
                }
              }
            }
          },
          NhanVien: { select: { HoTen: true, MaNV: true } }
        }
      });

      if (!yeuCau) {
        return res.status(404).json({ message: 'Không tìm thấy yêu cầu' });
      }

      res.status(200).json({
        message: 'Lấy chi tiết yêu cầu thành công',
        data: yeuCau
      });

    } catch (error) {
      console.error('Error getting request detail:', error);
      res.status(500).json({
        message: 'Lỗi khi lấy chi tiết yêu cầu',
        error: error.message
      });
    }
  }

  // [PUT] /api/requests/:id/approve - Duyệt yêu cầu (tạo phiếu mượn)
  async approveRequest(req, res) {
    const { id } = req.params;
    const idNV = req.user.id;

    try {
      // 1. Kiểm tra yêu cầu
      const yeuCau = await prisma.yeuCauMuon.findUnique({
        where: { MaYeuCau: parseInt(id) },
        include: {
          DocGia: true,
          CuonSach: true
        }
      });

      if (!yeuCau) {
        return res.status(404).json({ message: 'Không tìm thấy yêu cầu' });
      }

      if (yeuCau.TrangThai !== 'ChoXuLy') {
        return res.status(400).json({ 
          message: `Yêu cầu đã được xử lý. Trạng thái: ${yeuCau.TrangThai}` 
        });
      }

      // 2. Kiểm tra cuốn sách vẫn còn sẵn
      if (yeuCau.CuonSach.TrangThaiCS !== 'Con') {
        return res.status(400).json({
          message: 'Cuốn sách không còn sẵn để mượn'
        });
      }

      // 3. Kiểm tra độc giả còn phạt chưa thanh toán không
      const unpaidFines = await prisma.thePhat.findMany({
        where: {
          TraSach: {
            PhieuMuon: {
              IdDG: yeuCau.IdDG,
            },
          },
          TrangThaiThanhToan: "ChuaThanhToan",
        },
      });

      if (unpaidFines.length > 0) {
        const totalUnpaidAmount = unpaidFines.reduce(
          (sum, fine) => sum + parseFloat(fine.SoTienPhat),
          0
        );
        return res.status(403).json({
          message: `Độc giả ${yeuCau.DocGia.HoTen} còn ${unpaidFines.length} khoản phạt chưa thanh toán (tổng: ${totalUnpaidAmount.toLocaleString()} VNĐ). Không thể duyệt yêu cầu. Vui lòng yêu cầu độc giả thanh toán hết phạt trước.`,
          unpaidFinesCount: unpaidFines.length,
          totalUnpaidAmount: totalUnpaidAmount,
        });
      }

      // 4. Kiểm tra độc giả có đủ điều kiện mượn không
      if (yeuCau.DocGia.TrangThai !== 'ConHan') {
        return res.status(403).json({
          message: `Độc giả không đủ điều kiện mượn sách. Trạng thái: ${yeuCau.DocGia.TrangThai}`
        });
      }

      // 5. Kiểm tra giới hạn sách đang mượn
      const currentBorrows = await prisma.chiTietMuon.count({
        where: {
          PhieuMuon: {
            IdDG: yeuCau.IdDG,
          },
          TrangThai: 'DangMuon',
        },
      });

      const maxSachConfig = await prisma.cauHinhHeThong.findFirst({
        where: { Nhom: 'MuonSach', TenThamSo: 'MaxSachMuon' },
      });
      const maxSach = parseInt(maxSachConfig?.GiaTri || '5');

      if (currentBorrows >= maxSach) {
        return res.status(403).json({
          message: `Độc giả đã mượn ${currentBorrows}/${maxSach} sách. Không thể mượn thêm.`
        });
      }

      // 6. Tạo phiếu mượn trong transaction
      const result = await prisma.$transaction(async (tx) => {
        // Cập nhật yêu cầu
        await tx.yeuCauMuon.update({
          where: { MaYeuCau: parseInt(id) },
          data: {
            TrangThai: 'DaDuyet',
            IdNVXuLy: idNV,
            NgayXuLy: new Date()
          }
        });

        // Tạo phiếu mượn
        const phieuMuon = await tx.phieuMuon.create({
          data: {
            IdDG: yeuCau.IdDG,
            IdNV: idNV
          }
        });

        // Tạo chi tiết mượn
        await tx.chiTietMuon.create({
          data: {
            MaPM: phieuMuon.MaPM,
            MaCuonSach: yeuCau.MaCuonSach,
            NgayMuon: new Date(),
            NgayHenTra: yeuCau.NgayHenTra,
            TrangThai: 'DangMuon',
            SoLanGiaHan: 0
          }
        });

        // Cập nhật trạng thái cuốn sách
        await tx.cuonSach.update({
          where: { MaCuonSach: yeuCau.MaCuonSach },
          data: { TrangThaiCS: 'DangMuon' }
        });

        return phieuMuon;
      });

      res.status(200).json({
        message: 'Duyệt yêu cầu và tạo phiếu mượn thành công',
        data: { MaPM: result.MaPM }
      });

    } catch (error) {
      console.error('Error approving request:', error);
      res.status(500).json({
        message: 'Lỗi khi duyệt yêu cầu',
        error: error.message
      });
    }
  }

  // [PUT] /api/requests/:id/reject - Từ chối yêu cầu
  async rejectRequest(req, res) {
    const { id } = req.params;
    const { lyDoTuChoi } = req.body;
    const idNV = req.user.id;

    if (!lyDoTuChoi || !lyDoTuChoi.trim()) {
      return res.status(400).json({
        message: 'Vui lòng cung cấp lý do từ chối'
      });
    }

    try {
      const yeuCau = await prisma.yeuCauMuon.findUnique({
        where: { MaYeuCau: parseInt(id) }
      });

      if (!yeuCau) {
        return res.status(404).json({ message: 'Không tìm thấy yêu cầu' });
      }

      if (yeuCau.TrangThai !== 'ChoXuLy') {
        return res.status(400).json({ 
          message: `Yêu cầu đã được xử lý. Trạng thái: ${yeuCau.TrangThai}` 
        });
      }

      await prisma.yeuCauMuon.update({
        where: { MaYeuCau: parseInt(id) },
        data: {
          TrangThai: 'TuChoi',
          LyDoTuChoi: lyDoTuChoi.trim(),
          IdNVXuLy: idNV,
          NgayXuLy: new Date()
        }
      });

      res.status(200).json({
        message: 'Từ chối yêu cầu thành công'
      });

    } catch (error) {
      console.error('Error rejecting request:', error);
      res.status(500).json({
        message: 'Lỗi khi từ chối yêu cầu',
        error: error.message
      });
    }
  }

  // [GET] /api/requests/my - Lấy yêu cầu của độc giả hiện tại
  async getMyRequests(req, res) {
    try {
      const idTK = req.user.id; // MaTK từ token

      // Tìm độc giả theo MaTK
      const docGia = await prisma.docGia.findUnique({
        where: { MaTK: parseInt(idTK) }
      });

      if (!docGia) {
        return res.status(404).json({ message: 'Không tìm thấy thông tin độc giả' });
      }

      const { page = 1, limit = 10, trangThai } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const whereConditions = { IdDG: docGia.IdDG };
      if (trangThai) whereConditions.TrangThai = trangThai;

      const [yeuCauList, total] = await Promise.all([
        prisma.yeuCauMuon.findMany({
          where: whereConditions,
          skip,
          take,
          include: {
            CuonSach: {
              include: {
                Sach: { 
                  select: { TieuDe: true, MaSach: true, AnhBia: true }
                }
              }
            },
            NhanVien: { select: { HoTen: true, MaNV: true } }
          },
          orderBy: { NgayYeuCau: 'desc' }
        }),
        prisma.yeuCauMuon.count({ where: whereConditions })
      ]);

      res.status(200).json({
        message: 'Lấy danh sách yêu cầu của bạn thành công',
        data: yeuCauList,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / take)
        }
      });

    } catch (error) {
      console.error('Error getting my requests:', error);
      res.status(500).json({
        message: 'Lỗi khi lấy danh sách yêu cầu của bạn',
        error: error.message
      });
    }
  }
}

module.exports = new RequestController();