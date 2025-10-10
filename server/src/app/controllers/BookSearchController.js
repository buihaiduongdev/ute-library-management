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
    const { search, limit = 9, offset = 0 } = req.query;
    try {
      const where = {};
      if (search && search.trim()) {
        const searchTrimmed = search.trim();
        const isNumericSearch = !isNaN(searchTrimmed) && searchTrimmed !== '';

        where.OR = [
          { TieuDe: { contains: searchTrimmed } },
          { ViTriKe: { contains: searchTrimmed } },
          { MoTa: { contains: searchTrimmed } }, // Thêm MoTa vào điều kiện tìm kiếm
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
        console.log('getBooks: Sample book MoTa:', books[0].MoTa); // Log để kiểm tra MoTa
        console.log('getBooks: Sample book AnhBia:', books[0].AnhBia ? `Length: ${books[0].AnhBia.length}` : 'null');
      }

      const booksWithBase64 = books.map((book) => ({
        ...book,
        AnhBia: book.AnhBia ? `data:image/jpeg;base64,${book.AnhBia}` : null,
        TrangThai: book.TrangThai === 'Con' ? 'Còn sách' : 'Hết sách',
        MoTa: book.MoTa, // Giữ nguyên giá trị MoTa từ Prisma
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

      console.log('getBookById: Fetched book MoTa:', book.MoTa); // Log để kiểm tra MoTa
      console.log('getBookById: Fetched book AnhBia:', book.AnhBia ? `Length: ${book.AnhBia.length}` : 'null');

      const bookWithBase64 = {
        ...book,
        AnhBia: book.AnhBia ? `data:image/jpeg;base64,${book.AnhBia}` : null,
        TrangThai: book.TrangThai === 'Con' ? 'Còn sách' : 'Hết sách',
        MoTa: book.MoTa, // Giữ nguyên giá trị MoTa từ Prisma
      };
      res.json({ message: 'Thành công', data: bookWithBase64 });
    } catch (err) {
      console.error('getBookById: Error:', err);
      res.status(500).json({ message: 'Lỗi máy chủ: ' + err.message });
    }
  },

  async getNewArrivals(req, res) {
    try {
      const { limit = 9, offset = 0 } = req.query;
      const total = await prisma.sach.count();
      const newBooks = await prisma.sach.findMany({
        orderBy: { MaSach: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
        include: {
          Sach_TacGia: { include: { TacGia: true } },
          Sach_TheLoai: { include: { TheLoai: true } },
          NhaXuatBan: true,
        },
      });

      console.log('getNewArrivals: Fetched books MoTa:', newBooks[0]?.MoTa); // Log để kiểm tra MoTa

      const booksWithBase64 = newBooks.map((book) => ({
        ...book,
        AnhBia: book.AnhBia ? `data:image/jpeg;base64,${book.AnhBia}` : null,
        TacGia: book.Sach_TacGia.map(st => st.TacGia.TenTacGia).join(', '),
        TrangThai: book.TrangThai === 'Con' ? 'Còn sách' : 'Hết sách',
        MoTa: book.MoTa, // Giữ nguyên giá trị MoTa từ Prisma
      }));

      res.json({ message: 'Lấy sách mới về thành công.', data: booksWithBase64, total });
    } catch (err) {
      console.error('Lỗi trong getNewArrivals:', err);
      res.status(500).json({ message: err.message });
    }
  },

  async getTrendingBooks(req, res) {
    try {
      const { limit = 9, offset = 0 } = req.query;
      const trendingDetails = await prisma.chiTietMuon.groupBy({
        by: ['MaCuonSach'],
        _count: { MaCuonSach: true },
        orderBy: { _count: { MaCuonSach: 'desc' } },
        take: parseInt(limit) + parseInt(offset),
        skip: parseInt(offset),
      });

      let booksWithBase64 = [];
      let total = 0;

      if (trendingDetails.length === 0) {
        const fallbackBooks = await prisma.sach.findMany({
          orderBy: { MaSach: 'desc' },
          take: parseInt(limit),
          skip: parseInt(offset),
          include: {
            Sach_TacGia: { include: { TacGia: true } },
            Sach_TheLoai: { include: { TheLoai: true } },
            NhaXuatBan: true,
          },
        });
        total = await prisma.sach.count();
        console.log('getTrendingBooks: Fallback books MoTa:', fallbackBooks[0]?.MoTa); // Log để kiểm tra MoTa
        booksWithBase64 = fallbackBooks.map((book) => ({
          ...book,
          AnhBia: book.AnhBia ? `data:image/jpeg;base64,${book.AnhBia}` : null,
          TacGia: book.Sach_TacGia.map(st => st.TacGia.TenTacGia).join(', '),
          TrangThai: book.TrangThai === 'Con' ? 'Còn sách' : 'Hết sách',
          MoTa: book.MoTa, // Giữ nguyên giá trị MoTa từ Prisma
        }));
        return res.json({ message: 'Không có dữ liệu xu hướng, trả về sách mới nhất.', data: booksWithBase64, total });
      }

      const cuonSachIds = trendingDetails.map(detail => detail.MaCuonSach);
      const sachRecords = await prisma.cuonSach.findMany({
        where: { MaCuonSach: { in: cuonSachIds } },
        select: { MaSach: true },
        distinct: ['MaSach'],
      });
      const uniqueSachIds = sachRecords.map(s => s.MaSach);

      total = uniqueSachIds.length;
      const books = await prisma.sach.findMany({
        where: { MaSach: { in: uniqueSachIds.slice(parseInt(offset), parseInt(offset) + parseInt(limit)) } },
        include: {
          Sach_TacGia: { include: { TacGia: true } },
          Sach_TheLoai: { include: { TheLoai: true } },
          NhaXuatBan: true,
        },
      });

      console.log('getTrendingBooks: Fetched books MoTa:', books[0]?.MoTa); // Log để kiểm tra MoTa

      const sortedBooks = uniqueSachIds
        .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
        .map(id => books.find(b => b.MaSach === id))
        .filter(Boolean);

      booksWithBase64 = sortedBooks.map((book) => ({
        ...book,
        AnhBia: book.AnhBia ? `data:image/jpeg;base64,${book.AnhBia}` : null,
        TacGia: book.Sach_TacGia.map(st => st.TacGia.TenTacGia).join(', '),
        TrangThai: book.TrangThai === 'Con' ? 'Còn sách' : 'Hết sách',
        MoTa: book.MoTa, // Giữ nguyên giá trị MoTa từ Prisma
      }));

      res.json({ message: 'Lấy sách xu hướng thành công.', data: booksWithBase64, total });
    } catch (err) {
      console.error('Lỗi trong getTrendingBooks:', err);
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = BookSearchController;