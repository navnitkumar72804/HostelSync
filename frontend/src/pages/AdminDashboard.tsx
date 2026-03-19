import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ComplaintCard from '../components/ComplaintCard';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Users,
  Building,
  BarChart3,
  TrendingUp,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  Plus,
  Settings,
  Shield,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from 'recharts';
import { apiRequest } from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  hostelBlock?: string;
  room?: string;
  isVerified?: boolean;
  createdAt?: string;
}

interface WebsiteContent {
  id: string;
  title: string;
  content: string;
  type: 'rules' | 'info' | 'announcement';
  createdAt: string;
  updatedAt: string;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const { complaints, deleteComplaint } = useData();
  const { showToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // State for different sections
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [websiteContent, setWebsiteContent] = useState<WebsiteContent[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [blockFilter, setBlockFilter] = useState('all');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userVerificationFilter, setUserVerificationFilter] = useState('all');

  // Content management
  const [showContentForm, setShowContentForm] = useState(false);
  const [editingContent, setEditingContent] = useState<WebsiteContent | null>(null);
  const [contentForm, setContentForm] = useState({
    title: '',
    content: '',
    type: 'rules' as 'rules' | 'info' | 'announcement'
  });

  useEffect(() => {
    console.log('AdminDashboard useEffect - user:', user);
    console.log('AdminDashboard useEffect - isAuthenticated:', user?.role === 'Admin');
    
    if (user && user.role === 'Admin') {
      console.log('User is admin, fetching data...');
      fetchAllUsers();
      fetchWebsiteContent();
      testAdminAPI();
    } else {
      console.log('User is not admin or not authenticated');
    }
  }, [user]);

  const testAdminAPI = async () => {
    try {
      console.log('Testing admin API...');
      const response = await apiRequest<{ message: string; totalUsers: number; sampleUsers: any[] }>('GET', '/admin/test');
      console.log('Admin API test response:', response);
    } catch (error: any) {
      console.error('Admin API test failed:', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users from admin API...');
      console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api/v1');
      console.log('Full URL:', `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api/v1'}/admin/users`);
      
      const data = await apiRequest<{ users: User[] }>('GET', '/admin/users');
      console.log('Users fetched:', data);
      console.log('First user data:', data.users?.[0]);
      console.log('User IDs:', data.users?.map(u => ({ id: u.id, name: u.name })));
      setAllUsers(data.users || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      console.error('Error details:', error.message);
      showToast(error.message || 'Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchWebsiteContent = async () => {
    try {
      const data = await apiRequest<{ content: WebsiteContent[] }>('GET', '/admin/content');
      setWebsiteContent(data.content);
    } catch (error: any) {
      // If endpoint doesn't exist yet, use mock data
      setWebsiteContent([
        {
          id: '1',
          title: 'Hostel Rules',
          content: '1. No smoking in rooms\n2. Maintain cleanliness\n3. Follow curfew timings\n4. Respect other residents',
          type: 'rules',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Hostel Information',
          content: 'Welcome to our hostel! We provide comfortable accommodation with modern amenities.',
          type: 'info',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]);
    }
  };

  const handleVerifyUser = async (userId: string, verified: boolean) => {
    try {
      console.log('handleVerifyUser called with userId:', userId, 'verified:', verified);
      console.log('userId type:', typeof userId);
      console.log('userId value:', userId);
      
      if (!userId || userId === 'undefined') {
        showToast('Invalid user ID', 'error');
        return;
      }
      
      await apiRequest('PATCH', `/admin/users/${userId}/verify`, { verified });
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, isVerified: verified } : u));
      showToast(`User ${verified ? 'verified' : 'rejected'} successfully`, 'success');
    } catch (error: any) {
      console.error('Error in handleVerifyUser:', error);
      showToast(error.message || 'Failed to update user verification', 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await apiRequest('DELETE', `/admin/users/${userId}`);
      setAllUsers(prev => prev.filter(u => u.id !== userId));
      showToast('User deleted successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to delete user', 'error');
    }
  };

  const handleDeleteComplaint = async (complaintId: string) => {
    if (!confirm('Are you sure you want to delete this complaint?')) return;
    
    try {
      await deleteComplaint(complaintId);
      showToast('Complaint deleted successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to delete complaint', 'error');
    }
  };

  const handleSaveContent = async () => {
    try {
      if (editingContent) {
        await apiRequest('PUT', `/admin/content/${editingContent.id}`, contentForm);
        setWebsiteContent(prev => prev.map(c => c.id === editingContent.id ? { ...c, ...contentForm, updatedAt: new Date().toISOString() } : c));
        showToast('Content updated successfully', 'success');
      } else {
        const response = await apiRequest<{ content: WebsiteContent }>('POST', '/admin/content', contentForm);
        setWebsiteContent(prev => [...prev, response.content]);
        showToast('Content created successfully', 'success');
      }
      setShowContentForm(false);
      setEditingContent(null);
      setContentForm({ title: '', content: '', type: 'rules' });
    } catch (error: any) {
      showToast(error.message || 'Failed to save content', 'error');
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    
    try {
      await apiRequest('DELETE', `/admin/content/${contentId}`);
      setWebsiteContent(prev => prev.filter(c => c.id !== contentId));
      showToast('Content deleted successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to delete content', 'error');
    }
  };

  // Filter complaints
  const filteredComplaints = complaints.filter(complaint => {
    if (statusFilter !== 'all' && complaint.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && complaint.category !== categoryFilter) return false;
    if (blockFilter !== 'all' && complaint.hostelBlock !== blockFilter) return false;
    return true;
  });

  // Filter users
  const filteredUsers = allUsers.filter(user => {
    if (userRoleFilter !== 'all' && user.role !== userRoleFilter) return false;
    if (userVerificationFilter !== 'all') {
      if (userVerificationFilter === 'verified' && !user.isVerified) return false;
      if (userVerificationFilter === 'unverified' && user.isVerified) return false;
    }
    return true;
  });

  // Stats
  const stats = [
    {
      title: 'Total Complaints',
      value: complaints.length,
      icon: FileText,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Pending',
      value: complaints.filter(c => c.status === 'Pending').length,
      icon: Clock,
      color: 'bg-yellow-500',
      lightColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Resolved',
      value: complaints.filter(c => c.status === 'Resolved').length,
      icon: CheckCircle,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Total Users',
      value: allUsers.length,
      icon: Users,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Students',
      value: allUsers.filter(u => u.role === 'Student').length,
      icon: Users,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Wardens',
      value: allUsers.filter(u => u.role === 'Warden').length,
      icon: Shield,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
  ];

  // Analytics data
  const categoryData = complaints.reduce((acc, complaint) => {
    acc[complaint.category] = (acc[complaint.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(categoryData).map(([category, count]) => ({
    category,
    count
  }));

  const statusData = [
    { name: 'Pending', value: complaints.filter(c => c.status === 'Pending').length, color: '#F59E0B' },
    { name: 'In Progress', value: complaints.filter(c => c.status === 'In Progress').length, color: '#F97316' },
    { name: 'Resolved', value: complaints.filter(c => c.status === 'Resolved').length, color: '#10B981' }
  ];

  const blockData = complaints.reduce((acc, complaint) => {
    acc[complaint.hostelBlock] = (acc[complaint.hostelBlock] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const blockChartData = Object.entries(blockData).map(([block, count]) => ({
    block,
    count
  }));

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.lightColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Complaints</h2>
          <div className="space-y-4">
            {complaints.slice(0, 5).map(complaint => (
              <div key={complaint.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{complaint.title}</p>
                  <p className="text-sm text-gray-600">{complaint.hostelBlock} - {complaint.studentName}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  complaint.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  complaint.status === 'In Progress' ? 'bg-orange-100 text-orange-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {complaint.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h2>
          <div className="space-y-4">
            {allUsers.slice(0, 5).map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'Warden' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                  {user.isVerified ? (
                    <UserCheck className="w-4 h-4 text-green-500" />
                  ) : (
                    <UserX className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Complaints by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category" 
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Block Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Complaints by Hostel Block</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={blockChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="block" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#14B8A6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="Student">Students</option>
              <option value="Warden">Wardens</option>
              <option value="Admin">Admins</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Verification</label>
            <select
              value={userVerificationFilter}
              onChange={(e) => setUserVerificationFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Users</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hostel Block
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((userData) => (
                <tr key={userData.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {userData.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {userData.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      userData.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                      userData.role === 'Warden' ? 'bg-orange-100 text-orange-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {userData.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {userData.hostelBlock || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {userData.room || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {userData.isVerified ? (
                        <UserCheck className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <UserX className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs font-semibold ${
                        userData.isVerified ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {userData.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {!userData.isVerified && (
                        <button
                          onClick={() => handleVerifyUser(userData.id, true)}
                          className="text-green-600 hover:text-green-900"
                          title="Verify User"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                      {userData.isVerified && (
                        <button
                          onClick={() => handleVerifyUser(userData.id, false)}
                          className="text-red-600 hover:text-red-900"
                          title="Reject User"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(userData.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderComplaintManagement = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Food Quality">Food Quality</option>
              <option value="Electricity">Electricity</option>
              <option value="Water">Water</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Security">Security</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Block</label>
            <select
              value={blockFilter}
              onChange={(e) => setBlockFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Blocks</option>
              <option value="Block A">Block A</option>
              <option value="Block B">Block B</option>
              <option value="Block C">Block C</option>
              <option value="Block D">Block D</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints */}
      {filteredComplaints.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
          <p className="text-gray-600">No complaints match the current filters.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredComplaints.map(complaint => (
            <div key={complaint.id} className="bg-white rounded-lg shadow-sm p-6">
              <ComplaintCard
                complaint={complaint}
                showActions={false}
              />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => handleDeleteComplaint(complaint.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete Complaint
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContentManagement = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Website Content Management</h2>
        <button
          onClick={() => {
            setEditingContent(null);
            setContentForm({ title: '', content: '', type: 'rules' });
            setShowContentForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4 mr-2 inline" />
          Add Content
        </button>
      </div>

      {/* Content Form */}
      {showContentForm && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingContent ? 'Edit Content' : 'Add New Content'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={contentForm.title}
                onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter content title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={contentForm.type}
                onChange={(e) => setContentForm({ ...contentForm, type: e.target.value as 'rules' | 'info' | 'announcement' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="rules">Rules</option>
                <option value="info">Information</option>
                <option value="announcement">Announcement</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                value={contentForm.content}
                onChange={(e) => setContentForm({ ...contentForm, content: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter content details"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleSaveContent}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {editingContent ? 'Update' : 'Create'} Content
              </button>
              <button
                onClick={() => {
                  setShowContentForm(false);
                  setEditingContent(null);
                  setContentForm({ title: '', content: '', type: 'rules' });
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content List */}
      <div className="grid gap-6">
        {websiteContent.map(content => (
          <div key={content.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{content.title}</h3>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    content.type === 'rules' ? 'bg-red-100 text-red-800' :
                    content.type === 'info' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {content.type}
                  </span>
                  <span className="text-sm text-gray-500">
                    Updated: {new Date(content.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingContent(content);
                    setContentForm({
                      title: content.title,
                      content: content.content,
                      type: content.type
                    });
                    setShowContentForm(true);
                  }}
                  className="text-blue-600 hover:text-blue-900"
                  title="Edit Content"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteContent(content.id)}
                  className="text-red-600 hover:text-red-900"
                  title="Delete Content"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                {content.content}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Complete system management and oversight</p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                  { id: 'users', label: 'User Management', icon: Users },
                  { id: 'complaints', label: 'Complaint Management', icon: FileText },
                  { id: 'content', label: 'Content Management', icon: BookOpen }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'analytics' && renderAnalytics()}
            {activeTab === 'users' && renderUserManagement()}
            {activeTab === 'complaints' && renderComplaintManagement()}
            {activeTab === 'content' && renderContentManagement()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;