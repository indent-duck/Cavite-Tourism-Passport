import { hasSession } from '@/data/api';
import { Redirect, type Href } from 'expo-router';
import { useEffect, useState } from 'react';

/**
 * Entry route: opens the app when a login session is saved on this device,
 * otherwise the login screen. Signing out also lands here.
 */
export default function Index() {
  const [href, setHref] = useState<Href | null>(null);

  useEffect(() => {
    let cancelled = false;
    hasSession()
      .catch(() => false)
      .then((signedIn) => {
        if (!cancelled) setHref(signedIn ? '/(tabs)/explore' : '/(auth)/login');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Reading the saved session takes a moment; show nothing until it's known
  if (!href) return null;
  return <Redirect href={href} />;
}
