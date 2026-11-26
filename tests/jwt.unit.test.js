const { generateTokens, verifyAccessToken, verifyRefreshToken } = require('../src/utils/jwt');

describe('JWT Utility Unit Tests', () => {
  const payload = { id: 1, email: 'unit@test.com', role: 'USER' };

  test('should generate valid access and refresh tokens and verify them', () => {
    const { accessToken, refreshToken } = generateTokens(payload);

    expect(typeof accessToken).toBe('string');
    expect(typeof refreshToken).toBe('string');

    const decodedAccess = verifyAccessToken(accessToken);
    expect(decodedAccess.id).toBe(payload.id);
    expect(decodedAccess.email).toBe(payload.email);
    expect(decodedAccess.role).toBe(payload.role);

    const decodedRefresh = verifyRefreshToken(refreshToken);
    expect(decodedRefresh.id).toBe(payload.id);
  });

  test('should throw an error on invalid token', () => {
    expect(() => verifyAccessToken('invalid.token.string')).toThrow();
  });
});
