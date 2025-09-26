import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }) {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    // 1. Kiểm tra token đăng nhập
    if (!token) {
        // Nếu không có token, chuyển hướng đến trang đăng nhập
        return <Navigate to="/login" replace />;
    }

    // 2. Kiểm tra vai trò
    if (!allowedRoles.includes(userRole)) {
        alert('Bạn không có quyền truy cập trang này!');
        return <Navigate to="/search-books" replace />;
    }

    return children;
}

export default ProtectedRoute;
