// app/forgot-password/page.tsx
'use client';
import { useEffect } from 'react';

export default function ForgotPassword() {
    useEffect(() => {
        const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM ?? '';
        const keycloakBase = process.env.NEXT_PUBLIC_KEYCLOAK_URL!;
        const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!;
        
        // Keycloak's forgot password flow
        // This redirects to login with a special action parameter
        const forgotPasswordUrl = `${keycloakBase}/realms/${realm}/login-actions/reset-credentials?client_id=${clientId}`;
        
        window.location.href = forgotPasswordUrl;
    }, []);

    return (
        <main style={{ padding: 24, textAlign: 'center' }}>
            <h1>Redirecting to Password Reset...</h1>
            <p>If you are not redirected automatically, please refresh the page.</p>
        </main>
    );
}