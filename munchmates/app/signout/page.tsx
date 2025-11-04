'use client';
import { useEffect } from 'react';
import { logout } from '@/lib/keycloak';

export default function SignOutPage() {
    useEffect(() => {
        logout(window.location.origin); // must be allowed in "post logout redirect URIs"
    }, []);
    return <main style={{ padding: 24 }}>Signing you out…</main>;
}
