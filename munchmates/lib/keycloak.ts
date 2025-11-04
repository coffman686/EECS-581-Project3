// lib/keycloak.ts
'use client';
import Keycloak, { KeycloakLoginOptions } from 'keycloak-js';

const url = process.env.NEXT_PUBLIC_KEYCLOAK_URL!;
const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM!;
const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!;

export const keycloak = new Keycloak({ url, realm, clientId });

// One singleton promise for init (guards double-mount / HMR in dev)
let initPromise: Promise<boolean> | null = null;

/**
 * Initialize Keycloak exactly once.
 * - mode 'login-required' for protected pages (RequireAuth)
 * - mode 'check-sso' for public pages that just want session info
 */
export function initKeycloak(mode: 'login-required' | 'check-sso' = 'login-required') {
    if (initPromise) return initPromise; // <-- guard
    initPromise = keycloak.init({
        onLoad: mode,
        pkceMethod: 'S256',
        checkLoginIframe: false,
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
        // messageReceiveTimeout: 3000, // optional: shorter wait in dev
    });
    return initPromise;
}

// Passive refresh: never triggers login
export async function ensureToken() {
    if (!keycloak.authenticated) return undefined;
    try {
        await keycloak.updateToken(30);
        return keycloak.token;
    } catch {
        return undefined;
    }
}

export const login = (opts?: KeycloakLoginOptions) => keycloak.login(opts);
export const logout = (redirectUri?: string) =>
    keycloak.logout({ redirectUri: redirectUri ?? window.location.origin });

export const getAccessTokenClaims = <T = any>(): T | undefined =>
    (keycloak.tokenParsed as T | undefined);
export const getParsedIdToken = <T = any>(): T | undefined =>
    (keycloak.idTokenParsed as T | undefined);
