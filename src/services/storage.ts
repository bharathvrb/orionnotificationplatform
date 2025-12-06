import type { OnboardRequest } from '../types';

const STORAGE_KEY = 'onp-onboard-template';

export const saveTemplate = (request: OnboardRequest): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(request));
  } catch (error) {
    console.error('Failed to save template:', error);
  }
};

export const loadTemplate = (): OnboardRequest | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as OnboardRequest;
    }
  } catch (error) {
    console.error('Failed to load template:', error);
  }
  return null;
};

export const clearTemplate = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear template:', error);
  }
};

