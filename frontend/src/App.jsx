import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import StudentsPage from './pages/StudentsPage';
import CoursesPage from './pages/CoursesPage';
import BatchesPage from './pages/BatchesPage';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Login />} />

          {/* Admin Routes */}
          <Route element={<PrivateRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="batches" element={<BatchesPage />} />
            </Route>
          </Route>

          {/* Student Routes */}
          <Route element={<PrivateRoute allowedRoles={['student']} />}>
            <Route path="/student" element={<StudentDashboard />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
