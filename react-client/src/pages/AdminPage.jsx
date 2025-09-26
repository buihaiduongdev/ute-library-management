import React from 'react';
import Navbar from '../components/Navbar';

function AdminPage() {
    return (
        <div>
            <Navbar />
            <div style={{ padding: '1rem' }}>
                <h1>Trang Quản Trị Viên (Admin)</h1>
                <p>Đây là khu vực chỉ dành cho Admin.</p>
            </div>
        </div>
    );
}

export default AdminPage;
