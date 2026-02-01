const prisma = require('../utils/prismaClient');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Generate a random password
const generatePassword = () => {
  return crypto.randomBytes(8).toString('hex');
};

// Generate a unique email for doctor
const generateDoctorEmail = (name) => {
  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `dr.${cleanName}${randomNum}@healthcare.com`;
};

// Get doctor profile
const getDoctorProfile = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    let doctor = await prisma.doctor.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        hospital: {
          select: { id: true, name: true, address: true },
        },
      },
    });

    // If doctor profile doesn't exist but user has DOCTOR role, create one
    if (!doctor) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true },
      });

      if (user && user.role === 'DOCTOR') {
        // Create doctor profile
        doctor = await prisma.doctor.create({
          data: {
            userId,
            specialization: 'General Physician',
            visitingHours: '09:00 AM - 05:00 PM',
            fees: 500,
          },
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
            hospital: {
              select: { id: true, name: true, address: true },
            },
          },
        });
      } else {
        return res.status(404).json({ message: 'Doctor profile not found' });
      }
    }

    res.json(doctor);
  } catch (error) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({ message: 'Failed to get doctor profile' });
  }
};

// Update doctor profile (specializations, fees, hospital)
const updateDoctorProfile = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { specialization, specializations, fees, hospitalId, visitingHours } = req.body;

    const doctor = await prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Handle specializations array
    let primarySpecialization = specialization;
    if (specializations && Array.isArray(specializations) && specializations.length > 0) {
      primarySpecialization = specializations[0]; // First one is primary
    }

    const updatedDoctor = await prisma.doctor.update({
      where: { userId },
      data: {
        ...(primarySpecialization && { specialization: primarySpecialization }),
        ...(specializations && { specializations: specializations }),
        ...(fees && { fees: parseFloat(fees) }),
        ...(hospitalId !== undefined && { hospitalId: hospitalId ? parseInt(hospitalId) : null }),
        ...(visitingHours && { visitingHours }),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        hospital: {
          select: { id: true, name: true, address: true },
        },
      },
    });

    res.json(updatedDoctor);
  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(500).json({ message: 'Failed to update doctor profile' });
  }
};

// Add availability slots for a date
const addAvailability = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { date, slots } = req.body; // slots: array of { startTime, endTime }

    const doctor = await prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Parse the date
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    // Create availability slots
    const createdSlots = await Promise.all(
      slots.map(async (slot) => {
        try {
          return await prisma.doctorAvailability.create({
            data: {
              doctorId: doctor.id,
              date: dateObj,
              startTime: slot.startTime,
              endTime: slot.endTime,
              isBooked: false,
            },
          });
        } catch (err) {
          // Ignore duplicate entries
          if (err.code === 'P2002') {
            return null;
          }
          throw err;
        }
      })
    );

    res.json({
      message: 'Availability slots added successfully',
      slots: createdSlots.filter(Boolean),
    });
  } catch (error) {
    console.error('Add availability error:', error);
    res.status(500).json({ message: 'Failed to add availability' });
  }
};

// Get doctor's availability for a date range
const getAvailability = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { startDate, endDate } = req.query;

    const doctor = await prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const whereClause = {
      doctorId: doctor.id,
    };

    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      whereClause.date = {
        gte: new Date(startDate),
      };
    }

    const availability = await prisma.doctorAvailability.findMany({
      where: whereClause,
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    res.json(availability);
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ message: 'Failed to get availability' });
  }
};

// Delete an availability slot
const deleteAvailability = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { slotId } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const slot = await prisma.doctorAvailability.findFirst({
      where: {
        id: parseInt(slotId),
        doctorId: doctor.id,
      },
    });

    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    if (slot.isBooked) {
      return res.status(400).json({ message: 'Cannot delete a booked slot' });
    }

    await prisma.doctorAvailability.delete({
      where: { id: parseInt(slotId) },
    });

    res.json({ message: 'Slot deleted successfully' });
  } catch (error) {
    console.error('Delete availability error:', error);
    res.status(500).json({ message: 'Failed to delete availability' });
  }
};

// Get doctor's appointments
const getDoctorAppointments = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { status, date } = req.query;

    const doctor = await prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const whereClause = {
      doctorId: doctor.id,
    };

    if (status) {
      whereClause.status = status;
    }

    if (date) {
      const dateStart = new Date(date);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(date);
      dateEnd.setHours(23, 59, 59, 999);
      whereClause.date = {
        gte: dateStart,
        lte: dateEnd,
      };
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: {
          select: { id: true, name: true, email: true },
        },
        hospital: {
          select: { id: true, name: true, address: true },
        },
      },
      orderBy: { date: 'asc' },
    });

    res.json(appointments);
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({ message: 'Failed to get appointments' });
  }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { appointmentId } = req.params;
    const { status } = req.body;

    const doctor = await prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: parseInt(appointmentId),
        doctorId: doctor.id,
      },
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: parseInt(appointmentId) },
      data: { status },
      include: {
        patient: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json(updatedAppointment);
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ message: 'Failed to update appointment status' });
  }
};

