const prisma = require('../models/db');
const ExcelJS = require('exceljs');

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
    const { search, limit = 12, offset = 0 } = req.query;
    try {
      const where = {};
      if (search && search.trim()) {
        const searchTrimmed = search.trim();
        const isNumericSearch = !isNaN(searchTrimmed) && searchTrimmed !== '';

        where.OR = [
          { TieuDe: { contains: searchTrimmed } },
          { ViTriKe: { contains: searchTrimmed } },
          { NhaXuatBan: { TenNXB: { contains: searchTrimmed } } },
          { Sach_TacGia: { some: { TacGia: { TenTacGia: { contains: searchTrimmed } } } } },
          { Sach_TheLoai: { some: { TheLoai: { TenTheLoai: { contains: searchTrimmed } } } } },
          ...(searchTrimmed.toLowerCase().includes('còn') || searchTrimmed.toLowerCase().includes('hết')
            ? [{ TrangThai: searchTrimmed.toLowerCase().includes('còn') ? 'Con' : 'Het' }]
            : []),
        ];

        if (isNumericSearch) {
          where.OR.push(
            { MaSach: parseInt(searchTrimmed) },
            { NamXuatBan: parseInt(searchTrimmed) },
            { GiaSach: parseFloat(searchTrimmed) },
            { SoLuong: parseInt(searchTrimmed) }
          );
        }
      }

      const total = await prisma.sach.count({ where });

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
    console.log('getBookById: Received id:', id, 'Type:', typeof id);
    try {
      if (!id || isNaN(id)) {
        console.error('getBookById: Invalid id:', id);
        return res.status(400).json({ message: `Mã sách phải là số, nhận được: "${id}"` });
      }

      const bookId = parseInt(id);
      if (bookId <= 0) {
        console.error('getBookById: id is not positive:', bookId);
        return res.status(400).json({ message: 'Mã sách phải là số nguyên dương' });
      }

      const book = await prisma.sach.findUnique({
        where: { MaSach: bookId },
        include: {
          NhaXuatBan: true,
          Sach_TacGia: { include: { TacGia: true } },
          Sach_TheLoai: { include: { TheLoai: true } },
        },
      });

      if (!book) {
        console.error(`getBookById: Book not found for MaSach: ${bookId}`);
        return res.status(404).json({ message: 'Không tìm thấy sách' });
      }

      console.log(`getBookById: Fetched book ${bookId} with AnhBia:`, book.AnhBia ? `Length: ${book.AnhBia.length}` : 'null');

      const bookWithBase64 = {
        ...book,
        AnhBia: book.AnhBia ? `data:image/jpeg;base64,${book.AnhBia}` : null,
        TrangThai: book.TrangThai === 'Con' ? 'Còn sách' : 'Hết sách',
      };
      res.json({ message: 'Thành công', data: bookWithBase64 });
    } catch (err) {
      console.error('getBookById: Error:', err.message);
      res.status(500).json({ message: 'Lỗi máy chủ: ' + err.message });
    }
  },

  async createBook(req, res) {
    const { TieuDe, TenTacGia, TheLoai, TenNXB, NamXuatBan, SoLuong, GiaSach, ViTriKe, AnhBia } = req.body;
    try {
      const currentYear = 2025;
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

      const base64Data = AnhBia ? sanitizeBase64(AnhBia.replace(/^data:image\/(jpeg|png);base64,/, '')) : null;
      console.log(`createBook: Độ dài ảnh bìa: ${base64Data ? base64Data.length : 'null'}`);
      console.log(`createBook: Xem trước base64: ${base64Data ? base64Data.substring(0, 50) + '...' : 'null'}`);

      const book = await prisma.$transaction(async (tx) => {
        let author = await tx.tacGia.findFirst({
          where: { TenTacGia: TenTacGia.trim() },
        });
        if (!author) {
          author = await tx.tacGia.create({
            data: { TenTacGia: TenTacGia.trim() },
          });
        }

        let publisher = await tx.nhaXuatBan.findUnique({
          where: { TenNXB: TenNXB.trim() },
        });
        if (!publisher) {
          publisher = await tx.nhaXuatBan.create({
            data: { TenNXB: TenNXB.trim() },
          });
        }

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

        if (genreIds.length) {
          await tx.sach_TheLoai.createMany({
            data: genreIds.map((id) => ({
              MaSach: newBook.MaSach,
              MaTL: id,
            })),
          });
        }

        await tx.sach_TacGia.create({
          data: {
            MaSach: newBook.MaSach,
            MaTG: author.MaTG,
            VaiTro: null,
          },
        });

        return newBook;
      });

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
        ...book,
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

      const base64Data = AnhBia ? sanitizeBase64(AnhBia.replace(/^data:image\/(jpeg|png);base64,/, '')) : null;
      console.log(`updateBook: Độ dài ảnh bìa: ${base64Data ? base64Data.length : 'null'}`);
      console.log(`updateBook: Xem trước base64: ${base64Data ? base64Data.substring(0, 50) + '...' : 'null'}`);

      const book = await prisma.$transaction(async (tx) => {
        let author = await tx.tacGia.findFirst({
          where: { TenTacGia: TenTacGia.trim() },
        });
        if (!author) {
          author = await tx.tacGia.create({
            data: { TenTacGia: TenTacGia.trim() },
          });
        }

        let publisher = await tx.nhaXuatBan.findUnique({
          where: { TenNXB: TenNXB.trim() },
        });
        if (!publisher) {
          publisher = await tx.nhaXuatBan.create({
            data: { TenNXB: TenNXB.trim() },
          });
        }

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

        await tx.sach_TacGia.deleteMany({ where: { MaSach: parseInt(id) } });
        await tx.sach_TheLoai.deleteMany({ where: { MaSach: parseInt(id) } });

        await tx.sach_TacGia.create({
          data: {
            MaSach: parseInt(id),
            MaTG: author.MaTG,
          },
        });

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
        await tx.sach_TacGia.deleteMany({ where: { MaSach: parseInt(id) } });
        await tx.sach_TheLoai.deleteMany({ where: { MaSach: parseInt(id) } });

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

  async exportBooks(req, res) {
    try {
      const books = await prisma.sach.findMany({
        include: {
          NhaXuatBan: true,
          Sach_TacGia: { include: { TacGia: true } },
          Sach_TheLoai: { include: { TheLoai: true } },
        },
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Danh Sách Sách');

      worksheet.columns = [
        { header: 'Mã Sách', key: 'MaSach', width: 10 },
        { header: 'Tiêu Đề', key: 'TieuDe', width: 30 },
        { header: 'Tác Giả', key: 'TacGia', width: 20 },
        { header: 'Thể Loại', key: 'TheLoai', width: 20 },
        { header: 'NXB', key: 'TenNXB', width: 20 },
        { header: 'Năm XB', key: 'NamXuatBan', width: 15 },
        { header: 'Số Lượng', key: 'SoLuong', width: 10 },
        { header: 'Giá Sách', key: 'GiaSach', width: 10 },
        { header: 'Vị Trí Kệ', key: 'ViTriKe', width: 15 },
        { header: 'Trạng Thái', key: 'TrangThai', width: 15 },
      ];

      books.forEach((book) => {
        worksheet.addRow({
          MaSach: book.MaSach,
          TieuDe: book.TieuDe,
          TacGia: book.Sach_TacGia.map((t) => t.TacGia.TenTacGia).join(', ') || 'N/A',
          TheLoai: book.Sach_TheLoai.map((t) => t.TheLoai.TenTheLoai).join(', ') || 'N/A',
          TenNXB: book.NhaXuatBan?.TenNXB || 'N/A',
          NamXuatBan: book.NamXuatBan || 'N/A',
          SoLuong: book.SoLuong || 0,
          GiaSach: book.GiaSach || 0,
          ViTriKe: book.ViTriKe || 'N/A',
          TrangThai: book.TrangThai === 'Con' ? 'Còn sách' : 'Hết sách',
        });
      });

      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="DanhSachSach.xlsx"');

      await workbook.xlsx.write(res);
      res.end();
    } catch (err) {
      console.error('Lỗi trong exportBooks:', err);
      res.status(500).json({ message: 'Lỗi máy chủ: ' + err.message });
    }
  },

  // Duong them dung cho home
  async getTrendingBooks(req, res) {
    try {
      const trendingDetails = await prisma.chiTietMuon.groupBy({
        by: ['MaCuonSach'],
        _count: { MaCuonSach: true },
        orderBy: { _count: { MaCuonSach: 'desc' } },
        take: 20,
      });

      if (trendingDetails.length === 0) {
        return res.json({ message: "Không có dữ liệu sách xu hướng.", data: [] });
      }

      const cuonSachIds = trendingDetails.map(detail => detail.MaCuonSach);
      
      const sachRecords = await prisma.cuonSach.findMany({
          where: { MaCuonSach: { in: cuonSachIds } },
          select: { MaSach: true },
          distinct: ['MaSach'],
      });
      const uniqueSachIds = sachRecords.map(s => s.MaSach);

      const books = await prisma.sach.findMany({
        where: { MaSach: { in: uniqueSachIds.slice(0, 10) } },
        include: {
          Sach_TacGia: { include: { TacGia: true } },
          Sach_TheLoai: { include: { TheLoai: true } },
        },
      });

      const sortedBooks = uniqueSachIds
        .slice(0, 10)
        .map(id => books.find(b => b.MaSach === id))
        .filter(Boolean);

      const booksWithBase64 = sortedBooks.map((book) => ({
        ...book,
        AnhBia: book.AnhBia ? `data:image/jpeg;base64,${book.AnhBia}` : null,
        TacGia: book.Sach_TacGia.map(st => st.TacGia.TenTacGia).join(', '),
      }));

      res.json({ message: "Lấy sách xu hướng thành công.", data: booksWithBase64 });
    } catch (err) {
      console.error('Lỗi trong getTrendingBooks:', err);
      res.status(500).json({ message: err.message });
    }
  },

  async getNewArrivals(req, res) {
    try {
      const newBooks = await prisma.sach.findMany({
        orderBy: {
          MaSach: 'desc',
        },
        take: 10,
        include: {
          Sach_TacGia: { include: { TacGia: true } },
          Sach_TheLoai: { include: { TheLoai: true } },
        },
      });

      const booksWithBase64 = newBooks.map((book) => ({
        ...book,
        AnhBia: book.AnhBia ? `data:image/jpeg;base64,${book.AnhBia}` : null,
        TacGia: book.Sach_TacGia.map(st => st.TacGia.TenTacGia).join(', '),
      }));

      res.json({ message: "Lấy sách mới về thành công.", data: booksWithBase64 });
    } catch (err) {
      console.error('Lỗi trong getNewArrivals:', err);
      res.status(500).json({ message: err.message });
    }
  },
  async getRecommendedBooks(req, res) {
    try {
      const userId = req.user.id; // hoặc req.user.userId tùy JWT bạn set
  
      // 1. Lấy các thể loại user hay mượn nhất
      const favoriteGenres = await prisma.sach_TheLoai.groupBy({
        by: ['MaTL'],
        _count: { MaTL: true },
        where: {
          Sach: {
            CuonSach: {
              some: {
                ChiTietMuon: {
                  some: {
                    PhieuMuon: { IdDG: Number(userId) }
                  }
                }
              }
            }
          }
        },
        orderBy: { _count: { MaTL: 'desc' } },
        take: 3,
      });
  
      if (favoriteGenres.length === 0) {
        return res.json({ message: "Chưa có dữ liệu để gợi ý.", data: [] });
      }
  
      const genreIds = favoriteGenres.map(g => g.MaTL);
  
      const recommendedBooks = await prisma.sach.findMany({
        where: {
          Sach_TheLoai: { some: { MaTL: { in: genreIds } } },
        },
        include: {
          Sach_TacGia: { include: { TacGia: true } },
        },
        take: 10,
      });
  
      const booksWithBase64 = recommendedBooks.map(book => ({
        ...book,
        AnhBia: book.AnhBia ? `data:image/jpeg;base64,${book.AnhBia}` : null,
        TacGia: book.Sach_TacGia.map(st => st.TacGia.TenTacGia).join(', '),
      }));
  
      res.json({ message: "Gợi ý sách thành công.", data: booksWithBase64 });
    } catch (err) {
      console.error("Lỗi trong getRecommendedBooks:", err);
      res.status(500).json({ message: err.message });
    }
  },
  
  async getRelated(req, res) {
    try {
      const id = Number(req.params.id);
  
      // 1 Lấy sách hiện tại + các thể loại của nó
      const currentBook = await prisma.sach.findUnique({
        where: { MaSach: id },
        include: { Sach_TheLoai: true }
      });
  
      if (!currentBook) {
        return res.status(404).json({ message: "Không tìm thấy sách" });
      }
  
      // 2 Lấy danh sách mã thể loại
      const maTLList = currentBook.Sach_TheLoai.map(stl => stl.MaTL);
  
      if (maTLList.length === 0) {
        return res.json({ message: "Sách này chưa có thể loại", data: [] });
      }
  
      // 3 Lấy các sách khác có cùng thể loại
      const related = await prisma.sach.findMany({
        where: {
          MaSach: { not: id },
          Sach_TheLoai: {
            some: { MaTL: { in: maTLList } }
          }
        },
        take: 5
      });
  
      console.log(`Lấy ${related.length} sách liên quan với ID ${id}`);
      res.json({ message: "Lấy sách liên quan thành công", data: related });
    } catch (err) {
      console.error("Lỗi chi tiết trong getRelated:", err);
      res.status(500).json({ message: "Lỗi server", error: err.message });
    }
  },
  
  async getBookCopies(req, res){
    try{
      const id = Number(req.params.id);
      const copies = await prisma.cuonSach.findMany({
        where: { MaSach: id },
        select: {
          MaCuonSach: true,
          TrangThaiCS: true,
        },
      });
      console.log(`getBookCopies: Lấy bản sao sách ${id}`);
      res.json({ message: "Lấy copies thành công", data: copies });
    }
    catch(err){
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = BooksController;
