const prisma = require('../models/db');

const GenresController = {
  async getGenres(req, res) {
    const { search } = req.query;
    try {
      const where = search ? { TenTheLoai: { contains: search, mode: 'insensitive' } } : {};
      const genres = await prisma.theLoai.findMany({ where });
      res.json({ message: 'Success', data: genres });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getGenreById(req, res) {
    const { id } = req.params;
    try {
      const genre = await prisma.theLoai.findUnique({ where: { MaTL: parseInt(id) } });
      if (!genre) return res.status(404).json({ message: 'Genre not found' });
      res.json({ message: 'Success', data: genre });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async createGenre(req, res) {
    const { TenTheLoai, MoTa } = req.body;
    try {
      const genre = await prisma.theLoai.create({
        data: { TenTheLoai, MoTa }
      });
      res.status(201).json({ message: 'Genre created', data: genre });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  async updateGenre(req, res) {
    const { id } = req.params;
    const { TenTheLoai, MoTa } = req.body;
    try {
      const genre = await prisma.theLoai.update({
        where: { MaTL: parseInt(id) },
        data: { TenTheLoai, MoTa }
      });
      res.json({ message: 'Genre updated', data: genre });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  async deleteGenre(req, res) {
    const { id } = req.params;
    try {
      await prisma.theLoai.delete({ where: { MaTL: parseInt(id) } });
      res.json({ message: 'Genre deleted' });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
};

module.exports = GenresController;