const appointmentService = require('../services/appointmentService');
const Joi = require('joi');
const prisma = require('../utils/prismaClient');

// Admin: Get all appointments
const getAllAppointments = async (req, res) => {
    try {
        const appointments = await prisma.appointment.findMany({
            include: {
                patient: {
                    select: { id: true, name: true, email: true }
                },
                doctor: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true }
                        },
                        hospital: {
                            select: { id: true, name: true, address: true }
                        }
                    }
                },
                hospital: true
            },
            orderBy: { date: 'desc' }
        });

        // Transform to frontend-expected format
        const transformed = appointments.map(apt => ({
            id: apt.id.toString(),
            patientId: apt.patientId.toString(),
            patientName: apt.patient?.name || 'Unknown Patient',
            patientEmail: apt.patient?.email || '',
            doctorId: apt.doctorId.toString(),
            doctorName: apt.doctor?.user?.name || 'Unknown Doctor',
            specialty: apt.doctor?.specialization || '',
            date: apt.date,
            time: apt.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            status: apt.status,
            reason: apt.reason,
            hospital: apt.hospital?.name || apt.doctor?.hospital?.name || '',
            createdAt: apt.createdAt
        }));

        res.json(transformed);
    } catch (err) {
        console.error('Failed to fetch all appointments:', err);
        res.status(500).json({ message: err.message });
    }
};

const bookAppointment = async (req, res) => {
    console.log('Booking appointment request body:', JSON.stringify(req.body));
    
    const schema = Joi.object({
        doctorId: Joi.alternatives().try(Joi.number(), Joi.string()).required(),
        hospitalId: Joi.number().optional(),
        date: Joi.date().iso().required(), // ISO format date string
        time: Joi.string().optional(),
        slotId: Joi.alternatives().try(Joi.number(), Joi.string()).optional(), // Can be number or "weekly-X" string
        reason: Joi.string().allow('').optional(),
        notes: Joi.string().allow('').optional()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        console.error('Validation error:', error.details[0].message);
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        const { doctorId, hospitalId, date, time, slotId, reason, notes } = req.body;
        const parsedDoctorId = parseInt(doctorId);
        
        // If slotId is provided and it's a date-specific slot (not weekly), mark it as booked
        if (slotId && typeof slotId === 'number') {
            const slot = await prisma.doctorAvailability.findUnique({
                where: { id: slotId }
            });

            if (!slot) {
                return res.status(404).json({ message: 'Time slot not found' });
            }

            if (slot.isBooked) {
                return res.status(400).json({ message: 'This time slot is already booked' });
            }

            // Mark slot as booked
            await prisma.doctorAvailability.update({
                where: { id: slotId },
                data: { isBooked: true }
            });
        }
        // Weekly slots don't need to be marked as booked - we check appointments instead

        // Combine date and time for the appointment
        let appointmentDate = new Date(date);
        if (time) {
            const [hours, minutes] = time.split(':');
            appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }

        const appointment = await appointmentService.createAppointment(
            req.user.userId, 
            parsedDoctorId, 
            hospitalId || null, 
            appointmentDate.toISOString(), 
            reason || notes
        );
        res.status(201).json(appointment);
    } catch (err) {
        console.error('Appointment booking error:', err);
        res.status(400).json({ message: err.message });
    }
};

const getAppointments = async (req, res) => {
    try {
        const appointments = await appointmentService.getMyAppointments(req.user.userId);
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateStatus = async (req, res) => {
    const schema = Joi.object({
        status: Joi.string().valid('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED').required()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const appointment = await appointmentService.updateAppointmentStatus(req.params.id, req.body.status);
        res.json(appointment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

module.exports = {
    getAllAppointments,
    bookAppointment,
    getAppointments,
    updateStatus
};
