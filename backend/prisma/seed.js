const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
    // Seed Hospitals
    const hospitals = [
        {
            name: "Sylhet M.A.G. Osmani Medical College Hospital",
            address: "Kajolshah, Sylhet",
            latitude: 24.9048,
            longitude: 91.8600,
            phone: "0821-713289"
        },
        {
            name: "Jalalabad Ragib-Rabeya Medical College Hospital",
            address: "Pathantula, Sylhet",
            latitude: 24.9128,
            longitude: 91.8492,
            phone: "0821-719009"
        },
        {
            name: "North East Medical College Hospital",
            address: "South Surma, Sylhet",
            latitude: 24.8722,
            longitude: 91.8844,
            phone: "0821-761376"
        },
        {
            name: "Parkview Medical College Hospital",
            address: "Taltola, Sylhet",
            latitude: 24.8967,
            longitude: 91.8675,
            phone: "0821-727878"
        },
        {
            name: "Mount Adora Hospital",
            address: "Nayasarak, Sylhet",
            latitude: 24.8989,
            longitude: 91.8736,
            phone: "01717-385555"
        },
        {
            name: "Women's Medical College Hospital",
            address: "Mirboxtula, Sylhet",
            latitude: 24.9015,
            longitude: 91.8710,
            phone: "0821-718080"
        }
    ];

    console.log('Seeding hospitals...');
    for (const hospital of hospitals) {
        await prisma.hospital.upsert({
            where: { id: -1 }, // Assuming IDs are autoincrement, we modify this if needed or just createMany. 
            // Since upsert needs a unique where clause and we don't have static IDs, we'll try findFirst or just create.
            // But for simplicity in this seed, let's just create if not exists by checking name.
            update: {},
            create: hospital,
        }).catch(async () => {
            // Fallback or better check
            const exists = await prisma.hospital.findFirst({ where: { name: hospital.name } });
            if (!exists) {
                await prisma.hospital.create({ data: hospital });
            }
        });
    }

    // Improved seeding logic:
    for (const h of hospitals) {
        const exists = await prisma.hospital.findFirst({ where: { name: h.name } });
        if (!exists) {
            await prisma.hospital.create({ data: h });
        }
    }

    // Create Admin User - Murad
    const adminEmail = "murad@sylhethealth.com";
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash("Chunu753951", 10);
        await prisma.user.create({
            data: {
                name: "Murad",
                email: adminEmail,
                password: hashedPassword,
                role: "ADMIN"
            }
        });
        console.log('Admin user Murad created');
    } else {
        // Update existing admin password if needed
        const hashedPassword = await bcrypt.hash("Chunu753951", 10);
        await prisma.user.update({
            where: { email: adminEmail },
            data: {
                name: "Murad",
                password: hashedPassword,
                role: "ADMIN"
            }
        });
        console.log('Admin user Murad updated');
    }

    // Create some Medicines - Common Bangladeshi Medicines
    const medicines = [
        // Pain Relief & Fever
        { name: "Napa Extra", description: "Paracetamol 500mg + Caffeine 65mg - Pain & fever relief", category: "Pain Relief", price: 2.5, stock: 1000 },
        { name: "Napa", description: "Paracetamol 500mg tablet", category: "Pain Relief", price: 1.5, stock: 1500 },
        { name: "Ace Plus", description: "Paracetamol 500mg + Caffeine 65mg", category: "Pain Relief", price: 3.0, stock: 800 },
        { name: "Tory Plus", description: "Paracetamol + Caffeine for pain relief", category: "Pain Relief", price: 2.5, stock: 600 },
        { name: "Naprosyn 500", description: "Naproxen 500mg - Anti-inflammatory", category: "Pain Relief", price: 8.0, stock: 400 },
        
        // Gastric & Acidity
        { name: "Seclo 20", description: "Omeprazole 20mg - Gastric relief", category: "Gastric & Acidity", price: 5.0, stock: 500 },
        { name: "Pantonix 40", description: "Pantoprazole 40mg - Acid reducer", category: "Gastric & Acidity", price: 6.0, stock: 450 },
        { name: "Maxpro 20", description: "Esomeprazole 20mg - GERD treatment", category: "Gastric & Acidity", price: 8.0, stock: 350 },
        { name: "Ranitid 150", description: "Ranitidine 150mg - Ulcer treatment", category: "Gastric & Acidity", price: 3.0, stock: 600 },
        { name: "Antacid Plus", description: "Aluminum + Magnesium - Quick relief", category: "Gastric & Acidity", price: 2.0, stock: 1000 },
        
        // Antibiotics
        { name: "Azithromycin 500", description: "Azithromycin 500mg - Broad spectrum antibiotic", category: "Antibiotics", price: 35.0, stock: 200 },
        { name: "Ciprofloxacin 500", description: "Ciprofloxacin 500mg - Antibiotic", category: "Antibiotics", price: 12.0, stock: 300 },
        { name: "Amoxicillin 500", description: "Amoxicillin 500mg capsule - Antibiotic", category: "Antibiotics", price: 8.0, stock: 400 },
        { name: "Cefixime 200", description: "Cefixime 200mg - Cephalosporin antibiotic", category: "Antibiotics", price: 25.0, stock: 250 },
        { name: "Fluclox 500", description: "Flucloxacillin 500mg - Antibiotic", category: "Antibiotics", price: 15.0, stock: 300 },
        
        // Allergy & Cold
        { name: "Fexo 120", description: "Fexofenadine 120mg - Antihistamine", category: "Allergy & Cold", price: 10.0, stock: 400 },
        { name: "Histacin", description: "Chlorpheniramine - Allergy relief", category: "Allergy & Cold", price: 2.0, stock: 800 },
        { name: "Alatrol 10", description: "Cetirizine 10mg - Allergy treatment", category: "Allergy & Cold", price: 5.0, stock: 500 },
        { name: "Monas 10", description: "Montelukast 10mg - Asthma & allergy", category: "Allergy & Cold", price: 15.0, stock: 300 },
        { name: "Sudafed", description: "Pseudoephedrine - Nasal decongestant", category: "Allergy & Cold", price: 4.0, stock: 600 },
        
        // Vitamins & Supplements
        { name: "Calbo D", description: "Calcium + Vitamin D3 supplement", category: "Vitamins & Supplements", price: 12.0, stock: 500 },
        { name: "Neurobion Forte", description: "Vitamin B1, B6, B12 - Nerve health", category: "Vitamins & Supplements", price: 8.0, stock: 400 },
        { name: "Feroglobin", description: "Iron + Folic Acid + B12 - Anemia", category: "Vitamins & Supplements", price: 15.0, stock: 350 },
        { name: "Vitamin C 500", description: "Ascorbic Acid 500mg - Immunity booster", category: "Vitamins & Supplements", price: 3.0, stock: 800 },
        { name: "Zincovit", description: "Multivitamin + Zinc tablet", category: "Vitamins & Supplements", price: 5.0, stock: 600 },
        
        // Diabetes
        { name: "Metformin 500", description: "Metformin 500mg - Diabetes control", category: "Diabetes", price: 4.0, stock: 500 },
        { name: "Glimepiride 2", description: "Glimepiride 2mg - Blood sugar control", category: "Diabetes", price: 6.0, stock: 400 },
        { name: "Daonil 5", description: "Glibenclamide 5mg - Diabetes", category: "Diabetes", price: 3.0, stock: 450 },
        
        // Blood Pressure
        { name: "Amlodipine 5", description: "Amlodipine 5mg - BP control", category: "Blood Pressure", price: 3.0, stock: 600 },
        { name: "Losartan 50", description: "Losartan 50mg - Hypertension", category: "Blood Pressure", price: 8.0, stock: 400 },
        { name: "Atenolol 50", description: "Atenolol 50mg - Beta blocker", category: "Blood Pressure", price: 2.5, stock: 500 },
        
        // Digestive
        { name: "Orsaline-N", description: "Oral Rehydration Salts - Dehydration", category: "Digestive", price: 6.0, stock: 2000 },
        { name: "Domperidone 10", description: "Domperidone 10mg - Anti-nausea", category: "Digestive", price: 2.0, stock: 600 },
        { name: "Flagyl 400", description: "Metronidazole 400mg - Diarrhea treatment", category: "Digestive", price: 5.0, stock: 500 },
        { name: "Buscopan", description: "Hyoscine - Stomach cramp relief", category: "Digestive", price: 4.0, stock: 400 },
        
        // Cough & Respiratory
        { name: "Adovas", description: "Ambroxol - Cough expectorant", category: "Cough & Respiratory", price: 6.0, stock: 500 },
        { name: "Brodil Plus", description: "Salbutamol + Guaifenesin - Bronchodilator", category: "Cough & Respiratory", price: 8.0, stock: 350 },
        { name: "Tus-A", description: "Dextromethorphan - Cough suppressant", category: "Cough & Respiratory", price: 5.0, stock: 400 },
        
        // Skin & External
        { name: "Candid Cream", description: "Clotrimazole - Antifungal cream", category: "Skin & External", price: 45.0, stock: 200 },
        { name: "Savlon Cream", description: "Antiseptic cream - Wound care", category: "Skin & External", price: 35.0, stock: 250 },
        { name: "Dettol Antiseptic", description: "Antiseptic liquid 100ml", category: "Skin & External", price: 80.0, stock: 200 },
        
        // Eye & Ear
        { name: "Ocuflox", description: "Ofloxacin eye drops - Eye infection", category: "Eye & Ear", price: 55.0, stock: 150 },
        { name: "Tobrex", description: "Tobramycin eye drops", category: "Eye & Ear", price: 85.0, stock: 120 },
        
        // Others
        { name: "Omeprazole 20", description: "Omeprazole 20mg capsule", category: "Gastric & Acidity", price: 4.0, stock: 600 },
        { name: "Diclofenac 50", description: "Diclofenac 50mg - Pain relief", category: "Pain Relief", price: 3.0, stock: 500 },
        { name: "Tramadol 50", description: "Tramadol 50mg - Pain management", category: "Pain Relief", price: 8.0, stock: 200 },
    ];

    console.log('Seeding medicines...');
    for (const med of medicines) {
        const exists = await prisma.medicine.findFirst({ where: { name: med.name } });
        if (!exists) {
            await prisma.medicine.create({ data: med });
        }
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
