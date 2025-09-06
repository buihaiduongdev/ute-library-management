document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('token', data.token);
            alert('Đăng nhập thành công!');
            window.location.href = '/pages/admin/dashboard.html';
        } else {
            alert(data.message || 'Đăng nhập thất bại');
        }
    } catch (err) {
        console.error(err);
        alert('Không thể kết nối server');
    }

});
