const prisma = require('../models/db');

const GenresController = {
  async getGenres(req, res) {
    const { search, limit = 8, offset = 0 } = req.query;
    try {
      console.log(`getGenres: Query params - search: ${search}, limit: ${limit}, offset: ${offset}`);
      const where = {};
      if (search && search.trim()) {
        const searchTrimmed = search.trim();
        const isNumericSearch = !isNaN(searchTrimmed) && searchTrimmed !== '';

        where.OR = [
          // Tìm kiếm theo tên thể loại
          { TenTheLoai: { contains: searchTrimmed } },
          // Tìm kiếm theo mô tả
          { MoTa: { contains: searchTrimmed } },
        ];

        // Chỉ thêm điều kiện số nếu search là số hợp lệ
        if (isNumericSearch) {
          where.OR.push({ MaTL: parseInt(searchTrimmed) });
        }
      }

      // Đếm tổng số thể loại
      const total = await prisma.theLoai.count({ where });

      // Lấy danh sách thể loại
      const genres = await prisma.theLoai.findMany({
        where,
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { MaTL: 'asc' },
      });

      console.log(`getGenres: Fetched ${genres.length} genres`);
      if (genres.length > 0) {
        console.log('getGenres: Sample genre:', {
          MaTL: genres[0].MaTL,
          TenTheLoai: genres[0].TenTheLoai,
          MoTa: genres[0].MoTa ? `${genres[0].MoTa.substring(0, 50)}...` : 'null',
        });
      }

      res.json({ message: 'Success', data: genres, total });
    } catch (err) {
      console.error('Error in getGenres:', err);
      res.status(500).json({ message: err.message });
    }
  },

  async getGenreById(req, res) {
    const { id } = req.params;
    try {
      const genre = await prisma.theLoai.findUnique({
        where: { MaTL: parseInt(id) },
      });
      if (!genre) return res.status(404).json({ message: 'Không tìm thấy thể loại' });

      console.log(`getGenreById: Thể loại ${id}`);

      res.json({ message: 'Thành công', data: genre });
    } catch (err) {
      console.error('Lỗi trong getGenreById:', err);
      res.status(500).json({ message: err.message });
    }
  },

  async createGenre(req, res) {
    const { TenTheLoai, MoTa } = req.body;
    try {
      // Xác thực
      if (!TenTheLoai?.trim()) throw new Error('Tên thể loại là bắt buộc');

      const genre = await prisma.$transaction(async (tx) => {
        // Tạo thể loại
        const newGenre = await tx.theLoai.create({
          data: {
            TenTheLoai: TenTheLoai.trim(),
            MoTa: MoTa?.trim() || null,
          },
        });

        console.log(`createGenre: Đã tạo thể loại ${newGenre.MaTL}`);

        return newGenre;
      });

      // Lấy thể loại vừa tạo
      const createdGenre = await prisma.theLoai.findUnique({
        where: { MaTL: genre.MaTL },
      });

      if (!createdGenre) throw new Error('Không tìm thấy thể loại vừa tạo');

      console.log(`createGenre: Lấy thể loại ${genre.MaTL}`);

      res.status(201).json({ message: 'Thêm thể loại thành công', data: createdGenre });
    } catch (err) {
      console.error('Lỗi trong createGenre:', err);
      res.status(400).json({ message: err.message });
    }
  },

  async updateGenre(req, res) {
    const { id } = req.params;
    const { TenTheLoai, MoTa } = req.body;
    try {
      // Xác thực
      if (!TenTheLoai?.trim()) throw new Error('Tên thể loại là bắt buộc');

      const genre = await prisma.$transaction(async (tx) => {
        // Cập nhật thể loại
        const updatedGenre = await tx.theLoai.update({
          where: { MaTL: parseInt(id) },
          data: {
            TenTheLoai: TenTheLoai.trim(),
            MoTa: MoTa?.trim() || null,
          },
        });

        console.log(`updateGenre: Cập nhật thể loại ${updatedGenre.MaTL}`);

        return updatedGenre;
      });

      // Lấy thể loại vừa cập nhật
      const updatedGenre = await prisma.theLoai.findUnique({
        where: { MaTL: genre.MaTL },
      });

      if (!updatedGenre) throw new Error('Không tìm thấy thể loại vừa cập nhật');

      console.log(`updateGenre: Lấy thể loại ${genre.MaTL}`);

      res.json({ message: 'Cập nhật thể loại thành công', data: updatedGenre });
    } catch (err) {
      console.error('Lỗi trong updateGenre:', err);
      res.status(400).json({ message: err.message });
    }
  },

  async deleteGenre(req, res) {
    const { id } = req.params;
    try {
      await prisma.$transaction(async (tx) => {
        // Xóa các quan hệ liên quan
        await tx.sach_TheLoai.deleteMany({ where: { MaTL: parseInt(id) } });

        // Xóa thể loại
        const deletedGenre = await tx.theLoai.delete({
          where: { MaTL: parseInt(id) },
        });

        console.log(`deleteGenre: Đã xóa thể loại ${deletedGenre.MaTL}`);
        return deletedGenre;
      });

      res.json({ message: 'Xóa thể loại thành công' });
    } catch (err) {
      console.error('Lỗi trong deleteGenre:', err);
      res.status(400).json({ message: err.message });
    }
  },
};

module.exports = GenresController;