import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions, JwtSignOptions } from '@nestjs/jwt';

export const getJwtConfig = (
  configService: ConfigService,
): JwtModuleOptions => {
  const expiresIn = configService.get<string>('JWT_EXPIRES_IN') || '15m';

  return {
    secret: configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production',
    signOptions: {
      expiresIn: expiresIn as JwtSignOptions['expiresIn'],
    },
  };
};
