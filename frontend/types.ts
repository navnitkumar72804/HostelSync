export interface Feedback {
  rating: number;       // ⭐ Rating (1–5)
  comment: string;      // Student ka feedback text
}

export interface Complaint {
  id: string;
  title: string;
  category: string;
  description: string;
  studentName: string;
  hostelBlock: string;
  roomNumber: string;
  dateCreated: string;
  status: "Pending" | "In Progress" | "Resolved";
  priority: "Low" | "Medium" | "High";
  feedback?: Feedback;  // Optional (sirf jab student feedback dega tab hoga)
}
