import React from 'react';

function AdminPage() {
    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    return (
        <div>
            <h1>Trang Quản Trị Viên (Admin)</h1>
            <p>Đây là khu vực chỉ dành cho Admin.</p>
            <button onClick={handleLogout}>Đăng xuất</button>
        </div>
    );
}

export default AdminPage;
