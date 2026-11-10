'use strict';

require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

let prisma;

function getPrismaClient() {
  if (!prisma) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const adapter = new PrismaPg(pool);

    prisma = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development'
        ? ['warn', 'error']
        : ['error'],
    });
  }
  return prisma;
}

async function connectDB() {
  const client = getPrismaClient();
  try {
    await client.$connect();
    console.log('✅ Database connected successfully');
    return client;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

async function disconnectDB() {
  if (prisma) {
    await prisma.$disconnect();
    console.log('Database disconnected');
  }
}

module.exports = { getPrismaClient, connectDB, disconnectDB };
