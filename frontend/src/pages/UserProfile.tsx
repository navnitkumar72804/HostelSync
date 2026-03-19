import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Save, Lock, Mail, Building, Home } from 'lucide-react';
import { apiRequest } from '../lib/api';

const UserProfile = () => {
  const { user, setUser, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    hostelBlock: '',
    room: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changePassword, setChangePassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        hostelBlock: user.hostelBlock || '',
        room: user.room || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      showToast('Please log in to update your profile', 'error');
      return;
    }

    // Validate password change
    if (changePassword) {
      if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
        showToast('Please fill all password fields', 'error');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
      }
      if (formData.newPassword.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
      }
    }

    setLoading(true);
    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email
      };

      // Allow all users to update hostel block and room
      if (formData.hostelBlock !== undefined) updateData.hostelBlock = formData.hostelBlock;
      if (formData.room !== undefined) updateData.room = formData.room;

      // Update profile
      const res = await apiRequest<{ user: any; message?: string }>(
        'PATCH',
        `/auth/profile`,
        updateData
      );

      // Update password if requested
      if (changePassword) {
        await apiRequest<{ message?: string }>(
          'PATCH',
          `/auth/password`,
          {
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword
          }
        );
        showToast('Password updated successfully', 'success');
      }

      // Update user context and localStorage
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('userData', JSON.stringify(res.user));
      }

      showToast(res.message || 'Profile updated successfully!', 'success');
      setChangePassword(false);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error: any) {
      console.error('Profile update error:', error);
      showToast(error.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">My Profile</h1>
          <p className="text-text-secondary">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="card p-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-text-primary mb-1">{user.name}</h2>
              <p className="text-text-secondary mb-3">{user.email}</p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                  user.role === 'Warden' ? 'bg-orange-100 text-orange-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {user.role}
                </span>
                {user.isVerified && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-success-100 text-success-700">
                    Verified
                  </span>
                )}
              </div>
              {(user.hostelBlock || user.room) && (
                <div className="space-y-2 text-sm text-text-secondary">
                  {user.hostelBlock && (
                    <div className="flex items-center justify-center gap-2">
                      <Building className="w-4 h-4" />
                      <span>{user.hostelBlock}</span>
                    </div>
                  )}
                  {user.room && (
                    <div className="flex items-center justify-center gap-2">
                      <Home className="w-4 h-4" />
                      <span>Room {user.room}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Personal Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="label">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="input"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="label">
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

                  {/* Show hostel block and room for all users, not just Students/Wardens */}
                  <div>
                    <label htmlFor="hostelBlock" className="label">
                      Hostel Block {user.role === 'Admin' && <span className="text-xs text-text-secondary">(Optional)</span>}
                    </label>
                    <input
                      type="text"
                      id="hostelBlock"
                      name="hostelBlock"
                      value={formData.hostelBlock}
                      onChange={handleChange}
                      className="input"
                      placeholder="e.g., Block A"
                    />
                  </div>

                  <div>
                    <label htmlFor="room" className="label">
                      Room Number {user.role === 'Admin' && <span className="text-xs text-text-secondary">(Optional)</span>}
                    </label>
                    <input
                      type="text"
                      id="room"
                      name="room"
                      value={formData.room}
                      onChange={handleChange}
                      className="input"
                      placeholder="e.g., 101"
                    />
                  </div>
                </div>
              </div>

              {/* Password Change Section */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Change Password
                  </h3>
                  <button
                    type="button"
                    onClick={() => setChangePassword(!changePassword)}
                    className="text-sm text-secondary hover:text-primary"
                  >
                    {changePassword ? 'Cancel' : 'Change Password'}
                  </button>
                </div>

                {changePassword && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="currentPassword" className="label">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className="input"
                        placeholder="Enter current password"
                      />
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="label">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="input"
                        placeholder="Enter new password"
                        minLength={6}
                      />
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="label">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="input"
                        placeholder="Confirm new password"
                        minLength={6}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary px-8 py-3 flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

