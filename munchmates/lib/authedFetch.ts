// lib/authedFetch.ts
// Ensures authenticated fetch requests with Keycloak token

'use client';
import { ensureToken, keycloak } from '@/lib/keycloak';

export async function authedFetch(input: RequestInfo, init: RequestInit = {}) {
    const headers = new Headers(init.headers || {});
    headers.set('Content-Type', 'application/json');

    // validate authentication
    if (keycloak.authenticated) {
        // add token if available
        const token = await ensureToken();
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        } else {
            console.warn('authedFetch: Keycloak authenticated but no token available');
        }
    } else {
        console.warn('authedFetch: Keycloak not authenticated');
    }

    return fetch(input, { ...init, headers });
}
