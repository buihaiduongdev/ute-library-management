const jwt = require('jsonwebtoken');

function auth(requiredRole) {
    return (req, res, next) => {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Không có token' });

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (requiredRole !== undefined && decoded.role !== requiredRole) {
                return res.status(403).json({ message: 'Không đủ quyền' });
            }
            req.user = decoded;
            next();
        } catch {
            res.status(401).json({ message: 'Token không hợp lệ' });
        }
    };
}

module.exports = auth;
