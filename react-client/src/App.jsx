// Import các công cụ cần thiết từ react-router-dom
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import các component trang và layout của chúng ta
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import StaffPage from './pages/StaffPage';
import ReaderPage from './pages/ReaderPage';
import BookSearchPage from './pages/BookSearchPage';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* === Các Route công khai không có Navbar === */}
        {/* Cả hai đường dẫn / và /login đều dẫn đến trang đăng nhập */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} /> 
        <Route path="/register" element={<RegisterPage />} />

        {/* === Nhóm các Route được bảo vệ sử dụng chung AppLayout === */}
        <Route 
          element={
            // Lớp bảo vệ đầu tiên: chỉ cần đăng nhập là được
            <ProtectedRoute allowedRoles={['0', '1', '2']}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Các route con này sẽ được render bên trong <Outlet /> của AppLayout */}
          <Route 
            path="/admin" 
            element={
              // Lớp bảo vệ thứ hai: kiểm tra vai trò cụ thể
              <ProtectedRoute allowedRoles={['0']}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/staff" 
            element={
              <ProtectedRoute allowedRoles={['0', '1']}> {/* Admin cũng có thể vào */}
                <StaffPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/reader" 
            element={
              <ProtectedRoute allowedRoles={['2']}>
                <ReaderPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/search-books" 
            element={<BookSearchPage />} // Route này chỉ cần đăng nhập, đã được bảo vệ ở lớp ngoài
          />
        </Route>

        {/* Bạn có thể thêm một route "*" ở đây để xử lý trang 404 Not Found */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
