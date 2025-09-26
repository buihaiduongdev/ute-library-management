// Import các công cụ cần thiết từ react-router-dom
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import các component trang của chúng ta
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import StaffPage from './pages/StaffPage';
import ReaderPage from './pages/ReaderPage';
import ProtectedRoute from './components/ProtectedRoute';
import BookSearchPage from './pages/BookSearchPage';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route cho trang đăng nhập */}
        <Route path="/" element={<LoginPage />} />

        {/* Route cho trang đăng ký */}
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Các routes được bảo vệ - 0 admin - 1 staff - 2 reader */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['0']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/staff" 
          element={
            <ProtectedRoute allowedRoles={['0', '1']}> {/* Admin cũng có thể vào trang staff */}
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

        {/* Route chung cho tra cứu sách, bảo vệ cho cả 3 vai trò */}
        <Route 
          path="/search-books" 
          element={
            <ProtectedRoute allowedRoles={['0', '1', '2']}>
              <BookSearchPage />
            </ProtectedRoute>
          }
        />

        {/* Có thể thêm một route "*" ở đây để xử lý trang 404 Not Found */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
