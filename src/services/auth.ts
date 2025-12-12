export interface User {
  id: string;
  username: string;
  name: string;
}

export interface AuthTokens {
  accessToken: string;
  expiresAt?: number;
}

const STORAGE_KEY = 'onp_auth';
const TOKEN_KEY = 'onp_tokens';

// Hardcoded credentials
const VALID_CREDENTIALS = {
  username: 'omwadmin',
  password: 'omwadmin18',
};

// Validate username and password
export const validateCredentials = (username: string, password: string): boolean => {
  return username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password;
};

// Login with username and password
export const login = async (username: string, password: string): Promise<{ user: User; tokens: AuthTokens }> => {
  if (!validateCredentials(username, password)) {
    throw new Error('Invalid username or password');
  }

  // Create user object
  const user: User = {
    id: '1',
    username: username,
    name: 'Admin User',
  };

  // Create a simple token (in production, this would come from your backend)
  const tokens: AuthTokens = {
    accessToken: `token_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };

  return { user, tokens };
};

// Store authentication data
export const storeAuth = (user: User, tokens: AuthTokens): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
};

// Get stored authentication data
export const getStoredAuth = (): { user: User | null; tokens: AuthTokens | null } => {
  try {
    const userStr = localStorage.getItem(STORAGE_KEY);
    const tokensStr = localStorage.getItem(TOKEN_KEY);
    
    const user = userStr ? JSON.parse(userStr) : null;
    const tokens = tokensStr ? JSON.parse(tokensStr) : null;
    
    return { user, tokens };
  } catch (error) {
    console.error('Error reading stored auth:', error);
    return { user: null, tokens: null };
  }
};

// Clear authentication data
export const clearAuth = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TOKEN_KEY);
};

// Check if token is expired
export const isTokenExpired = (tokens: AuthTokens): boolean => {
  if (!tokens.expiresAt) {
    return false; // No expiration set
  }
  return Date.now() >= tokens.expiresAt;
};

// Get valid access token
export const getValidAccessToken = async (): Promise<string | null> => {
  const { tokens } = getStoredAuth();
  if (!tokens) {
    return null;
  }

  if (isTokenExpired(tokens)) {
    clearAuth();
    return null;
  }

  return tokens.accessToken;
};
