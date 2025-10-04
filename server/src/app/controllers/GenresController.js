const prisma = require('../models/db');
const ExcelJS = require('exceljs');

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
          { TenTheLoai: { contains: searchTrimmed } },
          { MoTa: { contains: searchTrimmed } },
        ];

        if (isNumericSearch) {
          where.OR.push({ MaTL: parseInt(searchTrimmed) });
        }
      }

      const total = await prisma.theLoai.count({ where });

      const genres = await prisma.theLoai.findMany({
        where,
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { MaTL: 'asc' },
        include: {
          Sach_TheLoai: { select: { MaSach: true } },
        },
      });

      const genresWithHasBooks = genres.map((genre) => ({
        ...genre,
        hasBooks: genre.Sach_TheLoai.length > 0,
        Sach_TheLoai: undefined,
      }));

      console.log(`getGenres: Fetched ${genres.length} genres`);
      if (genres.length > 0) {
        console.log('getGenres: Sample genre:', {
          MaTL: genres[0].MaTL,
          TenTheLoai: genres[0].TenTheLoai,
          MoTa: genres[0].MoTa ? `${genres[0].MoTa.substring(0, 50)}...` : 'null',
          hasBooks: genresWithHasBooks[0].hasBooks,
        });
      }

      res.json({ message: 'Success', data: genresWithHasBooks, total });
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
      if (!TenTheLoai?.trim()) throw new Error('Tên thể loại là bắt buộc');

      const genre = await prisma.$transaction(async (tx) => {
        const newGenre = await tx.theLoai.create({
          data: {
            TenTheLoai: TenTheLoai.trim(),
            MoTa: MoTa?.trim() || null,
          },
        });

        console.log(`createGenre: Đã tạo thể loại ${newGenre.MaTL}`);

        return newGenre;
      });

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
      if (!TenTheLoai?.trim()) throw new Error('Tên thể loại là bắt buộc');

      const genre = await prisma.$transaction(async (tx) => {
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
      console.log(`deleteGenre: Attempting to delete genre with MaTL: ${id}`);
      
      await prisma.$transaction(async (tx) => {
        // Kiểm tra xem thể loại có liên kết với sách nào không
        const bookCount = await tx.sach_TheLoai.count({
          where: { MaTL: parseInt(id) },
        });

        console.log(`deleteGenre: Found ${bookCount} books linked to genre MaTL: ${id}`);

        if (bookCount > 0) {
          throw new Error('Không thể xóa thể loại vì vẫn còn sách liên quan');
        }

        // Xóa quan hệ trong Sach_TheLoai (dù không cần thiết nếu bookCount là 0)
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

  async exportGenres(req, res) {
    try {
      const genres = await prisma.theLoai.findMany({
        orderBy: { MaTL: 'asc' },
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Danh Sách Thể Loại');

      worksheet.columns = [
        { header: 'Mã Thể Loại', key: 'MaTL', width: 12 },
        { header: 'Tên Thể Loại', key: 'TenTheLoai', width: 30 },
        { header: 'Mô Tả', key: 'MoTa', width: 50 },
      ];

      genres.forEach((genre) => {
        worksheet.addRow({
          MaTL: genre.MaTL,
          TenTheLoai: genre.TenTheLoai || 'N/A',
          MoTa: genre.MoTa || 'N/A',
        });
      });

      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="DanhSachTheLoai.xlsx"');

      await workbook.xlsx.write(res);
      res.end();

      console.log(`exportGenres: Đã xuất ${genres.length} thể loại`);
    } catch (err) {
      console.error('Lỗi trong exportGenres:', err);
      res.status(500).json({ message: 'Lỗi máy chủ: ' + err.message });
    }
  },
};

module.exports = GenresController;