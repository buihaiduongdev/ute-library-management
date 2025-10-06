const prisma = require('../models/db.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
class AuthController {
    // [POST] /api/auth/login
    async login(req, res) {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });
        }

        try {
            const user = await prisma.taiKhoan.findUnique({
                where: { TenDangNhap: username },
            });
            let idDG = null;

            if (user.VaiTro === 2) {
            const dg = await prisma.docGia.findUnique({
                where: { MaTK: user.MaTK },
            });
            idDG = dg.IdDG;
        }
            
            if (!user) {
                return res.status(401).json({ message: 'Tên đăng nhập không tồn tại.' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.MatKhauMaHoa);

            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Mật khẩu không chính xác.' });
            }

            if (user.TrangThai !== 1) {
                return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa hoặc chưa được kích hoạt.' });
            }

            const token = jwt.sign(
                { id: user.MaTK, role: user.VaiTro },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            res.status(200).json({
                message: 'Đăng nhập thành công',
                token,
                username: user.TenDangNhap,
                role: user.VaiTro,
                idDG: idDG
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Lỗi hệ thống.', error: error.message });
        }
    }

    // [POST] /api/auth/register
    async register(req, res) {
        console.log("Register body:", req.body);

        const { fullname, birthdate, address, email, phone ,username, password } = req.body;

        if (!username || !password || !fullname || !birthdate || !address || !email || !phone) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đủ thông tin' });
        }

        try {
            const userExists = await prisma.taiKhoan.findUnique({
                where: { TenDangNhap: username },
            });
            
            if (userExists) {
                return res.status(409).json({ message: 'Tên đăng nhập đã tồn tại.' });
            }

            const contactExists = await prisma.docGia.findFirst({
                where:{
                    OR: [
                        {Email: email},
                        {SoDienThoai: phone}
                    ]
                }
            });

            if (contactExists) {
                if (contactExists.Email === email) {
                    return res.status(409).json({ message: 'Email đã tồn tại.' });
                }
                if (contactExists.SoDienThoai === phone){
                    return res.status(409).json({ message: 'Số điện thoại đã tồn tại.' });
                }
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const READER_ROLE = 2; // 2=ĐG (Độc giả)
            const ACTIVE_STATUS = 1; // 1=Hoạt động

            const result = await prisma.$transaction(async (prisma) => {
                const newUser = await prisma.taiKhoan.create({
                    data: {
                        TenDangNhap: username,
                        MatKhauMaHoa: hashedPassword,
                        VaiTro: READER_ROLE,
                        TrangThai: ACTIVE_STATUS,
                    },
                });

                const ngayHetHan = new Date();
                ngayHetHan.setFullYear(ngayHetHan.getFullYear() + 1);

                const newDocGia = await prisma.docGia.create({
                    data: {
                        MaTK: newUser.MaTK,
                        HoTen: fullname,
                        NgaySinh: birthdate ? new Date(birthdate) : null,
                        DiaChi: address,
                        Email: email,
                        SoDienThoai: phone,
                        NgayDangKy: new Date(),
                        NgayHetHan: ngayHetHan,
                        TrangThai: 'ConHan',
                    },
                });

                return newDocGia;
            });

            res.status(201).json({ message: 'Đăng ký tài khoản độc giả thành công.', hoTen: result.HoTen });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Lỗi hệ thống.', error: error.message });
        }
    }
}

module.exports = new AuthController();
