document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch('/api/auth/login', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('username', data.username);
            alert('Đăng nhập thành công!');
            // Chuyển hướng đến trang dashboard
            window.location.href = '/pages/dashboard.html'; 

        } else {
            alert(data.message || 'Đăng nhập thất bại');
        }

    } catch (err) {
        console.error(err);
        alert('Có lỗi xảy ra, không thể gửi yêu cầu. Vui lòng kiểm tra console.'); 
    }
});
