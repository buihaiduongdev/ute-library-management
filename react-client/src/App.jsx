// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  AdminPage,
  BookSearchPage,
  BorrowBooks,
  HomePage,
  LoginPage,
  ReaderPage,
  RegisterPage,
  StaffPage,
  ManageBooksPage,
  ManageAuthorsPage,
  ManageGenresPage,
  ManagePublishersPage
} from './pages';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import './assets/css/App.css';
import '@mantine/core/styles.css';
import '@mantine/carousel/styles.css';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          {/* Các Route công khai */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} /> 
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/search-books" element={<BookSearchPage />} /> {/* Chuyển ra đây */}

          {/* Các Route được bảo vệ */}
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
            path="/borrow-books" 
            element={
              <ProtectedRoute allowedRoles={['0', '1']}>
                <BorrowBooks />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/manage-books" 
            element={
              <ProtectedRoute allowedRoles={['0', '1']}>
                <ManageBooksPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/manage-authors" 
            element={
              <ProtectedRoute allowedRoles={['0', '1']}>
                <ManageAuthorsPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/manage-genres" 
            element={
              <ProtectedRoute allowedRoles={['0', '1']}>
                <ManageGenresPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/manage-publishers" 
            element={
              <ProtectedRoute allowedRoles={['0', '1']}>
                <ManagePublishersPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;