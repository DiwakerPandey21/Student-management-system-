import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import StudentsPage from './pages/StudentsPage';
import CoursesPage from './pages/CoursesPage';
import BatchesPage from './pages/BatchesPage';
import AdminIdCardsPage from './pages/AdminIdCardsPage';
import AttendancePage from './pages/AttendancePage';
import PaymentsPage from './pages/PaymentsPage';
import StudentPaymentDetails from './pages/StudentPaymentDetails';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
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
                <Route path="id-cards" element={<AdminIdCardsPage />} />
                <Route path="attendance" element={<AttendancePage />} />
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="students/:id/payments" element={<StudentPaymentDetails />} />
              </Route>
            </Route>

            {/* Student Routes */}
            <Route element={<PrivateRoute allowedRoles={['student']} />}>
              <Route path="/student" element={<StudentDashboard />} />
            </Route>
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