// Public: Get available slots for a doctor (for patients)
const getPublicDoctorAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    // First, get date-specific availability
    const whereClause = {
      doctorId: parseInt(doctorId),
      isBooked: false,
    };

    if (date) {
      const dateObj = new Date(date);
      dateObj.setHours(0, 0, 0, 0);
      whereClause.date = dateObj;
    } else {
      // Get slots from today onwards
      whereClause.date = {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      };
    }

    const dateSpecificSlots = await prisma.doctorAvailability.findMany({
      where: whereClause,
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    // If date is provided, also check weekly availability for that day of week
    if (date) {
      const dateObj = new Date(date);
      const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.

      const weeklySlots = await prisma.doctorWeeklyAvailability.findMany({
        where: {
          doctorId: parseInt(doctorId),
          dayOfWeek: dayOfWeek,
        },
        orderBy: { startTime: 'asc' },
      });

      // Check which weekly slots are already booked for this specific date
      const bookedAppointments = await prisma.appointment.findMany({
        where: {
          doctorId: parseInt(doctorId),
          date: {
            gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
            lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
          },
          status: { not: 'CANCELLED' },
        },
        select: { date: true },
      });

      // Get booked times as strings for comparison
      const bookedTimes = bookedAppointments.map(apt => {
        const d = new Date(apt.date);
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      });

      // Convert weekly slots to date-specific format, excluding booked ones
      const weeklyAsSlotsFormat = weeklySlots
        .filter(slot => !bookedTimes.includes(slot.startTime))
        .map(slot => ({
          id: `weekly-${slot.id}`,
          doctorId: slot.doctorId,
          date: date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isBooked: false,
          isWeekly: true, // Flag to indicate this is from weekly availability
        }));

      // Combine date-specific and weekly slots, avoiding duplicates by startTime
      const existingStartTimes = new Set(dateSpecificSlots.map(s => s.startTime));
      const combinedSlots = [
        ...dateSpecificSlots,
        ...weeklyAsSlotsFormat.filter(s => !existingStartTimes.has(s.startTime)),
      ];

      // Sort by startTime
      combinedSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

      return res.json(combinedSlots);
    }

    res.json(dateSpecificSlots);
  } catch (error) {
    console.error('Get public doctor availability error:', error);
    res.status(500).json({ message: 'Failed to get availability' });
  }
};

// Add weekly availability slots (weekday-based)
const addWeeklyAvailability = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { dayOfWeek, slots } = req.body; // dayOfWeek: 0-6, slots: array of { startTime, endTime }

    const doctor = await prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Validate dayOfWeek
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return res.status(400).json({ message: 'Invalid day of week' });
    }

    // Create weekly availability slots
    const createdSlots = await Promise.all(
      slots.map(async (slot) => {
        try {
          return await prisma.doctorWeeklyAvailability.create({
            data: {
              doctorId: doctor.id,
              dayOfWeek: parseInt(dayOfWeek),
              startTime: slot.startTime,
              endTime: slot.endTime,
            },
          });
        } catch (err) {
          // Ignore duplicate entries
          if (err.code === 'P2002') {
            return null;
          }
          throw err;
        }
      })
    );

    res.json({
      message: 'Weekly availability slots added successfully',
      slots: createdSlots.filter(Boolean),
    });
  } catch (error) {
    console.error('Add weekly availability error:', error);
    res.status(500).json({ message: 'Failed to add weekly availability' });
  }
};

// Get doctor's weekly availability
const getWeeklyAvailability = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { dayOfWeek } = req.query;

    const doctor = await prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const whereClause = {
      doctorId: doctor.id,
    };

    if (dayOfWeek !== undefined) {
      whereClause.dayOfWeek = parseInt(dayOfWeek);
    }

    const availability = await prisma.doctorWeeklyAvailability.findMany({
      where: whereClause,
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    res.json(availability);
  } catch (error) {
    console.error('Get weekly availability error:', error);
    res.status(500).json({ message: 'Failed to get weekly availability' });
  }
};

// Delete a weekly availability slot
const deleteWeeklyAvailability = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { slotId } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const slot = await prisma.doctorWeeklyAvailability.findFirst({
      where: {
        id: parseInt(slotId),
        doctorId: doctor.id,
      },
    });

    if (!slot) {
      return res.status(404).json({ message: 'Weekly slot not found' });
    }

    await prisma.doctorWeeklyAvailability.delete({
      where: { id: parseInt(slotId) },
    });

    res.json({ message: 'Weekly slot deleted successfully' });
  } catch (error) {
    console.error('Delete weekly availability error:', error);
    res.status(500).json({ message: 'Failed to delete weekly availability' });
  }
};

