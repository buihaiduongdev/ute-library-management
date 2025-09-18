import React from 'react';

function ReaderPage() {
    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    return (
        <div>
            <h1>Trang đọc giả(Reader)</h1>
            <p>Đây là khu vực dành cho đọc giả.</p>
            <button onClick={handleLogout}>Đăng xuất</button>
        </div>
    );
}

export default ReaderPage;
