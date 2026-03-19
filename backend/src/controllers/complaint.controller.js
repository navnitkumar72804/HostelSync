import { Complaint } from '../models/Complaint.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../errors/asyncHandler.js';
import mongoose from 'mongoose';

export const createComplaintController = asyncHandler(async (req, res) => {
  console.log('Creating complaint with data:', req.body);
  console.log('User:', req.user);
  console.log('Files:', req.files);
  
  // Check database connection
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database not connected');
  }
  
  const { title, category, description, priority, room } = req.body;
  if (!title || !category || !description) {
    throw new Error('Missing required fields');
  }

  // Derive hostelBlock from authenticated student to prevent spoofing
  const student = await User.findById(req.user.id);
  console.log('Found student:', student ? { id: student.id, role: student.role, hostelBlock: student.hostelBlock } : 'Not found');
  
  if (!student || student.role !== 'Student') {
    throw new Error('Only students can submit complaints');
  }
  if (!student.hostelBlock) {
    console.log('Student has no hostelBlock, using default');
    // For now, use a default hostel block if not assigned
    student.hostelBlock = 'Block A';
    await student.save();
  }

  const derivedHostelBlock = student.hostelBlock;
  const derivedRoom = room || student.room || '';

  // Process file attachments if any
  const attachments = [];
  if (req.files && req.files.length > 0) {
    req.files.forEach(file => {
      attachments.push({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path
      });
    });
  }

  console.log('Creating complaint with data:', {
    title,
    category,
    description,
    priority,
    room: derivedRoom,
    hostelBlock: derivedHostelBlock,
    student: req.user.id,
    attachmentsCount: attachments.length
  });

  const complaint = await Complaint.create({
    title,
    category,
    description,
    priority,
    room: derivedRoom,
    hostelBlock: derivedHostelBlock,
    student: req.user.id,
    attachments: attachments
  });
  
  console.log('Complaint created successfully:', complaint.id);

  res.status(201).json({
    message: `Complaint sent to ${derivedHostelBlock} warden successfully`,
    complaint,
  });
});

export const listComplaintsController = asyncHandler(async (req, res) => {
  const role = req.user.role;
  let filter = {};
  if (role === 'Student') {
    filter.student = req.user.id;
  }
  if (role === 'Warden') {
    filter.hostelBlock = req.user.hostelBlock; // ensures wardens only see their block's complaints
  }
  // Admin can see all complaints, so no filter is applied
  
  const complaints = await Complaint.find(filter)
    .populate('student', 'name email')
    .sort({ createdAt: -1 });
  res.json({ complaints });
});

export const getComplaintController = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('student', 'name email');
  if (!complaint) throw new Error('Complaint not found');
  res.json({ complaint });
});

export const updateComplaintController = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) throw new Error('Complaint not found');
  if (req.user.role === 'Student' && complaint.student.toString() !== req.user.id)
    throw new Error('Forbidden');
  if (complaint.status === 'Resolved') throw new Error('Cannot edit resolved complaint');
  const allowed = ['title', 'category', 'description', 'priority', 'room'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) complaint[key] = req.body[key];
  }
  await complaint.save();
  res.json({ complaint });
});

export const deleteComplaintController = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) throw new Error('Complaint not found');
  if (req.user.role === 'Student' && complaint.student.toString() !== req.user.id)
    throw new Error('Forbidden');
  await complaint.deleteOne();
  res.json({ ok: true });
});

export const transitionStatusController = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('student', 'name email');
  if (!complaint) throw new Error('Complaint not found');
  if (req.user.role !== 'Warden' || complaint.hostelBlock !== req.user.hostelBlock)
    throw new Error('Forbidden');
  const allowed = ['Pending', 'In Progress', 'Resolved'];
  let target = req.body?.status;
  if (target) {
    const normalized = String(target).toLowerCase().trim();
    const mapping = {
      pending: 'Pending',
      'in progress': 'In Progress',
      'in_progress': 'In Progress',
      inprogress: 'In Progress',
      resolved: 'Resolved',
    };
    target = mapping[normalized] || target;
    if (!allowed.includes(target)) throw new Error('Invalid target status');
    if (target !== complaint.status) {
      complaint.status = target;
    }
  } else {
    // If no status provided, keep simple next-step advance
    const sequence = ['Pending', 'In Progress', 'Resolved'];
    const currentIndex = sequence.indexOf(complaint.status);
    if (currentIndex === -1 || currentIndex === sequence.length - 1)
      throw new Error('Cannot transition');
    complaint.status = sequence[currentIndex + 1];
  }
  await complaint.save();
  await complaint.populate('student', 'name email');
  res.json({ complaint });
});

export const addFeedbackController = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) throw new Error('Complaint not found');
  if (complaint.student.toString() !== req.user.id)
    throw new Error('Forbidden');
  if (complaint.status !== 'Resolved')
    throw new Error('Feedback allowed only after resolution');
  complaint.feedback = { rating, comment, by: req.user.id };
  await complaint.save();
  res.json({ complaint });
});


