'use client';
import { useEffect, useState } from 'react';
import { initKeycloak } from '@/lib/keycloak';
import { ChefHat } from 'lucide-react';

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

    if (!ready) return (
        <main style={{ padding: 24 }}>
            <div className="mx-auto">
                <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-semibold mb-2 mx-auto">
                        Loading...
                    </h3>
            </div>
        </main>);
    return <>{children}</>;
}
