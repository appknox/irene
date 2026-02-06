/**
 * React hook for session management
 */

import { useEffect, useState, useCallback } from 'react';
import { sessionManager } from '@lib/auth';
import type { SessionData } from '@lib/auth';

export function useSession() {
  const [session, setSession] = useState<SessionData | null>(() => 
    sessionManager.getSession()
  );
  const [isAuthenticated, setIsAuthenticated] = useState(() => 
    sessionManager.isAuthenticated()
  );

  useEffect(() => {
    // Subscribe to session changes
    const unsubscribe = sessionManager.subscribe((newSession) => {
      setSession(newSession);
      setIsAuthenticated(!!(newSession?.b64token && newSession?.user_id));
    });

    // Cleanup on unmount
    return unsubscribe;
  }, []);

  const login = useCallback(
    (data: Omit<SessionData, 'timestamp'>) => {
      sessionManager.setSession(data);
    },
    []
  );

  const logout = useCallback(() => {
    sessionManager.clearSession();
  }, []);

  return {
    session,
    isAuthenticated,
    login,
    logout,
    userId: session?.user_id,
    token: session?.b64token,
  };
}
