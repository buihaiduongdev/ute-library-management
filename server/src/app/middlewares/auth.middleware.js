const jwt = require('jsonwebtoken');

// Đây là một function "cấp cao hơn", nó nhận vào một mảng các vai trò được phép
// và trả về một middleware function thực sự.
const verifyToken = (allowedRoles) => {
    return (req, res, next) => {
        // Lấy token từ header, thường có dạng "Bearer [token]"
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        // 1. Nếu không có token, từ chối ngay
        if (!token) {
            return res.status(401).json({ message: 'Yêu cầu xác thực không hợp lệ (Không tìm thấy token).' }); // 401 Unauthorized
        }

        try {
            // 2. Giải mã token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Gán thông tin đã giải mã vào request để các controller sau có thể dùng
            req.user = decoded;

            // 3. Kiểm tra vai trò
            // Nếu mảng allowedRoles được cung cấp và vai trò của người dùng không nằm trong mảng đó
            if (allowedRoles && !allowedRoles.includes(decoded.role)) {
                 return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này.' }); // 403 Forbidden
            }
            
            // Mọi thứ hợp lệ, cho phép đi tiếp
            next();
        } catch (err) {
            // Nếu token sai, hết hạn, v.v.
            return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
        }
    };
};

module.exports = { verifyToken };
