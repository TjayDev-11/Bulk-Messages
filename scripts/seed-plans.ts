const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedPlans() {
  try {
    await prisma.plan.createMany({
      data: [
        { name: 'Test', credits: 5, price: 5, duration: 30 }, // Test plan
        { name: 'Basic', credits: 200, price: 200, duration: 30 },
        { name: 'Standard', credits: 500, price: 500, duration: 30 },
        { name: 'Advanced', credits: 1000, price: 1000, duration: 30 },
        { name: 'Pro', credits: 5000, price: 5000, duration: 30 },
        { name: 'Enterprise', credits: 10000, price: 10000, duration: 30 },
        { name: 'Platinum', credits: 50000, price: 50000, duration: 30 },
        { name: 'Diamond', credits: 100000, price: 100000, duration: 30 },
      ],
    });
    console.log('Plans seeded successfully');
  } catch (error) {
    console.error('Error seeding plans:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedPlans();