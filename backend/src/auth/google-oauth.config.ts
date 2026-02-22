import { ConfigService } from '@nestjs/config'

export const googleOAuthConfig = (cfg: ConfigService) => ({
  clientID: cfg.get<string>('GOOGLE_CLIENT_ID')!,
  clientSecret: cfg.get<string>('GOOGLE_CLIENT_SECRET')!,
  callbackURL: cfg.get<string>('GOOGLE_CALLBACK_URL')!,
  scope: ['email', 'profile'],
});

