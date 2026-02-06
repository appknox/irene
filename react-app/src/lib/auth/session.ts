/**
 * Session management for React app
 * Handles authentication state persistence via localStorage
 */

export interface SessionData {
  b64token: string | null;
  user_id: string | null;
  authenticator: string | null;
  timestamp: number;
}

const SESSION_STORAGE_KEY = 'irene:session';

export class SessionManager {
  private listeners: Set<(session: SessionData | null) => void> = new Set();

  constructor() {
    // Listen for storage events from other tabs/windows
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageChange);
    }
  }

  /**
   * Get current session data
   */
  getSession(): SessionData | null {
    try {
      const data = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!data) return null;
      
      return JSON.parse(data) as SessionData;
    } catch (error) {
      console.error('Error reading session:', error);
      return null;
    }
  }

  /**
   * Set session data and notify all listeners
   */
  setSession(data: Omit<SessionData, 'timestamp'>): void {
    const session: SessionData = {
      ...data,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      this.notifyListeners(session);
    } catch (error) {
      console.error('Error setting session:', error);
    }
  }

  /**
   * Clear session data
   */
  clearSession(): void {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      this.notifyListeners(null);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const session = this.getSession();
    return !!(session?.b64token && session?.user_id);
  }

  /**
   * Subscribe to session changes
   */
  subscribe(callback: (session: SessionData | null) => void): () => void {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Destroy the session manager and cleanup listeners
   */
  destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleStorageChange);
    }
    this.listeners.clear();
  }

  private handleStorageChange = (event: StorageEvent) => {
    if (event.key === SESSION_STORAGE_KEY) {
      const session = this.getSession();
      this.notifyListeners(session);
    }
  };

  private notifyListeners(session: SessionData | null): void {
    this.listeners.forEach((callback) => {
      try {
        callback(session);
      } catch (error) {
        console.error('Error in session listener:', error);
      }
    });
  }
}

// Singleton instance
export const sessionManager = new SessionManager();