// Update a weekly availability slot
const updateWeeklyAvailability = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { slotId } = req.params;
    const { startTime, endTime } = req.body;

    const doctor = await prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const slot = await prisma.doctorWeeklyAvailability.findFirst({
      where: {
        id: parseInt(slotId),
        doctorId: doctor.id,
      },
    });

    if (!slot) {
      return res.status(404).json({ message: 'Weekly slot not found' });
    }

    const updatedSlot = await prisma.doctorWeeklyAvailability.update({
      where: { id: parseInt(slotId) },
      data: {
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
      },
    });

    res.json(updatedSlot);
  } catch (error) {
    console.error('Update weekly availability error:', error);
    res.status(500).json({ message: 'Failed to update weekly availability' });
  }
};

// Public: Get weekly availability for a doctor (for patients)
const getPublicDoctorWeeklyAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { dayOfWeek } = req.query;

    const whereClause = {
      doctorId: parseInt(doctorId),
    };

    if (dayOfWeek !== undefined) {
      whereClause.dayOfWeek = parseInt(dayOfWeek);
    }

    const availability = await prisma.doctorWeeklyAvailability.findMany({
      where: whereClause,
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    res.json(availability);
  } catch (error) {
    console.error('Get public doctor weekly availability error:', error);
    res.status(500).json({ message: 'Failed to get weekly availability' });
  }
};

// Get all doctors (public endpoint for patients)
// Only shows doctors who have set their visiting hours
const getAllDoctors = async (req, res) => {
  try {
    const { specialization } = req.query;
    
    const doctors = await prisma.doctor.findMany({
      where: {
        // Only show doctors who have set their visiting hours
        visitingHours: {
          not: '',
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        hospital: {
          select: { id: true, name: true, address: true },
        },
      },
    });

    // Transform data for frontend
    let result = doctors.map((doctor) => ({
      id: doctor.id.toString(),
      name: doctor.user.name,
      email: doctor.user.email,
      specialization: doctor.specialization,
      specializations: doctor.specializations || [doctor.specialization],
      hospital: doctor.hospital?.name || 'Independent Practice',
      hospitalAddress: doctor.hospital?.address || '',
      fees: doctor.fees,
      visitingHours: doctor.visitingHours,
      rating: 4.5, // Placeholder - could be calculated from reviews
    }));

    // Filter by specialization if provided
    if (specialization && specialization !== 'all') {
      result = result.filter((doctor) => {
        const specs = doctor.specializations || [doctor.specialization];
        return specs.some((s) => s.toLowerCase() === specialization.toLowerCase());
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Get all doctors error:', error);
    res.status(500).json({ message: 'Failed to get doctors' });
  }
};

// Get single doctor by ID (public endpoint)
const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doctor = await prisma.doctor.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        hospital: {
          select: { id: true, name: true, address: true },
        },
      },
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json({
      id: doctor.id.toString(),
      name: doctor.user.name,
      email: doctor.user.email,
      specialization: doctor.specialization,
      specializations: doctor.specializations || [doctor.specialization],
      hospital: doctor.hospital?.name || 'Independent Practice',
      hospitalAddress: doctor.hospital?.address || '',
      fees: doctor.fees,
      visitingHours: doctor.visitingHours,
      rating: 4.5,
    });
  } catch (error) {
    console.error('Get doctor by ID error:', error);
    res.status(500).json({ message: 'Failed to get doctor' });
  }
};

// Get list of all available specializations
const getSpecializations = async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      select: {
        specialization: true,
        specializations: true,
      },
    });

    // Collect all unique specializations
    const specSet = new Set();
    doctors.forEach((doctor) => {
      if (doctor.specializations && Array.isArray(doctor.specializations)) {
        doctor.specializations.forEach((s) => specSet.add(s));
      } else if (doctor.specialization) {
        specSet.add(doctor.specialization);
      }
    });

    res.json(Array.from(specSet).sort());
  } catch (error) {
    console.error('Get specializations error:', error);
    res.status(500).json({ message: 'Failed to get specializations' });
  }
};

