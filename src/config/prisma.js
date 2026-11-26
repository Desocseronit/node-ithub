require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
const isCloudDb =
  connectionString &&
  (connectionString.includes('render.com') || connectionString.includes('sslmode=require'));

const pool = new Pool({
  connectionString,
  ...(isCloudDb && { ssl: { rejectUnauthorized: false } }),
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
