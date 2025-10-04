const prisma = require('../models/db');
const ExcelJS = require('exceljs');

const AuthorsController = {
  async getAuthors(req, res) {
    const { search, limit = 8, offset = 0 } = req.query;
    try {
      console.log(`getAuthors: Query params - search: ${search}, limit: ${limit}, offset: ${offset}`);
      const where = {};
      if (search && search.trim()) {
        const searchTrimmed = search.trim();
        const isNumericSearch = !isNaN(searchTrimmed) && searchTrimmed !== '';

        where.OR = [
          { TenTacGia: { contains: searchTrimmed } },
          { QuocTich: { contains: searchTrimmed } },
          { TieuSu: { contains: searchTrimmed } },
        ];

        if (isNumericSearch) {
          where.OR.push({ MaTG: parseInt(searchTrimmed) });
        }
      }

      const total = await prisma.tacGia.count({ where });

      const authors = await prisma.tacGia.findMany({
        where,
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { MaTG: 'asc' },
        include: {
          Sach_TacGia: { select: { MaSach: true } }, // Lấy thông tin liên kết sách
        },
      });

      // Thêm trường hasBooks để chỉ ra tác giả có liên kết với sách hay không
      const authorsWithHasBooks = authors.map((author) => ({
        ...author,
        hasBooks: author.Sach_TacGia.length > 0,
        Sach_TacGia: undefined, // Loại bỏ dữ liệu không cần thiết
      }));

      console.log(`getAuthors: Fetched ${authors.length} authors`);
      if (authors.length > 0) {
        console.log('getAuthors: Sample author:', {
          MaTG: authors[0].MaTG,
          TenTacGia: authors[0].TenTacGia,
          QuocTich: authors[0].QuocTich || 'null',
          TieuSu: authors[0].TieuSu ? `${authors[0].TieuSu.substring(0, 50)}...` : 'null',
          hasBooks: authorsWithHasBooks[0].hasBooks,
        });
      }

      res.json({ message: 'Success', data: authorsWithHasBooks, total });
    } catch (err) {
      console.error('Error in getAuthors:', err);
      res.status(500).json({ message: err.message });
    }
  },

  async getAuthorById(req, res) {
    const { id } = req.params;
    try {
      const author = await prisma.tacGia.findUnique({
        where: { MaTG: parseInt(id) },
      });
      if (!author) return res.status(404).json({ message: 'Không tìm thấy tác giả' });

      console.log(`getAuthorById: Tác giả ${id}`);

      res.json({ message: 'Thành công', data: author });
    } catch (err) {
      console.error('Lỗi trong getAuthorById:', err);
      res.status(500).json({ message: err.message });
    }
  },

  async createAuthor(req, res) {
    const { TenTacGia, TieuSu, QuocTich } = req.body;
    try {
      if (!TenTacGia?.trim()) throw new Error('Tên tác giả là bắt buộc');

      const author = await prisma.$transaction(async (tx) => {
        const newAuthor = await tx.tacGia.create({
          data: {
            TenTacGia: TenTacGia.trim(),
            TieuSu: TieuSu?.trim() || null,
            QuocTich: QuocTich?.trim() || null,
          },
        });

        console.log(`createAuthor: Đã tạo tác giả ${newAuthor.MaTG}`);

        return newAuthor;
      });

      const createdAuthor = await prisma.tacGia.findUnique({
        where: { MaTG: author.MaTG },
      });

      if (!createdAuthor) throw new Error('Không tìm thấy tác giả vừa tạo');

      console.log(`createAuthor: Lấy tác giả ${author.MaTG}`);

      res.status(201).json({ message: 'Thêm tác giả thành công', data: createdAuthor });
    } catch (err) {
      console.error('Lỗi trong createAuthor:', err);
      res.status(400).json({ message: err.message });
    }
  },

  async updateAuthor(req, res) {
    const { id } = req.params;
    const { TenTacGia, TieuSu, QuocTich } = req.body;
    try {
      if (!TenTacGia?.trim()) throw new Error('Tên tác giả là bắt buộc');

      const author = await prisma.$transaction(async (tx) => {
        const updatedAuthor = await tx.tacGia.update({
          where: { MaTG: parseInt(id) },
          data: {
            TenTacGia: TenTacGia.trim(),
            TieuSu: TieuSu?.trim() || null,
            QuocTich: QuocTich?.trim() || null,
          },
        });

        console.log(`updateAuthor: Cập nhật tác giả ${updatedAuthor.MaTG}`);

        return updatedAuthor;
      });

      const updatedAuthor = await prisma.tacGia.findUnique({
        where: { MaTG: author.MaTG },
      });

      if (!updatedAuthor) throw new Error('Không tìm thấy tác giả vừa cập nhật');

      console.log(`updateAuthor: Lấy tác giả ${author.MaTG}`);

      res.json({ message: 'Cập nhật tác giả thành công', data: updatedAuthor });
    } catch (err) {
      console.error('Lỗi trong updateAuthor:', err);
      res.status(400).json({ message: err.message });
    }
  },

  async deleteAuthor(req, res) {
    const { id } = req.params;
    try {
      await prisma.$transaction(async (tx) => {
        // Kiểm tra xem tác giả có liên kết với sách nào không
        const bookCount = await tx.sach_TacGia.count({
          where: { MaTG: parseInt(id) },
        });

        if (bookCount > 0) {
          throw new Error('Không thể xóa tác giả vì vẫn còn sách liên quan');
        }

        // Nếu không có sách liên quan, xóa quan hệ trong Sach_TacGia (để đảm bảo sạch dữ liệu)
        await tx.sach_TacGia.deleteMany({ where: { MaTG: parseInt(id) } });

        // Xóa tác giả
        const deletedAuthor = await tx.tacGia.delete({
          where: { MaTG: parseInt(id) },
        });

        console.log(`deleteAuthor: Đã xóa tác giả ${deletedAuthor.MaTG}`);
        return deletedAuthor;
      });

      res.json({ message: 'Xóa tác giả thành công' });
    } catch (err) {
      console.error('Lỗi trong deleteAuthor:', err);
      res.status(400).json({ message: err.message });
    }
  },

  async searchAuthors(req, res) {
    const { keyword, sort = 'newest', limit = 8, offset = 0 } = req.query;
    try {
      console.log(`searchAuthors: Query params - keyword: ${keyword}, sort: ${sort}, limit: ${limit}, offset: ${offset}`);

      const where = {
        AND: [
          keyword
            ? {
                OR: [
                  { TenTacGia: { contains: keyword, mode: 'insensitive' } },
                  { TieuSu: { contains: keyword, mode: 'insensitive' } },
                  { QuocTich: { contains: keyword, mode: 'insensitive' } },
                ],
              }
            : {},
        ],
      };

      const orderBy =
        sort === 'newest'
          ? { MaTG: 'asc' }
          : sort === 'oldest'
          ? { MaTG: 'asc' }
          : { MaTG: 'asc' };

      const total = await prisma.tacGia.count({ where });

      const authors = await prisma.tacGia.findMany({
        where,
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy,
      }).catch((err) => {
        if (err.message.includes('Unknown argument `mode`')) {
          const fallbackWhere = {
            AND: [
              keyword
                ? {
                    OR: [
                      { TenTacGia: { contains: keyword } },
                      { TieuSu: { contains: keyword } },
                      { QuocTich: { contains: keyword } },
                    ],
                  }
                : {},
            ],
          };
          return prisma.tacGia.findMany({
            where: fallbackWhere,
            take: parseInt(limit),
            skip: parseInt(offset),
            orderBy,
          });
        }
        throw err;
      });

      console.log(`searchAuthors: Fetched ${authors.length} authors, Total: ${total}`);

      res.json({ message: 'Success', data: authors, total });
    } catch (err) {
      console.error('Error in searchAuthors:', err);
      res.status(500).json({ message: err.message });
    }
  },

  async exportAuthors(req, res) {
    try {
      const authors = await prisma.tacGia.findMany({
        orderBy: { MaTG: 'asc' },
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Danh Sách Tác Giả');

      worksheet.columns = [
        { header: 'Mã Tác Giả', key: 'MaTG', width: 12 },
        { header: 'Tên Tác Giả', key: 'TenTacGia', width: 30 },
        { header: 'Quốc Tịch', key: 'QuocTich', width: 20 },
        { header: 'Tiểu Sử', key: 'TieuSu', width: 50 },
      ];

      authors.forEach((author) => {
        worksheet.addRow({
          MaTG: author.MaTG,
          TenTacGia: author.TenTacGia || 'N/A',
          QuocTich: author.QuocTich || 'N/A',
          TieuSu: author.TieuSu || 'N/A',
        });
      });

      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="DanhSachTacGia.xlsx"');

      await workbook.xlsx.write(res);
      res.end();

      console.log(`exportAuthors: Đã xuất ${authors.length} tác giả`);
    } catch (err) {
      console.error('Lỗi trong exportAuthors:', err);
      res.status(500).json({ message: 'Lỗi máy chủ: ' + err.message });
    }
  },
};

module.exports = AuthorsController;