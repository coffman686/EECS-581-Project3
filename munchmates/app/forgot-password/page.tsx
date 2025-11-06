// app/forgot-password/page.tsx
'use client';
import { useEffect } from 'react';
import { forgotPassword } from '@/lib/keycloak';
import Link from 'next/link';

export default function ForgotPassword() {
    useEffect(() => {
        forgotPassword();
    }, []);

    return (
        <main style={{ 
            padding: 48, 
            maxWidth: 400, 
            margin: '0 auto', 
            textAlign: 'center' 
        }}>
            <h1 style={{ marginBottom: 24 }}>Reset Password</h1>
            <p>Redirecting to password reset...</p>
            
            <div style={{ marginTop: 32, fontSize: 14 }}>
                <p>
                    Remember your password?{' '}
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