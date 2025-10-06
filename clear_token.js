// Script để xóa token cũ và đăng nhập lại
// Chạy trong Console của trình duyệt (F12)

// 1. Xóa token cũ
localStorage.removeItem('token');
localStorage.removeItem('role');
localStorage.removeItem('username');

// 2. Reload trang
window.location.reload();

// 3. Sau đó đăng nhập lại
console.log('Token đã được xóa. Vui lòng đăng nhập lại.');

