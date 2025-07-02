import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : null,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  migrationsRun: false,
  synchronize: false,
});
