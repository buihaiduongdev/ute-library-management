const prisma = require('../models/db')
class BorrowController{
  // post /api/borrow -tạo phiếu mượn sách
  async createBorrow(req, res){
    const {idDG, sachMuon} = req.body;
    const idNV = req.user.id;
    if (!idDG || !sachMuon || !Array.isArray(sachMuon) || sachMuon.length === 0){
      return res.status(400).json({
        message:"Dữ liệu không hợp lệ. Cần idDG và danh sách mượn."
      });
    }
    try{
      // 1. Kiểm tra độc giả có tồn tại và đủ điều kiện không
      const docGia = await prisma.docGia.findUnique({
        where: { IdDG: parseInt(idDG) },
        include: {
            TaiKhoan: true,
            PhieuMuon: {
                include: {
                    ChiTietMuon: {
                        where: { TrangThai: 'DangMuon' }
                    }
                }
            }
        }
      });
      if (!docGia){
        return res.status(404).json({
          message: "Không tìm thấy độc giả."
        });
      }
      if(docGia.TrangThai !== 'ConHan'){
        return res.status(403).json({
          message: `Độc giả không đủ điều kiện mượn sách. Trạng thái: ${docGia.TrangThai}`

        });
      }
      //Dem so sach dang muon
      const soSachDangMuon = docGia.PhieuMuon.reduce(
        (total,pm) => total + pm.ChiTietMuon.length, 0
      );
      const MAX_SACH = 5;
      if (soSachDangMuon + sachMuon.length > MAX_SACH){
        return res.status(403).json({
          message: `Vượt quạ giới hạn mượn sách. Đang mượn: ${soSachDangMuon}/${MAX_SACH}`
        });
      }
      // 2. Kiểm tra tất cả cuốn sách có sẵn không
      const maCuonSachList = sachMuon.map(s => parseInt(s.maCuonSach));
      const cuonSachs = await prisma.cuonSach.findMany({
      where: { 
        MaCuonSach: { 
          in: maCuonSachList },
          TrangThaiCS: 'Con'
        }
      });
      if (cuonSachs.length !== sachMuon.length) {
        return res.status(400).json({ 
            message: 'Một số sách không có sẵn hoặc đang được mượn.' 
        });
      }
      // 3. Tạo phiếu mượn và chi tiết mượn (Transaction)
      const result = await prisma.$transaction(async (tx) => {
        // Tạo phiếu mượn
        const phieuMuon = await tx.phieuMuon.create({
            data: {
                IdDG: parseInt(idDG),
                IdNV: idNV
            }
        });

        // Tạo chi tiết mượn và cập nhật trạng thái cuốn sách
        const chiTietMuonData = sachMuon.map(s => ({
            MaPM: phieuMuon.MaPM,
            MaCuonSach: parseInt(s.maCuonSach),
            NgayMuon: new Date(),
            NgayHenTra: new Date(s.ngayHenTra),
            TrangThai: 'DangMuon'
        }));

        await tx.chiTietMuon.createMany({
            data: chiTietMuonData
        });

        // Cập nhật trạng thái cuốn sách thành 'DangMuon'
        await tx.cuonSach.updateMany({
            where: { MaCuonSach: { in: maCuonSachList } },
            data: { TrangThaiCS: 'DangMuon' }
        });

        return phieuMuon;
    });

    // 4. Lấy thông tin chi tiết phiếu mượn đã tạo
    const phieuMuonDetail = await prisma.phieuMuon.findUnique({
        where: { MaPM: result.MaPM },
        include: {
            DocGia: {
                include: { TaiKhoan: true }
            },
            NhanVien: {
                include: { TaiKhoan: true }
            },
            ChiTietMuon: {
                include: {
                    CuonSach: {
                        include: {
                            Sach: true
                        }
                    }
                }
            }
        }
    });

    res.status(201).json({
        message: 'Tạo phiếu mượn thành công.',
        data: phieuMuonDetail
    });
    }
    catch(error){
      console.error('Error creating borrow:', error);
      res.status(500).json({
        message: 'Lỗi hệ thống khi tạo phiếu mượn.',
        error: error.message
      })
    }
  }
  // [GET] /api/borrow - Lấy danh sách phiếu mượn (có phân trang và filter)
  async getBorrows(req, res) {
    try {
        const { 
            page = 1, 
            limit = 10, 
            idDG, 
            trangThai,
            fromDate,
            toDate 
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        // Build where conditions
        const whereConditions = {};
        
        if (idDG) whereConditions.IdDG = parseInt(idDG);

        // Filter theo trạng thái chi tiết mượn
        if (trangThai) {
            whereConditions.ChiTietMuon = {
                some: {
                    TrangThai: trangThai
                }
            };
        }

        // Lấy dữ liệu
        const [phieuMuons, total] = await Promise.all([
            prisma.phieuMuon.findMany({
                where: whereConditions,
                skip,
                take,
                include: {
                    DocGia: {
                        select: {
                            HoTen: true,
                            MaDG: true,
                            Email: true
                        }
                    },
                    NhanVien: {
                        select: {
                            HoTen: true,
                            MaNV: true
                        }
                    },
                    ChiTietMuon: {
                        include: {
                            CuonSach: {
                                include: {
                                    Sach: {
                                        select: {
                                            TieuDe: true,
                                            MaSach: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    MaPM: 'desc'
                }
            }),
            prisma.phieuMuon.count({ where: whereConditions })
        ]);

        res.status(200).json({
            message: 'Lấy danh sách phiếu mượn thành công.',
            data: phieuMuons,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / take)
            }
        });

    } catch (error) {
        console.error('Error getting borrows:', error);
        res.status(500).json({ 
            message: 'Lỗi khi lấy danh sách phiếu mượn.', 
            error: error.message 
        });
    }
}// [GET] /api/borrow/:id - Lấy chi tiết phiếu mượn
async getBorrowById(req, res) {
  try {
      const { id } = req.params;

      const phieuMuon = await prisma.phieuMuon.findUnique({
          where: { MaPM: parseInt(id) },
          include: {
              DocGia: {
                  include: { TaiKhoan: true }
              },
              NhanVien: {
                  include: { TaiKhoan: true }
              },
              ChiTietMuon: {
                  include: {
                      CuonSach: {
                          include: {
                              Sach: {
                                  include: {
                                      NhaXuatBan: true
                                  }
                              }
                          }
                      }
                  }
              }
          }
      });

      if (!phieuMuon) {
          return res.status(404).json({ message: 'Không tìm thấy phiếu mượn.' });
      }

      // Tính số ngày quá hạn cho từng sách
      phieuMuon.ChiTietMuon = phieuMuon.ChiTietMuon.map(ct => {
          if (ct.TrangThai === 'DangMuon' && new Date(ct.NgayHenTra) < new Date()) {
              const daysOverdue = Math.floor(
                  (new Date() - new Date(ct.NgayHenTra)) / (1000 * 60 * 60 * 24)
              );
              return { ...ct, daysOverdue, isOverdue: true };
          }
          return { ...ct, isOverdue: false };
      });

      res.status(200).json({
          message: 'Lấy chi tiết phiếu mượn thành công.',
          data: phieuMuon
      });

  } catch (error) {
      console.error('Error getting borrow detail:', error);
      res.status(500).json({ 
          message: 'Lỗi khi lấy chi tiết phiếu mượn.', 
          error: error.message 
      });
  }
}
// [POST] /api/borrow/return - Trả sách
async returnBooks(req, res) {
  const { maPM, sachTra } = req.body; // sachTra: [{maCuonSach, chatLuong}]
  const idNV = req.user.id;

  if (!maPM || !sachTra || !Array.isArray(sachTra) || sachTra.length === 0) {
      return res.status(400).json({ 
          message: 'Dữ liệu không hợp lệ. Cần maPM và danh sách sách trả.' 
      });
  }

  try {
      // 1. Kiểm tra phiếu mượn
      const phieuMuon = await prisma.phieuMuon.findUnique({
          where: { MaPM: parseInt(maPM) },
          include: {
              ChiTietMuon: {
                  where: {
                      MaCuonSach: {
                          in: sachTra.map(s => parseInt(s.maCuonSach))
                      },
                      TrangThai: 'DangMuon'
                  }
              }
          }
      });

      if (!phieuMuon || phieuMuon.ChiTietMuon.length === 0) {
          return res.status(404).json({ 
              message: 'Không tìm thấy phiếu mượn hoặc sách không trong trạng thái đang mượn.' 
          });
      }

      // 2. Lấy cấu hình phạt từ database
      const cauHinhPhat = await prisma.cauHinhHeThong.findMany({
          where: {
              Nhom: 'Phat'
          }
      });

      const phiTreHanMoiNgay = parseFloat(
          cauHinhPhat.find(c => c.TenThamSo === 'PhiTreHanMoiNgay')?.GiaTri || '5000'
      );
      const phiHuHong = parseFloat(
          cauHinhPhat.find(c => c.TenThamSo === 'PhiHuHong')?.GiaTri || '50000'
      );
      const phiMat = parseFloat(
          cauHinhPhat.find(c => c.TenThamSo === 'PhiMat')?.GiaTri || '200000'
      );

      // 3. Transaction trả sách
      const result = await prisma.$transaction(async (tx) => {
          // Tạo bản ghi TraSach
          const traSach = await tx.traSach.create({
              data: {
                  MaPM: parseInt(maPM),
                  IdNV: idNV,
                  NgayTra: new Date(),
                  DaThongBao: false
              }
          });

          const thePhatList = [];

          // Xử lý từng cuốn sách trả
          for (const sach of sachTra) {
              const maCuonSach = parseInt(sach.maCuonSach);
              const chatLuong = sach.chatLuong; // 'Tot', 'HuHong', 'Mat'

              // Tìm chi tiết mượn
              const chiTiet = phieuMuon.ChiTietMuon.find(
                  ct => ct.MaCuonSach === maCuonSach
              );

              if (!chiTiet) continue;

              // Tạo chi tiết trả sách
              await tx.chiTietTraSach.create({
                  data: {
                      MaTraSach: traSach.MaTraSach,
                      MaCuonSach: maCuonSach,
                      ChatLuongSach: chatLuong
                  }
              });

              // Cập nhật trạng thái chi tiết mượn
              const ngayTra = new Date();
              const ngayHenTra = new Date(chiTiet.NgayHenTra);
              const trangThaiMoi = ngayTra > ngayHenTra ? 'TreHan' : 'DaTra';

              await tx.chiTietMuon.update({
                  where: {
                      MaPM_MaCuonSach: {
                          MaPM: parseInt(maPM),
                          MaCuonSach: maCuonSach
                      }
                  },
                  data: {
                      NgayTra: ngayTra,
                      TrangThai: trangThaiMoi
                  }
              });

              // Tính phí phạt
              let tongPhat = 0;
              let lyDoPhat = null;

              // Phạt trễ hạn
              if (ngayTra > ngayHenTra) {
                  const soNgayTre = Math.floor(
                      (ngayTra - ngayHenTra) / (1000 * 60 * 60 * 24)
                  );
                  tongPhat += soNgayTre * phiTreHanMoiNgay;
                  lyDoPhat = 'TreHan';
              }

              // Phạt hư hỏng/mất
              if (chatLuong === 'HuHong') {
                  tongPhat += phiHuHong;
                  lyDoPhat = 'HuHong';
              } else if (chatLuong === 'Mat') {
                  tongPhat += phiMat;
                  lyDoPhat = 'Mat';
              }

              // Tạo thẻ phạt nếu có
              if (tongPhat > 0 && lyDoPhat) {
                  const thePhat = await tx.thePhat.create({
                      data: {
                          MaTraSach: traSach.MaTraSach,
                          MaCuonSach: maCuonSach,
                          SoTienPhat: tongPhat,
                          LyDoPhat: lyDoPhat,
                          TrangThaiThanhToan: 'ChuaThanhToan'
                      }
                  });
                  thePhatList.push(thePhat);
              }

              // Cập nhật trạng thái cuốn sách
              let trangThaiCS = 'Con';
              if (chatLuong === 'Mat') {
                  trangThaiCS = 'Mat';
              } else if (chatLuong === 'HuHong') {
                  trangThaiCS = 'Hong';
              }

              await tx.cuonSach.update({
                  where: { MaCuonSach: maCuonSach },
                  data: { TrangThaiCS: trangThaiCS }
              });
          }

          return { traSach, thePhatList };
      });

      // 4. Lấy thông tin chi tiết trả sách
      const traSachDetail = await prisma.traSach.findUnique({
          where: { MaTraSach: result.traSach.MaTraSach },
          include: {
              PhieuMuon: {
                  include: {
                      DocGia: true
                  }
              },
              NhanVien: true,
              ChiTietTraSach: {
                  include: {
                      CuonSach: {
                          include: { Sach: true }
                      }
                  }
              },
              ThePhat: true
          }
      });

      res.status(201).json({
          message: 'Trả sách thành công.',
          data: traSachDetail,
          tongPhat: result.thePhatList.reduce((sum, p) => sum + parseFloat(p.SoTienPhat), 0)
      });

  } catch (error) {
      console.error('Error returning books:', error);
      res.status(500).json({ 
          message: 'Lỗi khi trả sách.', 
          error: error.message 
      });
  }
}
// [GET] /api/borrow/overdue - Lấy danh sách sách quá hạn
async getOverdueBooks(req, res) {
  try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const overdueBooks = await prisma.chiTietMuon.findMany({
          where: {
              TrangThai: 'DangMuon',
              NgayHenTra: {
                  lt: today
              }
          },
          include: {
              PhieuMuon: {
                  include: {
                      DocGia: {
                          select: {
                              HoTen: true,
                              MaDG: true,
                              Email: true,
                              SoDienThoai: true
                          }
                      }
                  }
              },
              CuonSach: {
                  include: {
                      Sach: {
                          select: {
                              TieuDe: true,
                              MaSach: true
                          }
                      }
                  }
              }
          },
          orderBy: {
              NgayHenTra: 'asc'
          }
      });

      // Tính số ngày quá hạn
      const overdueWithDays = overdueBooks.map(item => {
          const daysOverdue = Math.floor(
              (today - new Date(item.NgayHenTra)) / (1000 * 60 * 60 * 24)
          );
          return { ...item, daysOverdue };
      });

      res.status(200).json({
          message: 'Lấy danh sách sách quá hạn thành công.',
          data: overdueWithDays,
          total: overdueWithDays.length
      });

  } catch (error) {
      console.error('Error getting overdue books:', error);
      res.status(500).json({ 
          message: 'Lỗi khi lấy danh sách sách quá hạn.', 
          error: error.message 
      });
  }
}// [GET] /api/borrow/reader/:idDG - Lịch sử mượn sách của độc giả
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
                  NhanVien: {
                      select: { HoTen: true }
                  },
                  ChiTietMuon: {
                      include: {
                          CuonSach: {
                              include: {
                                  Sach: {
                                      select: {
                                          TieuDe: true,
                                          MaSach: true
                                      }
                                  }
                              }
                          }
                      }
                  }
              },
              orderBy: { MaPM: 'desc' }
          }),
          prisma.phieuMuon.count({ where: { IdDG: parseInt(idDG) } })
      ]);

      res.status(200).json({
          message: 'Lấy lịch sử mượn sách thành công.',
          data: history,
          pagination: {
              page: parseInt(page),
              limit: parseInt(limit),
              total,
              totalPages: Math.ceil(total / take)
          }
      });

  } catch (error) {
      console.error('Error getting reader history:', error);
      res.status(500).json({ 
          message: 'Lỗi khi lấy lịch sử mượn sách.', 
          error: error.message 
      });
  }
}
async getStatistics(req, res) {
  res.status(200).json({ message: 'Thống kê mượn trả sách - chưa implement' });
}

async getUnpaidFines(req, res) {
  res.status(200).json({ message: 'Danh sách phạt chưa thanh toán - chưa implement' });
}

async payFine(req, res) {
  res.status(200).json({ message: 'Thanh toán phạt - chưa implement' });
}

}
module.exports = new BorrowController();