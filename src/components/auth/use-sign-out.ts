'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';

/** Ends the session on the server, then leaves for the sign-in screen with a full reload (clears all state). */
export function useSignOut() {
  const [signingOut, setSigningOut] = useState(false);
  const signOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await authClient.signOut();
    } finally {
      // Full reload on purpose: nothing from the previous account may stay in memory. Replace keeps Back out of the app.
      window.location.replace('/login');
    }
  };
  return { signOut, signingOut };
}
