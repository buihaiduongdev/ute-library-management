const prisma = require('../models/db');

const BooksController = {
  async getBooks(req, res) {
    const { search, limit = 10, offset = 0 } = req.query;
    try {
      const where = search
        ? {
            OR: [
              { TieuDe: { contains: search, mode: 'insensitive' } },
              { MaSach: { equals: parseInt(search) || 0 } },
            ],
          }
        : {};
      const books = await prisma.sach.findMany({
        where,
        include: {
          NhaXuatBan: true,
          Sach_TacGia: { include: { TacGia: true } },
          Sach_TheLoai: { include: { TheLoai: true } },
        },
        take: parseInt(limit),
        skip: parseInt(offset),
      }).catch((err) => {
        // Fallback nếu mode không hỗ trợ, thử lại mà không dùng mode
        if (err.message.includes('Unknown argument `mode`')) {
          const fallbackWhere = search
            ? {
                OR: [
                  { TieuDe: { contains: search } }, // Bỏ mode
                  { MaSach: { equals: parseInt(search) || 0 } },
                ],
              }
            : {};
          return prisma.sach.findMany({
            where: fallbackWhere,
            include: {
              NhaXuatBan: true,
              Sach_TacGia: { include: { TacGia: true } },
              Sach_TheLoai: { include: { TheLoai: true } },
            },
            take: parseInt(limit),
            skip: parseInt(offset),
          });
        }
        throw err;
      });
      const booksWithBase64 = books.map((book) => ({
        ...book,
        AnhBia: book.AnhBia ? Buffer.from(book.AnhBia).toString('base64') : null,
        TrangThai: book.TrangThai === 'Con' ? 'Còn sách' : 'Hết sách',
      }));
      res.json({ message: 'Success', data: booksWithBase64 });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getBookById(req, res) {
    const { id } = req.params;
    try {
      const book = await prisma.sach.findUnique({
        where: { MaSach: parseInt(id) },
        include: {
          NhaXuatBan: true,
          Sach_TacGia: { include: { TacGia: true } },
          Sach_TheLoai: { include: { TheLoai: true } },
        },
      });
      if (!book) return res.status(404).json({ message: 'Book not found' });
      const bookWithBase64 = {
        ...book,
        AnhBia: book.AnhBia ? Buffer.from(book.AnhBia).toString('base64') : null,
        TrangThai: book.TrangThai === 'Con' ? 'Còn sách' : 'Hết sách',
      };
      res.json({ message: 'Success', data: bookWithBase64 });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async createBook(req, res) {
    const { TieuDe, TenTacGia, TheLoai, TenNXB, NamXuatBan, SoLuong, ViTriKe, AnhBia } = req.body;
    try {
      const currentYear = 2025;
      // Xác thực
      if (!TieuDe) throw new Error('Tiêu đề sách là bắt buộc');
      if (!TenTacGia) throw new Error('Tên tác giả là bắt buộc');
      if (!TenNXB) throw new Error('Tên nhà xuất bản là bắt buộc');
      if (SoLuong === undefined || isNaN(parseInt(SoLuong)) || parseInt(SoLuong) < 0)
        throw new Error('Số lượng phải là số không âm');
      if (NamXuatBan && (parseInt(NamXuatBan) > currentYear || parseInt(NamXuatBan) < 0))
        throw new Error(`Năm xuất bản phải từ 0 đến ${currentYear}`);
  
      const book = await prisma.$transaction(async (tx) => {
        // Kiểm tra và tạo/lấy tác giả
        let author = await tx.tacGia.findFirst({
          where: { TenTacGia: TenTacGia.trim() },
        });
        if (!author) {
          author = await tx.tacGia.create({
            data: { TenTacGia: TenTacGia.trim() },
          });
        }
  
        // Kiểm tra và tạo/lấy nhà xuất bản
        let publisher = await tx.nhaXuatBan.findUnique({
          where: { TenNXB: TenNXB.trim() },
        });
        if (!publisher) {
          publisher = await tx.nhaXuatBan.create({
            data: { TenNXB: TenNXB.trim() },
          });
        }
  
        // Xử lý thể loại
        const genreIds = [];
        if (TheLoai?.trim()) {
          let genre = await tx.theLoai.findFirst({
            where: { TenTheLoai: TheLoai.trim() },
          });
          if (!genre) {
            genre = await tx.theLoai.create({
              data: { TenTheLoai: TheLoai.trim() },
            });
          }
          genreIds.push(genre.MaTL);
        }
  
        // Tạo sách
        const newBook = await tx.sach.create({
          data: {
            TieuDe: TieuDe.trim(),
            NamXuatBan: NamXuatBan ? parseInt(NamXuatBan) : null,
            GiaSach: 0,
            SoLuong: parseInt(SoLuong) || 0,
            ViTriKe: ViTriKe?.trim() || null,
            AnhBia: AnhBia ? Buffer.from(AnhBia.split(',')[1] || AnhBia, 'base64') : null,
            TrangThai: parseInt(SoLuong) > 0 ? 'Con' : 'Het',
            NhaXuatBan: {
              connect: { MaNXB: publisher.MaNXB },
            },
          },
        });
  
        // Liên kết thể loại
        if (genreIds.length) {
          await tx.sach_TheLoai.createMany({
            data: genreIds.map((id) => ({
              MaSach: newBook.MaSach,
              MaTL: id,
            })),
          });
        }
  
        // Liên kết tác giả
        await tx.sach_TacGia.create({
          data: {
            MaSach: newBook.MaSach,
            MaTG: author.MaTG,
            VaiTro: null, // Có thể lấy từ req.body nếu cần
          },
        });
  
        return newBook;
      });
  
      // Lấy sách vừa tạo
      const createdBook = await prisma.sach.findUnique({
        where: { MaSach: book.MaSach },
        include: {
          NhaXuatBan: true,
          Sach_TacGia: { include: { TacGia: true } },
          Sach_TheLoai: { include: { TheLoai: true } },
        },
      });
  
      const bookWithBase64 = {
        ...createdBook,
        AnhBia: createdBook.AnhBia ? Buffer.from(createdBook.AnhBia).toString('base64') : null,
        TrangThai: createdBook.TrangThai === 'Con' ? 'Còn sách' : 'Hết sách',
      };
  
      res.status(201).json({ message: 'Thêm sách thành công', data: bookWithBase64 });
    } catch (err) {
      console.error('Error in createBook:', err);
      res.status(400).json({ message: err.message });
    }
  },

  async updateBook(req, res) {
    const { id } = req.params;
    const { TieuDe, TenTacGia, TheLoai, TenNXB, NamXuatBan, SoLuong, ViTriKe, AnhBia } = req.body;
    try {
      const currentYear = 2025;
      // Xác thực
      if (!TieuDe) throw new Error('Tiêu đề sách là bắt buộc');
      if (!TenTacGia) throw new Error('Tên tác giả là bắt buộc');
      if (!TenNXB) throw new Error('Tên nhà xuất bản là bắt buộc');
      if (SoLuong === undefined || parseInt(SoLuong) < 0) throw new Error('Số lượng không được âm');
      if (NamXuatBan && (parseInt(NamXuatBan) > currentYear || parseInt(NamXuatBan) < 0))
        throw new Error(`Năm xuất bản phải từ 0 đến ${currentYear}`);

      const book = await prisma.$transaction(async (tx) => {
        // Kiểm tra và tạo/lấy tác giả
        let author = await tx.tacGia.findFirst({
          where: { TenTacGia: TenTacGia.trim() },
        });
        if (!author) {
          author = await tx.tacGia.create({
            data: { TenTacGia: TenTacGia.trim() },
          });
        }

        // Kiểm tra và tạo/lấy nhà xuất bản
        let publisher = await tx.nhaXuatBan.findUnique({
          where: { TenNXB: TenNXB.trim() },
        });
        if (!publisher) {
          publisher = await tx.nhaXuatBan.create({
            data: { TenNXB: TenNXB.trim() },
          });
        }

        // Xử lý thể loại (nhập trực tiếp)
        const genreIds = [];
        if (TheLoai?.trim()) {
          let genre = await tx.theLoai.findFirst({
            where: { TenTheLoai: TheLoai.trim() },
          });
          if (!genre) {
            genre = await tx.theLoai.create({
              data: { TenTheLoai: TheLoai.trim() },
            });
          }
          genreIds.push(genre.MaTL);
        }

        // Cập nhật sách
        const quantity = parseInt(SoLuong);
        if (isNaN(quantity)) throw new Error('Số lượng không hợp lệ');
        const updatedBook = await tx.sach.update({
          where: { MaSach: parseInt(id) },
          data: {
            TieuDe: TieuDe.trim(),
            NamXuatBan: NamXuatBan ? parseInt(NamXuatBan) : null,
            GiaSach: 0,
            MaNXB: publisher.MaNXB,
            SoLuong: quantity,
            ViTriKe: ViTriKe?.trim() || null,
            AnhBia: AnhBia ? Buffer.from(AnhBia, 'base64') : undefined,
            TrangThai: quantity > 0 ? 'Con' : 'Het',
          },
        });

        // Xóa quan hệ cũ
        await tx.sach_TacGia.deleteMany({ where: { MaSach: parseInt(id) } });
        await tx.sach_TheLoai.deleteMany({ where: { MaSach: parseInt(id) } });

        // Liên kết tác giả
        await tx.sach_TacGia.create({
          data: {
            MaSach: parseInt(id),
            MaTG: author.MaTG,
          },
        });

        // Liên kết thể loại
        if (genreIds.length) {
          await tx.sach_TheLoai.createMany({
            data: genreIds.map((id) => ({
              MaSach: parseInt(updatedBook.MaSach),  // Sửa từ parseInt(id) thành updatedBook.MaSach
              MaTL: id,
            })),
          });
        }

        return updatedBook;
      });

      // Lấy sách vừa cập nhật
      const updatedBook = await prisma.sach.findUnique({
        where: { MaSach: book.MaSach },
        include: {
          NhaXuatBan: true,
          Sach_TacGia: { include: { TacGia: true } },
          Sach_TheLoai: { include: { TheLoai: true } },
        },
      });

      const bookWithBase64 = {
        ...updatedBook,
        AnhBia: updatedBook.AnhBia ? Buffer.from(updatedBook.AnhBia).toString('base64') : null,
        TrangThai: updatedBook.TrangThai === 'Con' ? 'Còn sách' : 'Hết sách',
      };

      res.json({ message: 'Cập nhật sách thành công', data: bookWithBase64 });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  async deleteBook(req, res) {
    const { id } = req.params;
    try {
      await prisma.$transaction(async (tx) => {
        // Lấy danh sách MaCuonSach liên quan đến MaSach
        const cuonSachRecords = await tx.cuonSach.findMany({
          where: { MaSach: parseInt(id) },
          select: { MaCuonSach: true },
        });
  
        // Xóa các bản ghi trong ChiTietMuon liên quan đến CuonSach
        if (cuonSachRecords.length > 0) {
          const maCuonSachIds = cuonSachRecords.map((record) => record.MaCuonSach);
          await tx.chiTietMuon.deleteMany({
            where: { MaCuonSach: { in: maCuonSachIds } },
          });
        }
  
        // Xóa các bản ghi liên quan trong CuonSach, Sach_TacGia, Sach_TheLoai
        await tx.cuonSach.deleteMany({ where: { MaSach: parseInt(id) } });
        await tx.sach_TacGia.deleteMany({ where: { MaSach: parseInt(id) } });
        await tx.sach_TheLoai.deleteMany({ where: { MaSach: parseInt(id) } });
  
        // Xóa sách
        const deletedBook = await tx.sach.delete({
          where: { MaSach: parseInt(id) },
        });
  
        return deletedBook;
      });
  
      res.json({ message: 'Xóa sách thành công' });
    } catch (err) {
      console.error('Error in deleteBook:', err);
      res.status(400).json({ message: err.message });
    }
  },

  async searchBooks(req, res) {
    const { keyword, authors, genres, publisher, yearFrom, yearTo, sort = 'newest' } = req.query;
    try {
      const where = {
        AND: [
          keyword
            ? {
                OR: [
                  { TieuDe: { contains: keyword, mode: 'insensitive' } },
                  { MoTa: { contains: keyword, mode: 'insensitive' } },
                ],
              }
            : {},
          authors ? { Sach_TacGia: { some: { MaTG: { in: authors.split(',').map(Number) } } } } : {},
          genres ? { Sach_TheLoai: { some: { MaTL: { in: genres.split(',').map(Number) } } } } : {},
          publisher ? { MaNXB: parseInt(publisher) } : {},
          yearFrom && yearTo
            ? { NamXuatBan: { gte: parseInt(yearFrom), lte: parseInt(yearTo) } }
            : {},
        ],
      };
      const orderBy =
        sort === 'newest'
          ? { NamXuatBan: 'desc' }
          : sort === 'oldest'
          ? { NamXuatBan: 'asc' }
          : sort === 'popular'
          ? { ChiTietMuon: { _count: 'desc' } }
          : {};
      const books = await prisma.sach.findMany({
        where,
        include: {
          NhaXuatBan: true,
          Sach_TacGia: { include: { TacGia: true } },
          Sach_TheLoai: { include: { TheLoai: true } },
        },
        orderBy,
      }).catch((err) => {
        if (err.message.includes('Unknown argument `mode`')) {
          const fallbackWhere = {
            AND: [
              keyword
                ? {
                    OR: [
                      { TieuDe: { contains: keyword } },
                      { MoTa: { contains: keyword } },
                    ],
                  }
                : {},
              authors ? { Sach_TacGia: { some: { MaTG: { in: authors.split(',').map(Number) } } } } : {},
              genres ? { Sach_TheLoai: { some: { MaTL: { in: genres.split(',').map(Number) } } } } : {},
              publisher ? { MaNXB: parseInt(publisher) } : {},
              yearFrom && yearTo
                ? { NamXuatBan: { gte: parseInt(yearFrom), lte: parseInt(yearTo) } }
                : {},
            ],
          };
          return prisma.sach.findMany({
            where: fallbackWhere,
            include: {
              NhaXuatBan: true,
              Sach_TacGia: { include: { TacGia: true } },
              Sach_TheLoai: { include: { TheLoai: true } },
            },
            orderBy,
          });
        }
        throw err;
      });
      const booksWithBase64 = books.map((book) => ({
        ...book,
        AnhBia: book.AnhBia ? Buffer.from(book.AnhBia).toString('base64') : null,
        TrangThai: book.TrangThai === 'Con' ? 'Còn sách' : 'Hết sách',
      }));
      res.json({ message: 'Success', data: booksWithBase64 });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = BooksController;