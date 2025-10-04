const prisma = require('../models/db');
const ExcelJS = require('exceljs');

const PublishersController = {
  async getPublishers(req, res) {
    const { search, limit = 8, offset = 0 } = req.query;
    try {
      console.log(`getPublishers: Query params - search: ${search}, limit: ${limit}, offset: ${offset}`);
      const where = {};
      if (search && search.trim()) {
        const searchTrimmed = search.trim();
        const isNumericSearch = !isNaN(searchTrimmed) && searchTrimmed !== '';

        where.OR = [
          { TenNXB: { contains: searchTrimmed } },
          { DiaChi: { contains: searchTrimmed } },
          { SoDienThoai: { contains: searchTrimmed } },
          { Email: { contains: searchTrimmed } },
        ];

        if (isNumericSearch) {
          where.OR.push({ MaNXB: parseInt(searchTrimmed) });
        }
      }

      const total = await prisma.nhaXuatBan.count({ where });

      const publishers = await prisma.nhaXuatBan.findMany({
        where,
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { MaNXB: 'asc' },
        include: {
          Sach: { select: { MaSach: true } },
        },
      });

      const publishersWithHasBooks = publishers.map((publisher) => ({
        ...publisher,
        hasBooks: publisher.Sach.length > 0,
        Sach: undefined,
      }));

      console.log(`getPublishers: Fetched ${publishers.length} publishers`);
      if (publishers.length > 0) {
        console.log('getPublishers: Sample publisher:', {
          MaNXB: publishers[0].MaNXB,
          TenNXB: publishers[0].TenNXB,
          DiaChi: publishers[0].DiaChi || 'null',
          SoDienThoai: publishers[0].SoDienThoai || 'null',
          Email: publishers[0].Email || 'null',
          hasBooks: publishersWithHasBooks[0].hasBooks,
        });
      }

      res.json({ message: 'Success', data: publishersWithHasBooks, total });
    } catch (err) {
      console.error('Error in getPublishers:', err);
      res.status(500).json({ message: err.message });
    }
  },

  async getPublisherById(req, res) {
    const { id } = req.params;
    try {
      const publisher = await prisma.nhaXuatBan.findUnique({
        where: { MaNXB: parseInt(id) },
      });
      if (!publisher) return res.status(404).json({ message: 'Không tìm thấy nhà xuất bản' });

      console.log(`getPublisherById: Nhà xuất bản ${id}`);

      res.json({ message: 'Thành công', data: publisher });
    } catch (err) {
      console.error('Lỗi trong getPublisherById:', err);
      res.status(500).json({ message: err.message });
    }
  },

  async createPublisher(req, res) {
    const { TenNXB, DiaChi, SoDienThoai, Email } = req.body;
    try {
      if (!TenNXB?.trim()) throw new Error('Tên nhà xuất bản là bắt buộc');

      const publisher = await prisma.$transaction(async (tx) => {
        const newPublisher = await tx.nhaXuatBan.create({
          data: {
            TenNXB: TenNXB.trim(),
            DiaChi: DiaChi?.trim() || null,
            SoDienThoai: SoDienThoai?.trim() || null,
            Email: Email?.trim() || null,
          },
        });

        console.log(`createPublisher: Đã tạo nhà xuất bản ${newPublisher.MaNXB}`);

        return newPublisher;
      });

      const createdPublisher = await prisma.nhaXuatBan.findUnique({
        where: { MaNXB: publisher.MaNXB },
      });

      if (!createdPublisher) throw new Error('Không tìm thấy nhà xuất bản vừa tạo');

      console.log(`createPublisher: Lấy nhà xuất bản ${publisher.MaNXB}`);

      res.status(201).json({ message: 'Thêm nhà xuất bản thành công', data: createdPublisher });
    } catch (err) {
      console.error('Lỗi trong createPublisher:', err);
      res.status(400).json({ message: err.message });
    }
  },

  async updatePublisher(req, res) {
    const { id } = req.params;
    const { TenNXB, DiaChi, SoDienThoai, Email } = req.body;
    try {
      if (!TenNXB?.trim()) throw new Error('Tên nhà xuất bản là bắt buộc');

      const publisher = await prisma.$transaction(async (tx) => {
        const updatedPublisher = await tx.nhaXuatBan.update({
          where: { MaNXB: parseInt(id) },
          data: {
            TenNXB: TenNXB.trim(),
            DiaChi: DiaChi?.trim() || null,
            SoDienThoai: SoDienThoai?.trim() || null,
            Email: Email?.trim() || null,
          },
        });

        console.log(`updatePublisher: Cập nhật nhà xuất bản ${updatedPublisher.MaNXB}`);

        return updatedPublisher;
      });

      const updatedPublisher = await prisma.nhaXuatBan.findUnique({
        where: { MaNXB: publisher.MaNXB },
      });

      if (!updatedPublisher) throw new Error('Không tìm thấy nhà xuất bản vừa cập nhật');

      console.log(`updatePublisher: Lấy nhà xuất bản ${publisher.MaNXB}`);

      res.json({ message: 'Cập nhật nhà xuất bản thành công', data: updatedPublisher });
    } catch (err) {
      console.error('Lỗi trong updatePublisher:', err);
      res.status(400).json({ message: err.message });
    }
  },

  async deletePublisher(req, res) {
    const { id } = req.params;
    try {
      console.log(`deletePublisher: Attempting to delete publisher with MaNXB: ${id}`);
      
      await prisma.$transaction(async (tx) => {
        // Kiểm tra xem nhà xuất bản có liên kết với sách nào không
        const bookCount = await tx.sach.count({
          where: { MaNXB: parseInt(id) },
        });

        console.log(`deletePublisher: Found ${bookCount} books linked to publisher MaNXB: ${id}`);

        if (bookCount > 0) {
          throw new Error('Không thể xóa nhà xuất bản vì vẫn còn sách liên quan');
        }

        // Xóa nhà xuất bản
        const deletedPublisher = await tx.nhaXuatBan.delete({
          where: { MaNXB: parseInt(id) },
        });

        console.log(`deletePublisher: Đã xóa nhà xuất bản ${deletedPublisher.MaNXB}`);
        return deletedPublisher;
      });

      res.json({ message: 'Xóa nhà xuất bản thành công' });
    } catch (err) {
      console.error('Lỗi trong deletePublisher:', err);
      res.status(400).json({ message: err.message });
    }
  },

  async exportPublishers(req, res) {
    try {
      const publishers = await prisma.nhaXuatBan.findMany({
        orderBy: { MaNXB: 'asc' },
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Danh Sách Nhà Xuất Bản');

      worksheet.columns = [
        { header: 'Mã Nhà Xuất Bản', key: 'MaNXB', width: 12 },
        { header: 'Tên Nhà Xuất Bản', key: 'TenNXB', width: 30 },
        { header: 'Số Điện Thoại', key: 'SoDienThoai', width: 20 },
        { header: 'Địa Chỉ', key: 'DiaChi', width: 30 },
        { header: 'Email', key: 'Email', width: 25 },
      ];

      publishers.forEach((publisher) => {
        worksheet.addRow({
          MaNXB: publisher.MaNXB,
          TenNXB: publisher.TenNXB || 'N/A',
          SoDienThoai: publisher.SoDienThoai || 'N/A',
          DiaChi: publisher.DiaChi || 'N/A',
          Email: publisher.Email || 'N/A',
        });
      });

      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="DanhSachNhaXuatBan.xlsx"');

      await workbook.xlsx.write(res);
      res.end();

      console.log(`exportPublishers: Đã xuất ${publishers.length} nhà xuất bản`);
    } catch (err) {
      console.error('Lỗi trong exportPublishers:', err);
      res.status(500).json({ message: 'Lỗi máy chủ: ' + err.message });
    }
  },
};

module.exports = PublishersController;