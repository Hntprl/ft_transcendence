import { ConfigService } from '@nestjs/config';
type JwtPayload = {
    sub: number;
};
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor(cfg: ConfigService);
    validate(payload: JwtPayload): Promise<{
        id: number;
    }>;
}
export {};
