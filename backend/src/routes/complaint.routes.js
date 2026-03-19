import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  createComplaintController,
  listComplaintsController,
  getComplaintController,
  updateComplaintController,
  deleteComplaintController,
  transitionStatusController,
  addFeedbackController,
} from '../controllers/complaint.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { uploadFiles, handleUploadErrors } from '../middleware/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Student
router.post('/', requireAuth(['Student']), uploadFiles, handleUploadErrors, createComplaintController);
router.get('/mine', requireAuth(['Student']), listComplaintsController);
router.patch('/:id', requireAuth(['Student']), updateComplaintController);
router.delete('/:id', requireAuth(['Student', 'Warden']), deleteComplaintController);
router.post('/:id/feedback', requireAuth(['Student']), addFeedbackController);

// Warden
router.get('/block', requireAuth(['Warden']), listComplaintsController);
// Alias for clarity: /warden returns same filtered list for assigned block
router.get('/warden', requireAuth(['Warden']), listComplaintsController);
router.post('/:id/status', requireAuth(['Warden']), transitionStatusController);

// Admin - can see all complaints (must be before /:id route)
router.get('/all', requireAuth(['Admin']), listComplaintsController);

// Serve uploaded files (MUST be before /:id route to prevent route conflicts)
router.get('/files/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    console.log('📁 Request to serve file:', filename);
    
    // Security: prevent path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      console.error('❌ Invalid filename (path traversal attempt):', filename);
      return res.status(400).json({ message: 'Invalid filename' });
    }
    
    // Use absolute path for uploads directory
    // __dirname is at backend/src/routes, so go up two levels to backend, then into uploads
    const uploadsDir = path.join(__dirname, '../../uploads');
    const filePath = path.join(uploadsDir, filename);
    
    // Also check alternative location (in case files are in backend/uploads directly)
    const alternativeDir = path.join(process.cwd(), 'uploads');
    const alternativePath = path.join(alternativeDir, filename);
    
    console.log('📂 Uploads directory:', uploadsDir);
    console.log('📄 File path:', filePath);
    
    // Verify the file path is within uploads directory (security check)
    const resolvedFilePath = path.resolve(filePath);
    const resolvedUploadsDir = path.resolve(uploadsDir);
    
    console.log('🔒 Resolved file path:', resolvedFilePath);
    console.log('🔒 Resolved uploads dir:', resolvedUploadsDir);
    
    if (!resolvedFilePath.startsWith(resolvedUploadsDir)) {
      console.error('❌ Path traversal detected');
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Check if file exists in primary location
    let finalFilePath = null;
    if (fs.existsSync(resolvedFilePath) && fs.statSync(resolvedFilePath).isFile()) {
      finalFilePath = resolvedFilePath;
      console.log('✅ File found in primary location:', resolvedFilePath);
    } else if (fs.existsSync(alternativePath) && fs.statSync(alternativePath).isFile()) {
      finalFilePath = path.resolve(alternativePath);
      console.log('✅ File found in alternative location:', alternativePath);
    } else {
      console.error('❌ File not found in either location:');
      console.error('  Primary:', resolvedFilePath);
      console.error('  Alternative:', alternativePath);
      return res.status(404).json({ 
        message: 'File not found', 
        searchedPaths: [resolvedFilePath, alternativePath]
      });
    }
    
    // Set proper content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.mp4': 'video/mp4',
      '.avi': 'video/x-msvideo',
      '.mov': 'video/quicktime'
    };
    const contentType = contentTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.sendFile(finalFilePath);
  } catch (error) {
    console.error('💥 Error serving file:', error);
    res.status(500).json({ message: 'Error serving file', error: error.message });
  }
});

// Common - must be after /files/:filename to prevent route conflicts
router.get('/:id', requireAuth(['Student', 'Warden', 'Admin']), getComplaintController);

export default router;


