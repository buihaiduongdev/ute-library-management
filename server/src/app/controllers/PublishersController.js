const prisma = require('../models/db');

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
          // Tìm kiếm theo tên nhà xuất bản
          { TenNXB: { contains: searchTrimmed } },
          // Tìm kiếm theo địa chỉ
          { DiaChi: { contains: searchTrimmed } },
          // Tìm kiếm theo số điện thoại
          { SoDienThoai: { contains: searchTrimmed } },
          // Tìm kiếm theo email
          { Email: { contains: searchTrimmed } },
        ];

        // Chỉ thêm điều kiện số nếu search là số hợp lệ
        if (isNumericSearch) {
          where.OR.push({ MaNXB: parseInt(searchTrimmed) });
        }
      }

      // Đếm tổng số nhà xuất bản
      const total = await prisma.nhaXuatBan.count({ where });

      // Lấy danh sách nhà xuất bản
      const publishers = await prisma.nhaXuatBan.findMany({
        where,
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { MaNXB: 'asc' },
      });

      console.log(`getPublishers: Fetched ${publishers.length} publishers`);
      if (publishers.length > 0) {
        console.log('getPublishers: Sample publisher:', {
          MaNXB: publishers[0].MaNXB,
          TenNXB: publishers[0].TenNXB,
          DiaChi: publishers[0].DiaChi || 'null',
          SoDienThoai: publishers[0].SoDienThoai || 'null',
          Email: publishers[0].Email || 'null',
        });
      }

      res.json({ message: 'Success', data: publishers, total });
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
      // Xác thực
      if (!TenNXB?.trim()) throw new Error('Tên nhà xuất bản là bắt buộc');

      const publisher = await prisma.$transaction(async (tx) => {
        // Tạo nhà xuất bản
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

      // Lấy nhà xuất bản vừa tạo
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
      // Xác thực
      if (!TenNXB?.trim()) throw new Error('Tên nhà xuất bản là bắt buộc');

      const publisher = await prisma.$transaction(async (tx) => {
        // Cập nhật nhà xuất bản
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

      // Lấy nhà xuất bản vừa cập nhật
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
      await prisma.$transaction(async (tx) => {
        // Xóa các quan hệ liên quan
        await tx.sach.deleteMany({ where: { MaNXB: parseInt(id) } });

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
};

module.exports = PublishersController;