const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { authenticateToken, requireDoctor, requireAdmin } = require('../middlewares/authMiddleware');

// Public routes (no authentication needed) - must be before protected routes
router.get('/specializations', doctorController.getSpecializations);
router.get('/list', doctorController.getAllDoctors); // /api/doctors/list

// Admin routes (require admin role)
router.post('/admin/create', authenticateToken, requireAdmin, doctorController.createDoctorAccount);
router.get('/admin/list', authenticateToken, requireAdmin, doctorController.getAdminDoctorsList);
router.delete('/admin/:doctorId', authenticateToken, requireAdmin, doctorController.deleteDoctorAccount);

// Protected routes (require doctor role)
router.get('/profile', authenticateToken, requireDoctor, doctorController.getDoctorProfile);
router.put('/profile', authenticateToken, requireDoctor, doctorController.updateDoctorProfile);
router.post('/availability', authenticateToken, requireDoctor, doctorController.addAvailability);
router.get('/availability', authenticateToken, requireDoctor, doctorController.getAvailability);
router.delete('/availability/:slotId', authenticateToken, requireDoctor, doctorController.deleteAvailability);
router.get('/appointments', authenticateToken, requireDoctor, doctorController.getDoctorAppointments);
router.put('/appointments/:appointmentId/status', authenticateToken, requireDoctor, doctorController.updateAppointmentStatus);

// Weekly availability routes (weekday-based)
router.post('/weekly-availability', authenticateToken, requireDoctor, doctorController.addWeeklyAvailability);
router.get('/weekly-availability', authenticateToken, requireDoctor, doctorController.getWeeklyAvailability);
router.delete('/weekly-availability/:slotId', authenticateToken, requireDoctor, doctorController.deleteWeeklyAvailability);
router.put('/weekly-availability/:slotId', authenticateToken, requireDoctor, doctorController.updateWeeklyAvailability);

// Public route for patients to see doctor availability
router.get('/:doctorId/availability', doctorController.getPublicDoctorAvailability);
router.get('/:doctorId/weekly-availability', doctorController.getPublicDoctorWeeklyAvailability);

// Public routes - get doctor by ID (must be after specific routes to avoid conflicts)
router.get('/:id', doctorController.getDoctorById);

// Root route for /api/doctors - get all doctors
router.get('/', doctorController.getAllDoctors);

module.exports = router;
