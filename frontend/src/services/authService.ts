import type { User } from '../types/index.ts';
import { DEMO_USERS } from '../data/mockData.ts';

/**
 * Checks whether demo profile switching is enabled in the current environment.
 * In a production build with `VITE_ENABLE_DEMO_PROFILES=false`, demo profile switching is disabled.
 * Note: Client-side flags are UI controls only; real authorization must also be enforced by backend/RLS.
 */
export function isDemoProfilesEnabled(overrideEnv?: { MODE?: string; VITE_ENABLE_DEMO_PROFILES?: string }): boolean {
  const env = overrideEnv ?? ((import.meta as unknown as { env?: Record<string, string> }).env || {});
  if (env.VITE_ENABLE_DEMO_PROFILES === 'false') {
    return false;
  }
  if (env.MODE === 'production' && env.VITE_ENABLE_DEMO_PROFILES !== 'true') {
    // Allow demo mode by default for university evaluation builds unless explicitly disabled via VITE_ENABLE_DEMO_PROFILES=false
    return true;
  }
  return true;
}

export interface IAuthService {
  loginWithEmail(email: string, users: User[]): { success: boolean; user?: User; error?: string };
  listDemoProfiles(): User[];
}

export class MockAuthService implements IAuthService {
  loginWithEmail(email: string, users: User[]): { success: boolean; user?: User; error?: string } {
    const clean = email.trim().toLowerCase();
    const matched = users.find(u => u.email.toLowerCase() === clean);
    if (!matched) {
      return {
        success: false,
        error: 'No se encontró una cuenta registrada con ese correo en el entorno actual.'
      };
    }
    return {
      success: true,
      user: matched
    };
  }

  listDemoProfiles(): User[] {
    return DEMO_USERS;
  }
}

export const authService = new MockAuthService();
