const medicineService = require('../services/medicineService');
const Joi = require('joi');

const getMedicines = async (req, res) => {
    try {
        const search = req.query.search;
        const medicines = await medicineService.getAllMedicines(search);
        res.json(medicines);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const createOrder = async (req, res) => {
    const schema = Joi.object({
        items: Joi.array().items(
            Joi.object({
                medicineId: Joi.number().required(),
                quantity: Joi.number().min(1).required()
            })
        ).min(1).required()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const order = await medicineService.createOrder(req.user.userId, req.body.items);
        res.status(201).json(order);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getOrders = async (req, res) => {
    try {
        const orders = await medicineService.getMyOrders(req.user.userId);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await medicineService.getAllOrders();
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateOrderStatus = async (req, res) => {
    const schema = Joi.object({
        status: Joi.string().valid('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED').required()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const order = await medicineService.updateOrderStatus(parseInt(req.params.orderId), req.body.status);
        res.json(order);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = {
    getMedicines,
    createOrder,
    getOrders,
    getAllOrders,
    updateOrderStatus
};
