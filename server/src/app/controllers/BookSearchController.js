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

const BookSearchController = {
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
      console.error('getBookById: Error:', err);
      res.status(500).json({ message: 'Lỗi máy chủ: ' + err.message });
    }
  },
};

module.exports = BookSearchController;