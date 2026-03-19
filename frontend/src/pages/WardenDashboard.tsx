import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ComplaintCard from '../components/ComplaintCard';
import { FileText, Clock, CheckCircle, AlertTriangle, Filter } from 'lucide-react';

const WardenDashboard = () => {
  const { user } = useAuth();
  const { getComplaintsByBlock, transitionStatus } = useData();
  const { showToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  const blockComplaints = user?.hostelBlock ? getComplaintsByBlock(user.hostelBlock) : [];

  const stats = [
    {
      title: 'Total Complaints',
      value: blockComplaints.length,
      icon: FileText,
      color: 'bg-gradient-to-r from-indigo-500 to-blue-500',
      lightColor: 'from-indigo-100 to-blue-100',
      textColor: 'text-indigo-600'
    },
    {
      title: 'Pending',
      value: blockComplaints.filter(c => c.status === 'Pending').length,
      icon: Clock,
      color: 'bg-gradient-to-r from-yellow-400 to-amber-500',
      lightColor: 'from-yellow-100 to-amber-100',
      textColor: 'text-amber-600'
    },
    {
      title: 'In Progress',
      value: blockComplaints.filter(c => c.status === 'In Progress').length,
      icon: AlertTriangle,
      color: 'bg-gradient-to-r from-orange-400 to-red-500',
      lightColor: 'from-orange-100 to-red-100',
      textColor: 'text-orange-600'
    },
    {
      title: 'Resolved',
      value: blockComplaints.filter(c => c.status === 'Resolved').length,
      icon: CheckCircle,
      color: 'bg-gradient-to-r from-green-400 to-emerald-500',
      lightColor: 'from-green-100 to-emerald-100',
      textColor: 'text-emerald-600'
    }
  ];

  const getFilteredComplaints = () => {
    return blockComplaints.filter(complaint => {
      const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || complaint.category === categoryFilter;
      return matchesStatus && matchesCategory;
    });
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      setBusyId(id);
      await transitionStatus(id, newStatus as any);
      showToast(`Complaint status updated to ${newStatus}`, 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to update status', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const categories = ['Cleaning', 'Food Quality', 'Electricity', 'Water', 'Maintenance', 'Security', 'Other'];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden backdrop-blur-lg bg-white/5 border-l border-gray-800">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-extrabold text-white tracking-tight">
                Warden Dashboard
              </h1>
              <p className="text-gray-400 mt-2">
                Managing complaints for <span className="font-semibold text-indigo-400">{user?.hostelBlock}</span>
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat) => (
                <div
                  key={stat.title}
                  className="rounded-2xl shadow-lg p-6 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 transition"
                >
                  <div className="flex items-center">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.lightColor}`}>
                      <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-300">{stat.title}</p>
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="bg-gray-800/80 rounded-2xl shadow-md border border-gray-700 p-6 mb-6 backdrop-blur-sm">
              <div className="flex items-center space-x-6">
                <Filter className="w-5 h-5 text-indigo-400" />
                <div className="flex items-center space-x-6">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 rounded-md text-sm bg-gray-900 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      id="category"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="px-3 py-2 rounded-md text-sm bg-gray-900 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Complaints */}
            <div className="space-y-6">
              {getFilteredComplaints().length === 0 ? (
                <div className="text-center py-12 bg-gray-800/60 rounded-2xl border border-gray-700 shadow-inner">
                  <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No complaints found</h3>
                  <p className="text-gray-400">
                    {statusFilter === 'all' && categoryFilter === 'all'
                      ? `No complaints have been submitted for ${user?.hostelBlock} yet.`
                      : 'No complaints match your current filters.'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {getFilteredComplaints()
                    .sort((a, b) => {
                      const statusOrder = { 'Pending': 0, 'In Progress': 1, 'Resolved': 2 };
                      return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
                    })
                    .map(complaint => (
                      <ComplaintCard
                        key={complaint.id}
                        complaint={complaint}
                        onStatusUpdate={handleStatusUpdate}
                        statusDisabled={busyId !== null && busyId !== complaint.id}
                        showActions={true}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WardenDashboard;
