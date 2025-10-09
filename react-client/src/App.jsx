// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  BookSearchPage,
  BorrowBooks,
  HomePage,
  LoginPage,
  ReaderPage,
  ReaderDashboard,
  ReaderStatsPage,
  RegisterPage,
  StaffPage,
  ManageBooksPage,
  ManageAuthorsPage,
  ManageGenresPage,
  ManagePublishersPage,
  BookDetailPage,
  CardManagement,
  SystemCofigPage
} from './pages';
import ReaderForm from './components/ReaderForm';
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
          <Route path="/search-books" element={<BookSearchPage />} />

          {/* Các Route được bảo vệ */}
          <Route 
            path="/system-configs" 
            element={
              <ProtectedRoute allowedRoles={['0']}>
                <SystemCofigPage />
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
            path="/reader/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['2']}>
                <ReaderDashboard />
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
          
          {/* 🎴 Card Management - Only Admin & Staff */}
          <Route 
            path="/card-management" 
            element={
              <ProtectedRoute allowedRoles={['0', '1']}>
                <CardManagement />
              </ProtectedRoute>
            }
          />

          <Route
          path="/book-detail/:id"
          element={
            <ProtectedRoute allowedRoles={['0', '1', '2']}>
              <BookDetailPage />
            </ProtectedRoute>
          }
          />

          {/* 📊 Reader Statistics - Only Admin */}
          <Route 
            path="/reader-stats" 
            element={
              <ProtectedRoute allowedRoles={['0']}>
                <ReaderStatsPage />
              </ProtectedRoute>
            }
          />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;