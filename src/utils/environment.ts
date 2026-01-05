import type { Environment } from '../types';

/**
 * Check if an environment is a production environment
 */
export const isProductionEnvironment = (environment: string | Environment | ''): boolean => {
  if (!environment) return false;
  const env = environment.toUpperCase();
  return env.startsWith('PROD');
};

