const authService = require('../services/authService');
const Joi = require('joi');
const prisma = require('../utils/prismaClient');

const register = async (req, res) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        role: Joi.string().valid('USER', 'ADMIN')
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const { name, email, password, role } = req.body;
        const user = await authService.registerUser(name, email, password, role);
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const login = async (req, res) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password);
        res.json(result);
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                dateOfBirth: true,
                bloodGroup: true,
                role: true,
                createdAt: true,
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ message: 'Failed to get profile' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const { name, phone, dateOfBirth, bloodGroup } = req.body;
        
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(name && { name }),
                ...(phone !== undefined && { phone: phone || null }),
                ...(dateOfBirth !== undefined && { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null }),
                ...(bloodGroup !== undefined && { bloodGroup: bloodGroup || null }),
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                dateOfBirth: true,
                bloodGroup: true,
                role: true,
                createdAt: true,
            }
        });

        res.json(updatedUser);
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ message: 'Failed to update profile' });
    }
};

// Admin: Get all regular users (excluding doctors and admins)
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: {
                role: 'USER' // Only regular users
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(users);
    } catch (err) {
        console.error('Get all users error:', err);
        res.status(500).json({ message: 'Failed to get users' });
    }
};

// Admin: Get dashboard stats
const getAdminStats = async (req, res) => {
    try {
        const [totalUsers, totalDoctors, totalAppointments] = await Promise.all([
            prisma.user.count({
                where: { role: 'USER' } // Only count regular users (patients)
            }),
            prisma.doctor.count(),
            prisma.appointment.count()
        ]);

        res.json({
            totalUsers,
            totalDoctors,
            approvedDoctors: totalDoctors, // All doctors in the system are approved (created by admin)
            totalAppointments
        });
    } catch (err) {
        console.error('Get admin stats error:', err);
        res.status(500).json({ message: 'Failed to get stats' });
    }
};

// Admin: Delete a user account
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const userIdInt = parseInt(userId);

        const user = await prisma.user.findUnique({
            where: { id: userIdInt },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Don't allow deleting admins
        if (user.role === 'ADMIN') {
            return res.status(400).json({ message: 'Cannot delete admin accounts' });
        }

        // Check for active appointments
        const activeAppointments = await prisma.appointment.count({
            where: {
                patientId: userIdInt,
                date: { gte: new Date() },
                status: { in: ['PENDING', 'CONFIRMED'] }
            }
        });

        if (activeAppointments > 0) {
            return res.status(400).json({ 
                message: `Cannot delete user with ${activeAppointments} active appointment(s). Please cancel them first.` 
            });
        }

        // Use transaction to delete all related records
        await prisma.$transaction(async (tx) => {
            // Delete all appointments (past ones)
            await tx.appointment.deleteMany({
                where: { patientId: userIdInt }
            });

            // Delete all order items and orders
            await tx.orderItem.deleteMany({
                where: { order: { userId: userIdInt } }
            });
            await tx.order.deleteMany({
                where: { userId: userIdInt }
            });

            // Delete all ambulance requests
            await tx.ambulanceRequest.deleteMany({
                where: { userId: userIdInt }
            });

            // Delete the user
            await tx.user.delete({
                where: { id: userIdInt }
            });
        });

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ message: 'Failed to delete user' });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    getAllUsers,
    getAdminStats,
    deleteUser
};
