const prisma = require('../models/db');

const BooksController = {
  async getBooks(req, res) {
    const { search, limit = 10, offset = 0 } = req.query;
    try {
      const where = search ? {
        OR: [
          { TieuDe: { contains: search, mode: 'insensitive' } },
          { MaSach: { equals: parseInt(search) || 0 } }
        ]
      } : {};
      const books = await prisma.sach.findMany({
        where,
        include: {
          NhaXuatBan: true,
          Sach_TacGia: { include: { TacGia: true } },
          Sach_TheLoai: { include: { TheLoai: true } }
        },
        take: parseInt(limit),
        skip: parseInt(offset)
      });
      // Convert AnhBia to base64
      const booksWithBase64 = books.map(book => ({
        ...book,
        AnhBia: book.AnhBia ? Buffer.from(book.AnhBia).toString('base64') : null
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
          Sach_TheLoai: { include: { TheLoai: true } }
        }
      });
      if (!book) return res.status(404).json({ message: 'Book not found' });
      const bookWithBase64 = {
        ...book,
        AnhBia: book.AnhBia ? Buffer.from(book.AnhBia).toString('base64') : null
      };
      res.json({ message: 'Success', data: bookWithBase64 });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async createBook(req, res) {
    const { TieuDe, MoTa, NamXuatBan, GiaSach, MaNXB, SoLuong, ViTriKe, AnhBia, TacGias, TheLoais } = req.body;
    try {
      const book = await prisma.$transaction(async (tx) => {
        const newBook = await tx.sach.create({
          data: {
            TieuDe,
            MoTa,
            NamXuatBan: parseInt(NamXuatBan),
            GiaSach: parseFloat(GiaSach),
            MaNXB: parseInt(MaNXB),
            SoLuong: parseInt(SoLuong),
            ViTriKe,
            AnhBia: AnhBia ? Buffer.from(AnhBia, 'base64') : null,
            TrangThai: 'Con'
          }
        });
        if (TacGias?.length) {
          await tx.sach_TacGia.createMany({
            data: TacGias.map(id => ({ MaSach: newBook.MaSach, MaTG: parseInt(id) }))
          });
        }
        if (TheLoais?.length) {
          await tx.sach_TheLoai.createMany({
            data: TheLoais.map(id => ({ MaSach: newBook.MaSach, MaTL: parseInt(id) }))
          });
        }
        return newBook;
      });
      res.status(201).json({ message: 'Book created', data: book });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  async updateBook(req, res) {
    const { id } = req.params;
    const { TieuDe, MoTa, NamXuatBan, GiaSach, MaNXB, SoLuong, ViTriKe, AnhBia, TacGias, TheLoais } = req.body;
    try {
      const book = await prisma.$transaction(async (tx) => {
        const updatedBook = await tx.sach.update({
          where: { MaSach: parseInt(id) },
          data: {
            TieuDe,
            MoTa,
            NamXuatBan: parseInt(NamXuatBan),
            GiaSach: parseFloat(GiaSach),
            MaNXB: parseInt(MaNXB),
            SoLuong: parseInt(SoLuong),
            ViTriKe,
            AnhBia: AnhBia ? Buffer.from(AnhBia, 'base64') : undefined
          }
        });
        if (TacGias?.length) {
          await tx.sach_TacGia.deleteMany({ where: { MaSach: parseInt(id) } });
          await tx.sach_TacGia.createMany({
            data: TacGias.map(id => ({ MaSach: parseInt(id), MaTG: parseInt(id) }))
          });
        }
        if (TheLoais?.length) {
          await tx.sach_TheLoai.deleteMany({ where: { MaSach: parseInt(id) } });
          await tx.sach_TheLoai.createMany({
            data: TheLoais.map(id => ({ MaSach: parseInt(id), MaTL: parseInt(id) }))
          });
        }
        return updatedBook;
      });
      res.json({ message: 'Book updated', data: book });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  async deleteBook(req, res) {
    const { id } = req.params;
    try {
      await prisma.sach.delete({ where: { MaSach: parseInt(id) } });
      res.json({ message: 'Book deleted' });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  async searchBooks(req, res) {
    const { keyword, authors, genres, publisher, yearFrom, yearTo, sort = 'newest' } = req.query;
    try {
      const where = {
        AND: [
          keyword ? {
            OR: [
              { TieuDe: { contains: keyword, mode: 'insensitive' } },
              { MoTa: { contains: keyword, mode: 'insensitive' } }
            ]
          } : {},
          authors ? { Sach_TacGia: { some: { MaTG: { in: authors.split(',').map(Number) } } } } : {},
          genres ? { Sach_TheLoai: { some: { MaTL: { in: genres.split(',').map(Number) } } } } : {},
          publisher ? { MaNXB: parseInt(publisher) } : {},
          yearFrom && yearTo ? { NamXuatBan: { gte: parseInt(yearFrom), lte: parseInt(yearTo) } } : {}
        ]
      };
      const orderBy = sort === 'newest' ? { NamXuatBan: 'desc' } :
                      sort === 'oldest' ? { NamXuatBan: 'asc' } :
                      sort === 'popular' ? { ChiTietMuon: { _count: 'desc' } } : {};
      const books = await prisma.sach.findMany({
        where,
        include: {
          NhaXuatBan: true,
          Sach_TacGia: { include: { TacGia: true } },
          Sach_TheLoai: { include: { TheLoai: true } }
        },
        orderBy
      });
      const booksWithBase64 = books.map(book => ({
        ...book,
        AnhBia: book.AnhBia ? Buffer.from(book.AnhBia).toString('base64') : null
      }));
      res.json({ message: 'Success', data: booksWithBase64 });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = BooksController;