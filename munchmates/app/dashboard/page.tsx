'use client';
import RequireAuth from '@/components/RequireAuth';
import { ensureToken, getParsedIdToken, getAccessTokenClaims, logout, keycloak } from '@/lib/keycloak';
import { useEffect, useState } from 'react';
import { authedFetch } from '@/lib/authedFetch';

type IdClaims = { name?: string; preferred_username?: string; email?: string };
type AccessClaims = { preferred_username?: string; email?: string; realm_access?: { roles?: string[] } };

export default function Dashboard() {
    const [signedIn, setSignedIn] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [roles, setRoles] = useState<string[]>([]);
    const [me, setMe] = useState<any>(null);

    const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM ?? '';
    const keycloakBase = process.env.NEXT_PUBLIC_KEYCLOAK_URL!;
    const mailpitUrl = process.env.NEXT_PUBLIC_MAILPIT_URL ?? 'http://localhost:8025';
    const adminUrl = `${keycloakBase}/admin/${realm}/console`;
    const accountUrl = `${keycloakBase}/realms/${realm}/account`;

    // hide system roles
    const hidden = new Set(['offline_access', 'uma_authorization', `default-roles-${realm}`]);
    const displayRoles = roles.filter(r => !hidden.has(r));

    useEffect(() => {
        let mounted = true;

        const readClaims = () => {
            const id  = (getParsedIdToken<IdClaims>() ?? {}) as IdClaims;
            const acc = (getAccessTokenClaims<AccessClaims>() ?? {}) as AccessClaims;
            setName(id.name || id.preferred_username || acc.preferred_username || '');
            setEmail(id.email || acc.email || '');
            setRoles(acc.realm_access?.roles ?? []);
        };

        (async () => {
            // RequireAuth already ensured we're logged in; just refresh token & reflect state
            await ensureToken();
            if (!mounted) return;

            setSignedIn(!!keycloak.token);  // <-- derive from token, not just keycloak.authenticated
            readClaims();
        })();

        // keep UI in sync if KC fires events slightly later (or on refresh)
        keycloak.onAuthSuccess = async () => {
            if (!mounted) return;
            await ensureToken();
            setSignedIn(!!keycloak.token);
            readClaims();
        };
        keycloak.onAuthRefreshSuccess = async () => {
            if (!mounted) return;
            await ensureToken();
            setSignedIn(!!keycloak.token);
            readClaims();
        };
        keycloak.onAuthLogout = () => {
            if (!mounted) return;
            setSignedIn(false);
            setName(''); setEmail(''); setRoles([]); setMe(null);
        };

        return () => {
            mounted = false;
            keycloak.onAuthSuccess = undefined;
            keycloak.onAuthRefreshSuccess = undefined;
            keycloak.onAuthLogout = undefined;
        };
    }, []);


    async function callMe() {
        const res = await authedFetch('/api/me');
        if (!res.ok) return console.error('API error', res.status);
        const data = await res.json();
        setMe(data);
    }

    return (
        <RequireAuth>
            <main style={{ padding: 24 }}>
                <h1>Dashboard</h1>
                <p><b>Status:</b> {signedIn ? 'Signed in' : 'Signed out'}</p>
                <p><b>Name:</b> {name || '—'}</p>
                <p><b>Email:</b> {email || '—'}</p>
                <p><b>Roles:</b> {displayRoles.length ? displayRoles.join(', ') : 'none'}</p>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '12px 0 20px' }}>
                    <button onClick={() => logout()}>Sign out</button>
                    <button onClick={callMe}>Call /api/me</button>
                    <button onClick={() => window.open(accountUrl, '_blank')}>Keycloak Account</button>
                    <button onClick={() => window.open(adminUrl, '_blank')}>Keycloak Admin</button>
                    <button onClick={() => window.open(mailpitUrl, '_blank')}>Mailpit</button>
                </div>

                <pre>{me ? JSON.stringify(me, null, 2) : ''}</pre>
            </main>
        </RequireAuth>
    );
}
