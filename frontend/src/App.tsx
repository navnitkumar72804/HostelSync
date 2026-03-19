import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import StudentLogin from './pages/StudentLogin';
import WardenLogin from './pages/WardenLogin';
import AdminLogin from './pages/AdminLogin';
import AdminSignup from './pages/AdminSignup';
import StudentDashboard from './pages/StudentDashboard';
import WardenDashboard from './pages/WardenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserProfile from './pages/UserProfile';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <ToastProvider>
          <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/login/student" element={<StudentLogin />} />
                <Route path="/login/warden" element={<WardenLogin />} />
                <Route path="/login/admin" element={<AdminLogin />} />
                <Route path="/signup/admin" element={<AdminSignup />} />
                
                {/* Protected Routes */}
                <Route 
                  path="/dashboard/student" 
                  element={
                    <ProtectedRoute allowedRoles={['Student']}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard/warden" 
                  element={
                    <ProtectedRoute allowedRoles={['Warden']}>
                      <WardenDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard/admin" 
                  element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin-dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
          </Router>
        </ToastProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;