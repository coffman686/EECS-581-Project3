// app/api/account/route.ts
// this routing directly concerns how we will handle a user's account deletion,
// and verifying the token we are given. Also helps to show error codes if keycloak
// acts up
import { NextRequest, NextResponse } from "next/server";
import { verifyBearer } from "@/lib/verifyToken";
import { deleteUserById } from "@/lib/keycloakAdmin";

export async function DELETE(req: NextRequest) {
    try {
        const claims = await verifyBearer(
            req.headers.get("authorization") || undefined
        );

        if (!claims?.sub) {
            return NextResponse.json(
                { error: "No user id (sub) in token" },
                { status: 400 }
            );
        }

        // If you want to also remove local profile data, you can move the
        // `profiles` Map into a shared module and delete here as well.

        await deleteUserById(claims.sub);

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("Error deleting Keycloak account", err);
        return NextResponse.json(
            { error: "Failed to delete account" },
            { status: 500 }
        );
    }
}
