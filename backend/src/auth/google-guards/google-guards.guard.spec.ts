import { GoogleAuthGuard } from './google-guards.guard';

describe('GoogleAuthGuard', () => {
  it('should be defined', () => {
    expect(new GoogleAuthGuard()).toBeDefined();
  });
});
