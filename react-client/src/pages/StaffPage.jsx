import React from 'react';

function StaffPage() {
    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    return (
        <div>
            <h1>Trang Nhân Viên Thư viện(Staff)</h1>
            <p>Đây là khu vực dành cho nhân viên thư viện.</p>
            <button onClick={handleLogout}>Đăng xuất</button>
        </div>
    );
}

export default StaffPage;
