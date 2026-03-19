import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { X, Upload, File, Trash2 } from 'lucide-react';

interface ComplaintFormProps {
  onClose: () => void;
}

const ComplaintForm = ({ onClose }: ComplaintFormProps) => {
  const { user, isAuthenticated } = useAuth();
  const { addComplaint, refreshComplaints } = useData();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Cleaning' as const,
    priority: 'Medium' as const
  });
  
  const [attachments, setAttachments] = useState<File[]>([]);

  const categories = ['Cleaning', 'Food Quality', 'Electricity', 'Water', 'Maintenance', 'Security', 'Other'] as const;
  const priorities = ['Low', 'Medium', 'High'] as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isAuthenticated) {
      console.log('❌ No user found or not authenticated');
      console.log('User:', user);
      console.log('Is Authenticated:', isAuthenticated);
      showToast('Please log in again', 'error');
      return;
    }
    
    if (user.role !== 'Student') {
      console.error('❌ User role is not Student:', user.role);
      showToast('Only students can submit complaints', 'error');
      return;
    }
    
    console.log('👤 User data:', user);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('priority', formData.priority);
      formDataToSend.append('room', (user as any).room || (user as any).roomNumber || '101');
      
      // Add attachments
      attachments.forEach(file => {
        formDataToSend.append('attachments', file);
      });

      // Get token using the same method as api.ts - ALWAYS from localStorage for FormData requests
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('❌ No auth token found');
        showToast('Please log in again', 'error');
        return;
      }
      
      // Verify user and token are in sync
      if (!user || user.role !== 'Student') {
        console.error('❌ User role mismatch or invalid user');
        console.error('User from context:', user);
        console.error('Expected role: Student, Got:', user?.role);
        showToast('Invalid user session. Please log in as a Student.', 'error');
        return;
      }
      
      // Decode token to verify it matches user (simple check)
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        console.log('🔑 Token payload from token:', { role: tokenPayload.role, id: tokenPayload.sub });
        console.log('👤 User from context:', { role: user.role, id: user.id });
        
        if (tokenPayload.role !== user.role) {
          console.error('❌ CRITICAL: Token role does not match user context role!');
          console.error('Token role:', tokenPayload.role);
          console.error('Context user role:', user.role);
          showToast('Session mismatch. Please log out and log in again.', 'error');
          return;
        }
        
        if (tokenPayload.sub !== user.id) {
          console.error('❌ CRITICAL: Token user ID does not match context user ID!');
          console.error('Token user ID:', tokenPayload.sub);
          console.error('Context user ID:', user.id);
          showToast('Session mismatch. Please log out and log in again.', 'error');
          return;
        }
      } catch (e) {
        console.error('❌ Failed to decode token:', e);
      }
      
      console.log('🔑 Auth token found:', token.substring(0, 20) + '...');
      console.log('👤 User role:', user?.role);
      console.log('👤 User ID:', user?.id);
      console.log('📝 Form data being sent:', {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        room: (user as any).room || (user as any).roomNumber || '101',
        attachmentsCount: attachments.length
      });
      console.log('📎 Attachments:', attachments.map(f => ({ name: f.name, type: f.type, size: f.size })));

      const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api/v1'}/complaints`;
      console.log('🌐 API URL:', apiUrl);

      // Don't set Content-Type header when sending FormData - browser needs to set it with boundary
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Note: DO NOT set 'Content-Type' header - browser will set it automatically with boundary for multipart/form-data
        },
        body: formDataToSend
      });
      
      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('🚨 Server error details:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Complaint created successfully:', data);
      
      // Refresh complaints to show the new one with images
      if (refreshComplaints) {
        await refreshComplaints();
        console.log('✅ Complaints refreshed');
      }
      
      showToast(data.message || 'Complaint submitted successfully!', 'success');
      onClose();
    } catch (err) {
      console.error('Complaint submission error:', err);
      const m = err instanceof Error ? err.message : 'Failed to submit complaint';
      showToast(m, 'error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm'];
      return validTypes.includes(file.type);
    });
    
    if (validFiles.length !== files.length) {
      showToast('Some files were skipped. Only images and videos are allowed.', 'warning');
    }
    
    setAttachments(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="glass-dark rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin animate-scale-in">
        <div className="flex justify-between items-center p-6 border-b border-gray-700/50 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          <div>
            <h2 className="text-2xl font-bold text-slate-50">Submit New Complaint</h2>
            <p className="text-slate-300 mt-1">Describe your issue and we'll help you resolve it</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-300 transform hover:scale-110"
          >
            <X className="w-5 h-5 text-slate-400 hover:text-slate-200" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="label">
                Hostel Details
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="input"
                placeholder="Hostel name, Block, Room No"
              />
            </div>

            <div>
              <label htmlFor="category" className="label">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="priority" className="label">
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {priorities.map(priority => (
                <label key={priority} className="relative">
                  <input
                    type="radio"
                    name="priority"
                    value={priority}
                    checked={formData.priority === priority}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    formData.priority === priority
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-secondary-200 hover:border-secondary-300 text-secondary-700'
                  }`}>
                    <div className="text-center">
                      <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                        priority === 'High' ? 'bg-error-500' :
                        priority === 'Medium' ? 'bg-warning-500' : 'bg-success-500'
                      }`}></div>
                      <span className="font-medium">{priority}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="label">
              Detailed Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              className="input resize-none"
              placeholder="Please provide a detailed description of your complaint. Include specific details about the issue, when it occurred, and any relevant information that might help resolve it..."
            />
          </div>

          <div>
            <label htmlFor="attachments" className="label">
              Attachments (Photos/Videos)
            </label>
            <div className="border-2 border-dashed border-secondary-300 rounded-xl p-6 hover:border-primary-400 transition-colors duration-200">
              <input
                type="file"
                id="attachments"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="attachments"
                className="cursor-pointer flex flex-col items-center justify-center py-6 group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <Upload className="w-8 h-8 text-primary-600" />
                </div>
                <span className="text-lg font-medium text-secondary-700 mb-2">
                  Click to upload photos/videos
                </span>
                <span className="text-sm text-secondary-500">
                  Max 5 files, 10MB each • Supports JPG, PNG, MP4, AVI
                </span>
              </label>
            </div>
            
            {attachments.length > 0 && (
              <div className="mt-4 space-y-3">
                <h4 className="text-sm font-semibold text-secondary-700">Selected Files:</h4>
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-secondary-50 p-4 rounded-xl border border-secondary-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <File className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-secondary-900">{file.name}</span>
                        <span className="text-xs text-secondary-500 block">({formatFileSize(file.size)})</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="p-2 text-error-500 hover:bg-error-50 rounded-lg transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-secondary-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline px-6 py-3 text-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-8 py-3 text-lg font-semibold"
            >
              Submit Complaint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplaintForm;