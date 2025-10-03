const prisma = require('../models/db');

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
          // Tìm kiếm theo tên tác giả
          { TenTacGia: { contains: searchTrimmed } },
          // Tìm kiếm theo quốc tịch
          { QuocTich: { contains: searchTrimmed } },
          // Tìm kiếm theo tiểu sử
          { TieuSu: { contains: searchTrimmed } },
        ];

        // Chỉ thêm điều kiện số nếu search là số hợp lệ
        if (isNumericSearch) {
          where.OR.push({ MaTG: parseInt(searchTrimmed) });
        }
      }

      // Đếm tổng số tác giả
      const total = await prisma.tacGia.count({ where });

      // Lấy danh sách tác giả
      const authors = await prisma.tacGia.findMany({
        where,
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { MaTG: 'asc' },
      });

      console.log(`getAuthors: Fetched ${authors.length} authors`);
      if (authors.length > 0) {
        console.log('getAuthors: Sample author:', {
          MaTG: authors[0].MaTG,
          TenTacGia: authors[0].TenTacGia,
          QuocTich: authors[0].QuocTich || 'null',
          TieuSu: authors[0].TieuSu ? `${authors[0].TieuSu.substring(0, 50)}...` : 'null',
        });
      }

      res.json({ message: 'Success', data: authors, total });
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
      // Xác thực
      if (!TenTacGia?.trim()) throw new Error('Tên tác giả là bắt buộc');

      const author = await prisma.$transaction(async (tx) => {
        // Tạo tác giả
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

      // Lấy tác giả vừa tạo
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
      // Xác thực
      if (!TenTacGia?.trim()) throw new Error('Tên tác giả là bắt buộc');

      const author = await prisma.$transaction(async (tx) => {
        // Cập nhật tác giả
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

      // Lấy tác giả vừa cập nhật
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
        // Xóa các quan hệ liên quan
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
          ? { MaTG: 'asc' } // Sắp xếp theo MaTG tăng dần
          : sort === 'oldest'
          ? { MaTG: 'asc' } // Vẫn tăng dần để nhất quán
          : { MaTG: 'asc' }; // Mặc định sắp xếp theo MaTG tăng dần

      // Đếm tổng số tác giả
      const total = await prisma.tacGia.count({ where });

      // Lấy danh sách tác giả
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
};

module.exports = AuthorsController;