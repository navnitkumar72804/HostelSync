import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { GraduationCap, ArrowLeft } from 'lucide-react';

const StudentLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: 'student@hosteleease.com',
    password: 'student123'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(formData.email, formData.password, 'Student');
      if (success) {
        showToast('Welcome back!', 'success');
        navigate('/dashboard/student');
      } else {
        showToast('Invalid credentials', 'error');
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'An error occurred. Please try again.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full glass-dark rounded-lg shadow-xl p-8 animate-scale-in">
        <div className="text-center mb-8 ">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center glow floating">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-50">Student Login</h2>
          <p className="text-coral-300">Access your complaints dashboard</p>
        </div>

        <div className="bg-purple-500/25 border border-purple-500/40 rounded-lg p-4 mb-6 animate-slide-in">
          <p className="text-sm text-brown-200 font-medium mb-2">Demo Credentials:</p>
          <p className="text-sm text-brown-100">Email: student@hosteleease.com</p>
          <p className="text-sm text-brown-100">Password: student123</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-coral mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-coral mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="input"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-lg font-semibold"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-300">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-400 hover:text-blue-300 transition-all duration-300 transform hover:scale-105">
              Sign up
            </Link>
          </p>
        </div>

        <div className="mt-4">
          <Link
            to="/"
            className="inline-flex items-center text-slate-400 hover:text-blue-400 transition-all duration-300 transform hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;