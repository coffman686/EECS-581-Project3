'use client';
import { useEffect, useState } from 'react';
import { initKeycloak } from '@/lib/keycloak';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let mounted = true;
        (async () => {
            const authed = await initKeycloak('login-required'); // redirects if needed
            if (mounted && authed) setReady(true);
        })();
        return () => { mounted = false; };
    }, []);

    if (!ready) return <main style={{ padding: 24 }}>Checking session…</main>;
    return <>{children}</>;
}
