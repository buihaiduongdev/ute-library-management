const prisma = require("../models/db");

const BorrowController = {
  async createBorrow(req, res) {
    try {
      const { readerId, bookIds } = req.body;
      const staffId = req.user?.id;  // từ token (middleware gắn vào)

      if (!readerId || !bookIds?.length) {
        return res.status(400).json({ message: "Thiếu dữ liệu mượn sách" });
      }

      // Transaction: đảm bảo tất cả các thao tác đều thành công hoặc rollback
      const result = await prisma.$transaction(async (tx) => {
        // 1. Kiểm tra độc giả
        const docGia = await tx.docGia.findUnique({ where: { IdDG: readerId } });
        if (!docGia) throw new Error("Không tìm thấy độc giả");
        if (docGia.TrangThai !== "ConHan" || docGia.NgayHetHan < new Date()) {
          throw new Error("Thẻ độc giả đã hết hạn hoặc bị khóa");
        }

        // 2. Tạo phiếu mượn
        const phieuMuon = await tx.phieuMuon.create({
          data: { IdDG: readerId, IdNV: staffId }
        });

        // 3. Tạo chi tiết mượn + cập nhật sách
        for (let maSach of bookIds) {
          // kiểm tra sách có sẵn
          const sach = await tx.sach.findUnique({ where: { MaSach: maSach } });
          if (!sach || sach.TrangThai !== "Con") {
            throw new Error(`Sách ID ${maSach} không khả dụng`);
          }

          // tạo chi tiết mượn
          await tx.chiTietMuon.create({
            data: {
              MaPM: phieuMuon.MaPM,
              MaSach: maSach,
              NgayMuon: new Date(),
              NgayHenTra: new Date(new Date().setDate(new Date().getDate() + 14)),
              TrangThai: "DangMuon"
            }
          });

          // cập nhật trạng thái sách
          await tx.sach.update({
            where: { MaSach: maSach },
            data: { TrangThai: "DangMuon" }
          });
        }

        return phieuMuon;
      });

      res.json({ message: "✅ Mượn sách thành công", phieuMuon: result });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
};

module.exports = BorrowController;
