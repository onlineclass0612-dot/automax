import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding AutoMax database...');

  // 1. Initial Setting
  await prisma.setting.upsert({
    where: { id: 'global' },
    update: {
      rentalName: 'AutoMax Car Rental',
      adminWhatsApp: '6281234567890',
      defaultDpPercent: 30,
      poolAddress: 'Pool Utama AutoMax, Jl. TB Simatupang No. 88, Jakarta Selatan',
    },
    create: {
      id: 'global',
      rentalName: 'AutoMax Car Rental',
      adminWhatsApp: '6281234567890',
      defaultDpPercent: 30,
      poolAddress: 'Pool Utama AutoMax, Jl. TB Simatupang No. 88, Jakarta Selatan',
    },
  });

  // 2. Initial Cars Fleet
  const initialCars = [
    {
      name: 'Toyota Avanza 1.5 G CVT',
      slug: 'toyota-avanza-15-g-cvt',
      brand: 'Toyota',
      category: 'MPV',
      plateNumber: 'B 1420 ABC',
      transmission: 'AUTOMATIC',
      seats: 7,
      luggage: 3,
      fuelType: 'Bensin',
      dailyRate: 400000,
      imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop',
      status: 'AVAILABLE',
    },
    {
      name: 'Toyota Innova Reborn 2.4 V Diesel',
      slug: 'toyota-innova-reborn-24-v-diesel',
      brand: 'Toyota',
      category: 'MPV',
      plateNumber: 'B 2199 DEF',
      transmission: 'AUTOMATIC',
      seats: 7,
      luggage: 4,
      fuelType: 'Diesel',
      dailyRate: 650000,
      imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop',
      status: 'AVAILABLE',
    },
    {
      name: 'Honda Brio RS 1.2 CVT',
      slug: 'honda-brio-rs-12-cvt',
      brand: 'Honda',
      category: 'City Car',
      plateNumber: 'B 1872 GHI',
      transmission: 'AUTOMATIC',
      seats: 5,
      luggage: 2,
      fuelType: 'Bensin',
      dailyRate: 350000,
      imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop',
      status: 'AVAILABLE',
    },
    {
      name: 'Mitsubishi Xpander Ultimate',
      slug: 'mitsubishi-xpander-ultimate',
      brand: 'Mitsubishi',
      category: 'MPV',
      plateNumber: 'B 2411 JKL',
      transmission: 'AUTOMATIC',
      seats: 7,
      luggage: 3,
      fuelType: 'Bensin',
      dailyRate: 450000,
      imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=800&auto=format&fit=crop',
      status: 'AVAILABLE',
    },
    {
      name: 'Toyota Fortuner 2.8 GR Sport 4x2',
      slug: 'toyota-fortuner-28-gr-sport',
      brand: 'Toyota',
      category: 'SUV',
      plateNumber: 'B 1001 MNO',
      transmission: 'AUTOMATIC',
      seats: 7,
      luggage: 4,
      fuelType: 'Diesel',
      dailyRate: 1100000,
      imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800&auto=format&fit=crop',
      status: 'AVAILABLE',
    },
  ];

  for (const car of initialCars) {
    await prisma.car.upsert({
      where: { slug: car.slug },
      update: car,
      create: car,
    });
  }

  // 3. Initial Demo Admin User (admin@automax.id)
  await prisma.adminUser.upsert({
    where: { email: 'admin@automax.id' },
    update: {
      name: 'Admin AutoMax',
      password: 'password123', // In production, use bcrypt hash
    },
    create: {
      email: 'admin@automax.id',
      name: 'Admin AutoMax',
      password: 'password123',
    },
  });

  console.log('✅ AutoMax database seeded successfully with 5 cars, settings, and demo admin!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
