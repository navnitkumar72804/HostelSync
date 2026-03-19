import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, Menu, X, User, LogOut, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

const Navbar = ({ onToggleSidebar }: NavbarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-soft border-b border-secondary-200 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-lg hover:bg-secondary-100 transition-colors duration-200"
              >
                <Menu className="w-5 h-5 text-secondary-600" />
              </button>
            )}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-soft">
                <span className="text-white font-bold text-sm">HS</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-secondary-900 text-xl">HostelSync</span>
                <p className="text-xs text-secondary-500 -mt-1">Complaint Management</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-lg hover:bg-secondary-100 relative transition-colors duration-200 group">
              <Bell className="w-5 h-5 text-secondary-600 group-hover:text-primary-600 transition-colors" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-error-500 rounded-full animate-pulse"></span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-secondary-100 transition-colors duration-200 group"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-soft">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-secondary-900 group-hover:text-primary-600 transition-colors">
                    {user?.name}
                  </p>
                  <p className="text-xs text-secondary-500 capitalize">{user?.role}</p>
                </div>
              </button>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-large border border-secondary-200 py-2 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-secondary-100 bg-gradient-to-r from-primary-50 to-accent-50">
                      <p className="text-sm font-semibold text-secondary-900">{user?.name}</p>
                      <p className="text-xs text-secondary-600">{user?.email}</p>
                      <div className="mt-1">
                        <span className="badge badge-primary text-xs">
                          {user?.role}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate('/profile');
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-secondary-700 hover:bg-secondary-50 flex items-center space-x-3 transition-colors duration-200 group"
                    >
                      <Settings className="w-4 h-4 text-secondary-500 group-hover:text-primary-600 transition-colors" />
                      <span className="group-hover:text-primary-600 transition-colors">Profile Settings</span>
                    </button>
                    <button
                      onClick={logout}
                      className="w-full px-4 py-3 text-left text-sm text-secondary-700 hover:bg-secondary-50 flex items-center space-x-3 transition-colors duration-200 group"
                    >
                      <LogOut className="w-4 h-4 text-secondary-500 group-hover:text-error-600 transition-colors" />
                      <span className="group-hover:text-error-600 transition-colors">Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;