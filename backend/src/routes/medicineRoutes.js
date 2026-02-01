const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

router.get('/', medicineController.getMedicines);

// Protected routes
router.post('/orders', authenticateToken, medicineController.createOrder);
router.get('/orders/my', authenticateToken, medicineController.getOrders);

// Admin routes
router.get('/orders/all', authenticateToken, requireAdmin, medicineController.getAllOrders);
router.patch('/orders/:orderId/status', authenticateToken, requireAdmin, medicineController.updateOrderStatus);

module.exports = router;
