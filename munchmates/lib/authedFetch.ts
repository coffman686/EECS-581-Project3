// lib/authedFetch.ts
'use client';
import { ensureToken, keycloak } from '@/lib/keycloak';

export async function authedFetch(input: RequestInfo, init: RequestInit = {}) {
    const headers = new Headers(init.headers || {});
    headers.set('Content-Type', 'application/json');

    if (keycloak.authenticated) {
        const token = await ensureToken();
        if (token) headers.set('Authorization', `Bearer ${token}`);
    }

    return fetch(input, { ...init, headers });
}
