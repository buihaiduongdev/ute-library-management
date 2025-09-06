const sql = require('mssql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dbConfig = require('../../config/db.config');

async function login(req, res) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ username và password' });
        }

        // Kết nối DB
        let pool = await sql.connect(dbConfig);

        // Tìm user trong DB
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .query('SELECT * FROM TaiKhoan WHERE TenDangNhap = @username');

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: 'Tài Khoản không tồn tại' });
        }

        const user = result.recordset[0];

        // So sánh password
        const match = await bcrypt.compare(password, user.MatKhauMaHoa);
        if (!match) {
            return res.status(401).json({ message: 'Sai mật khẩu' });
        }

        // Tạo JWT
        const token = jwt.sign(
            { id: user.MaTK, role: user.VaiTro },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
        );

        return res.json({
            message: 'Đăng nhập thành công',
            token
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Lỗi server' });
    }
}

module.exports = { login };
