// Import các công cụ cần thiết từ react-router-dom
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import các component trang và layout của chúng ta
import {
  AdminPage,
  BookSearchPage,
  BorrowBooks,
  HomePage,
  LoginPage,
  ReaderPage,
  RegisterPage,
  StaffPage,
} from './pages';
import ReaderForm from './components/ReaderForm';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Sử dụng AppLayout làm layout chung cho tất cả các trang */}
        <Route element={<AppLayout />}>

          {/* === Các Route công khai === */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} /> 
          <Route path="/register" element={<RegisterPage />} />

          {/* === Các Route được bảo vệ === */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['0']}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/admin/readers" 
            element={
              <ProtectedRoute allowedRoles={['0']}>
                <ReaderPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/admin/readers/new" 
            element={
              <ProtectedRoute allowedRoles={['0']}>
                <ReaderForm />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/admin/readers/edit/:id" 
            element={
              <ProtectedRoute allowedRoles={['0']}>
                <ReaderForm />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/staff" 
            element={
              <ProtectedRoute allowedRoles={['0', '1']}> 
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
            element={
              <ProtectedRoute allowedRoles={['0', '1', '2']}> {/* Bất kỳ ai đã đăng nhập */}
                <BookSearchPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/borrow-books" 
            element={
              <ProtectedRoute allowedRoles={['0', '1']}>
                <BorrowBooks />
              </ProtectedRoute>
            }
          />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
