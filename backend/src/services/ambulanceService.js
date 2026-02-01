const prisma = require('../utils/prismaClient');

const createRequest = async (userId, latitude, longitude) => {
    return await prisma.ambulanceRequest.create({
        data: {
            userId,
            latitude,
            longitude,
            status: 'PENDING'
        }
    });
};

const getMyRequests = async (userId) => {
    return await prisma.ambulanceRequest.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
};

// Ambulance Service CRUD operations
const getAllAmbulanceServices = async () => {
    return await prisma.ambulanceService.findMany({
        where: { isActive: true },
        orderBy: { companyName: 'asc' }
    });
};

const getAllAmbulanceServicesAdmin = async () => {
    return await prisma.ambulanceService.findMany({
        orderBy: { createdAt: 'desc' }
    });
};

const createAmbulanceService = async (data) => {
    return await prisma.ambulanceService.create({
        data: {
            companyName: data.companyName,
            phone: data.phone,
            address: data.address || null,
            description: data.description || null,
            isActive: data.isActive !== undefined ? data.isActive : true
        }
    });
};

const updateAmbulanceService = async (id, data) => {
    return await prisma.ambulanceService.update({
        where: { id: parseInt(id) },
        data: {
            companyName: data.companyName,
            phone: data.phone,
            address: data.address,
            description: data.description,
            isActive: data.isActive
        }
    });
};

const deleteAmbulanceService = async (id) => {
    return await prisma.ambulanceService.delete({
        where: { id: parseInt(id) }
    });
};

module.exports = {
    createRequest,
    getMyRequests,
    getAllAmbulanceServices,
    getAllAmbulanceServicesAdmin,
    createAmbulanceService,
    updateAmbulanceService,
    deleteAmbulanceService
};
