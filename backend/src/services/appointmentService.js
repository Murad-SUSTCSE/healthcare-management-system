const prisma = require('../utils/prismaClient');

const createAppointment = async (patientId, doctorId, hospitalId, date, reason) => {
    const appointmentDate = new Date(date);
    
    // Check for double booking - look for appointments within the same 30-minute slot
    const slotStart = new Date(appointmentDate);
    const slotEnd = new Date(appointmentDate);
    slotEnd.setMinutes(slotEnd.getMinutes() + 30);
    
    const existingAppointment = await prisma.appointment.findFirst({
        where: {
            doctorId,
            date: {
                gte: slotStart,
                lt: slotEnd
            },
            NOT: {
                status: 'CANCELLED'
            }
        }
    });

    if (existingAppointment) {
        throw new Error('Doctor is not available at this time');
    }

    return await prisma.appointment.create({
        data: {
            patientId,
            doctorId,
            hospitalId,
            date: appointmentDate,
            reason,
            status: 'PENDING'
        }
    });
};

const getMyAppointments = async (userId) => {
    const appointments = await prisma.appointment.findMany({
        where: { patientId: userId },
        include: {
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
    return appointments.map(apt => ({
        id: apt.id.toString(),
        userId: apt.patientId.toString(),
        doctorId: apt.doctorId.toString(),
        doctorName: apt.doctor?.user?.name || 'Unknown Doctor',
        specialty: apt.doctor?.specialization || '',
        date: apt.date,
        time: apt.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: apt.status.toLowerCase() === 'pending' ? 'scheduled' : apt.status.toLowerCase(),
        notes: apt.reason,
        hospital: apt.hospital?.name || apt.doctor?.hospital?.name || '',
        createdAt: apt.createdAt
    }));
};

const updateAppointmentStatus = async (id, status) => {
    const appointment = await prisma.appointment.findUnique({
        where: { id: parseInt(id) }
    });

    if (!appointment) {
        throw new Error('Appointment not found');
    }

    // If cancelling, release the time slot
    if (status === 'CANCELLED') {
        // Get the appointment time to find matching availability slot
        const appointmentDate = new Date(appointment.date);
        const dateOnly = new Date(appointmentDate);
        dateOnly.setHours(0, 0, 0, 0);
        
        const startTime = `${appointmentDate.getHours().toString().padStart(2, '0')}:${appointmentDate.getMinutes().toString().padStart(2, '0')}`;
        
        // Try to find and release the date-specific slot
        await prisma.doctorAvailability.updateMany({
            where: {
                doctorId: appointment.doctorId,
                date: dateOnly,
                startTime: startTime,
                isBooked: true
            },
            data: { isBooked: false }
        });
    }

    return await prisma.appointment.update({
        where: { id: parseInt(id) },
        data: { status }
    });
};

module.exports = {
    createAppointment,
    getMyAppointments,
    updateAppointmentStatus
};
