const prisma = require('../models/db.js');
const bcrypt = require('bcryptjs');

const AccountsController = {
  // Lấy tất cả tài khoản
  async getAccounts(req, res) {
    try {
      const accounts = await prisma.taiKhoan.findMany();
      res.json(accounts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Lấy 1 tài khoản theo ID
  async getAccount(req, res) {
    try {
      const result = await prisma.taiKhoan.findUnique({
        where: { MaTK: parseInt(req.params.id) },
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Tạo tài khoản mới
  async createAccount(req, res) {
    try {
      const { TenDangNhap, MatKhauMaHoa, VaiTro } = req.body;
      const userExists = await prisma.taiKhoan.findUnique({
        where: { TenDangNhap },
      });

      if (userExists) {
        return res.status(409).json({ message: 'Tên đăng nhập đã tồn tại.' });
      }

      const hashedPassword = await bcrypt.hash(MatKhauMaHoa, 10);
      const ACTIVE_STATUS = 1;

      const newUser = await prisma.taiKhoan.create({
        data: {
          TenDangNhap,
          MatKhauMaHoa: hashedPassword,
          VaiTro: parseInt(VaiTro),
          TrangThai: ACTIVE_STATUS,
        },
      });

      res.status(201).json(newUser);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Cập nhật tài khoản
  async updateAccount(req, res) {
    try {
        const { id } = req.params;
        const data = { ...req.body };
        delete data.MaTK;
        data.VaiTro = parseInt(req.body.VaiTro);
        data.TrangThai = parseInt(req.body.TrangThai);

        if (!req.body.MatKhauMaHoa) delete data.MatKhauMaHoa;

      const result = await prisma.taiKhoan.update({
        where: { MaTK: parseInt(id) },
        data,
      });
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Xóa tài khoản
  async delAccount(req, res) {
    try {
      const { id } = req.params;
      const result = await prisma.taiKhoan.delete({
        where: { MaTK: parseInt(id) },
      });
      res.json({ message: 'Đã xóa', data: result });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = AccountsController;
