const prisma = require('../models/db');

const PublishersController = {
  async getPublishers(req, res) {
    const { search } = req.query;
    try {
      const where = search ? { TenNXB: { contains: search, mode: 'insensitive' } } : {};
      const publishers = await prisma.nhaXuatBan.findMany({ where });
      res.json({ message: 'Success', data: publishers });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getPublisherById(req, res) {
    const { id } = req.params;
    try {
      const publisher = await prisma.nhaXuatBan.findUnique({ where: { MaNXB: parseInt(id) } });
      if (!publisher) return res.status(404).json({ message: 'Publisher not found' });
      res.json({ message: 'Success', data: publisher });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async createPublisher(req, res) {
    const { TenNXB, DiaChi, SoDienThoai, Email } = req.body;
    try {
      const publisher = await prisma.nhaXuatBan.create({
        data: { TenNXB, DiaChi, SoDienThoai, Email }
      });
      res.status(201).json({ message: 'Publisher created', data: publisher });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  async updatePublisher(req, res) {
    const { id } = req.params;
    const { TenNXB, DiaChi, SoDienThoai, Email } = req.body;
    try {
      const publisher = await prisma.nhaXuatBan.update({
        where: { MaNXB: parseInt(id) },
        data: { TenNXB, DiaChi, SoDienThoai, Email }
      });
      res.json({ message: 'Publisher updated', data: publisher });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  async deletePublisher(req, res) {
    const { id } = req.params;
    try {
      await prisma.nhaXuatBan.delete({ where: { MaNXB: parseInt(id) } });
      res.json({ message: 'Publisher deleted' });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
};

module.exports = PublishersController;