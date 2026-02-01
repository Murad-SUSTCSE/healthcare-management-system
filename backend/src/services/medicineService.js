const prisma = require('../utils/prismaClient');

const getAllMedicines = async (search) => {
    const where = search ? {
        OR: [
            { name: { contains: search } }, // Case-insensitive in MySQL by default usually, but depends on collation
            { description: { contains: search } }
        ]
    } : {};
    return await prisma.medicine.findMany({ where });
};

const createOrder = async (userId, items) => {
    // items: [{ medicineId, quantity }]

    // Calculate total and verify stock
    let total = 0;

    // Use a transaction ensures data integrity
    return await prisma.$transaction(async (tx) => {
        for (const item of items) {
            const medicine = await tx.medicine.findUnique({ where: { id: item.medicineId } });
            if (!medicine) throw new Error(`Medicine with ID ${item.medicineId} not found`);
            if (medicine.stock < item.quantity) throw new Error(`Insufficient stock for ${medicine.name}`);

            total += medicine.price * item.quantity;

            // Update stock
            await tx.medicine.update({
                where: { id: item.medicineId },
                data: { stock: medicine.stock - item.quantity }
            });
        }

        // Create order
        const order = await tx.order.create({
            data: {
                userId,
                total,
                status: 'PENDING',
                orderItems: {
                    create: items.map(item => ({
                        medicineId: item.medicineId,
                        quantity: item.quantity,
                        price: 0 // Fetch actual price again or pass it. Let's fetch it above or just assume consistent.
                        // Ideally we should store the price at time of purchase.
                        // Simpler way:
                    }))
                }
            },
            include: { orderItems: true }
        });

        // Fix price in OrderItem since we didn't pass it easily in the map above without extra lookups.
        // Instead of complex logic, let's just re-iterate or do it cleaner.
        // But for this level, let's keep it simple. We calculated total.
        // To be precise, we need to store the price in OrderItem.
        // Refactoring the create loop:

        return order;
    });
};

const createOrderSimple = async (userId, items) => {
    return await prisma.$transaction(async (tx) => {
        let total = 0;
        const orderItemsData = [];

        for (const item of items) {
            const medicine = await tx.medicine.findUnique({ where: { id: item.medicineId } });
            if (!medicine) throw new Error(`Medicine ${item.medicineId} not found`);
            if (medicine.stock < item.quantity) throw new Error(`Insufficient stock for ${medicine.name}`);

            total += medicine.price * item.quantity;

            await tx.medicine.update({
                where: { id: item.medicineId },
                data: { stock: medicine.stock - item.quantity }
            });

            orderItemsData.push({
                medicineId: item.medicineId,
                quantity: item.quantity,
                price: medicine.price
            });
        }

        const order = await tx.order.create({
            data: {
                userId,
                total,
                status: 'PENDING',
                orderItems: {
                    create: orderItemsData
                }
            },
            include: { orderItems: true }
        });

        return order;
    });
}

const getMyOrders = async (userId) => {
    return await prisma.order.findMany({
        where: { userId },
        include: { orderItems: { include: { medicine: true } } },
        orderBy: { createdAt: 'desc' }
    });
};

const getAllOrders = async () => {
    return await prisma.order.findMany({
        include: { 
            orderItems: { include: { medicine: true } },
            user: { select: { id: true, name: true, email: true, phone: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
};

const updateOrderStatus = async (orderId, status) => {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Order not found');

    return await prisma.order.update({
        where: { id: orderId },
        data: { status },
        include: { 
            orderItems: { include: { medicine: true } },
            user: { select: { id: true, name: true, email: true } }
        }
    });
};

module.exports = {
    getAllMedicines,
    createOrder: createOrderSimple,
    getMyOrders,
    getAllOrders,
    updateOrderStatus
};
