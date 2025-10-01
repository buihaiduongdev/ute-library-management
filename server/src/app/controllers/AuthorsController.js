const prisma = require('../models/db');

const AuthorsController = {
  async getAuthors(req, res) {
    const { search } = req.query;
    try {
      const where = search ? { TenTacGia: { contains: search, mode: 'insensitive' } } : {};
      const authors = await prisma.tacGia.findMany({ where });
      res.json({ message: 'Success', data: authors });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getAuthorById(req, res) {
    const { id } = req.params;
    try {
      const author = await prisma.tacGia.findUnique({ where: { MaTG: parseInt(id) } });
      if (!author) return res.status(404).json({ message: 'Author not found' });
      res.json({ message: 'Success', data: author });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async createAuthor(req, res) {
    const { TenTacGia, TieuSu, QuocTich } = req.body;
    try {
      const author = await prisma.tacGia.create({ data: { TenTacGia, TieuSu, QuocTich } });
      res.status(201).json({ message: 'Author created', data: author });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  async updateAuthor(req, res) {
    const { id } = req.params;
    const { TenTacGia, TieuSu, QuocTich } = req.body;
    try {
      const author = await prisma.tacGia.update({
        where: { MaTG: parseInt(id) },
        data: { TenTacGia, TieuSu, QuocTich }
      });
      res.json({ message: 'Author updated', data: author });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  async deleteAuthor(req, res) {
    const { id } = req.params;
    try {
      await prisma.tacGia.delete({ where: { MaTG: parseInt(id) } });
      res.json({ message: 'Author deleted' });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
};

module.exports = AuthorsController;