import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ComplaintCard from '../components/ComplaintCard';
import ComplaintForm from '../components/ComplaintForm';
import FeedbackForm from '../components/FeedbackForm';
import { PlusCircle, FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { getComplaintsByStudent, deleteComplaint } = useData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const userComplaints = user ? getComplaintsByStudent(user.id) : [];

  const handleFeedback = (complaintId: string) => {
    setSelectedComplaintId(complaintId);
    setShowFeedbackForm(true);
  };

  const handleFeedbackSuccess = () => {
    // Refresh complaints or update local state
    window.location.reload(); // Simple refresh for now
  };

  const stats = [
    {
      title: 'Total Complaints',
      value: userComplaints.length,
      icon: FileText,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Pending',
      value: userComplaints.filter(c => c.status === 'Pending').length,
      icon: Clock,
      color: 'bg-yellow-500',
      lightColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: 'In Progress',
      value: userComplaints.filter(c => c.status === 'In Progress').length,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      title: 'Resolved',
      value: userComplaints.filter(c => c.status === 'Resolved').length,
      icon: CheckCircle,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600'
    }
  ];

  const getFilteredComplaints = () => {
    switch (activeTab) {
      case 'pending':
        return userComplaints.filter(c => c.status === 'Pending');
      case 'progress':
        return userComplaints.filter(c => c.status === 'In Progress');
      case 'resolved':
        return userComplaints.filter(c => c.status === 'Resolved');
      default:
        return userComplaints;
    }
  };

  return (
    <div className="flex h-screen gradient-bg">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-auto p-4 lg:p-6 scrollbar-thin">
          <div className="container-custom">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-secondary-900">
                  Welcome back, {user?.name}!
                </h1>
                <p className="text-secondary-600 mt-1 text-lg">
                  {user?.hostelBlock} - Room {user?.room}
                </p>
              </div>
              <button
                onClick={() => setShowComplaintForm(true)}
                className="btn-primary px-6 py-3 text-lg font-semibold inline-flex items-center self-start lg:self-auto"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                New Complaint
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat) => (
                <div
                  key={stat.title}
                  className="card p-6"
                >
                  <div className="flex items-center">
                    <div className={`p-4 rounded-2xl ${stat.lightColor} transition-transform duration-300`}>
                      <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-secondary-600 font-medium">{stat.title}</p>
                      <p className="text-3xl font-bold text-secondary-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-soft border border-secondary-200 mb-6 overflow-hidden">
              <nav className="flex flex-wrap">
                {[
                  { id: 'overview', label: 'All Complaints', count: userComplaints.length },
                  { id: 'pending', label: 'Pending', count: userComplaints.filter(c => c.status === 'Pending').length },
                  { id: 'progress', label: 'In Progress', count: userComplaints.filter(c => c.status === 'In Progress').length },
                  { id: 'resolved', label: 'Resolved', count: userComplaints.filter(c => c.status === 'Resolved').length }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-4 px-6 font-medium text-sm transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-500'
                        : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span>{tab.label}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        activeTab === tab.id
                          ? 'bg-primary-100 text-primary-800'
                          : 'bg-secondary-100 text-secondary-600'
                      }`}>
                        {tab.count}
                      </span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            {/* Complaints */}
            <div className="space-y-6">
              {getFilteredComplaints().length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-12 h-12 text-primary-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-secondary-900 mb-3">No complaints found</h3>
                  <p className="text-secondary-600 text-lg mb-6 max-w-md mx-auto">
                    {activeTab === 'overview' 
                      ? "You haven't submitted any complaints yet. Start by creating your first complaint."
                      : `No ${activeTab} complaints found. Check other tabs for more complaints.`
                    }
                  </p>
                  {activeTab === 'overview' && (
                    <button
                      onClick={() => setShowComplaintForm(true)}
                      className="btn-primary px-8 py-4 text-lg font-semibold inline-flex items-center"
                    >
                      <PlusCircle className="w-5 h-5 mr-2" />
                      Submit Your First Complaint
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid gap-6">
                  {getFilteredComplaints().map(complaint => (
                    <ComplaintCard
                      key={complaint.id}
                      complaint={complaint}
                      onDelete={deleteComplaint}
                      onFeedback={handleFeedback}
                      showActions={true}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Complaint Form Modal */}
      {showComplaintForm && (
        <ComplaintForm onClose={() => setShowComplaintForm(false)} />
      )}

      {/* Feedback Form Modal */}
      {showFeedbackForm && selectedComplaintId && (
        <FeedbackForm
          complaintId={selectedComplaintId}
          onClose={() => {
            setShowFeedbackForm(false);
            setSelectedComplaintId(null);
          }}
          onSuccess={handleFeedbackSuccess}
        />
      )}
    </div>
  );
};

export default StudentDashboard;