import React from 'react';
import Navbar from '../components/Navbar';

function BookSearchPage() {
    return (
        <div>
            <Navbar />
            <div style={{ padding: '1rem' }}>
                <h1>Trang Tra Cứu Sách</h1>
                <p>Chức năng tìm kiếm sách sẽ được xây dựng ở đây.</p>
                <p>Tất cả các vai trò (Admin, Staff, Reader) đều có thể thấy trang này.</p>
            </div>
        </div>
    );
}

export default BookSearchPage;
