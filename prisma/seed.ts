import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Hash passwords using ENV variable
  const hashedDemoPassword = await bcrypt.hash(process.env.DEMO_PASSWORD as string, 10);

  // Upsert Demo Admin
  const demoAdmin = await prisma.user.upsert({
    where: { username: 'demoadmin' },
    update: {},
    create: {
      name: 'Demo Admin', // Required field
      username: 'demoadmin',
      password: hashedDemoPassword,
      role: Role.ADMIN,
    },
  });

  // Upsert Demo User
  const demoUser = await prisma.user.upsert({
    where: { username: 'demouser' },
    update: {},
    create: {
      name: 'Demo User', // Required field
      username: 'demouser',
      password: hashedDemoPassword,
      role: Role.USER,
    },
  });

  // Create a demo team for demoadmin
  const demoTeam = await prisma.team.upsert({
    where: { id: 'demo-team' },
    update: {},
    create: {
      id: 'demo-team',
      name: 'Demo Admin’s Team',
      managerId: demoAdmin.id,
    },
  });

  // Create 3 demo team members
  const teamMembers = [
    {
      name: 'Team User 1',
      username: 'teamuser1',
      password: hashedDemoPassword,
      role: Role.USER,
      teamId: demoTeam.id,
    },
    {
      name: 'Team User 2',
      username: 'teamuser2',
      password: hashedDemoPassword,
      role: Role.USER,
      teamId: demoTeam.id,
    },
    {
      name: 'Team User 3',
      username: 'teamuser3',
      password: hashedDemoPassword,
      role: Role.USER,
      teamId: demoTeam.id,
    },
  ];

  await prisma.user.createMany({ data: teamMembers });

  // Fetch newly created team members
  const createdTeamUsers = await prisma.user.findMany({ where: { teamId: demoTeam.id } });

  // Seed repair orders for demouser
  await prisma.repairOrder.createMany({
    data: [
      {
        year: '2022',
        make: 'Toyota',
        model: 'Corolla',
        roNumber: '12345',
        labor: 5.5,
        userId: demoUser.id,
      },
      {
        year: '2021',
        make: 'Ford',
        model: 'F-150',
        roNumber: '67890',
        labor: 6.0,
        userId: demoUser.id,
      },
      {
        year: '2023',
        make: 'Honda',
        model: 'Civic',
        roNumber: '98765',
        labor: 4.5,
        userId: demoUser.id,
      },
    ],
  });

  // Seed repair orders for demo team members
  for (const teamUser of createdTeamUsers) {
    await prisma.repairOrder.createMany({
      data: [
        {
          year: '2020',
          make: 'Chevrolet',
          model: 'Silverado',
          roNumber: '54321',
          labor: 5.0,
          userId: teamUser.id,
        },
        {
          year: '2019',
          make: 'Nissan',
          model: 'Altima',
          roNumber: '13579',
          labor: 6.2,
          userId: teamUser.id,
        },
      ],
    });
  }

  console.log('✅ Demo data seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
