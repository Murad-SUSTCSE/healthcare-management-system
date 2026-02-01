const express = require('express');
const router = express.Router();
const ambulanceController = require('../controllers/ambulanceController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

// Public route - get active ambulance services
router.get('/services', ambulanceController.getAmbulanceServices);

// Protected routes
router.use(authenticateToken);

router.post('/', ambulanceController.requestAmbulance);
router.get('/my', ambulanceController.getRequests);

// Admin routes
router.get('/services/admin', requireAdmin, ambulanceController.getAmbulanceServicesAdmin);
router.post('/services', requireAdmin, ambulanceController.createAmbulanceService);
router.put('/services/:id', requireAdmin, ambulanceController.updateAmbulanceService);
router.delete('/services/:id', requireAdmin, ambulanceController.deleteAmbulanceService);

module.exports = router;
