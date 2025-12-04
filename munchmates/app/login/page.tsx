// app/login/page.tsx
// Login page for MunchMates application.
// Initializes Keycloak authentication and redirects users accordingly.
// If the user is already logged in, they are redirected to the dashboard.

'use client';
import { useEffect, useState } from 'react';
import { initKeycloak } from '@/lib/keycloak';
import Link from 'next/link';

export default function Login() {
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        let mounted = true;

        (async () => {
            // This will automatically redirect to Keycloak login
            await initKeycloak('login-required');
            if (mounted) {
                // If we get here, user is already logged in
                window.location.href = '/dashboard';
            }
        })();

        return () => { mounted = false; };
    }, []);

    return (
        <main style={{ 
            padding: 48, 
            maxWidth: 400, 
            margin: '0 auto', 
            textAlign: 'center' 
        }}>
            <h1 style={{ marginBottom: 24 }}>Sign In</h1>
            <p>Redirecting to login...</p>
            
            <div style={{ marginTop: 32, fontSize: 14 }}>
                <p>
                    Don't have an account?{' '}
                    <Link href="/register" style={{ color: '#2563eb' }}>
                        Create one
                    </Link>
                </p>
                <p>
                    <Link href="/forgot-password" style={{ color: '#666' }}>
                        Forgot your password?
                    </Link>
                </p>
                <p>
                    <Link href="/" style={{ color: '#666' }}>
                        ← Back to Home
                    </Link>
                </p>
            </div>
        </main>
    );
}