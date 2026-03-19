import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  FileText, 
  BarChart3, 
  Users, 
  Settings,
  X,
  PlusCircle,
  ClipboardList,
  User
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user } = useAuth();

  const getNavigationItems = () => {
    const baseItems = [];
    
    switch (user?.role) {
      case 'Student':
        baseItems.push(
          { icon: Home, label: 'Dashboard', to: '/dashboard/student' },
          { icon: PlusCircle, label: 'New Complaint', to: '/dashboard/student?tab=new' },
          { icon: ClipboardList, label: 'My Complaints', to: '/dashboard/student?tab=complaints' }
        );
        break;
      case 'Warden':
        baseItems.push(
          { icon: Home, label: 'Dashboard', to: '/dashboard/warden' },
          { icon: FileText, label: 'Manage Complaints', to: '/dashboard/warden' }
        );
        break;
      case 'Admin':
        baseItems.push(
          { icon: Home, label: 'Dashboard', to: '/dashboard/admin' },
          { icon: BarChart3, label: 'Analytics', to: '/dashboard/admin?tab=analytics' },
          { icon: Users, label: 'Manage Users', to: '/dashboard/admin?tab=users' },
          { icon: FileText, label: 'All Complaints', to: '/dashboard/admin?tab=complaints' }
        );
        break;
      default:
        return [];
    }
    
    // Add profile link to all users
    baseItems.push(
      { icon: User, label: 'My Profile', to: '/profile' }
    );
    
    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-white/95 backdrop-blur-sm shadow-large border-r border-secondary-200 lg:translate-x-0 lg:static lg:w-64 z-50 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-secondary-200 bg-gradient-to-r from-primary-50 to-accent-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-soft">
              <span className="text-white font-bold text-sm">HS</span>
            </div>
            <div>
              <span className="font-bold text-secondary-900 text-lg">HostelSync</span>
              <p className="text-xs text-secondary-500 -mt-1">Dashboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-secondary-100 transition-colors duration-200"
          >
            <X className="w-5 h-5 text-secondary-600" />
          </button>
        </div>

        <nav className="mt-6 px-4">
          <ul className="space-y-2">
            {navigationItems.map((item, index) => (
              <li key={item.label}>
                <NavLink
                  to={item.to}
                  onClick={() => onClose()}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500 shadow-soft'
                        : 'text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900'
                    }`
                  }
                >
                  <div className={`p-2 rounded-lg transition-colors duration-200 ${
                    window.location.pathname.includes(item.to.split('?')[0])
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-secondary-100 text-secondary-600 group-hover:bg-primary-100 group-hover:text-primary-600'
                  }`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gradient-to-r from-secondary-50 to-primary-50 rounded-xl p-4 border border-secondary-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-soft">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-secondary-900">{user?.name}</p>
                <p className="text-xs text-secondary-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;