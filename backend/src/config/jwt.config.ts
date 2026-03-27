import appConfig from './app.config';

const jwtConfig = appConfig.jwt;

export default {
  secret: jwtConfig.secret,
  expiresIn: jwtConfig.expiresIn,
  refreshExpiresIn: jwtConfig.refreshExpiresIn,
  issuer: jwtConfig.issuer,
  options: {
    algorithm: 'HS256' as const,
  },
};
