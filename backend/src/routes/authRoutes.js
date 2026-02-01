const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);

// Admin routes
router.get('/admin/users', authenticateToken, requireAdmin, authController.getAllUsers);
router.get('/admin/stats', authenticateToken, requireAdmin, authController.getAdminStats);
router.delete('/admin/users/:userId', authenticateToken, requireAdmin, authController.deleteUser);

module.exports = router;
