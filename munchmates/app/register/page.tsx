// app/register/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { initKeycloak, register } from '@/lib/keycloak';
import Link from 'next/link';

export default function Register() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let mounted = true;

        (async () => {
            // Initialize Keycloak first
            await initKeycloak('check-sso');
            
            if (!mounted) return;
            
            setReady(true);
            
            // Trigger registration with redirect back to dashboard
            register({
                redirectUri: `${window.location.origin}/dashboard`
            });
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
            <h1 style={{ marginBottom: 24 }}>Create Account</h1>
            
            {!ready ? (
                <p>Preparing registration...</p>
            ) : (
                <>
                    <p style={{ marginBottom: 24, color: '#666' }}>
                        Redirecting to registration...
                    </p>
                    <button 
                        onClick={() => register({ redirectUri: `${window.location.origin}/dashboard` })}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Continue to Registration
                    </button>
                </>
            )}
            
            <div style={{ marginTop: 32, fontSize: 14 }}>
                <p>
                    Already have an account?{' '}
                    <Link href="/login" style={{ color: '#2563eb' }}>
                        Sign in
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