const hospitalService = require('../services/hospitalService');

const getHospitals = async (req, res) => {
    try {
        const hospitals = await hospitalService.getAllHospitals();
        res.json(hospitals);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getHospital = async (req, res) => {
    try {
        const hospital = await hospitalService.getHospitalById(req.params.id);
        if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
        res.json(hospital);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = {
    getHospitals,
    getHospital
};
