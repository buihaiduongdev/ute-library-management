const prisma = require('../models/db');

// Hàm kiểm tra và làm sạch chuỗi base64
const sanitizeBase64 = (str) => {
  if (!str || typeof str !== 'string') return null;
  const cleanStr = str.replace(/[^A-Za-z0-9+/=]/g, '');
  try {
    const buffer = Buffer.from(cleanStr, 'base64');
    const reEncoded = buffer.toString('base64');
    if (reEncoded !== cleanStr) {
      console.error('Chuỗi base64 không hợp lệ khi mã hóa lại');
      return null;
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (buffer.length > maxSize) {
      console.error(`Kích thước base64 vượt quá giới hạn: ${buffer.length} bytes`);
      return null;
    }
    return cleanStr;
  } catch (err) {
    console.error('Chuỗi base64 không hợp lệ:', err.message);
    return null;
  }
};

const BooksController = {
  async getBooks(req, res) {
    const { search, limit = 12, offset = 0 } = req.query; // Đổi limit mặc định thành 8
    try {
      const where = {};
      if (search && search.trim()) {
        const searchTrimmed = search.trim();
        const isNumericSearch = !isNaN(searchTrimmed) && searchTrimmed !== '';

        where.OR = [
          // Tìm kiếm theo tiêu đề
          { TieuDe: { contains: searchTrimmed } },
          // Tìm kiếm theo vị trí kệ
          { ViTriKe: { contains: searchTrimmed } },
          // Tìm kiếm theo tên nhà xuất bản
          { NhaXuatBan: { TenNXB: { contains: searchTrimmed } } },
          // Tìm kiếm theo tên tác giả
          { Sach_TacGia: { some: { TacGia: { TenTacGia: { contains: searchTrimmed } } } } },
          // Tìm kiếm theo thể loại
          { Sach_TheLoai: { some: { TheLoai: { TenTheLoai: { contains: searchTrimmed } } } } },
          // Tìm kiếm theo trạng thái
          ...(searchTrimmed.toLowerCase().includes('còn') || searchTrimmed.toLowerCase().includes('hết')
            ? [{ TrangThai: searchTrimmed.toLowerCase().includes('còn') ? 'Con' : 'Het' }]
            : []),
        ];

        // Chỉ thêm các điều kiện số nếu search là số hợp lệ
        if (isNumericSearch) {
          where.OR.push(
            { MaSach: parseInt(searchTrimmed) },
            { NamXuatBan: parseInt(searchTrimmed) },
            { GiaSach: parseFloat(searchTrimmed) },
            { SoLuong: parseInt(searchTrimmed) }
          );
        }
      }

      // Đếm tổng số sách
      const total = await prisma.sach.count({ where });

      // Lấy danh sách sách
      const books = await prisma.sach.findMany({
        where,
        include: {
          NhaXuatBan: true,
          Sach_TacGia: { include: { TacGia: true } },
          Sach_TheLoai: { include: { TheLoai: true } },
        },
        take: parseInt(limit),
        skip: parseInt(offset),
      });

      console.log(`getBooks: Fetched ${books.length} books`);
      if (books.length > 0) {
        console.log('getBooks: Sample book AnhBia:', books[0].AnhBia ? `Length: ${books[0].AnhBia.length}` : 'null');
      }

      // Chuyển đổi dữ liệu ảnh và trạng thái
      const booksWithBase64 = books.map((book) => ({
        ...book,
        AnhBia: book.AnhBia ? `data:image/jpeg;base64,${book.AnhBia}` : null,
        TrangThai: book.TrangThai === 'Con' ? 'Còn sách' : 'Hết sách',
      }));

      res.json({ message: 'Success', data: booksWithBase64, total });
    } catch (err) {
      console.error('Error in getBooks:', err);
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
      if (!book) return res.status(404).json({ message: 'Không tìm thấy sách' });

      console.log(`getBookById: Sách ${id} ảnh bìa:`, book.AnhBia ? `Độ dài: ${book.AnhBia.length}` : 'null');

      const bookWithBase64 = {
        ...book,
        AnhBia: book.AnhBia ? `data:image/jpeg;base64,${book.AnhBia}` : null,
        TrangThai: book.TrangThai === 'Con' ? 'Còn sách' : 'Hết sách',
      };
      res.json({ message: 'Thành công', data: bookWithBase64 });
    } catch (err) {
      console.error('Lỗi trong getBookById:', err);
      res.status(500).json({ message: err.message });
    }
  },

  async createBook(req, res) {
    const { TieuDe, TenTacGia, TheLoai, TenNXB, NamXuatBan, SoLuong, GiaSach, ViTriKe, AnhBia } = req.body;
    try {
      const currentYear = 2025;
      // Xác thực
      if (!TieuDe?.trim()) throw new Error('Tiêu đề sách là bắt buộc');
      if (!TenTacGia?.trim()) throw new Error('Tên tác giả là bắt buộc');
      if (!TenNXB?.trim()) throw new Error('Tên nhà xuất bản là bắt buộc');
      if (SoLuong === undefined || isNaN(parseInt(SoLuong)) || parseInt(SoLuong) < 0)
        throw new Error('Số lượng phải là số không âm');
      if (GiaSach === undefined || isNaN(parseFloat(GiaSach)) || parseFloat(GiaSach) < 0)
        throw new Error('Giá sách phải là số không âm');
      if (NamXuatBan && (parseInt(NamXuatBan) > currentYear || parseInt(NamXuatBan) < 0))
        throw new Error(`Năm xuất bản phải từ 0 đến ${currentYear}`);
      if (AnhBia && !AnhBia.match(/^data:image\/(jpeg|png);base64,/))
        throw new Error('Ảnh bìa phải là chuỗi base64 hợp lệ (jpeg hoặc png)');

      // Làm sạch và kiểm tra base64
      const base64Data = AnhBia ? sanitizeBase64(AnhBia.replace(/^data:image\/(jpeg|png);base64,/, '')) : null;
      console.log(`createBook: Độ dài ảnh bìa: ${base64Data ? base64Data.length : 'null'}`);
      console.log(`createBook: Xem trước base64: ${base64Data ? base64Data.substring(0, 50) + '...' : 'null'}`);

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
            GiaSach: parseFloat(GiaSach) || 0,
            SoLuong: parseInt(SoLuong) || 0,
            ViTriKe: ViTriKe?.trim() || null,
            AnhBia: base64Data,
            TrangThai: parseInt(SoLuong) > 0 ? 'Con' : 'Het',
            MaNXB: publisher.MaNXB,
          },
        });

        console.log(`createBook: Đã tạo sách ${newBook.MaSach} với ảnh bìa:`, base64Data ? `Độ dài: ${base64Data.length}` : 'null');

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
            VaiTro: null,
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

      if (!createdBook) throw new Error('Không tìm thấy sách vừa tạo');

      console.log(`createBook: Lấy sách ${book.MaSach} ảnh bìa:`, createdBook.AnhBia ? `Độ dài: ${createdBook.AnhBia.length}` : 'null');

      const bookWithBase64 = {
        ...createdBook,
        AnhBia: createdBook.AnhBia ? `data:image/jpeg;base64,${createdBook.AnhBia}` : null,
        TrangThai: createdBook.TrangThai === 'Con' ? 'Còn sách' : 'Hết sách',
      };

      res.status(201).json({ message: 'Thêm sách thành công', data: bookWithBase64 });
    } catch (err) {
      console.error('Lỗi trong createBook:', err);
      res.status(400).json({ message: err.message });
    }
  },

  async updateBook(req, res) {
    const { id } = req.params;
    const { TieuDe, TenTacGia, TheLoai, TenNXB, NamXuatBan, SoLuong, GiaSach, ViTriKe, AnhBia } = req.body;
    try {
      const currentYear = 2025;
      // Xác thực
      if (!TieuDe?.trim()) throw new Error('Tiêu đề sách là bắt buộc');
      if (!TenTacGia?.trim()) throw new Error('Tên tác giả là bắt buộc');
      if (!TenNXB?.trim()) throw new Error('Tên nhà xuất bản là bắt buộc');
      if (SoLuong === undefined || isNaN(parseInt(SoLuong)) || parseInt(SoLuong) < 0)
        throw new Error('Số lượng phải là số không âm');
      if (GiaSach === undefined || isNaN(parseFloat(GiaSach)) || parseFloat(GiaSach) < 0)
        throw new Error('Giá sách phải là số không âm');
      if (NamXuatBan && (parseInt(NamXuatBan) > currentYear || parseInt(NamXuatBan) < 0))
        throw new Error(`Năm xuất bản phải từ 0 đến ${currentYear}`);
      if (AnhBia && !AnhBia.match(/^data:image\/(jpeg|png);base64,/))
        throw new Error('Ảnh bìa phải là chuỗi base64 hợp lệ (jpeg hoặc png)');

      // Làm sạch và kiểm tra base64
      const base64Data = AnhBia ? sanitizeBase64(AnhBia.replace(/^data:image\/(jpeg|png);base64,/, '')) : null;
      console.log(`updateBook: Độ dài ảnh bìa: ${base64Data ? base64Data.length : 'null'}`);
      console.log(`updateBook: Xem trước base64: ${base64Data ? base64Data.substring(0, 50) + '...' : 'null'}`);

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

        // Cập nhật sách
        const updatedBook = await tx.sach.update({
          where: { MaSach: parseInt(id) },
          data: {
            TieuDe: TieuDe.trim(),
            NamXuatBan: NamXuatBan ? parseInt(NamXuatBan) : null,
            GiaSach: parseFloat(GiaSach) || 0,
            SoLuong: parseInt(SoLuong) || 0,
            ViTriKe: ViTriKe?.trim() || null,
            AnhBia: base64Data,
            TrangThai: parseInt(SoLuong) > 0 ? 'Con' : 'Het',
            MaNXB: publisher.MaNXB,
          },
        });

        console.log(`updateBook: Cập nhật sách ${updatedBook.MaSach} với ảnh bìa:`, base64Data ? `Độ dài: ${base64Data.length}` : 'null');

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
            data: genreIds.map((maTL) => ({
              MaSach: updatedBook.MaSach,
              MaTL: maTL,
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

      if (!updatedBook) throw new Error('Không tìm thấy sách vừa cập nhật');

      console.log(`updateBook: Lấy sách ${book.MaSach} ảnh bìa:`, updatedBook.AnhBia ? `Độ dài: ${updatedBook.AnhBia.length}` : 'null');

      const bookWithBase64 = {
        ...updatedBook,
        AnhBia: updatedBook.AnhBia ? `data:image/jpeg;base64,${updatedBook.AnhBia}` : null,
        TrangThai: updatedBook.TrangThai === 'Con' ? 'Còn sách' : 'Hết sách',
      };

      res.json({ message: 'Cập nhật sách thành công', data: bookWithBase64 });
    } catch (err) {
      console.error('Lỗi trong updateBook:', err);
      res.status(400).json({ message: err.message });
    }
  },

  async deleteBook(req, res) {
    const { id } = req.params;
    try {
      await prisma.$transaction(async (tx) => {
        // Xóa các quan hệ liên quan
        await tx.sach_TacGia.deleteMany({ where: { MaSach: parseInt(id) } });
        await tx.sach_TheLoai.deleteMany({ where: { MaSach: parseInt(id) } });

        // Xóa sách
        const deletedBook = await tx.sach.delete({
          where: { MaSach: parseInt(id) },
        });

        console.log(`deleteBook: Đã xóa sách ${deletedBook.MaSach}`);
        return deletedBook;
      });

      res.json({ message: 'Xóa sách thành công' });
    } catch (err) {
      console.error('Lỗi trong deleteBook:', err);
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