// Admin: Create a new doctor account
const createDoctorAccount = async (req, res) => {
  try {
    const { name, specialization, specializations, fees, hospitalId } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Doctor name is required' });
    }

    // Generate email and password
    const email = generateDoctorEmail(name);
    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle specializations - can be array or single string
    let primarySpecialization = 'General Physician';
    let allSpecializations = [];
    
    if (specializations && Array.isArray(specializations) && specializations.length > 0) {
      primarySpecialization = specializations[0];
      allSpecializations = specializations;
    } else if (specialization) {
      primarySpecialization = specialization;
      allSpecializations = [specialization];
    }

    // Create user with DOCTOR role
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email,
        password: hashedPassword,
        role: 'DOCTOR',
      },
    });

    // Create doctor profile - visitingHours is intentionally empty
    // Doctor must update their profile to appear in user listings
    const doctor = await prisma.doctor.create({
      data: {
        userId: user.id,
        specialization: primarySpecialization,
        specializations: allSpecializations,
        fees: fees || 500,
        visitingHours: '', // Empty - doctor must set this to appear in listings
        hospitalId: hospitalId || null,
      },
    });

    res.status(201).json({
      message: 'Doctor account created successfully',
      credentials: {
        email,
        password, // Plain text password to show to admin
      },
      doctor: {
        id: doctor.id,
        userId: user.id,
        name: user.name,
        email: user.email,
        specialization: doctor.specialization,
        specializations: doctor.specializations,
        fees: doctor.fees,
        visitingHours: doctor.visitingHours,
      },
    });
  } catch (error) {
    console.error('Create doctor account error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Email already exists. Please try again.' });
    }
    res.status(500).json({ message: 'Failed to create doctor account' });
  }
};

// Admin: Get all doctors with full details
const getAdminDoctorsList = async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
        hospital: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(doctors);
  } catch (error) {
    console.error('Get admin doctors list error:', error);
    res.status(500).json({ message: 'Failed to get doctors' });
  }
};

// Admin: Delete a doctor account
const deleteDoctorAccount = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { id: parseInt(doctorId) },
      include: {
        appointments: true,
        user: {
          select: { name: true }
        }
      },
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check for active/upcoming appointments (PENDING or CONFIRMED with future dates)
    const now = new Date();
    console.log('Current time:', now);
    console.log('Doctor appointments:', doctor.appointments.map(apt => ({
      id: apt.id,
      date: apt.date,
      status: apt.status,
      isFuture: new Date(apt.date) >= now
    })));

    const activeAppointments = doctor.appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      const isFuture = aptDate >= now;
      const isActive = apt.status === 'PENDING' || apt.status === 'CONFIRMED';
      console.log(`Appointment ${apt.id}: date=${aptDate}, status=${apt.status}, isFuture=${isFuture}, isActive=${isActive}`);
      return isFuture && isActive;
    });

    console.log('Active appointments count:', activeAppointments.length);

    if (activeAppointments.length > 0) {
      return res.status(400).json({ 
        message: `Cannot delete doctor with ${activeAppointments.length} active appointment(s). Please cancel or complete them first.`,
        activeAppointments: activeAppointments.map(apt => ({
          id: apt.id,
          date: apt.date,
          status: apt.status
        }))
      });
    }

    // Use a transaction to delete all related records and the doctor
    await prisma.$transaction(async (tx) => {
      // Delete all past appointments for this doctor
      await tx.appointment.deleteMany({
        where: { doctorId: parseInt(doctorId) },
      });

      // Delete all availability records for this doctor
      await tx.doctorAvailability.deleteMany({
        where: { doctorId: parseInt(doctorId) },
      });

      // Delete all weekly availability records for this doctor
      await tx.doctorWeeklyAvailability.deleteMany({
        where: { doctorId: parseInt(doctorId) },
      });

      // Delete the doctor profile
      await tx.doctor.delete({
        where: { id: parseInt(doctorId) },
      });

      // Delete all orders by this user
      await tx.orderItem.deleteMany({
        where: { order: { userId: doctor.userId } },
      });
      await tx.order.deleteMany({
        where: { userId: doctor.userId },
      });

      // Delete all ambulance requests by this user
      await tx.ambulanceRequest.deleteMany({
        where: { userId: doctor.userId },
      });

      // Delete the user account completely
      await tx.user.delete({
        where: { id: doctor.userId },
      });
    });

    res.status(200).json({ message: 'Doctor account deleted successfully' });
  } catch (error) {
    console.error('Delete doctor account error:', error);
    res.status(500).json({ message: 'Failed to delete doctor account', error: error.message });
  }
};

module.exports = {
  getDoctorProfile,
  updateDoctorProfile,
  addAvailability,
  getAvailability,
  deleteAvailability,
  getDoctorAppointments,
  updateAppointmentStatus,
  getPublicDoctorAvailability,
  addWeeklyAvailability,
  getWeeklyAvailability,
  deleteWeeklyAvailability,
  updateWeeklyAvailability,
  getPublicDoctorWeeklyAvailability,
  getAllDoctors,
  getDoctorById,
  getSpecializations,
  // Admin functions
  createDoctorAccount,
  getAdminDoctorsList,
  deleteDoctorAccount,
};
