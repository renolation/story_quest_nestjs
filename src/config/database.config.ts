import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_DATABASE'),
  ssl: configService.get<boolean>('DB_SSL', true)
    ? {
        rejectUnauthorized: false,
      }
    : false,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, // Disable auto-synchronization since schema is already created
  logging: false, // Disable SQL query logs
});
