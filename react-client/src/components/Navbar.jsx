import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        navigate('/');
    };

    return (
        <nav style={{ backgroundColor: '#f0f0f0', padding: '1rem', display: 'flex', justifyContent: 'space-between' }}>
            <div>
                <Link to="/search-books" style={{ marginRight: '1rem' }}>Tra Cứu Sách</Link>
            </div>
            <button onClick={handleLogout}>Đăng Xuất</button>
        </nav>
    );
}

export default Navbar;
