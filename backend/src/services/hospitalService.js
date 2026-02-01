const prisma = require('../utils/prismaClient');

const getAllHospitals = async () => {
    return await prisma.hospital.findMany();
};

const getHospitalById = async (id) => {
    return await prisma.hospital.findUnique({
        where: { id: parseInt(id) }
    });
}

module.exports = {
    getAllHospitals,
    getHospitalById
};
