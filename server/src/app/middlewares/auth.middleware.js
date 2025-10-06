const jwt = require('jsonwebtoken');

// Đây là một function "cấp cao hơn", nó nhận vào một mảng các vai trò được phép
// và trả về một middleware function thực sự.
const verifyToken = (allowedRoles) => {
    return (req, res, next) => {
        // Lấy token từ header, thường có dạng "Bearer [token]"
        const authHeader = req.headers['authorization'];
        console.log('🔍 Authorization header:', authHeader);
        const token = authHeader && authHeader.split(' ')[1];
        console.log('🔍 Extracted token:', token ? 'Present' : 'Missing');

        // 1. Nếu không có token, từ chối ngay
        if (!token) {
            console.log('❌ No token found');
            return res.status(401).json({ message: 'Yêu cầu xác thực không hợp lệ (Không tìm thấy token).' }); // 401 Unauthorized
        }

        try {
            // 2. Giải mã token
            console.log('🔍 JWT Secret:', process.env.JWT_SECRET);
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('✅ Decoded token:', decoded);

            // Gán thông tin đã giải mã vào request để các controller sau có thể dùng
            req.user = decoded;

            // 3. Kiểm tra vai trò
            // Nếu mảng allowedRoles được cung cấp và vai trò của người dùng không nằm trong mảng đó
            console.log('🔍 User role:', decoded.role, 'Allowed roles:', allowedRoles);
            if (allowedRoles && !allowedRoles.includes(decoded.role)) {
                console.log('❌ Role not allowed');
                return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này.' }); // 403 Forbidden
            }
            
            console.log('✅ Token valid, proceeding...');
            // Mọi thứ hợp lệ, cho phép đi tiếp
            next();
        } catch (err) {
            // Nếu token sai, hết hạn, v.v.
            console.log('❌ Token verification failed:', err.message);
            return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
        }
    };
};

module.exports = { verifyToken };
