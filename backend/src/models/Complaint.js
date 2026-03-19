import mongoose from 'mongoose';

// Sub-schemas
const AttachmentSchema = new mongoose.Schema({
  filename: { type: String },
  originalName: { type: String },
  path: { type: String },
  mimetype: { type: String },
  size: { type: Number }
}, { _id: false });

const FeedbackSchema = new mongoose.Schema({
  rating: { type: Number, min: 1, max: 5 },
  comment: { type: String },
  by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { _id: false, timestamps: true });

// Main complaint schema
const ComplaintSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  room: { type: String },
  hostelBlock: { type: String },
  attachments: { type: [AttachmentSchema], default: [] },
  feedback: { type: FeedbackSchema, default: undefined },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' }
}, { timestamps: true });

// reuse model if already compiled (prevents OverwriteModelError in watch/dev)
const Complaint = mongoose.models?.Complaint || mongoose.model('Complaint', ComplaintSchema);

export default Complaint;
export { Complaint };


