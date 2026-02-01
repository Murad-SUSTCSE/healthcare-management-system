const ambulanceService = require('../services/ambulanceService');
const Joi = require('joi');

const requestAmbulance = async (req, res) => {
    const schema = Joi.object({
        latitude: Joi.number().required(),
        longitude: Joi.number().required()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const { latitude, longitude } = req.body;
        const request = await ambulanceService.createRequest(req.user.userId, latitude, longitude);
        res.status(201).json(request);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getRequests = async (req, res) => {
    try {
        const requests = await ambulanceService.getMyRequests(req.user.userId);
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all active ambulance services (public)
const getAmbulanceServices = async (req, res) => {
    try {
        const services = await ambulanceService.getAllAmbulanceServices();
        res.json(services);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin: Get all ambulance services
const getAmbulanceServicesAdmin = async (req, res) => {
    try {
        const services = await ambulanceService.getAllAmbulanceServicesAdmin();
        res.json(services);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin: Create ambulance service
const createAmbulanceService = async (req, res) => {
    const schema = Joi.object({
        companyName: Joi.string().required(),
        phone: Joi.string().required(),
        address: Joi.string().allow('', null),
        description: Joi.string().allow('', null),
        isActive: Joi.boolean()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const service = await ambulanceService.createAmbulanceService(req.body);
        res.status(201).json(service);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin: Update ambulance service
const updateAmbulanceService = async (req, res) => {
    const schema = Joi.object({
        companyName: Joi.string(),
        phone: Joi.string(),
        address: Joi.string().allow('', null),
        description: Joi.string().allow('', null),
        isActive: Joi.boolean()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const service = await ambulanceService.updateAmbulanceService(req.params.id, req.body);
        res.json(service);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin: Delete ambulance service
const deleteAmbulanceService = async (req, res) => {
    try {
        await ambulanceService.deleteAmbulanceService(req.params.id);
        res.json({ message: 'Ambulance service deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    requestAmbulance,
    getRequests,
    getAmbulanceServices,
    getAmbulanceServicesAdmin,
    createAmbulanceService,
    updateAmbulanceService,
    deleteAmbulanceService
};
