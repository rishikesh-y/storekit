import 'reflect-metadata';
import { DataSource } from 'typeorm';
import Dotenv from  'dotenv';
import path = require('path');

Dotenv.config();

const entityPath = path.join(__dirname, 'entities', '**.entity.{js,ts}');

const migrationPath = path.join(__dirname, 'entities', 'migrations', '**.{js,ts}');

const subscribersPath = path.join(__dirname, 'entities', 'subscribers', '**.{js,ts}');

console.log(entityPath, migrationPath, subscribersPath);

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: true,
  logging: process.env.NODE_ENV !== 'production',
  logger: 'advanced-console',
  entities: [entityPath],
  migrations: [migrationPath],
  subscribers: [subscribersPath],
  applicationName: 'dapp-store-server'
});
