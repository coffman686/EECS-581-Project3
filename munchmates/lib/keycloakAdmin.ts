// lib/keycloakAdmin.ts  is the server side implementation of a client role that is an admin
// effectively this exists as a component for us to call when we need an admin action done,
// like deletion or role altering
import KcAdminClient from "@keycloak/keycloak-admin-client";

const baseUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL!;
const realmName = process.env.NEXT_PUBLIC_KEYCLOAK_REALM!;
const clientId = process.env.KEYCLOAK_ADMIN_CLIENT_ID!;
const clientSecret = process.env.KEYCLOAK_ADMIN_CLIENT_SECRET!;

/**
 * Creates an authenticated Keycloak admin client for each call.
 */
export async function getAdminClient() {
    const kcAdmin = new KcAdminClient({
        baseUrl,
        realmName,
    });

    await kcAdmin.auth({
        grantType: "client_credentials",
        clientId,
        clientSecret,
    });

    return kcAdmin;
}

/**
 * Delete a user by Keycloak user ID (sub in access token).
 */
export async function deleteUserById(userId: string) {
    const admin = await getAdminClient();
    await admin.users.del({ id: userId });
}
