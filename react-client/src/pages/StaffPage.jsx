import React from 'react';
import Navbar from '../components/Navbar';

function StaffPage() {
    return (
        <div>
            <Navbar />
            <div style={{ padding: '1rem' }}>
                <h1>Trang Nhân Viên Thư Viện (Staff)</h1>
                <p>Đây là khu vực dành cho nhân viên thư viện.</p>
            </div>
        </div>
    );
}

export default StaffPage;
