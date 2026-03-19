import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '../lib/api';
import { useAuth } from './AuthContext';

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: 'Cleaning' | 'Food Quality' | 'Electricity' | 'Water' | 'Maintenance' | 'Security' | 'Other';
  status: 'Pending' | 'In Progress' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High';
  studentId: string;
  studentName: string;
  hostelBlock: string;
  roomNumber: string;
  dateCreated: string;
  dateUpdated: string;
  attachments?: any[];
  feedback?: {
    rating: number;
    comment: string;
    by?: string;
  } | null;
}

interface DataContextType {
  complaints: Complaint[];
  isLoading: boolean;
  refreshComplaints: () => Promise<void>;
  addComplaint: (complaint: Omit<Complaint, 'id' | 'dateCreated' | 'dateUpdated'>) => Promise<string | void>;
  updateComplaint: (id: string, updates: Partial<Complaint>) => void;
  deleteComplaint: (id: string) => void;
  getComplaintsByStudent: (studentId: string) => Complaint[];
  getComplaintsByBlock: (hostelBlock: string) => Complaint[];
  transitionStatus: (id: string, status: 'Pending' | 'In Progress' | 'Resolved') => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider = ({ children }: DataProviderProps) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Clear complaints when user logs out
  useEffect(() => {
    if (!user || !isAuthenticated) {
      setComplaints([]);
      setIsLoading(false);
      return;
    }
  }, [user, isAuthenticated]);

  const fetchComplaints = async () => {
    // Don't fetch if not authenticated or no user
    if (!user || !isAuthenticated) {
      console.log('No user or not authenticated, skipping complaint fetch');
      setComplaints([]);
      setIsLoading(false);
      return;
    }
    if (!user.id) {
      console.log('User has no ID, skipping complaint fetch');
      setComplaints([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    console.log('Fetching complaints for user:', user);
    try {
      let res: { complaints: any[] };
      
      if (user.role === 'Student') {
        res = await apiRequest<{ complaints: any[] }>('GET', '/complaints/mine');
      } else if (user.role === 'Warden') {
        res = await apiRequest<{ complaints: any[] }>('GET', '/complaints/block');
      } else if (user.role === 'Admin') {
        // Admin can see all complaints
        res = await apiRequest<{ complaints: any[] }>('GET', '/complaints/all');
      } else {
        // Other roles
        setIsLoading(false);
        return;
      }

      const mappedComplaints = res.complaints.map((c) => {
        const complaint = {
          id: c._id,
          title: c.title,
          description: c.description,
          category: c.category,
          status: c.status,
          priority: c.priority,
          studentId: typeof c.student === 'object' ? c.student._id || c.student.id : c.student,
          studentName: (typeof c.student === 'object' && c.student?.name) ? c.student.name : (c.studentName || ''),
          hostelBlock: c.hostelBlock,
          roomNumber: c.room || '',
          dateCreated: c.createdAt,
          dateUpdated: c.updatedAt,
          attachments: c.attachments || [],
          feedback: c.feedback || null,
        };
        
        // Debug attachments
        if (c.attachments && c.attachments.length > 0) {
          console.log('📎 Complaint', complaint.id, 'has', c.attachments.length, 'attachments:');
          c.attachments.forEach((att: any, idx: number) => {
            console.log(`  ${idx + 1}.`, att.filename, '-', att.originalName, '- mimetype:', att.mimetype);
          });
        }
        
        return complaint;
      });

      console.log('Fetched complaints:', mappedComplaints.length);
      setComplaints(mappedComplaints);
    } catch (e) {
      console.error('Error fetching complaints:', e);
      // Clear complaints on error to prevent stale data
      setComplaints([]);
      if (e instanceof Error) {
        console.error('Error message:', e.message);
        // If it's an auth error, the AuthContext will handle it
        if (e.message.includes('401') || e.message.includes('Unauthorized') || e.message.includes('Forbidden')) {
          console.log('Authentication error, complaints cleared');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Add a small delay to ensure token is set after page refresh
    const timeoutId = setTimeout(() => {
      fetchComplaints();
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [user?.id, user?.role, isAuthenticated]);

  const addComplaint = async (complaintData: Omit<Complaint, 'id' | 'dateCreated' | 'dateUpdated'>) => {
    const payload = {
      title: complaintData.title,
      category: complaintData.category,
      description: complaintData.description,
      priority: complaintData.priority,
      room: complaintData.roomNumber,
      hostelBlock: complaintData.hostelBlock,
    };
    const res = await apiRequest<{ complaint: any; message?: string }>(
      'POST',
      '/complaints',
      payload
    );
    const c = res.complaint;
    const newComplaint: Complaint = {
      id: c._id,
      title: c.title,
      description: c.description,
      category: c.category,
      status: c.status,
      priority: c.priority,
      studentId: typeof c.student === 'object' ? c.student._id || c.student.id : c.student,
      studentName: (typeof c.student === 'object' && c.student?.name) ? c.student.name : (c.studentName || ''),
      hostelBlock: c.hostelBlock,
      roomNumber: c.room || '',
      dateCreated: c.createdAt,
      dateUpdated: c.updatedAt,
      attachments: c.attachments || [],
      feedback: c.feedback || null,
    };
    // Refresh complaints to get the latest data from server
    await refreshComplaints();
    return res.message;
  };

  const updateComplaint = async (id: string, updates: Partial<Complaint>) => {
    const payload: any = {};
    if (updates.title) payload.title = updates.title;
    if (updates.category) payload.category = updates.category;
    if (updates.description) payload.description = updates.description;
    if (updates.priority) payload.priority = updates.priority;
    if (updates.roomNumber) payload.room = updates.roomNumber;
    await apiRequest('PATCH', `/complaints/${id}`, payload);
    setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } as Complaint : c)));
  };

  const deleteComplaint = async (id: string) => {
    await apiRequest('DELETE', `/complaints/${id}`);
    setComplaints((prev) => prev.filter((c) => c.id !== id));
  };

  const getComplaintsByStudent = (studentId: string) => {
    return complaints.filter(complaint => complaint.studentId === studentId);
  };

  const getComplaintsByBlock = (hostelBlock: string) => {
    return complaints.filter(complaint => complaint.hostelBlock === hostelBlock);
  };

  const refreshComplaints = async () => {
    await fetchComplaints();
  };

  const value = {
    complaints,
    isLoading,
    refreshComplaints,
    addComplaint,
    updateComplaint,
    deleteComplaint,
    getComplaintsByStudent,
    getComplaintsByBlock,
    transitionStatus: async (id: string, status: 'Pending' | 'In Progress' | 'Resolved') => {
      const res = await apiRequest<{ complaint: any }>('POST', `/complaints/${id}/status`, { status });
      const c = res.complaint;
      setComplaints((prev) => prev.map((it) => {
        if (it.id === id) {
          return {
            ...it,
            status: c.status,
            attachments: c.attachments || it.attachments || [],
            feedback: c.feedback || it.feedback || null,
          } as Complaint;
        }
        return it;
      }));
    }
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};