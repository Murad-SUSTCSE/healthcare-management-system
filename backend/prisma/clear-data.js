const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearData() {
  try {
    // Delete in order to respect foreign key constraints
    await prisma.doctorWeeklyAvailability.deleteMany({});
    console.log('Cleared DoctorWeeklyAvailability');
    
    await prisma.doctorAvailability.deleteMany({});
    console.log('Cleared DoctorAvailability');
    
    await prisma.appointment.deleteMany({});
    console.log('Cleared Appointments');
    
    await prisma.orderItem.deleteMany({});
    console.log('Cleared OrderItems');
    
    await prisma.order.deleteMany({});
    console.log('Cleared Orders');
    
    await prisma.ambulanceRequest.deleteMany({});
    console.log('Cleared AmbulanceRequests');
    
    await prisma.doctor.deleteMany({});
    console.log('Cleared Doctors');
    
    // Delete all users except admin
    await prisma.user.deleteMany({
      where: { role: { not: 'ADMIN' } }
    });
    console.log('Cleared Users (except ADMIN)');
    
    console.log('\nDatabase cleared successfully! Admin user preserved.');
    
    // Show remaining admin
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (admin) {
      console.log('Admin email:', admin.email);
    } else {
      console.log('No admin found. You may need to run the seed script.');
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

clearData();
