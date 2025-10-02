import React from 'react';
import { Link } from 'react-router-dom';

function AdminPage() {
    return (
        <div>
            <h1>Trang Quản Trị Viên (Admin)</h1>
            <p>Đây là khu vực chỉ dành cho Admin.</p>
            <nav>
                <ul>
                    <li>
                        <Link to="/admin/readers">Manage Readers</Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
}

export default AdminPage;
