import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';
import AdminLayout from './components/admin/AdminLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Register from './pages/Register';
import ProviderDetail from './pages/ProviderDetail';
import AddReview from './pages/AddReview';
import ReportIssue from './pages/ReportIssue';
import OwnerDashboard from './pages/OwnerDashboard';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminReports from './pages/admin/AdminReports';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-amber-50">
          <Toaster position="top-right" />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/provider/:id" element={<ProviderDetail />} />
            <Route
              path="/provider/:id/review"
              element={
                <ProtectedRoute requiredRole="customer">
                  <AddReview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/:id/report"
              element={
                <ProtectedRoute requiredRole="customer">
                  <ReportIssue />
                </ProtectedRoute>
              }
            />
            <Route path="/dashboard" element={<ProtectedRoute><OwnerDashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="reports" element={<AdminReports />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
