
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
// import { Strategy } from "passport-oauth2";
import { googleOAuthConfig } from "./google-oauth.config";
import { ConfigService } from "@nestjs/config";
import { Strategy } from 'passport-google-oauth20';
import { AuthService } from "./auth.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(cfg: ConfigService, private authService: AuthService) {
    const googleCfg = googleOAuthConfig(cfg);

    super({
      clientID: googleCfg.clientID,
      clientSecret: googleCfg.clientSecret,
      callbackURL: googleCfg.callbackURL,
      scope: googleCfg.scope,
    });
  }

    async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {

        try {
            const user = await this.authService.validateUserByGoogle(profile);
            done(null, user);
        } catch (err) {
            done(err, false);
        }
    }
}