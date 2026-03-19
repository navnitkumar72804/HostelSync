import { Calendar, User, MapPin, AlertCircle, Paperclip, Star, MessageSquare } from 'lucide-react';
import { Complaint } from '../context/DataContext';

interface ComplaintCardProps {
  complaint: Complaint;
  onStatusUpdate?: (id: string, status: string) => void;
  onDelete?: (id: string) => void;
  onFeedback?: (id: string) => void;
  showActions?: boolean;
  statusDisabled?: boolean;
}

const ComplaintCard = ({ complaint, onStatusUpdate, onDelete, onFeedback, showActions = false, statusDisabled = false }: ComplaintCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'badge-warning';
      case 'In Progress': return 'badge-primary';
      case 'Resolved': return 'badge-success';
      default: return 'badge-secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-error-600 bg-error-50';
      case 'Medium': return 'text-warning-600 bg-warning-50';
      case 'Low': return 'text-success-600 bg-success-50';
      default: return 'text-secondary-600 bg-secondary-50';
    }
  };

  return (
    <div className="card p-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6 gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-secondary-900 mb-3">
            {complaint.title}
          </h3>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="badge badge-primary">
              {complaint.category}
            </span>
            <span className={`badge ${getStatusColor(complaint.status)}`}>
              {complaint.status}
            </span>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
              <AlertCircle className="w-3 h-3 mr-1" />
              {complaint.priority} Priority
            </div>
          </div>
        </div>
      </div>

      <p className="text-secondary-600 mb-6 leading-relaxed">{complaint.description}</p>

      {/* Attachments */}
      {(() => {
        console.log('🔍 Checking attachments for complaint:', complaint.id);
        console.log('🔍 Attachments data:', complaint.attachments);
        console.log('🔍 Attachments type:', typeof complaint.attachments);
        console.log('🔍 Attachments is array:', Array.isArray(complaint.attachments));
        console.log('🔍 Attachments length:', complaint.attachments?.length);
        
        if (!complaint.attachments || !Array.isArray(complaint.attachments) || complaint.attachments.length === 0) {
          return null;
        }
        
        return (
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <Paperclip className="w-4 h-4 text-primary-600 mr-2" />
              <span className="text-sm font-semibold text-secondary-700">Attachments ({complaint.attachments.length}):</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {complaint.attachments.map((attachment: any, index: number) => {
                const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api/v1';
                const fileUrl = `${baseUrl}/complaints/files/${attachment.filename}`;
                const isImage = attachment.mimetype?.startsWith('image/') || attachment.originalName?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                
                console.log('📎 Attachment:', attachment);
                console.log('🔗 File URL:', fileUrl);
                console.log('🖼️ Is Image:', isImage);
                console.log('📄 Filename:', attachment.filename);
              
              return (
                <div key={index} className="relative group">
                  {isImage ? (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block relative aspect-square rounded-lg overflow-hidden border border-border hover:border-secondary transition-colors bg-gray-100"
                    >
                      <img
                        src={fileUrl}
                        alt={attachment.originalName || 'Attachment'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onLoad={() => {
                          console.log('Image loaded successfully:', fileUrl);
                        }}
                        onError={(e) => {
                          console.error('Image load error:', fileUrl, e);
                          // Fallback to link if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-secondary-50 text-secondary-600 text-xs p-2 text-center">${attachment.originalName || 'Image'}</div>`;
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Paperclip className="w-4 h-4 text-white" />
                      </div>
                    </a>
                  ) : (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-4 bg-primary-50 hover:bg-primary-100 rounded-lg text-sm text-primary-700 transition-colors duration-200 border border-primary-200 aspect-square"
                    >
                      <Paperclip className="w-6 h-6 mb-2" />
                      <span className="text-xs text-center truncate w-full px-1">{attachment.originalName}</span>
                    </a>
                  )}
                </div>
              );
              })}
            </div>
          </div>
        );
      })()}

      {/* Feedback */}
      {complaint.feedback && (
        <div className="mb-6 p-4 bg-gradient-to-r from-success-50 to-success-100 rounded-xl border border-success-200">
          <div className="flex items-center mb-3">
            <Star className="w-5 h-5 text-warning-500 mr-2" />
            <span className="text-sm font-semibold text-success-800">Student Feedback:</span>
          </div>
          <div className="flex items-center mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < complaint.feedback!.rating ? 'text-warning-400 fill-current' : 'text-secondary-300'}`}
                />
              ))}
            </div>
            <span className="ml-3 text-sm font-medium text-success-700">
              {complaint.feedback.rating}/5
            </span>
          </div>
          {complaint.feedback.comment && (
            <div className="flex items-start">
              <MessageSquare className="w-4 h-4 text-success-600 mr-2 mt-1" />
              <p className="text-sm text-success-800 leading-relaxed">{complaint.feedback.comment}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center text-sm text-secondary-500 space-x-6 mb-6">
        <div className="flex items-center">
          <User className="w-4 h-4 mr-2 text-primary-600" />
          <span className="font-medium">{complaint.studentName}</span>
        </div>
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-2 text-primary-600" />
          <span className="font-medium">{complaint.hostelBlock} - Room {complaint.roomNumber}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-primary-600" />
          <span className="font-medium">{complaint.dateCreated}</span>
        </div>
      </div>

      {showActions && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-6 border-t border-secondary-200 gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {onStatusUpdate && (
              <select
                value={complaint.status}
                onChange={(e) => onStatusUpdate(complaint.id, e.target.value)}
                disabled={statusDisabled}
                className={`input text-sm ${statusDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            )}
            {complaint.status === 'Resolved' && onFeedback && !complaint.feedback && (
              <button
                onClick={() => onFeedback(complaint.id)}
                className="btn-success px-4 py-2 text-sm font-semibold"
              >
                Give Feedback
              </button>
            )}
          </div>
          {onDelete && (
            <button
              onClick={() => onDelete(complaint.id)}
              className="btn-error px-4 py-2 text-sm font-semibold"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ComplaintCard;