import React from 'react';
import Navbar from '../components/Navbar';

function ReaderPage() {
    return (
        <div>
            <Navbar />
            <div style={{ padding: '1rem' }}>
                <h1>Trang đọc giả (Reader)</h1>
                <p>Đây là khu vực dành cho đọc giả.</p>
            </div>
        </div>
    );
}

export default ReaderPage;
