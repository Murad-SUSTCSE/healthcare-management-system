const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

// Admin route - must be before :id route
router.get('/admin/all', requireAdmin, appointmentController.getAllAppointments);

router.post('/', appointmentController.bookAppointment);
router.get('/my', appointmentController.getAppointments);
router.put('/:id', appointmentController.updateStatus);

module.exports = router;
