const prisma = require('../models/db.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const ConfigController = {
  async getConfig(req, res) {
    try {
      const configs = await prisma.cauHinhHeThong.findMany();
      res.json({ message: 'Success', data: configs });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async createConfig(req, res) {
    try {
      const newConfig = await prisma.cauHinhHeThong.create({ data: req.body });
      res.json({ message: 'Created', data: newConfig });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async updateConfig(req, res) {
    try {
      const { id } = req.params;
      const updated = await prisma.cauHinhHeThong.update({
        where: { MaCH: parseInt(id) },
        data: req.body,
      });
      res.json({ message: 'Updated', data: updated });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async deleteConfig(req, res) {
    try {
      const { id } = req.params;
      await prisma.cauHinhHeThong.delete({
        where: { MaCH: parseInt(id) },
      });
      res.json({ message: 'Deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  async verifyDeleteCode(req, res) {
    try {
      const { code } = req.body;
      if (code === process.env.DELETE_CODE) {
        res.json({ valid: true });
      } else {
        res.status(403).json({ valid: false, message: 'Mã xác nhận không hợp lệ.' });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
  
};


module.exports = ConfigController;